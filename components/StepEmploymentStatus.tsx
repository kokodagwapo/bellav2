import React, { useState } from 'react';
import { motion } from 'framer-motion';
import StepHeader from './StepHeader';
import { SelectionButton } from './StepHeader';
import StepNavigation from './StepNavigation';
import { Briefcase, User, Clock, Home as HomeIcon } from './icons';
import type { FormData } from '../types';

interface StepEmploymentStatusProps {
  data: FormData;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepEmploymentStatus: React.FC<StepEmploymentStatusProps> = ({ 
  data, 
  onChange, 
  onNext, 
  onBack 
}) => {
  const [status, setStatus] = useState<FormData['employmentStatus']>(
    data.employmentStatus
  );

  const handleSelect = (value: FormData['employmentStatus']) => {
    setStatus(value);
    onChange('employmentStatus', value);
  };

  const employmentOptions = [
    { value: 'Employed' as const, icon: <Briefcase className="h-6 w-6" />, label: 'Employed' },
    { value: 'Self-Employed' as const, icon: <User className="h-6 w-6" />, label: 'Self-Employed' },
    { value: 'Gig Worker' as const, icon: <Clock className="h-6 w-6" />, label: 'Gig Worker / Freelancer' },
    { value: 'Retired' as const, icon: <HomeIcon className="h-6 w-6" />, label: 'Retired' },
    { value: 'Not Working' as const, icon: <User className="h-6 w-6" />, label: 'Not Working' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <StepHeader 
        title="Employment Status"
        subtitle="How would you describe your current employment situation?"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
        {employmentOptions.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <SelectionButton
              label={option.label}
              icon={option.icon}
              isSelected={status === option.value}
              onClick={() => handleSelect(option.value)}
            />
          </motion.div>
        ))}
      </div>

      <StepNavigation onNext={status ? onNext : undefined} onBack={onBack} />
    </div>
  );
};

export default StepEmploymentStatus;

