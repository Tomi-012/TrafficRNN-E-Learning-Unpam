import React, { useState, useEffect, useRef } from 'react';
import { simulateServerTraffic } from '../services/geminiService';
import { Play, TrendingUp, Activity, BarChart3, Server, Clock, Download, FileSpreadsheet, Users, Cpu, HardDrive, Zap, Terminal, BrainCircuit } from 'lucide-react';
import { TrafficDataPoint } from '../types';

const SCENARIOS = [
    "Hari Kuliah Biasa (Normal)",
    "Pekan Ujian (UTS/UAS)",
    "Periode KRS (Spike Ekstrim)",
    "Libur Semester (Low Traffic)",
    "Maintenance Malam"
];

const Playground: React.FC = () => {
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [result, setResult] = useState<TrafficDataPoint[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  
  // Real-time Metrics State
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 24, latency: 15 });
  const [logs, setLogs] = useState<string[]>([]);
  
  // Ref for the specific log container to handle internal scrolling safely
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Effect: Simulate Live Server Metrics Heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() - 0.5) * 15)),
        ram: Math.min(64, Math.max(16, prev.ram + (Math.random() - 0.5) * 5)), // Max 64GB
        latency: Math.max(5, prev.latency + (Math.random() - 0.5) * 10)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Effect: Auto-scroll logs using scrollTop to avoid layout shift (navbar disappearing)
  useEffect(() => {
    if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleSimulate = async () => {
    setLoading(true);
    setLogs([]); 
    
    // Force reset untuk animasi ulang chart
    if(hasRun) setHasRun(false);
    
    // Simulate process
    addLog("System: Initializing TrafficRNN Model...");
    await new Promise(r => setTimeout(r, 600));
    
    addLog(`Config: Loading Scenario "${scenario}"...`);
    await new Promise(r => setTimeout(r, 500));
    
    addLog("Data: Fetching historical server logs...");
    await new Promise(r => setTimeout(r, 500));
    
    addLog("Preprocessing: MinMax Scaling & Windowing...");
    await new Promise(r => setTimeout(r, 600));
    
    addLog("Core: Running Inference (Forward Pass)...");
    
    // API Call
    const res = await simulateServerTraffic(scenario);
    
    addLog("Post-processing: Decoding Time Series Output...");
    await new Promise(r => setTimeout(r, 400));
    
    addLog("Visualization: Rendering Charts...");
    
    setResult(res.data);
    setStudentCount(res.studentCount);
    // Hapus kata "AI" jika ada dari insight
    setInsight(res.insight.replace(/AI/g, "Sistem"));
    setLoading(false);
    setHasRun(true);
    addLog("Success: Simulation Completed.");
  };

  const handleDownloadCSV = () => {
    if (result.length === 0) return;

    const headers = "timestamp,active_students_est,actual_traffic,predicted_traffic\n";
    const rows = result.map(row => 
        `${row.time},${studentCount},${row.actual},${row.predicted}`
    ).join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    const filename = `traffic_data_${scenario.replace(/\s+/g, '_').toLowerCase()}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxVal = result.length > 0 ? Math.max(...result.map(d => Math.max(d.actual, d.predicted))) * 1.2 : 1000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      
      {/* LEFT COLUMN: Controls & Live Status */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        
        {/* Live Server Status Card */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400 animate-pulse" />
                    Live System Monitor
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">ONLINE</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 text-center transition-colors hover:bg-slate-800/50 hover:border-cyan-500/30">
                    <div className="text-[10px] text-slate-500 mb-1 flex justify-center items-center gap-1"><Cpu size={10}/> CPU</div>
                    <div className="text-lg font-mono font-bold text-cyan-400">{metrics.cpu.toFixed(0)}%</div>
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-1000" style={{width: `${metrics.cpu}%`}}></div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 text-center transition-colors hover:bg-slate-800/50 hover:border-violet-500/30">
                    <div className="text-[10px] text-slate-500 mb-1 flex justify-center items-center gap-1"><HardDrive size={10}/> RAM</div>
                    <div className="text-lg font-mono font-bold text-violet-400">{metrics.ram.toFixed(0)} GB</div>
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 transition-all duration-1000" style={{width: `${(metrics.ram/64)*100}%`}}></div>
                    </div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-white/5 text-center transition-colors hover:bg-slate-800/50 hover:border-yellow-500/30">
                    <div className="text-[10px] text-slate-500 mb-1 flex justify-center items-center gap-1"><Zap size={10}/> Ping</div>
                    <div className="text-lg font-mono font-bold text-yellow-400">{Math.round(metrics.latency)} ms</div>
                    <div className="w-full bg-slate-800 h-1 mt-1 rounded-full overflow-hidden">
                         <div className="h-full bg-yellow-500 transition-all duration-1000" style={{width: `${Math.min(100, metrics.latency)}%`}}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Input Controls */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl ring-1 ring-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Server className="text-cyan-400" />
                Konfigurasi Prediksi
            </h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm text-slate-400 mb-2">Skenario Trafik:</label>
                    <select 
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none backdrop-blur-sm transition-all hover:bg-black/50 text-sm"
                    >
                        {SCENARIOS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                    </select>
                </div>

                <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                    <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-2 flex items-center gap-2">
                        <BrainCircuit size={12}/> Parameter Model (RNN)
                    </h4>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-400 font-mono">
                        <div className="flex justify-between"><span>Hidden Layers:</span> <span className="text-cyan-300">2</span></div>
                        <div className="flex justify-between"><span>Sequence:</span> <span className="text-cyan-300">24h</span></div>
                        <div className="flex justify-between"><span>Learn Rate:</span> <span className="text-cyan-300">0.01</span></div>
                        <div className="flex justify-between"><span>Optimizer:</span> <span className="text-cyan-300">Adam</span></div>
                    </div>
                </div>

                <button 
                    onClick={handleSimulate}
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        loading ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:shadow-cyan-500/30 hover:scale-[1.02] text-white border border-white/10 active:scale-95'
                    }`}
                >
                    {loading ? <Activity className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                    {loading ? 'Processing...' : 'Jalankan Simulasi'}
                </button>
            </div>
        </div>

        {/* Console Logs */}
        {(loading || hasRun) && (
            <div className="bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-0 overflow-hidden flex flex-col shadow-inner h-52 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white/5 px-3 py-2 border-b border-white/5 flex items-center gap-2">
                    <Terminal size={12} className="text-slate-400"/>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Logs</span>
                </div>
                <div 
                    ref={logsContainerRef}
                    className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1 custom-scrollbar"
                >
                    {logs.map((log, i) => (
                        <div key={i} className="border-l-2 border-cyan-500/30 pl-2 animate-in fade-in duration-300">
                            <span className="text-slate-500">{log.split(']')[0]}]</span> 
                            <span className={log.includes("Error") ? "text-red-400" : log.includes("Success") ? "text-emerald-400" : "text-slate-300"}>
                                {log.split(']')[1]}
                            </span>
                        </div>
                    ))}
                    {loading && (
                        <div className="text-cyan-500 animate-pulse pl-2">_</div>
                    )}
                </div>
            </div>
        )}

    </div>

      {/* RIGHT COLUMN: Visualization */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        {/* Main Chart Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 min-h-[500px] flex flex-col relative overflow-hidden shadow-2xl ring-1 ring-white/5 flex-grow">
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <div className="flex justify-between items-start mb-6 z-10">
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart3 className="text-violet-400" />
                        Monitoring Trafik (24 Jam)
                    </h3>
                    {hasRun && (
                        <span className="text-xs text-slate-400 mt-1 flex gap-2">
                            Total Req: <span className="text-white font-mono">{result.reduce((a, b) => a + b.actual, 0).toLocaleString()}</span>
                            <span className="text-slate-600">|</span>
                            Peak Load: <span className="text-white font-mono">{Math.max(...result.map(d => d.actual)).toLocaleString()} RPM</span>
                        </span>
                    )}
                </div>
                
                <button 
                    onClick={handleDownloadCSV}
                    disabled={!hasRun}
                    className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        hasRun 
                        ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10 cursor-pointer' 
                        : 'bg-white/5 text-slate-600 border-transparent opacity-50 cursor-not-allowed'
                    }`}
                >
                    <FileSpreadsheet size={14} className={hasRun ? "text-emerald-400" : "text-slate-600"} />
                    Download CSV
                </button>
            </div>

            {!hasRun && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 z-10 opacity-70">
                    <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 relative">
                        <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-20"></div>
                        <Activity size={32} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">Menunggu Input Skenario...</p>
                    <p className="text-xs text-slate-600 mt-1">Pilih skenario di panel kiri dan klik "Jalankan Simulasi"</p>
                </div>
            ) : (
                <div className="flex-1 relative z-10 h-64 w-full">
                     {/* Loading Overlay within Chart */}
                     {loading && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm rounded-lg border border-white/5">
                            <Activity className="animate-spin text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" size={40} />
                            <span className="text-xs text-cyan-400 mt-2 font-mono tracking-widest uppercase animate-pulse">Computing...</span>
                        </div>
                     )}

                     {/* The Chart Container */}
                     <div className="absolute inset-0 flex items-end justify-between px-2 pb-6">
                        
                        {/* CHART VISUALIZATION */}
                        <div className="absolute inset-x-2 bottom-6 top-0 flex items-end justify-between gap-1 z-10">
                            {result.map((item, idx) => (
                                <div key={`bar-${idx}`} className="flex-1 h-full flex flex-col justify-end group relative min-w-[20px]">
                                    {/* Tooltip on Hover */}
                                    <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xl text-xs p-3 rounded-xl shadow-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap scale-95 group-hover:scale-100 duration-200">
                                        <div className="font-bold text-white mb-2 border-b border-white/10 pb-1 flex justify-between gap-6">
                                            <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400"/> {item.time}</span>
                                            <span className="text-slate-500 font-mono">#{idx}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <div className="text-cyan-400 font-mono text-[10px] uppercase">Actual</div>
                                            <div className="text-white font-bold text-right">{item.actual}</div>
                                            <div className="text-violet-400 font-mono text-[10px] uppercase">Predicted</div>
                                            <div className="text-white font-bold text-right">{item.predicted}</div>
                                        </div>
                                    </div>

                                    {/* 1. DATA ACTUAL BAR */}
                                    <div 
                                        className="w-full bg-gradient-to-t from-cyan-900/40 via-cyan-500/80 to-cyan-300 rounded-t-sm transition-all hover:brightness-125 relative overflow-hidden"
                                        style={{ height: `${(item.actual / maxVal) * 100}%` }}
                                    ></div>

                                    {/* 2. PREDICTION TICK (NEAT & CENTERED) */}
                                    {/* Menggunakan "Cap" atau "Pill" shape yang terpusat */}
                                    <div 
                                        className="absolute w-[120%] h-[4px] bg-violet-400 left-1/2 -translate-x-1/2 shadow-[0_0_8px_rgba(139,92,246,0.8)] z-20 rounded-full transition-all duration-500"
                                        style={{ bottom: `${(item.predicted / maxVal) * 100}%` }}
                                    ></div>

                                    {/* X-Axis Labels */}
                                    {idx % 4 === 0 && (
                                        <div className="text-center mt-2 text-[10px] font-mono text-slate-500 absolute -bottom-6 w-full transform -translate-x-1/2 left-1/2">
                                            {item.time.split(':')[0]}h
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            )}

            {/* Legend (Revised) */}
            {hasRun && (
                <div className="flex justify-center space-x-8 mt-4 border-t border-white/5 pt-4 z-10">
                    <div className="flex items-center text-xs text-slate-300">
                        <div className="w-3 h-3 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-sm mr-2 shadow-[0_0_5px_rgba(34,211,238,0.5)]"></div>
                        Data Aktual (Bar)
                    </div>
                    <div className="flex items-center text-xs text-slate-300">
                        <div className="w-6 h-1 bg-violet-400 rounded-full mr-2 shadow-[0_0_5px_rgba(139,92,246,0.8)]"></div>
                        Prediksi RNN (Tick)
                    </div>
                </div>
            )}

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', 
                     backgroundSize: '40px 40px',
                     maskImage: 'linear-gradient(to bottom, transparent, black)' 
                 }}>
            </div>
        </div>
        
        {/* Insight & Summary Cards (Only Show if Run) */}
        {hasRun && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg flex items-center justify-between group hover:border-cyan-500/30 transition-colors">
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">Total Mahasiswa Aktif</div>
                        <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
                            {studentCount.toLocaleString('id-ID')} 
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                             User Concurrency OK
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <Users size={24} className="text-cyan-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl border border-violet-500/20 rounded-xl p-5 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-violet-500/20 blur-3xl rounded-full group-hover:bg-violet-500/30 transition-all"></div>
                    <h4 className="text-violet-400 text-sm font-bold flex items-center gap-2 mb-2">
                        <TrendingUp size={16} /> Insight
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed italic relative z-10 border-l-2 border-violet-500/30 pl-3">
                        "{insight}"
                    </p>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default Playground;