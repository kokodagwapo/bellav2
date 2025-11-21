import React, { useRef, useEffect, useState } from 'react';
import type { FormData } from '../../types';
import StepHeader from '../StepHeader';
import StepNavigation from '../StepNavigation';
import { Lightbulb } from '../icons';
import { AddressAutofill } from '@mapbox/search-js-react';
import AddressPreviewModal, { AddressDetails } from '../ui/AddressPreviewModal';


interface Step1Props {
    data: FormData;
    onDataChange: (data: Partial<FormData>) => void;
    onNext: () => void;
    onBack?: () => void;
}

const InputField: React.FC<{ label: string; id: keyof FormData; value: string | undefined; onChange: (id: keyof FormData, value: string) => void; fullWidth?: boolean; inputType?: string; placeholder?: string }> = ({ label, id, value, onChange, fullWidth = false, inputType = "text", placeholder }) => {
    const getInputType = () => {
        if (inputType) return inputType;
        if (id === 'email') return 'email';
        if (id === 'phoneNumber') return 'tel';
        if (id === 'dob') return 'text';
        return 'text';
    };
    
    return (
        <div className={fullWidth ? 'col-span-1 sm:col-span-2' : ''}>
            <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{label}</label>
            <input
                type={getInputType()}
                id={id}
                value={value || ''}
                onChange={(e) => onChange(id, e.target.value)}
                placeholder={placeholder}
                className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
            />
        </div>
    );
};

const AddressInput: React.FC<{ 
    label: string; 
    id: keyof FormData; 
    value: string | undefined; 
    onChange: (id: keyof FormData, value: string) => void; 
    fullWidth?: boolean; 
    placeholder?: string;
    onValidationChange?: (isValid: boolean) => void;
}> = ({ label, id, value, onChange, fullWidth = false, placeholder, onValidationChange }) => {
    const addressInputRef = useRef<HTMLInputElement>(null);
    const isVerifiedRef = useRef(false);
    const [isVerified, setIsVerified] = useState(false);
    const [mapboxLoaded, setMapboxLoaded] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressPreview, setAddressPreview] = useState<AddressDetails | null>(null);

    // Initialize Mapbox
    useEffect(() => {
        const apiKey = import.meta.env.VITE_MAPBOX_API_KEY || '';
        if (apiKey) {
            setMapboxLoaded(true);
        } else {
            console.warn('Mapbox API key not found. Please set VITE_MAPBOX_API_KEY in your environment variables.');
            setMapboxLoaded(false);
        }
    }, []);

    // Handle Mapbox address retrieval - improved to extract all address components and show preview modal
    const handleRetrieve = async (res: any) => {
        const feature = res.features[0];
        if (feature) {
            const properties = feature.properties || {};
            const context = feature.context || [];
            const coordinates = feature.geometry?.coordinates || [];
            
            // Extract address components
            const street = properties.address_line || properties.name || '';
            let city = '';
            let state = '';
            let zip = '';
            
            // Extract from context
            context.forEach((item: any) => {
                if (item.id?.startsWith('place')) {
                    city = item.text || '';
                }
                if (item.id?.startsWith('region')) {
                    state = item.short_code?.replace('US-', '') || '';
                }
                if (item.id?.startsWith('postcode')) {
                    zip = item.text || '';
                }
            });
            
            // Build full formatted address
            const formattedAddress = properties.full_address || properties.place_name || 
                `${street}${street && city ? ', ' : ''}${city}${city && state ? ', ' : ''}${state} ${zip}`.trim();
            
            // Verify address with Mapbox
            try {
                const { verifyAddress } = await import('../../services/addressVerificationService');
                const verification = await verifyAddress({
                    street,
                    city,
                    state,
                    zip
                });
                
                // Prepare address details for modal
                const addressDetails: AddressDetails = {
                    street: verification.normalizedAddress?.street || street,
                    city: verification.normalizedAddress?.city || city,
                    state: verification.normalizedAddress?.state || state,
                    zip: verification.normalizedAddress?.zip || zip,
                    fullAddress: verification.normalizedAddress 
                        ? `${verification.normalizedAddress.street}, ${verification.normalizedAddress.city}, ${verification.normalizedAddress.state} ${verification.normalizedAddress.zip}`
                        : formattedAddress,
                    coordinates: coordinates.length >= 2 ? {
                        longitude: coordinates[0],
                        latitude: coordinates[1]
                    } : undefined,
                    verified: verification.isValid
                };
                
                // Show preview modal
                setAddressPreview(addressDetails);
                setShowAddressModal(true);
                
                // Update form field with verified address
                const finalAddress = verification.isValid && verification.normalizedAddress
                    ? `${verification.normalizedAddress.street}, ${verification.normalizedAddress.city}, ${verification.normalizedAddress.state} ${verification.normalizedAddress.zip}`
                    : formattedAddress;
                
                onChange(id, finalAddress);
                isVerifiedRef.current = true;
                setIsVerified(true);
                if (onValidationChange) {
                    onValidationChange(true);
                }
            } catch (error) {
                console.error('Error verifying address:', error);
                // Still update with unverified address
                onChange(id, formattedAddress);
                isVerifiedRef.current = true;
                setIsVerified(true);
                if (onValidationChange) {
                    onValidationChange(true);
                }
                
                // Show modal with unverified address
                const addressDetails: AddressDetails = {
                    street,
                    city,
                    state,
                    zip,
                    fullAddress: formattedAddress,
                    coordinates: coordinates.length >= 2 ? {
                        longitude: coordinates[0],
                        latitude: coordinates[1]
                    } : undefined,
                    verified: false
                };
                setAddressPreview(addressDetails);
                setShowAddressModal(true);
            }
        }
    };

    // Validate address on value change
    useEffect(() => {
        const isValid = value ? value.trim().length > 5 : false;
        if (!isVerified && onValidationChange) {
            onValidationChange(isValid);
        }
    }, [value, isVerified, onValidationChange]);

    return (
        <div className={fullWidth ? 'col-span-1 sm:col-span-2' : ''}>
            <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                {label}
            </label>
            <div className="relative">
                {mapboxLoaded ? (
                    <AddressAutofill
                        accessToken={import.meta.env.VITE_MAPBOX_API_KEY || ''}
                        onRetrieve={handleRetrieve}
                        options={{
                            country: 'US',
                            language: 'en'
                        }}
                    >
                        <input
                            ref={addressInputRef}
                            type="text"
                            id={id}
                            name={id}
                            value={value || ''}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                onChange(id, newValue);
                                // Reset verification when manually editing (only if it was verified)
                                if (isVerifiedRef.current) {
                                    isVerifiedRef.current = false;
                                    setIsVerified(false);
                                }
                            }}
                            placeholder={placeholder || "Street address, City, State ZIP"}
                            className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto] pr-10"
                            autoComplete="address-line1"
                        />
                    </AddressAutofill>
                ) : (
                    <input
                        ref={addressInputRef}
                        type="text"
                        id={id}
                        value={value || ''}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            onChange(id, newValue);
                            // Reset verification when manually editing (only if it was verified)
                            if (isVerifiedRef.current) {
                                isVerifiedRef.current = false;
                                setIsVerified(false);
                            }
                        }}
                        placeholder={placeholder || "Street address, City, State ZIP"}
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto] pr-10"
                        autoComplete="address-line1"
                    />
                )}
                {isVerified && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>
            {isVerified && value && (
                <p className="mt-1.5 text-xs sm:text-sm text-primary flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Address verified
                </p>
            )}
            
            {/* Address Preview Modal */}
            <AddressPreviewModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                address={addressPreview}
                onConfirm={() => {
                    setShowAddressModal(false);
                }}
            />
        </div>
    );
};

const Step1BorrowerInfo: React.FC<Step1Props> = ({ data, onDataChange, onNext, onBack }) => {
    const [addressValid, setAddressValid] = useState(false);
    
    const handleFieldChange = (id: keyof FormData, value: string) => {
        onDataChange({ [id]: value });
    };
    
    // Allow form completion if address is verified OR if it's a reasonable length (manual entry)
    const addressIsValid = addressValid || (data.borrowerAddress && data.borrowerAddress.trim().length > 5);
    const isComplete = data.fullName && data.borrowerAddress && addressIsValid && data.dob && data.email && data.phoneNumber;

    // Backward compatibility: Pre-fill from Prep4Loan data if available
    useEffect(() => {
        if (!data.fullName && data.fullName === undefined) {
            // Could check for other name fields if they exist
        }
        // Address is already handled by borrowerAddress field
    }, [data]);

    return (
        <div className="px-2 sm:px-0">
            <StepHeader title="Section 1: Borrower Information" subtitle="This information is about you, the Borrower." />
            
            {/* Bella's Insight */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-800 rounded-md flex items-start gap-3 mt-4 mb-6">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-sm">
                    <span className="font-semibold">Bella's Insight:</span> Make sure to use your full legal name exactly as it appears on your government-issued ID. This helps prevent delays during verification!
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 md:mt-8">
                <InputField label="Full Legal Name" id="fullName" value={data.fullName} onChange={handleFieldChange} fullWidth placeholder="Enter your full legal name" />
                <AddressInput 
                    label="Current Home Address" 
                    id="borrowerAddress" 
                    value={data.borrowerAddress} 
                    onChange={handleFieldChange} 
                    fullWidth 
                    placeholder="Street address, City, State ZIP"
                    onValidationChange={setAddressValid}
                />
                <InputField label="Date of Birth (MM/DD/YYYY)" id="dob" value={data.dob} onChange={handleFieldChange} placeholder="MM/DD/YYYY" />
                <InputField label="Email Address" id="email" value={data.email} onChange={handleFieldChange} inputType="email" placeholder="your.email@example.com" />
                <InputField label="Phone Number" id="phoneNumber" value={data.phoneNumber} onChange={handleFieldChange} inputType="tel" placeholder="(555) 123-4567" />
            </div>

            {/* Address verification tip */}
            {addressValid && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-3 text-green-800 rounded-md flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs">
                        <span className="font-semibold">Great!</span> Your address has been verified. This will speed up your application processing.
                    </p>
                </div>
            )}

            <div className="mt-8 sm:mt-10 pt-6 border-t border-border/50">
                <StepNavigation onNext={onNext} onBack={onBack} isNextDisabled={!isComplete} />
            </div>
        </div>
    );
};

export default Step1BorrowerInfo;