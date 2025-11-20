import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StepHeader from './StepHeader';
import { SelectionButton } from './StepHeader';
import StepNavigation from './StepNavigation';
import { Home } from './icons';
import type { FormData, Address } from '../types';

interface StepSubjectPropertyProps {
  data: FormData;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const budgetRanges = [
  '$100k - $200k',
  '$200k - $300k',
  '$300k - $400k',
  '$400k - $500k',
  '$500k - $750k',
  '$750k - $1M',
  '$1M+'
];

const StepSubjectProperty: React.FC<StepSubjectPropertyProps> = ({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}) => {
  const [hasProperty, setHasProperty] = useState<boolean | null>(
    data.subjectProperty?.hasProperty ?? null
  );
  const [address, setAddress] = useState<Address>(data.subjectProperty?.address || {});
  const [value, setValue] = useState<number>(data.subjectProperty?.value || 0);
  const [budgetRange, setBudgetRange] = useState<string>(data.subjectProperty?.budgetRange || '');
  const [targetZip, setTargetZip] = useState<string>(data.subjectProperty?.targetZip || '');

  const handleHasProperty = (value: boolean) => {
    setHasProperty(value);
    onChange('subjectProperty', {
      ...data.subjectProperty,
      hasProperty: value
    });
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);
    onChange('subjectProperty', {
      ...data.subjectProperty,
      address: newAddress
    });
  };

  const handleZipChange = async (zip: string) => {
    setTargetZip(zip);
    onChange('subjectProperty', {
      ...data.subjectProperty,
      targetZip: zip
    });
    
    // Auto-fill city/state from ZIP (would integrate with address API)
    if (zip.length === 5) {
      // Placeholder for API integration
      // const cityState = await getCityStateFromZip(zip);
      // if (cityState) {
      //   handleAddressChange('city', cityState.city);
      //   handleAddressChange('state', cityState.state);
      // }
    }
  };

  const handleValueChange = (val: number) => {
    setValue(val);
    onChange('subjectProperty', {
      ...data.subjectProperty,
      value: val
    });
  };

  const handleBudgetSelect = (range: string) => {
    setBudgetRange(range);
    onChange('subjectProperty', {
      ...data.subjectProperty,
      budgetRange: range
    });
  };

  const canProceed = hasProperty !== null && (
    hasProperty 
      ? (address.street && address.zip && value > 0)
      : (budgetRange && targetZip)
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <StepHeader 
        title="Subject Property"
        subtitle="Tell us about the property you're interested in"
      />
      
      <div className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Do you already have a property in mind?
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <SelectionButton
              label="Yes"
              icon={<Home className="h-6 w-6" />}
              isSelected={hasProperty === true}
              onClick={() => handleHasProperty(true)}
            />
            <SelectionButton
              label="Not Yet"
              isSelected={hasProperty === false}
              onClick={() => handleHasProperty(false)}
            />
          </div>
        </div>

        {hasProperty === true && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                value={address.zip || ''}
                onChange={(e) => {
                  const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleAddressChange('zip', zip);
                  if (zip.length === 5) {
                    handleZipChange(zip);
                  }
                }}
                placeholder="12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                maxLength={5}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={address.street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main St"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unit (optional)
              </label>
              <input
                type="text"
                value={address.unit || ''}
                onChange={(e) => handleAddressChange('unit', e.target.value)}
                placeholder="Apt 4B"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {(address.zip && address.zip.length === 5) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground"
              >
                {address.city && address.state && (
                  <p>{address.city}, {address.state}</p>
                )}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                What do you believe is the VALUE of the home? *
              </label>
              <input
                type="number"
                value={value || ''}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                placeholder="500000"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </motion.div>
        )}

        {hasProperty === false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Budget Range *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {budgetRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => handleBudgetSelect(range)}
                    className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                      budgetRange === range
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white border-gray-300 hover:border-primary'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target ZIP Code *
              </label>
              <input
                type="text"
                value={targetZip}
                onChange={(e) => {
                  const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleZipChange(zip);
                }}
                placeholder="12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                maxLength={5}
              />
            </div>
          </motion.div>
        )}
      </div>

      <StepNavigation onNext={canProceed ? onNext : undefined} onBack={onBack} />
    </div>
  );
};

export default StepSubjectProperty;

