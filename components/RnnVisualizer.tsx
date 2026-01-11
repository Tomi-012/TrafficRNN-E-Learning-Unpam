import React from 'react';
import { ArrowRight, Database, BrainCircuit, LineChart, Server, Activity } from 'lucide-react';

const RnnVisualizer: React.FC = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
      
      {/* Glossy Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

      <div className="text-center mb-12 relative z-10">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 drop-shadow-sm">
          Alur Kerja Deep Learning (RNN)
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Arsitektur sistem prediksi beban server E-Learning Universitas Pamulang untuk optimalisasi resource dan pencegahan down time.
        </p>
      </div>

      <div className="relative z-10">
        {/* Connecting Line Center */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent -translate-x-1/2 hidden md:block"></div>

        <div className="space-y-12 relative z-10">
            
            {/* Step 1: Data Acquisition */}
            <div className="flex flex-col md:flex-row items-center md:justify-between group">
                <div className="md:w-5/12 text-center md:text-right md:pr-8 mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white mb-2">1. Data Acquisition (Server Logs)</h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        Mengambil data log historis dari <strong>Server Apache/Nginx</strong> E-Learning Unpam. Parameter utama adalah <em>Requests Per Second</em> (RPS), penggunaan CPU, dan RAM.
                    </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border-4 border-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] z-10 relative">
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md"></div>
                    <Server className="text-cyan-400 relative z-10" size={28} />
                </div>
                <div className="md:w-5/12 md:pl-8">
                     <div className="bg-black/40 backdrop-blur-sm p-3 rounded border border-white/10 font-mono text-xs text-green-400 shadow-inner">
                        access.log -&gt; CSV<br/>
                        Timestamp, IP, Request, Status
                     </div>
                </div>
            </div>

            {/* Step 2: Preprocessing */}
            <div className="flex flex-col md:flex-row-reverse items-center md:justify-between group">
                <div className="md:w-5/12 text-center md:text-left md:pl-8 mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white mb-2">2. Preprocessing & Resampling</h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        Data log mentah di-resample menjadi data <strong>Time Series Per Jam</strong>. Data dinormalisasi (MinMax Scaling 0-1) agar komputasi RNN efisien, lalu dibuat menjadi Sliding Window.
                    </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border-4 border-violet-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] z-10 relative">
                     <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md"></div>
                    <Database className="text-violet-400 relative z-10" size={28} />
                </div>
                <div className="md:w-5/12 md:pr-8 text-right">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded border border-white/10 font-mono text-xs text-yellow-400 inline-block text-left shadow-inner">
                        Input (t-5...t): [1200, 1350...]<br/>
                        Target (t+1): [1500]
                     </div>
                </div>
            </div>

            {/* Step 3: RNN Architecture */}
            <div className="flex flex-col md:flex-row items-center md:justify-between group">
                <div className="md:w-5/12 text-center md:text-right md:pr-8 mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white mb-2">3. RNN Modelling</h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        Model <strong>Recurrent Neural Network (RNN)</strong> dilatih untuk mempelajari pola trafik harian. RNN memiliki <em>hidden state</em> (memori) yang memungkinkannya mengingat informasi dari urutan waktu sebelumnya.
                    </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border-4 border-pink-500 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.4)] z-10 relative">
                    <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-md"></div>
                    <BrainCircuit className="text-pink-400 relative z-10" size={28} />
                </div>
                <div className="md:w-5/12 md:pl-8">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded border border-white/10 font-mono text-xs text-blue-300 shadow-inner">
                        h_t = tanh(W_h * h_{`t-1`} + W_x * x_t)
                     </div>
                </div>
            </div>

            {/* Step 4: Forecasting & Scaling */}
            <div className="flex flex-col md:flex-row-reverse items-center md:justify-between group">
                <div className="md:w-5/12 text-center md:text-left md:pl-8 mb-4 md:mb-0">
                    <h3 className="text-xl font-bold text-white mb-2">4. Prediksi & Auto-Scaling</h3>
                    <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        Model memprediksi beban trafik 1 jam ke depan. Jika prediksi melampaui ambang batas, sistem dapat otomatis menambah server (Auto Scaling) sebelum terjadi overload.
                    </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-800/80 border-4 border-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] z-10 relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md"></div>
                    <Activity className="text-emerald-400 relative z-10" size={28} />
                </div>
                 <div className="md:w-5/12 md:pr-8 text-right">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded border border-white/10 font-mono text-xs text-emerald-300 inline-block shadow-inner">
                        If Predicted &gt; Threshold:<br/>
                        Scale Up Server Instances
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RnnVisualizer;