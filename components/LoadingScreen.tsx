import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Server, Zap } from 'lucide-react';
import { AuroraBackground } from './AuroraBackground';

const LoadingScreen: React.FC = () => {
  const [statusText, setStatusText] = useState("Initializing System...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulasi log loading sistem
    const steps = [
        "Connecting to Neural Core...",
        "Loading Training Datasets (Unpam Logs)...",
        "Configuring RNN Layers...",
        "Optimizing Weights & Biases...",
        "Establishing Secure Connection...",
        "System Ready."
    ];
    
    let currentStep = 0;
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            setStatusText(steps[currentStep]);
            currentStep++;
        }
    }, 500);

    // Simulasi progress bar
    const progressInterval = setInterval(() => {
        setProgress(prev => {
            if (prev >= 100) {
                clearInterval(progressInterval);
                return 100;
            }
            // Kecepatan progress acak agar terlihat natural
            return prev + Math.random() * 3;
        });
    }, 80);

    return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
    };
  }, []);

  return (
    <AuroraBackground className="fixed inset-0 z-[100] overflow-hidden font-mono">
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8">
        
        {/* Main Loader Animation */}
        <div className="relative w-24 h-24 mb-12">
            <motion.div 
                className="absolute inset-0 border-t-2 border-r-2 border-cyan-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="absolute inset-2 border-b-2 border-l-2 border-violet-500 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
                className="absolute inset-0 border border-white/5 rounded-full"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit size={32} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
            </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-2"
            >
                Traffic<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">RNN</span>
            </motion.h1>
            <p className="text-[10px] md:text-xs text-slate-500 tracking-[0.3em] uppercase">Machine Learning Dashboard</p>
        </div>

        {/* Status & Progress */}
        <div className="w-full space-y-2">
            <div className="flex justify-between items-end text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-2">
                    <Server size={12} className="animate-pulse" />
                    {statusText}
                </span>
                <span className="text-white font-mono">{Math.min(100, Math.floor(progress))}%</span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5 relative">
                <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-600 via-violet-500 to-cyan-400 bg-[length:200%_100%]"
                    style={{ width: `${Math.min(100, progress)}%` }}
                    animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                {/* Glow Head of Progress Bar */}
                <div 
                    className="absolute top-0 bottom-0 w-2 bg-white blur-[4px]" 
                    style={{ left: `${Math.min(100, progress)}%`, transition: 'left 0.1s linear' }}
                />
            </div>
        </div>

        {/* Footer Code Decor */}
        <div className="mt-12 w-full grid grid-cols-2 gap-4 text-[10px] font-mono opacity-30 text-cyan-200">
             <div className="flex flex-col gap-1">
                <span>&gt; init_sequence(vocab_size=1000)</span>
                <span>&gt; checking_gpu_availability...</span>
                <span className="flex items-center gap-1"><Zap size={8}/> CUDA_CORES: DETECTED</span>
             </div>
             <div className="flex flex-col gap-1 text-right">
                <span>STATUS: OK</span>
                <span>LATENCY: 12ms</span>
                <span>SECURE: TRUE</span>
             </div>
        </div>

      </div>
    </AuroraBackground>
  );
};

export default LoadingScreen;