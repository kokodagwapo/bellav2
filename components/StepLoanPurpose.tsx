import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal } from '../types';
import StepHeader from './StepHeader';
import { SelectionButton } from './StepHeader';
import { ShoppingCart, Repeat, Zap, TrendingUp } from './icons';
import { generateBellaSpeech } from '../services/geminiService';
import { decodeAudioData, decode } from '../utils/audioUtils';

interface StepLoanPurposeProps {
  data: { goal?: Goal | '' };
  onChange: (field: string, value: Goal) => void;
  onNext: () => void;
  onBack: () => void;
}

const goalOptions = [
  { value: Goal.BUY_HOME, icon: <ShoppingCart className="h-8 w-8"/>, label: 'Buy a Home' },
  { value: Goal.REFINANCE_MORTGAGE, icon: <Repeat className="h-8 w-8" />, label: 'Refinance My Mortgage' },
  { value: Goal.CHECK_BUYING_POWER, icon: <TrendingUp className="h-8 w-8" />, label: 'Check My Buying Power' },
  { value: Goal.QUALIFY_FASTER, icon: <Zap className="h-8 w-8" />, label: 'See If I Qualify Faster' },
];

const gamificationMessages = [
  "Nice! Step unlocked. 🎉",
  "You're crushing it! 💪",
  "Awesome choice! Let's go! 🚀",
  "Boom! You're on a roll! ⚡",
  "That's the spirit! Keep it up! ✨",
  "Way to go! You're doing great! 🌟",
  "Excellent! You're making progress! 🎯",
  "Sweet! Let's keep moving forward! 🏃",
  "Perfect! You're on fire! 🔥",
  "Nice pick! You've got this! 💯",
  "Fantastic! Step by step! 👣",
  "Great choice! You're nailing it! 🎯",
  "Love it! Keep going! 💚",
  "Amazing! You're unstoppable! 🚀",
  "Brilliant! Let's do this! 💎"
];

const getRandomMessage = () => {
  return gamificationMessages[Math.floor(Math.random() * gamificationMessages.length)];
};

const StepLoanPurpose: React.FC<StepLoanPurposeProps> = ({ data, onChange, onNext }) => {
  const [showGamification, setShowGamification] = useState(false);
  const [gamificationMessage, setGamificationMessage] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize audio context
    audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Play Bella voice on mount
    const playBellaVoice = async () => {
      try {
        const audioContext = audioContextRef.current;
        if (!audioContext) return;
        
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        
        const audioData = await generateBellaSpeech("Let's get started!");
        if (audioData && audioContext) {
          const buffer = await decodeAudioData(decode(audioData), audioContext, 24000, 1);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start();
        }
      } catch (error) {
        console.error('Error playing Bella voice:', error);
      }
    };
    playBellaVoice();
    
    return () => {
      audioContextRef.current?.close().catch(console.error);
    };
  }, []);

  const handleSelect = (value: Goal) => {
    onChange('goal', value);
    setGamificationMessage(getRandomMessage());
    setShowGamification(true);
    setTimeout(() => {
      setShowGamification(false);
      setTimeout(onNext, 500);
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-2 sm:px-0">
      <StepHeader 
        title="What is the purpose of this loan?" 
        subtitle="Select the option that best describes your loan needs"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {goalOptions.map((option, index) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <SelectionButton
              label={option.label}
              icon={option.icon}
              isSelected={data.goal === option.value}
              onClick={() => handleSelect(option.value)}
            />
          </motion.div>
        ))}
      </div>
      
      <AnimatePresence>
        {showGamification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mt-6 text-center"
          >
            <div className="inline-block px-6 py-3 bg-primary/10 border-2 border-primary rounded-full">
              <p className="text-primary font-semibold text-lg">{gamificationMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StepLoanPurpose;