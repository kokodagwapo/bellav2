import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { generateBellaSpeech } from '../services/geminiService';
import { decodeAudioData, decode } from '../utils/audioUtils';

interface DemoScriptStep {
  time: number;
  action: string;
  text: string;
  targetUrl?: string;
  scrollTarget?: string;
  clickTarget?: string;
}

const demoScript: DemoScriptStep[] = [
  {
    time: 0,
    action: "Landing Page & Scroll",
    text: "Hi! Welcome to the 'not-boring' way to get a mortgage. This is Prep4Loan. Think of it as the warm-up lap before the marathon... except we make the marathon feel like a walk in the park.",
    targetUrl: "/",
    scrollTarget: "top"
  },
  {
    time: 10,
    action: "Click 'Start Pre-Evaluation'",
    text: "We start here. No scary forms yet. Just you, me, and some big friendly buttons. It's like a dating app, but for your dream home.",
    clickTarget: "Start Pre-Evaluation"
  },
  {
    time: 20,
    action: "Step-by-Step Flow",
    text: "See how easy this is? 'Purchase a Home', 'Single Family'... I'm just asking the basics. We keep it light because, let's be honest, nobody wakes up excited to fill out paperwork.",
    clickTarget: "Get Started"
  },
  {
    time: 35,
    action: "Progress Bar & Checklist",
    text: "Check out the left side. That's Bella—that's me!—keeping you organized. I'm like your personal assistant, but I don't drink all your coffee. I build your checklist in real-time so you know exactly what's happening."
  },
  {
    time: 45,
    action: "Click 'Document List'",
    text: "And for the documents? I've got super-vision. You upload your W2s, pay stubs, whatever—and I use OCR to read them instantly. I verify them faster than you can say 'low interest rate'.",
    clickTarget: "Document List"
  },
  {
    time: 55,
    action: "Click 'Home Journey' (URLA 1003)",
    text: "Now, for the magic trick. We switch to the Home Journey. This is the serious, official 1003 form that lenders need.",
    clickTarget: "Home Journey"
  },
  {
    time: 65,
    action: "Scrolling Form",
    text: "But guess what? You don't have to type it all again! I already moved your info over. Lenders love it because it's perfect; you love it because you're done. Easy, right?",
    scrollTarget: "form-content"
  }
];

const DemoController: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playStep = async (index: number) => {
    if (index >= demoScript.length) {
      setIsPlaying(false);
      return;
    }

    setCurrentStep(index);
    const step = demoScript[index];
    
    // Handle navigation/actions (mock for now, or implement real navigation)
    console.log(`Executing step ${index}: ${step.action}`);

    if (!isMuted) {
      setIsLoadingAudio(true);
      try {
        const audioData = await generateBellaSpeech(step.text);
        if (audioData && audioContextRef.current) {
          if (currentSourceRef.current) {
            currentSourceRef.current.stop();
          }
          
          const buffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => {
             if (isPlaying) {
                 // Auto-advance logic could go here, or rely on manual/timed
                 // For this demo controller, we'll just let the user click next or wait
             }
          };
          source.start();
          currentSourceRef.current = source;
        }
      } catch (error) {
        console.error("Error playing audio:", error);
      } finally {
        setIsLoadingAudio(false);
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }
    } else {
      setIsPlaying(true);
      playStep(currentStep);
    }
  };

  const nextStep = () => {
    playStep(currentStep + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-50 bg-white/90 backdrop-blur-md border border-primary/20 shadow-2xl rounded-2xl p-4 w-80"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-primary">Bella Live Demo</h3>
        <div className="flex gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
      
      <div className="mb-4 min-h-[60px]">
        <p className="text-sm text-gray-600 italic">
          {isLoadingAudio ? "Bella is thinking..." : `"${demoScript[currentStep].text}"`}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={togglePlay}
          className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <button 
          onClick={nextStep}
          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-all"
        >
          <SkipForward size={24} />
        </button>
      </div>
      
      <div className="mt-3 flex justify-between text-xs text-gray-400">
        <span>Step {currentStep + 1}/{demoScript.length}</span>
        <span>{demoScript[currentStep].action}</span>
      </div>
    </motion.div>
  );
};

export default DemoController;
