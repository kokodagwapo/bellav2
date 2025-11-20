import React, { useRef, useEffect } from 'react';
import StepHeader from './StepHeader';
import StepNavigation from './StepNavigation';
import { Lightbulb } from './icons';

interface StepNameProps {
  data: { fullName: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepName: React.FC<StepNameProps> = ({ data, onChange, onNext, onBack }) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const isFormValid = data.fullName.trim().includes(' ');

  return (
    <div className="px-2 sm:px-0">
      <StepHeader 
        title="What is your full name?"
      />
      
      {/* Bella's Insight */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-800 rounded-md flex items-start gap-3 mt-4 mb-6">
        <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
        <p className="text-sm">
          <span className="font-semibold">Bella's Insight:</span> Make sure to use your full legal name exactly as it appears on your government-issued ID. This helps prevent delays during verification!
        </p>
      </div>
      
      <div className="space-y-4 mt-4 sm:mt-6">
        <input
          ref={nameInputRef}
          type="text"
          placeholder="John Smith"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          className="w-full px-4 py-3 sm:py-3.5 text-base sm:text-lg border border-input bg-background rounded-xl sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition duration-200 touch-manipulation min-h-[48px] sm:min-h-[44px]"
          style={{ fontSize: '16px' }}
          aria-label="Full Name"
          required
        />
      </div>
      <StepNavigation onNext={onNext} onBack={onBack} isNextDisabled={!isFormValid} />
    </div>
  );
};

export default StepName;