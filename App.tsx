import React, { useState, useEffect, useRef } from 'react';
import { Activity, Code, BookOpen, Server, BrainCircuit, Workflow } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import RnnVisualizer from './components/RnnVisualizer';
import Playground from './components/Playground';
import PythonLab from './components/PythonLab';
import LoadingScreen from './components/LoadingScreen';
import { EtherealShadow } from './components/EtheralShadow';
import FlowchartPage from './components/FlowchartPage';
import { Tab } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.VISUALIZER);
  const [isLoading, setIsLoading] = useState(true);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Reset scroll when tab changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentTab]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <EtherealShadow
      color="#06b6d4" // Cyan-500
      animation={{ scale: 60, speed: 25 }}
      noise={{ opacity: 0.2, scale: 1.5 }}
      sizing="fill"
      // CHANGE: Use 'fixed inset-0' instead of 'h-screen w-screen' to strictly lock layout
      className="fixed inset-0 text-slate-200 selection:bg-cyan-500/30 font-sans overflow-hidden"
    >
      {/* Container utama menggunakan Flex Column Full Height */}
      <div className="flex flex-col h-full">

        {/* Header - Fixed Height & Z-Index tinggi agar tidak hilang */}
        <header className="flex-none z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5 shadow-lg shadow-black/20 h-16 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setCurrentTab(Tab.VISUALIZER)}>
              <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white h-6 w-6 drop-shadow-md">
                  <path d="M15 2V22" />
                  <path d="M5 14H19" />
                  <path d="M5 14L15 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-md">TrafficRNN</h1>
                <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase shadow-black drop-shadow-sm">E-Learning Unpam</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setCurrentTab(Tab.VISUALIZER)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${currentTab === Tab.VISUALIZER ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <BookOpen size={16} />
                <span>Konsep & Alur</span>
              </button>
              <button
                onClick={() => setCurrentTab(Tab.PLAYGROUND)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${currentTab === Tab.PLAYGROUND ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Activity size={16} />
                <span>Simulasi Trafik</span>
              </button>
              <button
                onClick={() => setCurrentTab(Tab.PYTHON_LAB)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${currentTab === Tab.PYTHON_LAB ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Code size={16} />
                <span>Kode Python</span>
              </button>

            </nav>
          </div>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden flex-none flex justify-around border-b border-white/5 bg-slate-950/80 backdrop-blur-md p-2 z-40 relative">
          <button onClick={() => setCurrentTab(Tab.VISUALIZER)} className={`p-2 rounded-lg transition-colors ${currentTab === Tab.VISUALIZER ? 'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-slate-500'}`}><BookOpen size={20} /></button>
          <button onClick={() => setCurrentTab(Tab.PLAYGROUND)} className={`p-2 rounded-lg transition-colors ${currentTab === Tab.PLAYGROUND ? 'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-slate-500'}`}><Activity size={20} /></button>
          <button onClick={() => setCurrentTab(Tab.PYTHON_LAB)} className={`p-2 rounded-lg transition-colors ${currentTab === Tab.PYTHON_LAB ? 'bg-white/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-slate-500'}`}><Code size={20} /></button>

        </div>

        {/* Main Content - SCROLLABLE AREA */}
        <main ref={mainRef} id="main-scroll" className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative flex flex-col">
          <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full h-full"
              >
                {currentTab === Tab.VISUALIZER && (
                  <div className="space-y-8 pb-12">
                    <div className="text-center max-w-3xl mx-auto mb-12 relative">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">Studi Kasus: Prediksi Trafik Server</h2>
                      <p className="text-slate-300 text-lg drop-shadow-sm">
                        Penerapan Algoritma <strong className="text-cyan-400">Recurrent Neural Network (RNN)</strong> untuk Memprediksi Beban Trafik Server E-Learning Universitas Pamulang.
                      </p>
                    </div>
                    <RnnVisualizer />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-cyan-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                        <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2"><Server size={20} className="text-red-400" /> Masalah: Downtime</h3>
                        <p className="text-slate-400 text-sm">Server E-Learning sering <em>down</em> atau lambat saat periode kritis seperti UTS/UAS atau pendaftaran KRS karena lonjakan trafik tak terduga.</p>
                      </div>
                      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-violet-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                        <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2"><BrainCircuit size={20} className="text-violet-400" /> Solusi: RNN Forecasting</h3>
                        <p className="text-slate-400 text-sm">Menggunakan algoritma RNN untuk mempelajari pola data log server (Time Series) dan memprediksi beban trafik di masa depan secara akurat.</p>
                      </div>
                      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 shadow-lg">
                        <h3 className="text-white font-bold mb-2 text-lg flex items-center gap-2"><Activity size={20} className="text-emerald-400" /> Dampak: Auto Scaling</h3>
                        <p className="text-slate-400 text-sm">Dengan prediksi akurat, tim IT dapat menyiapkan resource tambahan (Auto Scaling) SEBELUM lonjakan terjadi, menjaga stabilitas E-Learning.</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === Tab.PLAYGROUND && <Playground />}

                {currentTab === Tab.PYTHON_LAB && <PythonLab onOpenFlowchart={() => setCurrentTab(Tab.FLOWCHART)} />}

                {currentTab === Tab.FLOWCHART && <FlowchartPage />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer - mt-auto ensures it sticks to bottom if content is short */}
          <footer className="mt-auto border-t border-white/5 py-8 bg-slate-950/80 backdrop-blur-sm z-10 relative">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
              <p>© 2025 Studi Kasus ML Universitas Pamulang. Dikerjakan oleh Kelompok 4.</p>
              <p className="mt-2 text-xs">Topik: Penerapan RNN untuk Prediksi Beban Trafik Server.</p>
            </div>
          </footer>
        </main>
      </div>
    </EtherealShadow>
  );
}
