import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from './icons';
import { FormData } from '../types';
import { getRequirements, Requirement } from '../data/requirements';

import { LoanPurpose } from '../types';

interface Prep4LoanChecklistProps {
  loanPurpose: LoanPurpose | '';
  formData: FormData;
}

const RequirementItem: React.FC<{ requirement: Requirement; isCompleted: boolean }> = ({ requirement, isCompleted }) => {
    if (!requirement || !requirement.label) {
        return null;
    }
    
    return (
        <div className="flex items-start gap-3">
        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300 ${isCompleted ? 'bg-primary border-primary shadow-sm shadow-primary/20' : 'border-border'}`}>
            {isCompleted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
            <div className="flex-1 min-w-0">
            <p className={`font-light text-sm transition-colors duration-300 ${isCompleted ? 'line-through opacity-60' : 'text-foreground'}`} style={isCompleted ? { color: '#6b7280' } : {}}>
                {requirement.label}
            </p>
        </div>
    </div>
);
};

const Prep4LoanChecklist: React.FC<Prep4LoanChecklistProps> = ({ loanPurpose, formData }) => {
  const requirements = getRequirements(loanPurpose);
  
  const completedCount = useMemo(() => {
    return requirements.filter(req => req.isCompleted(formData)).length;
  }, [requirements, formData]);

  const totalCount = requirements.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4 p-6 bg-secondary/50 rounded-lg border border-border">
      <div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-light tracking-tight text-foreground mb-1">Application Checklist</h3>
        <p className="text-xs sm:text-sm font-light leading-relaxed mb-3" style={{ color: '#6b7280' }}>
          This list tracks key information required for a complete application.
        </p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-light text-foreground">Progress</span>
          <span className="text-xs font-light text-primary">{completedCount} / {totalCount}</span>
        </div>
        <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/90 transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs font-light mt-1 text-right" style={{ color: '#6b7280' }}>{completionPercentage}% Complete</p>
      </div>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {requirements.map((req) => (
          <div key={req.key} className="p-2 rounded-lg hover:bg-muted/30 transition-colors">
            <RequirementItem 
              requirement={req} 
              isCompleted={req.isCompleted(formData)}
            />
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-border">
        <p className="text-xs font-light leading-relaxed" style={{ color: '#6b7280' }}>
          This is not an exhaustive list. Additional documentation may be required based on your specific loan scenario.
        </p>
      </div>
    </div>
  );
};

export default Prep4LoanChecklist;

