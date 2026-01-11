
import React, { useState, useRef } from 'react';
import { Workflow, BrainCircuit, Database, FileCode2, Rocket, LineChart, Settings2, GitBranch, Zap, CheckCircle2, Plus, Minus, RotateCcw } from 'lucide-react';

type NodeSide = 'top' | 'right' | 'bottom' | 'left';
type NodeShape = 'rect' | 'diamond' | 'rounded';

type NodeDef = {
  id: string;
  title: string;
  lines: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  accent: string;
  shape?: NodeShape;
  icon?: string;
};

type EdgeDef = {
  from: string;
  to: string;
  fromSide?: NodeSide;
  toSide?: NodeSide;
  label?: string;
  color: string;
  curve?: 'smooth';
  animated?: boolean;
};

// REDESIGNED FLOWCHART - Clean Vertical Layout with Clear Lines
const nodes: NodeDef[] = [
  // COLUMN 1: Main Flow (Left)
  {
    id: 'start',
    title: 'START',
    lines: ['Inisialisasi Program', 'Import Libraries'],
    x: 100,
    y: 50,
    width: 240,
    height: 90,
    accent: '#06b6d4',
    shape: 'rounded'
  },
  {
    id: 'dataset',
    title: 'dataset_generator.py',
    lines: ['Konfigurasi 5 skenario:', 'Normal, UTS/UAS, KRS, Libur, Maintenance'],
    x: 100,
    y: 180,
    width: 240,
    height: 100,
    accent: '#22d3ee'
  },
  {
    id: 'generate',
    title: 'Generate Time Series',
    lines: ['• Pola sinusoidal harian', '• Random noise variasi', '• Spike lonjakan trafik'],
    x: 100,
    y: 320,
    width: 240,
    height: 110,
    accent: '#38bdf8'
  },
  {
    id: 'csv',
    title: 'traffic_dataset.csv',
    lines: ['120 baris (24 jam × 5 skenario)', 'Kolom: scenario, hour,', 'active_students, requests_per_min'],
    x: 100,
    y: 470,
    width: 240,
    height: 110,
    accent: '#0ea5e9'
  },

  // COLUMN 2: Processing (Center-Left)
  {
    id: 'loader',
    title: 'traffic_forecast.py',
    lines: ['Load CSV dengan pandas', 'Deteksi unique scenarios', 'Loop untuk setiap skenario'],
    x: 420,
    y: 470,
    width: 240,
    height: 110,
    accent: '#a78bfa'
  },
  {
    id: 'preprocess',
    title: 'Data Preprocessing',
    lines: ['Extract kolom requests_per_min', 'MinMaxScaler normalisasi [0,1]', 'Split sequence (t-1 → t)'],
    x: 420,
    y: 620,
    width: 240,
    height: 110,
    accent: '#c084fc'
  },

  // COLUMN 3: Decision Point (Center)
  {
    id: 'decision',
    title: 'Cek PyTorch',
    lines: ['try: import torch', 'USE_TORCH = ?'],
    x: 740,
    y: 620,
    width: 200,
    height: 90,
    accent: '#f97316',
    shape: 'diamond'
  },

  // COLUMN 4: PyTorch Path (Right-Top)
  {
    id: 'torch_path',
    title: 'PyTorch Available',
    lines: ['Mode: Deep Learning RNN'],
    x: 1020,
    y: 470,
    width: 220,
    height: 80,
    accent: '#22c55e'
  },
  {
    id: 'torch_model',
    title: 'Build RNN Model',
    lines: ['nn.RNN(input=1, hidden=32)', 'nn.Linear(32 → 1)', 'Optimizer: Adam(lr=0.01)'],
    x: 1020,
    y: 590,
    width: 220,
    height: 100,
    accent: '#16a34a'
  },
  {
    id: 'torch_train',
    title: 'Training Loop',
    lines: ['50 epochs', 'Forward → MSELoss → Backward', 'Update weights'],
    x: 1020,
    y: 730,
    width: 220,
    height: 100,
    accent: '#15803d'
  },

  // COLUMN 5: NumPy Path (Right-Bottom)
  {
    id: 'numpy_path',
    title: 'PyTorch Failed',
    lines: ['Mode: NumPy Fallback'],
    x: 1020,
    y: 870,
    width: 220,
    height: 80,
    accent: '#f59e0b'
  },
  {
    id: 'numpy_model',
    title: 'NumPy Simulation',
    lines: ['Smoothing: 0.6×prev + 0.4×val', 'Add random noise', 'Calculate MSE manually'],
    x: 1020,
    y: 990,
    width: 220,
    height: 100,
    accent: '#d97706'
  },

  // COLUMN 6: Results Processing (Center-Right)
  {
    id: 'predict',
    title: 'Generate Predictions',
    lines: ['Model.predict(X_test)', 'Inverse scaling transform', 'Calculate metrics'],
    x: 740,
    y: 870,
    width: 220,
    height: 100,
    accent: '#06b6d4'
  },
  {
    id: 'merge',
    title: 'Aggregate Results',
    lines: ['all_results[scenario] = {', '  actual, predicted, loss,', '  students, peak }'],
    x: 740,
    y: 1010,
    width: 220,
    height: 100,
    accent: '#0891b2'
  },

  // COLUMN 7: Output (Center-Left)
  {
    id: 'json',
    title: 'JSON Serialization',
    lines: ['json.dumps(all_results)', 'Embed into HTML template'],
    x: 420,
    y: 1010,
    width: 240,
    height: 90,
    accent: '#0e7490'
  },
  {
    id: 'dashboard',
    title: 'Create Dashboard',
    lines: ['dashboard_result.html', 'Tailwind CSS + Chart.js', 'Interactive dropdown'],
    x: 420,
    y: 1140,
    width: 240,
    height: 100,
    accent: '#8b5cf6'
  },

  // COLUMN 8: Final Steps (Left)
  {
    id: 'browser',
    title: 'Open in Browser',
    lines: ['webbrowser.open()', 'User dapat switch skenario', 'View interactive charts'],
    x: 100,
    y: 1140,
    width: 240,
    height: 100,
    accent: '#7c3aed'
  },
  {
    id: 'end',
    title: 'END',
    lines: ['Program selesai', 'Dashboard ready to use'],
    x: 100,
    y: 1280,
    width: 240,
    height: 90,
    accent: '#10b981',
    shape: 'rounded'
  }
];

// CLEAN EDGES - No overlapping lines
const edges: EdgeDef[] = [
  // Main vertical flow (left column)
  { from: 'start', to: 'dataset', fromSide: 'bottom', toSide: 'top', color: '#06b6d4', label: 'Execute', animated: true },
  { from: 'dataset', to: 'generate', fromSide: 'bottom', toSide: 'top', color: '#22d3ee', label: 'Configure' },
  { from: 'generate', to: 'csv', fromSide: 'bottom', toSide: 'top', color: '#38bdf8', label: 'Export' },

  // Horizontal to processing
  { from: 'csv', to: 'loader', fromSide: 'right', toSide: 'left', color: '#0ea5e9', label: 'Load Data', animated: true },
  { from: 'loader', to: 'preprocess', fromSide: 'bottom', toSide: 'top', color: '#a78bfa', label: 'Process' },

  // To decision point
  { from: 'preprocess', to: 'decision', fromSide: 'right', toSide: 'left', color: '#c084fc', label: 'Check' },

  // PyTorch path (top branch)
  { from: 'decision', to: 'torch_path', fromSide: 'top', toSide: 'bottom', color: '#22c55e', label: 'True' },
  { from: 'torch_path', to: 'torch_model', fromSide: 'bottom', toSide: 'top', color: '#22c55e', label: 'Build' },
  { from: 'torch_model', to: 'torch_train', fromSide: 'bottom', toSide: 'top', color: '#16a34a', label: 'Train' },
  { from: 'torch_train', to: 'predict', fromSide: 'bottom', toSide: 'right', color: '#15803d', label: 'Predict' },

  // NumPy path (bottom branch)
  { from: 'decision', to: 'numpy_path', fromSide: 'bottom', toSide: 'top', color: '#f59e0b', label: 'False' },
  { from: 'numpy_path', to: 'numpy_model', fromSide: 'bottom', toSide: 'top', color: '#f59e0b', label: 'Simulate' },
  { from: 'numpy_model', to: 'predict', fromSide: 'left', toSide: 'right', color: '#d97706', label: 'Predict' },

  // Results flow
  { from: 'predict', to: 'merge', fromSide: 'bottom', toSide: 'top', color: '#06b6d4', label: 'Collect' },
  { from: 'merge', to: 'json', fromSide: 'left', toSide: 'right', color: '#0891b2', label: 'Serialize' },
  { from: 'json', to: 'dashboard', fromSide: 'bottom', toSide: 'top', color: '#0e7490', label: 'Render' },

  // Final flow
  { from: 'dashboard', to: 'browser', fromSide: 'left', toSide: 'right', color: '#8b5cf6', label: 'Open' },
  { from: 'browser', to: 'end', fromSide: 'bottom', toSide: 'top', color: '#7c3aed', label: 'Done' }
];

const defaultSize = { width: 200, height: 100 };

const getNode = (id: string) => {
  const found = nodes.find((n) => n.id === id);
  if (!found) {
    throw new Error(`Node ${id} not found`);
  }
  return {
    ...found,
    width: found.width ?? defaultSize.width,
    height: found.height ?? defaultSize.height,
    shape: found.shape ?? 'rect'
  };
};

const getAnchor = (node: ReturnType<typeof getNode>, side: NodeSide) => {
  const { x, y, width, height } = node;
  switch (side) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
    default:
      return { x, y: y + height / 2 };
  }
};

const buildPath = (start: { x: number; y: number }, end: { x: number; y: number }, curve?: 'smooth') => {
  if (curve === 'smooth') {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} Q ${midX} ${start.y}, ${midX} ${midY} T ${end.x} ${end.y} `;
  }

  if (start.x === end.x || start.y === end.y) {
    return `M ${start.x} ${start.y} L ${end.x} ${end.y} `;
  }

  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y} `;
};

const FlowNode: React.FC<NodeDef> = ({ id, title, lines, x, y, width, height, accent, shape }) => {
  const w = width ?? defaultSize.width;
  const h = height ?? defaultSize.height;
  const shapeType = shape ?? 'rect';

  return (
    <g filter="url(#nodeShadow)">
      {shapeType === 'diamond' ? (
        <>
          <path
            d={`M ${x + w / 2} ${y} L ${x + w} ${y + h / 2} L ${x + w / 2} ${y + h} L ${x} ${y + h / 2} Z`}
            fill="rgba(12,18,36,0.98)"
            stroke={accent}
            strokeWidth={2.8}
          />
          <foreignObject x={x + w * 0.15} y={y + h * 0.25} width={w * 0.7} height={h * 0.5}>
            <div className="h-full w-full flex flex-col justify-center items-center text-center">
              <div className="text-[12px] font-bold text-white leading-tight break-words drop-shadow">
                {title}
              </div>
              <div className="mt-1 space-y-0.5">
                {lines.map((line, idx) => (
                  <p key={`${id} -line - ${idx} `} className="text-[10px] text-slate-200 leading-tight break-words">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </foreignObject>
        </>
      ) : shapeType === 'rounded' ? (
        <>
          <rect
            x={x}
            y={y}
            rx={h / 2}
            ry={h / 2}
            width={w}
            height={h}
            fill="rgba(12,18,36,0.98)"
            stroke={accent}
            strokeWidth={3}
          />
          <rect x={x} y={y} width={w} height={h / 4} fill={accent} opacity={0.4} rx={h / 2} />
          <foreignObject x={x + 10} y={y + h * 0.25} width={w - 20} height={h * 0.75}>
            <div className="h-full w-full flex flex-col justify-center items-center text-center">
              <div className="text-[13px] font-bold text-white leading-snug break-words drop-shadow">
                {title}
              </div>
              <div className="mt-1 space-y-0.5">
                {lines.map((line, idx) => (
                  <p key={`${id} -line - ${idx} `} className="text-[10px] text-slate-200 leading-snug break-words">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </foreignObject>
        </>
      ) : (
        <>
          <rect
            x={x}
            y={y}
            rx={12}
            ry={12}
            width={w}
            height={h}
            fill="rgba(12,18,36,0.98)"
            stroke={accent}
            strokeWidth={2.4}
          />
          <rect x={x} y={y} width={w} height={14} fill={accent} opacity={0.35} rx={12} />
          <foreignObject x={x + 8} y={y + 16} width={w - 16} height={h - 20}>
            {/* CHANGED: Added items-center and text-center to center all text */}
            <div className="h-full w-full flex flex-col justify-center items-center text-center overflow-hidden">
              <div className="text-[12px] font-bold text-white leading-tight break-words drop-shadow">
                {title}
              </div>
              <div className="mt-1.5 space-y-0.5">
                {lines.map((line, idx) => (
                  <p key={`${id} -line - ${idx} `} className="text-[10px] text-slate-100 leading-tight break-words">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </foreignObject>
        </>
      )}
    </g>
  );
};

const FlowchartPage: React.FC = () => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));
  const handleReset = () => setZoom(1);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const walkX = x - dragStart.x;
    const walkY = y - dragStart.y;
    containerRef.current.scrollLeft = dragStart.scrollLeft - walkX;
    containerRef.current.scrollTop = dragStart.scrollTop - walkY;
  };

  const handleStopDrag = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-950/90 via-blue-950/30 to-slate-950/90 border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 font-bold flex items-center gap-2 mb-2">
              <Workflow size={18} className="animate-pulse" /> FLOWCHART RNN PIPELINE
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 mb-3">
              Alur Kerja Deep Learning (RNN)
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
              Visualisasi lengkap logika dari <strong className="text-cyan-400">dua script Python</strong>:
              <code className="mx-1 px-2 py-0.5 bg-slate-800/50 rounded text-cyan-300">dataset_generator.py</code>
              untuk membangkitkan data sintetis dan
              <code className="mx-1 px-2 py-0.5 bg-slate-800/50 rounded text-green-300">traffic_forecast.py</code>
              untuk training RNN berbasis <strong className="text-green-400">PyTorch</strong> dengan
              <strong className="text-orange-400"> fallback NumPy</strong> agar program selalu berjalan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 flex items-center gap-2">
              <Database size={14} className="text-cyan-400" /> Dataset
              <span className="text-slate-500">→</span>
              <BrainCircuit size={14} className="text-cyan-400" /> Training
              <span className="text-slate-500">→</span>
              <LineChart size={14} className="text-cyan-400" /> Dashboard
            </span>
            <span className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-200 border border-orange-500/40 shadow-lg shadow-orange-500/10 flex items-center gap-2">
              <Zap size={14} className="text-orange-400" /> Safe Mode: PyTorch / NumPy
            </span>
          </div>
        </div>
      </div>

      {/* Main Flowchart */}
      <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90 border border-white/20 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.6)] overflow-hidden backdrop-blur-xl relative">
        {/* Zoom Controls Overlay */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-2 bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 rounded-md transition-colors border border-transparent hover:border-cyan-500/30"
            title="Zoom In"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors text-xs font-bold"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className={`p-2 rounded-md transition-colors border border-transparent ${zoom <= 1
              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30'
              }`}
            title="Zoom Out"
          >
            <Minus size={18} />
          </button>
        </div>

        <div className="relative">
          <div className="absolute top-4 left-4 z-10 bg-slate-950/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30">
            <p className="text-xs text-cyan-300 font-mono">
              <span className="text-cyan-400 font-bold">●</span> Drag & Scroll/Zoom untuk lihat detail
            </p>
          </div>

          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleStopDrag}
            onMouseLeave={handleStopDrag}
            className={`overflow-auto p-6 custom-scrollbar h-[650px] md:h-[950px] bg-slate-950/30 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <div
              style={{
                width: `${zoom * 100}%`,
                aspectRatio: '1360 / 1420'
              }}
              className="relative origin-top mx-auto"
            >
              <svg
                viewBox="0 0 1360 1420"
                width="100%"
                height="100%"
                className="drop-shadow-2xl"
                role="img"
                aria-label="Diagram alur kerja lengkap program Python RNN"
              >
                <defs>
                  <marker id="arrow" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
                    <path d="M 0 0 L 12 6 L 0 12 z" fill="#e2e8f0" />
                  </marker>
                  <marker id="arrowGreen" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
                    <path d="M 0 0 L 12 6 L 0 12 z" fill="#22c55e" />
                  </marker>
                  <marker id="arrowOrange" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto">
                    <path d="M 0 0 L 12 6 L 0 12 z" fill="#f59e0b" />
                  </marker>
                  <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="rgba(0,0,0,0.6)" />
                  </filter>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <radialGradient id="bgGlow" cx="50%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="rgba(56,189,248,0.15)" />
                    <stop offset="40%" stopColor="rgba(124,58,237,0.10)" />
                    <stop offset="100%" stopColor="rgba(15,23,42,0.05)" />
                  </radialGradient>

                  {/* Animated gradient for edges */}
                  <linearGradient id="animGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3">
                      <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="1">
                      <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3">
                      <animate attributeName="offset" values="0;1;0" dur="3s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                </defs>

                <rect x="0" y="0" width="1360" height="1420" fill="url(#bgGlow)" />

                {/* Render edges */}
                {edges.map((edge, idx) => {
                  const fromNode = getNode(edge.from);
                  const toNode = getNode(edge.to);
                  const fromPoint = getAnchor(fromNode, edge.fromSide ?? 'right');
                  const toPoint = getAnchor(toNode, edge.toSide ?? 'left');
                  const path = buildPath(fromPoint, toPoint, edge.curve);
                  const labelX = (fromPoint.x + toPoint.x) / 2;
                  const labelY = (fromPoint.y + toPoint.y) / 2 - 10;

                  const markerEnd = edge.color.includes('22c55e') ? 'url(#arrowGreen)' :
                    edge.color.includes('f59e0b') ? 'url(#arrowOrange)' :
                      'url(#arrow)';

                  return (
                    <g key={`edge - ${idx} `}>
                      {edge.animated && (
                        <path
                          d={path}
                          stroke="url(#animGradient)"
                          strokeWidth={6}
                          fill="none"
                          opacity={0.5}
                        />
                      )}
                      <path
                        d={path}
                        stroke={edge.color}
                        strokeWidth={edge.animated ? 3.5 : 3}
                        fill="none"
                        markerEnd={markerEnd}
                        strokeOpacity={0.95}
                        filter={edge.animated ? "url(#glow)" : undefined}
                      />
                      {edge.label && (
                        <g>
                          <rect
                            x={labelX - 40}
                            y={labelY - 10}
                            width={80}
                            height={20}
                            fill="rgba(15,23,42,0.9)"
                            rx={4}
                            stroke={edge.color}
                            strokeWidth={1}
                            strokeOpacity={0.5}
                          />
                          <text
                            x={labelX}
                            y={labelY + 4}
                            textAnchor="middle"
                            className="fill-white text-[11px] font-semibold drop-shadow-lg"
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Render nodes */}
                {nodes.map((node) => (
                  <FlowNode key={node.id} {...node} />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Legend Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-t border-white/10 bg-slate-950/80">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 flex gap-3 items-start hover:border-cyan-400/50 transition-all">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20">
              <Database size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-1">Data Pipeline</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                <code className="text-cyan-400">dataset_generator.py</code> membangkitkan time series sintetis untuk 5 skenario berbeda,
                lalu mengekspor ke <code className="text-blue-400">traffic_dataset.csv</code> dengan 120 baris data (24 jam × 5 skenario).
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-3 items-start hover:border-emerald-400/50 transition-all">
            <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <BrainCircuit size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-1">RNN Training</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                <code className="text-green-400">traffic_forecast.py</code> melatih model RNN per skenario menggunakan PyTorch.
                Jika PyTorch gagal dimuat, program otomatis beralih ke <strong className="text-orange-400">simulasi NumPy</strong> agar tetap berjalan.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-4 flex gap-3 items-start hover:border-violet-400/50 transition-all">
            <div className="p-2.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-lg shadow-violet-500/20">
              <LineChart size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-1">Dashboard Interaktif</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                Hasil prediksi dikemas dalam <code className="text-violet-400">all_results</code>, di-render ke
                <code className="text-purple-400"> dashboard_result.html</code> dengan Chart.js, dan otomatis dibuka di browser.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-sky-500/20 rounded-xl p-5 flex gap-3 items-start hover:border-sky-400/40 hover:shadow-lg hover:shadow-sky-500/10 transition-all">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/40">
            <FileCode2 size={20} />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
              Input <span className="text-xs text-sky-400 font-normal">(Requirements)</span>
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              • Kode Python (2 script)<br />
              • Libraries: <code className="text-sky-400">torch, numpy, pandas, scikit-learn</code><br />
              • Python 3.7+
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-orange-500/20 rounded-xl p-5 flex gap-3 items-start hover:border-orange-400/40 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
          <div className="p-2 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/40">
            <Settings2 size={20} />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
              Proses <span className="text-xs text-orange-400 font-normal">(Pipeline)</span>
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Generate dataset → Preprocessing → Pilih backend (PyTorch/NumPy) →
              Train RNN → Predict → Serialize hasil → Render HTML
            </p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-xl p-5 flex gap-3 items-start hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
            <Rocket size={20} />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1.5 flex items-center gap-2">
              Output <span className="text-xs text-emerald-400 font-normal">(Deliverable)</span>
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              File <code className="text-emerald-400">dashboard_result.html</code> dengan chart interaktif,
              dropdown skenario, dan metrics lengkap untuk analisis trafik.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <GitBranch className="text-cyan-400" size={22} />
          Detail Teknis Alur RNN
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-white">Dataset Generation:</strong> Menggunakan pola sinusoidal + noise Gaussian + spike manual untuk simulasi realistis
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-white">Normalisasi:</strong> MinMaxScaler dari scikit-learn untuk scaling data ke range [0,1]
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-white">Model RNN:</strong> Single-layer RNN dengan 32 hidden units, fully connected output layer
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-white">Training:</strong> 50 epochs dengan Adam optimizer, learning rate 0.01, MSE loss function
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-white">Fallback Mechanism:</strong> Jika PyTorch error, gunakan smoothing exponential dengan NumPy
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-violet-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300">
                <strong className="text-white">Visualization:</strong> Chart.js untuk rendering line chart interaktif dengan dropdown selector
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowchartPage;
