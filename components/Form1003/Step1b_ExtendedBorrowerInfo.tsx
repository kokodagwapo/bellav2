import React, { useState } from 'react';
import type { FormData, MaritalStatus, CitizenshipStatus } from '../../types';
import StepHeader from '../StepHeader';
import StepNavigation from '../StepNavigation';
import { Lightbulb } from '../icons';

interface Step1bProps {
    data: FormData;
    onDataChange: (data: Partial<FormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

const Step1bExtendedBorrowerInfo: React.FC<Step1bProps> = ({ data, onDataChange, onNext, onBack }) => {
    const [ssn, setSsn] = useState(data.ssn || '');
    const [ssnError, setSsnError] = useState('');

    const handleSsnChange = (value: string) => {
        // Format SSN: XXX-XX-XXXX
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;
        
        if (cleaned.length > 3) {
            formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3);
        }
        if (cleaned.length > 5) {
            formatted = cleaned.slice(0, 3) + '-' + cleaned.slice(3, 5) + '-' + cleaned.slice(5, 9);
        }
        
        setSsn(formatted);
        
        // Validate SSN format
        if (cleaned.length === 9) {
            setSsnError('');
            onDataChange({ ssn: formatted });
        } else if (cleaned.length > 0 && cleaned.length < 9) {
            setSsnError('SSN must be 9 digits');
        } else {
            setSsnError('');
            onDataChange({ ssn: formatted || undefined });
        }
    };

    const handleFieldChange = (field: keyof FormData, value: any) => {
        onDataChange({ [field]: value });
    };

    // Check if previous address is needed (< 2 years at current)
    const needsPreviousAddress = data.yearsAtCurrentAddress !== undefined && 
                                 data.monthsAtCurrentAddress !== undefined &&
                                 (data.yearsAtCurrentAddress < 2 || 
                                  (data.yearsAtCurrentAddress === 0 && data.monthsAtCurrentAddress < 24));

    const isComplete = 
        !!data.ssn && 
        data.ssn.replace(/\D/g, '').length === 9 &&
        !!data.maritalStatus &&
        !!data.citizenship &&
        (!needsPreviousAddress || (data.formerAddress?.street && data.formerAddress?.city && data.formerAddress?.state && data.formerAddress?.zip));

    return (
        <div className="px-2 sm:px-0">
            <StepHeader 
                title="Section 1b: Extended Borrower Information" 
                subtitle="Additional personal information required for your loan application." 
            />
            
            {/* Bella's Insight */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-800 rounded-md flex items-start gap-3 mt-4 mb-6">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-sm">
                    <span className="font-semibold">Bella's Insight:</span> Your SSN is required for credit verification and loan processing. This information is encrypted and secure. If you don't have an SSN, you can use an ITIN (Individual Taxpayer Identification Number).
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 md:mt-8">
                {/* SSN/ITIN */}
                <div className="sm:col-span-2">
                    <label htmlFor="ssn" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Social Security Number (SSN) or ITIN *
                    </label>
                    <input
                        type="text"
                        id="ssn"
                        value={ssn}
                        onChange={(e) => handleSsnChange(e.target.value)}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    />
                    {ssnError && <p className="mt-1 text-xs text-red-600">{ssnError}</p>}
                </div>

                {/* Marital Status */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Marital Status *
                    </label>
                    <select
                        value={data.maritalStatus || ''}
                        onChange={(e) => handleFieldChange('maritalStatus', e.target.value as MaritalStatus)}
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    >
                        <option value="">Select...</option>
                        <option value="Married">Married</option>
                        <option value="Unmarried">Unmarried</option>
                        <option value="Separated">Separated</option>
                    </select>
                </div>

                {/* Citizenship Status */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Citizenship Status *
                    </label>
                    <select
                        value={data.citizenship || ''}
                        onChange={(e) => handleFieldChange('citizenship', e.target.value as CitizenshipStatus)}
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    >
                        <option value="">Select...</option>
                        <option value="US Citizen">US Citizen</option>
                        <option value="Permanent Resident">Permanent Resident Alien</option>
                        <option value="Non-Permanent Resident">Non-Permanent Resident Alien</option>
                    </select>
                </div>

                {/* Alternate Names */}
                <div className="sm:col-span-2">
                    <label htmlFor="alternateNames" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Alternate Names (if any)
                    </label>
                    <input
                        type="text"
                        id="alternateNames"
                        value={data.alternateNames || ''}
                        onChange={(e) => handleFieldChange('alternateNames', e.target.value)}
                        placeholder="e.g., maiden name, previous legal name"
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    />
                </div>

                {/* Dependents */}
                <div>
                    <label htmlFor="dependentsCount" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Number of Dependents
                    </label>
                    <input
                        type="number"
                        id="dependentsCount"
                        value={data.dependentsCount || ''}
                        onChange={(e) => handleFieldChange('dependentsCount', parseInt(e.target.value) || 0)}
                        min="0"
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    />
                </div>

                {/* Years at Current Address */}
                <div>
                    <label htmlFor="yearsAtCurrentAddress" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Years at Current Address *
                    </label>
                    <input
                        type="number"
                        id="yearsAtCurrentAddress"
                        value={data.yearsAtCurrentAddress || ''}
                        onChange={(e) => handleFieldChange('yearsAtCurrentAddress', parseInt(e.target.value) || 0)}
                        min="0"
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    />
                </div>

                {/* Months at Current Address */}
                <div>
                    <label htmlFor="monthsAtCurrentAddress" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                        Months at Current Address *
                    </label>
                    <input
                        type="number"
                        id="monthsAtCurrentAddress"
                        value={data.monthsAtCurrentAddress || ''}
                        onChange={(e) => handleFieldChange('monthsAtCurrentAddress', parseInt(e.target.value) || 0)}
                        min="0"
                        max="11"
                        className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                    />
                </div>
            </div>

            {/* Previous Address Section (if needed) */}
            {needsPreviousAddress && (
                <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground mb-4">
                        Previous Address (Required - Less than 2 years at current address)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="sm:col-span-2">
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                value={data.formerAddress?.street || ''}
                                onChange={(e) => onDataChange({
                                    formerAddress: { ...data.formerAddress, street: e.target.value }
                                })}
                                className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={data.formerAddress?.city || ''}
                                onChange={(e) => onDataChange({
                                    formerAddress: { ...data.formerAddress, city: e.target.value }
                                })}
                                className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                                State *
                            </label>
                            <input
                                type="text"
                                value={data.formerAddress?.state || ''}
                                onChange={(e) => onDataChange({
                                    formerAddress: { ...data.formerAddress, state: e.target.value }
                                })}
                                maxLength={2}
                                placeholder="XX"
                                className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                                ZIP Code *
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={data.formerAddress?.zip || ''}
                                onChange={async (e) => {
                                    // Allow only digits, limit to 5 characters
                                    const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
                                    onDataChange({
                                        formerAddress: { ...data.formerAddress, zip }
                                    });
                                    // Auto-fill city/state from ZIP when 5 digits entered and verify with Mapbox
                                    if (zip.length === 5) {
                                        try {
                                            const { getCityStateFromZip } = await import('../../services/addressVerificationService');
                                            const cityState = await getCityStateFromZip(zip);
                                            if (cityState) {
                                                onDataChange({
                                                    formerAddress: { 
                                                        ...data.formerAddress, 
                                                        zip,
                                                        city: cityState.city,
                                                        state: cityState.state
                                                    }
                                                });
                                            }
                                        } catch (error) {
                                            console.error('Error verifying ZIP code with Mapbox:', error);
                                        }
                                    }
                                }}
                                maxLength={5}
                                minLength={5}
                                placeholder="12345"
                                className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 sm:mt-10 pt-6 border-t border-border/50">
                <StepNavigation onNext={onNext} onBack={onBack} isNextDisabled={!isComplete} />
            </div>
        </div>
    );
};

export default Step1bExtendedBorrowerInfo;

