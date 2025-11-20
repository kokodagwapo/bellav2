import React, { useEffect } from 'react';
import { LoanPurpose } from '../../types';
import type { FormData } from '../../types';
import StepHeader from '../StepHeader';
import StepNavigation from '../StepNavigation';
import { Lightbulb } from '../icons';

interface Step2Props {
    data: FormData;
    onDataChange: (data: Partial<FormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

const InputField: React.FC<{ label: string; id: keyof FormData; value: number; onChange: (id: keyof FormData, value: number) => void; }> = ({ label, id, value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(id, parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0);
    };

    return (
        <div>
            <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">{label}</label>
            <input
                type="text"
                inputMode="numeric"
                id={id}
                value={value > 0 ? `$${value.toLocaleString()}` : ''}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-3 sm:px-3 sm:py-2.5 bg-background border border-border rounded-xl sm:rounded-lg shadow-sm text-base sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all touch-manipulation min-h-[44px] sm:min-h-[auto]"
            />
        </div>
    );
};

const Step2FinancialInfo: React.FC<Step2Props> = ({ data, onDataChange, onNext, onBack }) => {
    const handleFieldChange = (id: keyof FormData, value: number) => {
        onDataChange({ [id]: value });
    };

    // Backward compatibility: Pre-fill income from Prep4Loan if available
    useEffect(() => {
        if (data.income && data.income > 0 && !data.income) {
            // Income should already be set from Prep4Loan
        }
    }, [data.income]);

    const isPurchase = data.loanPurpose === LoanPurpose.PURCHASE;
    const isComplete = isPurchase 
        ? data.income && data.income > 0 && data.downPayment && data.downPayment > 0 && data.loanAmount && data.loanAmount > 0
        : data.income && data.income > 0 && data.loanAmount && data.loanAmount > 0;

    // Calculate DTI if we have income and loan amount
    const estimatedMonthlyPayment = data.loanAmount && data.income 
        ? (data.loanAmount * 0.005) // Rough estimate: 0.5% monthly payment
        : 0;
    const estimatedDTI = data.income && estimatedMonthlyPayment > 0
        ? ((estimatedMonthlyPayment / data.income) * 100).toFixed(1)
        : null;

    return (
        <div className="px-2 sm:px-0">
            <StepHeader title="Section 2: Financial Information" subtitle="Details about your current income and assets." />
            
            {/* Bella's Insight */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-800 rounded-md flex items-start gap-3 mt-4 mb-6">
                <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-sm">
                    <span className="font-semibold">Bella's Insight:</span> Use your gross monthly income (before taxes). If you have multiple income sources, we'll add those up in the next steps. For down payment, include any gift funds or assistance programs you're using.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6 md:mt-8">
                <InputField label="Monthly Income (from W-2/Paystub)" id="income" value={data.income || 0} onChange={handleFieldChange} />
                {isPurchase && (
                    <InputField label="Estimated Down Payment" id="downPayment" value={data.downPayment || 0} onChange={handleFieldChange} />
                )}
                <InputField label="Loan Amount Requested" id="loanAmount" value={data.loanAmount || 0} onChange={handleFieldChange} />
            </div>

            {/* DTI Insight */}
            {estimatedDTI && parseFloat(estimatedDTI) > 0 && (
                <div className="mt-4 bg-primary/10 border-l-4 border-primary p-3 text-primary rounded-md flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs">
                        <span className="font-semibold">Quick Check:</span> Based on your inputs, your estimated debt-to-income ratio would be around {estimatedDTI}%. Most lenders prefer DTI under 43% for conventional loans.
                    </p>
                </div>
            )}

            <StepNavigation onNext={onNext} onBack={onBack} isNextDisabled={!isComplete}/>
        </div>
    );
};

export default Step2FinancialInfo;