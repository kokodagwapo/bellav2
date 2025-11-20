import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StepHeader from './StepHeader';
import { SelectionButton } from './StepHeader';
import StepNavigation from './StepNavigation';
import { Home } from './icons';
import type { FormData } from '../types';

interface StepCurrentHousingStatusProps {
  data: FormData;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepCurrentHousingStatus: React.FC<StepCurrentHousingStatusProps> = ({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}) => {
  const [status, setStatus] = useState<FormData['currentHousingStatus']>(
    data.currentHousingStatus
  );
  const [details, setDetails] = useState(data.currentHousingDetails || {});

  const handleStatusChange = (newStatus: FormData['currentHousingStatus']) => {
    setStatus(newStatus);
    onChange('currentHousingStatus', newStatus);
    // Reset details when status changes
    setDetails({});
  };

  const handleDetailChange = (field: string, value: any) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onChange('currentHousingDetails', newDetails);
  };

  const canProceed = status && (
    status === 'Live With Family' ||
    (status === 'Rent' && details.rentAmount && details.rentAmount > 0) ||
    (status === 'Own With Mortgage' && details.piti && details.loanBalance && details.homeValue && details.willSellOrRent) ||
    (status === 'Own Free & Clear' && details.homeValue && details.willSellOrRent)
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <StepHeader 
        title="Current Housing Status"
        subtitle="Tell us about your current living situation"
      />
      
      <div className="space-y-6 mt-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            What is your current housing situation?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectionButton
              label="I Rent"
              icon={<Home className="h-6 w-6" />}
              isSelected={status === 'Rent'}
              onClick={() => handleStatusChange('Rent')}
            />
            <SelectionButton
              label="I Own With Mortgage"
              isSelected={status === 'Own With Mortgage'}
              onClick={() => handleStatusChange('Own With Mortgage')}
            />
            <SelectionButton
              label="I Own Free & Clear"
              isSelected={status === 'Own Free & Clear'}
              onClick={() => handleStatusChange('Own Free & Clear')}
            />
            <SelectionButton
              label="I Live With Family"
              isSelected={status === 'Live With Family'}
              onClick={() => handleStatusChange('Live With Family')}
            />
          </div>
        </div>

        {status === 'Rent' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Monthly Rent Amount *
              </label>
              <input
                type="number"
                value={details.rentAmount || ''}
                onChange={(e) => handleDetailChange('rentAmount', Number(e.target.value))}
                placeholder="1500"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </motion.div>
        )}

        {status === 'Own With Mortgage' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current PITI (Principal, Interest, Taxes, Insurance) *
              </label>
              <input
                type="number"
                value={details.piti || ''}
                onChange={(e) => handleDetailChange('piti', Number(e.target.value))}
                placeholder="2000"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Loan Balance *
              </label>
              <input
                type="number"
                value={details.loanBalance || ''}
                onChange={(e) => handleDetailChange('loanBalance', Number(e.target.value))}
                placeholder="250000"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Home Value *
              </label>
              <input
                type="number"
                value={details.homeValue || ''}
                onChange={(e) => handleDetailChange('homeValue', Number(e.target.value))}
                placeholder="350000"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Will you SELL or RENT this home? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <SelectionButton
                  label="Sell"
                  isSelected={details.willSellOrRent === 'Sell'}
                  onClick={() => handleDetailChange('willSellOrRent', 'Sell')}
                />
                <SelectionButton
                  label="Rent"
                  isSelected={details.willSellOrRent === 'Rent'}
                  onClick={() => handleDetailChange('willSellOrRent', 'Rent')}
                />
              </div>
            </div>
            {details.willSellOrRent === 'Rent' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expected Monthly Rent Income *
                </label>
                <input
                  type="number"
                  value={details.expectedRentIncome || ''}
                  onChange={(e) => handleDetailChange('expectedRentIncome', Number(e.target.value))}
                  placeholder="2000"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            )}
          </motion.div>
        )}

        {status === 'Own Free & Clear' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Home Value *
              </label>
              <input
                type="number"
                value={details.homeValue || ''}
                onChange={(e) => handleDetailChange('homeValue', Number(e.target.value))}
                placeholder="350000"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Will you SELL or RENT this home? *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <SelectionButton
                  label="Sell"
                  isSelected={details.willSellOrRent === 'Sell'}
                  onClick={() => handleDetailChange('willSellOrRent', 'Sell')}
                />
                <SelectionButton
                  label="Rent"
                  isSelected={details.willSellOrRent === 'Rent'}
                  onClick={() => handleDetailChange('willSellOrRent', 'Rent')}
                />
              </div>
            </div>
            {details.willSellOrRent === 'Rent' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expected Monthly Rent Income *
                </label>
                <input
                  type="number"
                  value={details.expectedRentIncome || ''}
                  onChange={(e) => handleDetailChange('expectedRentIncome', Number(e.target.value))}
                  placeholder="2000"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>

      <StepNavigation onNext={canProceed ? onNext : undefined} onBack={onBack} />
    </div>
  );
};

export default StepCurrentHousingStatus;

