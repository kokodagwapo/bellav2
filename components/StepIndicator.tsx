import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from './icons';

interface StepIndicatorProps {
  labels: string[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
  stepIndices?: number[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ labels, currentStepIndex, onStepClick, stepIndices }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Scroll to active step when it changes
  useEffect(() => {
    if (activeStepRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeStep = activeStepRef.current;
      const containerWidth = container.offsetWidth;
      const stepLeft = activeStep.offsetLeft;
      const stepWidth = activeStep.offsetWidth;
      const scrollPosition = stepLeft - (containerWidth / 2) + (stepWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentStepIndex]);

  return (
    <div className="w-full pb-2 sm:pb-3 px-2 sm:px-4">
      <div 
        ref={containerRef}
        className="flex items-center w-full overflow-x-auto scrollbar-hide gap-1 sm:gap-2 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {labels.map((label, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          const isUpcoming = index > currentStepIndex;
          const showLabel = isActive || isCompleted || index === currentStepIndex + 1;

          return (
            <React.Fragment key={index}>
              <motion.div
                ref={isActive ? activeStepRef : null}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isCompleted ? 1 : (isActive ? 1 : (showLabel ? 0.6 : 0.3)),
                  scale: isActive ? 1.1 : 1,
                  width: isCompleted ? 'auto' : (isActive ? 'auto' : (showLabel ? 'auto' : '32px'))
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-center gap-1 sm:gap-2 flex-shrink-0"
              >
                <motion.button 
                  className="relative flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg cursor-pointer touch-manipulation group transition-all"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onStepClick && stepIndices && stepIndices[index] !== undefined && stepIndices[index] >= 0) {
                      onStepClick(stepIndices[index]);
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    pointerEvents: 'auto',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                  }}
                  aria-label={`Go to step: ${label || `Step ${index + 1}`}`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    </motion.div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                    >
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full" />
                    </motion.div>
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 border border-gray-300 flex-shrink-0"></div>
                  )}
                  
                  <AnimatePresence>
                    {showLabel && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`text-xs sm:text-sm font-light whitespace-nowrap ${
                          isActive 
                            ? 'text-primary' 
                            : isCompleted 
                            ? 'text-primary' 
                            : 'text-gray-500'
                        }`}
                      >
                        {label || `Step ${index + 1}`}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
              
              {index < labels.length - 1 && (
                <motion.div 
                  className="h-0.5 sm:h-1 bg-gray-200 rounded-full flex-shrink-0"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: isCompleted ? '24px' : (isActive ? '12px' : (showLabel ? '8px' : '4px'))
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div 
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : (isActive ? '50%' : '0%') }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;