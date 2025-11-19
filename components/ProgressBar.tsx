import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progressPercentage = totalSteps > 1
    ? ((currentStep - 1) / (totalSteps - 1)) * 100
    : (currentStep > 0 ? 100 : 0);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
        <span className="font-medium text-muted-foreground">Progress</span>
        <span className="font-semibold text-primary">{currentStep} of {totalSteps}</span>
      </div>
      <div className="w-full bg-muted/50 rounded-full h-2.5 sm:h-3 overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/90 shadow-sm relative overflow-hidden"
        >
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
