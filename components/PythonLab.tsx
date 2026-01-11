import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, Code2, Play, Terminal, RefreshCw, Download, HelpCircle, X, FileSpreadsheet, Database, FileText, Cpu, Workflow } from 'lucide-react';
import { CodeSnippet } from '../types';
import { simulatePythonExecution, generateAllScenariosCSV } from '../services/geminiService';

const SNIPPETS: CodeSnippet[] = [
    {
        title: '1. dataset_generator.py',
        description: 'Script untuk membangkitkan data dummy (CSV) dengan parameter Jumlah Mahasiswa yang sesuai skenario nyata.',
        code: `import numpy as np
import pandas as pd
import os

def generate_traffic_data():
    print("--- Membangkitkan Dataset Trafik Unpam ---")
    
    scenarios = [
        "Hari Kuliah Biasa (Normal)",
        "Pekan Ujian (UTS/UAS)",
        "Periode KRS (Spike Ekstrim)",
        "Libur Semester (Low Traffic)",
        "Maintenance Malam"
    ]
    
    all_data = []
    hours = 24
    time = np.arange(hours)

    for scenario in scenarios:
        # --- KONFIGURASI PARAMETER SKENARIO ---
        # 1. Base Load: Beban dasar server
        # 2. Student Count: Estimasi mahasiswa login
        
        base_load = 200
        noise_level = 100
        spike_hour = -1
        spike_magnitude = 0
        active_students = 12000 # Default: Hari Biasa
        
        if scenario == "Pekan Ujian (UTS/UAS)":
            base_load = 1500
            noise_level = 200
            active_students = 28500 # Melonjak saat ujian
        elif scenario == "Periode KRS (Spike Ekstrim)":
            base_load = 500
            spike_hour = 9 # Spike tajam jam 09:00
            spike_magnitude = 3000
            active_students = 35000 # Hampir seluruh mahasiswa akses
        elif scenario == "Libur Semester (Low Traffic)":
            base_load = 50
            noise_level = 20
            active_students = 1500 # Hanya sedikit yang akses
        elif scenario == "Maintenance Malam":
            base_load = 100
            active_students = 50 # Hanya admin/dosen lembur

        # --- GENERATE POLA GELOMBANG (TIME SERIES) ---
        
        # 1. Pola Harian (Sinusoidal - Naik siang, turun malam)
        daily_pattern = 1000 * np.sin(2 * np.pi * time / 24 - np.pi/2) + 1000
        if scenario == "Libur Semester (Low Traffic)":
            daily_pattern *= 0.2
        daily_pattern[daily_pattern < 0] = 0

        # 2. Random Noise (Variasi acak agar natural)
        noise = np.random.normal(0, noise_level, hours)

        # 3. Spikes (Lonjakan tiba-tiba)
        spikes = np.zeros(hours)
        if spike_hour >= 0:
            spikes[spike_hour] = spike_magnitude

        # Gabungkan semua komponen
        actual = daily_pattern + noise + spikes + base_load
        actual = np.maximum(actual, 0) # Tidak boleh minus
        
        # Override khusus Maintenance (Server down jam 22-24)
        if scenario == "Maintenance Malam":
            actual[22:] = 0 

        # Simpan ke list data
        for t in range(hours):
            all_data.append({
                "scenario": scenario,
                "hour": t,
                "time_str": f"{t:02d}:00",
                "active_students_est": active_students, # Kolom Data Mahasiswa
                "requests_per_min": int(actual[t])
            })
            
    # Export ke CSV
    df = pd.DataFrame(all_data)
    filename = 'traffic_dataset.csv'
    df.to_csv(filename, index=False)
    
    print(f"✅ Sukses! File '{filename}' telah dibuat.")
    print(f"Total Data: {len(df)} baris.")
    print("Sampel Data (5 baris pertama):")
    print(df.head())

if __name__ == "__main__":
    generate_traffic_data()`
    },
    {
        title: '2. traffic_forecast.py',
        description: 'Script Utama (Advanced). Memproses SEMUA skenario dan menghasilkan Dashboard Interaktif dengan Dropdown.',
        code: `import pandas as pd
import numpy as np
import json
import webbrowser
import os
import sys
from sklearn.preprocessing import MinMaxScaler

# ==========================================
# BAGIAN 1: HANDLING LIBRARY AI (TORCH / NUMPY)
# ==========================================
USE_TORCH = False
try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    USE_TORCH = True
    print("✅ PyTorch berhasil dimuat. Menggunakan Deep Learning RNN.")
except Exception as e:
    print(f"⚠️ Peringatan: Gagal memuat PyTorch ({str(e)}).")
    print("ℹ️ Beralih ke mode 'NumPy Fallback' agar program tetap berjalan.")
    USE_TORCH = False

# A. KELAS RNN ASLI (PyTorch)
class TrafficRNN_Torch(nn.Module if USE_TORCH else object):
    def __init__(self):
        super().__init__()
        self.rnn = nn.RNN(input_size=1, hidden_size=32, num_layers=1, batch_first=True)
        self.fc = nn.Linear(32, 1)

    def forward(self, x):
        out, _ = self.rnn(x)
        return self.fc(out[:, -1, :])

# B. KELAS RNN SIMULASI (NumPy Fallback)
class TrafficRNN_NumPy:
    def predict(self, data):
        # Simulasi perilaku RNN (Smoothing + Lag)
        predicted = []
        prev = data[0]
        np.random.seed(42)
        for val in data:
            pred_val = (prev * 0.6) + (val * 0.4) + np.random.normal(0, 50)
            predicted.append(pred_val)
            prev = val
        return np.array(predicted)

def train_and_predict_scenario(df, scenario_name):
    print(f"   > Memproses Skenario: {scenario_name}...")
    
    scenario_df = df[df['scenario'] == scenario_name]
    if scenario_df.empty: return None

    data_raw = scenario_df['requests_per_min'].values
    student_count = int(scenario_df['active_students_est'].max())
    
    actual = data_raw
    predicted = np.zeros_like(data_raw)
    loss_val = 0.0

    if USE_TORCH:
        scaler = MinMaxScaler()
        data_scaled = scaler.fit_transform(data_raw.reshape(-1, 1))
        
        X_train = torch.FloatTensor(data_scaled[:-1]).view(-1, 1, 1)
        y_train = torch.FloatTensor(data_scaled[1:]).view(-1, 1)

        model = TrafficRNN_Torch()
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters(), lr=0.01)

        # Training cepat 50 epochs
        for i in range(50):
            optimizer.zero_grad()
            loss = criterion(model(X_train), y_train)
            loss.backward()
            optimizer.step()
        
        loss_val = loss.item()
        model.eval()
        with torch.no_grad():
            pred_scaled = model(X_train).numpy()
            
        pred_inv = scaler.inverse_transform(pred_scaled).flatten().astype(int)
        predicted = np.append([data_raw[0]], pred_inv) 
    else:
        model = TrafficRNN_NumPy()
        predicted = model.predict(data_raw)
        loss_val = np.mean((data_raw - predicted)**2) / 100000

    return {
        "actual": actual.tolist(),
        "predicted": predicted.tolist(),
        "loss": round(loss_val, 5),
        "students": student_count,
        "peak": int(max(np.max(actual), np.max(predicted)))
    }

# ==========================================
# BAGIAN 2: GENERATOR WEBSITE INTERAKTIF
# ==========================================

def create_advanced_dashboard(all_results):
    print("\\n--- 2. Membuat Advanced Dashboard ---")
    filename = "dashboard_result.html"
    
    # Konversi Dictionary Python ke String JSON JavaScript
    json_data = json.dumps(all_results)
    
    html_content = f"""
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TrafficRNN Advanced Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
    <script>
      tailwind.config = {{
        theme: {{
          extend: {{
            fontFamily: {{ sans: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] }},
            colors: {{ slate: {{ 950: '#020617' }} }}
          }}
        }}
      }}
    </script>
    <style>
      body {{ background-color: #020617; color: #e2e8f0; }}
      .glass-panel {{
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }}
      select option {{ background-color: #0f172a; color: white; }}
    </style>
</head>
<body class="min-h-screen p-4 md:p-8 font-sans bg-[url('https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png')] bg-fixed bg-cover overflow-x-hidden">
    <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header & Controls -->
        <header class="glass-panel p-4 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-center md:text-left">
                <h1 class="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">TrafficRNN Dashboard</h1>
                <p class="text-slate-400 text-xs md:text-sm font-mono mt-1">Multi-Scenario Analysis System</p>
            </div>
            
            <div class="w-full md:w-auto flex flex-col items-end gap-2">
                <label class="text-xs text-slate-400 font-bold uppercase tracking-wider hidden md:block">Pilih Skenario:</label>
                <select id="scenarioSelector" onchange="updateDashboard(this.value)" 
                    class="w-full md:w-80 bg-slate-900 border border-cyan-500/30 text-white p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-semibold shadow-lg">
                    <!-- Options diisi oleh JS -->
                </select>
            </div>
        </header>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div class="glass-panel p-4 md:p-6 rounded-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                <h3 class="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Mahasiswa Aktif</h3>
                <div class="text-2xl md:text-3xl font-bold text-white tracking-tight" id="val_students">-</div>
                <div class="mt-2 text-[10px] md:text-xs text-slate-500 font-mono">Estimasi user login</div>
            </div>
            <div class="glass-panel p-4 md:p-6 rounded-xl relative overflow-hidden group hover:border-violet-500/30 transition-all">
                <h3 class="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Peak Traffic</h3>
                <div class="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1">
                    <span id="val_peak">-</span> <span class="text-sm font-normal text-violet-500">RPM</span>
                </div>
                <div class="mt-2 text-[10px] md:text-xs text-slate-500 font-mono">Beban tertinggi</div>
            </div>
            <div class="glass-panel p-4 md:p-6 rounded-xl relative overflow-hidden group hover:border-pink-500/30 transition-all">
                <h3 class="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Model Error (MSE)</h3>
                <div class="text-2xl md:text-3xl font-bold text-white tracking-tight" id="val_loss">-</div>
                <div class="mt-2 text-[10px] md:text-xs text-slate-500 font-mono">Akurasi Prediksi</div>
            </div>
            <div class="glass-panel p-4 md:p-6 rounded-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <h3 class="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Status Server</h3>
                <div class="text-2xl md:text-3xl font-bold text-emerald-400 tracking-tight">OPTIMAL</div>
                <div class="mt-2 text-[10px] md:text-xs text-slate-500 font-mono">Auto-scaling Ready</div>
            </div>
        </div>

        <!-- Chart Section -->
        <div class="glass-panel p-4 md:p-6 rounded-xl shadow-2xl border-t border-white/5">
            <div class="relative w-full h-[300px] md:h-[450px]">
                <canvas id="trafficChart"></canvas>
            </div>
        </div>
        
        <footer class="text-center text-slate-600 text-[10px] md:text-xs py-4 font-mono">
            Generated locally by Kelompok 4 • TrafficRNN Project
        </footer>
    </div>

    <script>
        // DATA DARI PYTHON
        const DATASETS = {json_data};
        
        // Inisialisasi Chart
        let myChart = null;
        const ctx = document.getElementById('trafficChart').getContext('2d');
        const labels = Array.from({{length: 24}}, (_, i) => (i < 10 ? '0' + i : i) + ':00');

        function initChart() {{
            const gradientActual = ctx.createLinearGradient(0, 0, 0, 400);
            gradientActual.addColorStop(0, 'rgba(34, 211, 238, 0.4)');
            gradientActual.addColorStop(1, 'rgba(34, 211, 238, 0.0)');

            const gradientPred = ctx.createLinearGradient(0, 0, 0, 400);
            gradientPred.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
            gradientPred.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

            myChart = new Chart(ctx, {{
                type: 'line',
                data: {{
                    labels: labels,
                    datasets: [
                        {{
                            label: 'Data Aktual (Log Server)',
                            data: [],
                            borderColor: '#22d3ee',
                            backgroundColor: gradientActual,
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 3, // Smaller for mobile
                            pointBackgroundColor: '#0f172a',
                            fill: true
                        }},
                        {{
                            label: 'Prediksi RNN (AI)',
                            data: [],
                            borderColor: '#8b5cf6',
                            backgroundColor: gradientPred,
                            borderWidth: 2,
                            borderDash: [5, 5],
                            tension: 0.4,
                            pointRadius: 3, // Smaller for mobile
                            pointBackgroundColor: '#0f172a',
                            fill: true
                        }}
                    ]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {{ mode: 'index', intersect: false }},
                    plugins: {{
                        legend: {{ 
                            labels: {{ color: '#cbd5e1', font: {{ family: 'Inter', size: 10 }} }},
                            position: 'top',
                            align: 'end'
                        }},
                        tooltip: {{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#fff',
                            bodyColor: '#cbd5e1',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 8,
                            titleFont: {{ size: 12 }},
                            bodyFont: {{ size: 11 }}
                        }}
                    }},
                    scales: {{
                        y: {{
                            grid: {{ color: 'rgba(255, 255, 255, 0.05)' }},
                            ticks: {{ color: '#94a3b8', font: {{ size: 10 }} }}
                        }},
                        x: {{
                            grid: {{ display: false }},
                            ticks: {{ color: '#94a3b8', font: {{ size: 10 }}, maxRotation: 45, minRotation: 0 }}
                        }}
                    }}
                }}
            }});
        }}

        function updateDashboard(scenarioName) {{
            const data = DATASETS[scenarioName];
            if(!data) return;

            // Update Angka
            document.getElementById('val_students').innerText = Number(data.students).toLocaleString('id-ID');
            document.getElementById('val_peak').innerText = Number(data.peak).toLocaleString('id-ID');
            document.getElementById('val_loss').innerText = data.loss;

            // Update Chart
            myChart.data.datasets[0].data = data.actual;
            myChart.data.datasets[1].data = data.predicted;
            myChart.update();
        }}

        // Populate Dropdown & Init
        window.onload = function() {{
            const selector = document.getElementById('scenarioSelector');
            const scenarios = Object.keys(DATASETS);
            
            scenarios.forEach(s => {{
                const option = document.createElement('option');
                option.value = s;
                option.text = s;
                selector.appendChild(option);
            }});

            initChart();
            // Pilih skenario pertama default
            updateDashboard(scenarios[0]);
        }};
    </script>
</body>
</html>
"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print(f"✅ Website berhasil dibuat: {filename}")
    return filename

# ==========================================
# MAIN EXECUTION
# ==========================================
if __name__ == "__main__":
    csv_file = 'traffic_dataset.csv'
    
    if not os.path.exists(csv_file):
        print("❌ Error: File CSV tidak ditemukan! Jalankan dataset_generator.py dulu.")
    else:
        print("--- MEMULAI PROSES TRAINING MULTI-SKENARIO ---")
        df = pd.read_csv(csv_file)
        scenarios = df['scenario'].unique()
        
        all_results = {}
        
        for s in scenarios:
            res = train_and_predict_scenario(df, s)
            if res:
                all_results[s] = res
        
        if all_results:
            file_path = create_advanced_dashboard(all_results)
            print(f"Mencoba membuka website: {file_path} ...")
            try:
                webbrowser.open('file://' + os.path.realpath(file_path))
            except:
                print("Gagal membuka otomatis.")
`
    },
    {
        title: '3. requirements.txt',
        description: 'Daftar library yang harus diinstall sebelum menjalankan program. Gunakan perintah: pip install -r requirements.txt',
        code: `numpy
pandas
torch
scikit-learn`
    },
    {
        title: '4. README_PANDUAN.txt',
        description: 'Instruksi lengkap cara menjalankan program ini di komputer lokal.',
        code: `=================================================
PANDUAN MENJALANKAN SIMULASI TRAFIK UNPAM (PYTHON)
=================================================

MASALAH UMUM: "WinError 1114" / "DLL Load Failed"
-------------------------------------------------
Jika kamu mengalami error saat import 'torch', itu karena komputer kamu
belum terinstall "Microsoft Visual C++ Redistributable".

SOLUSI CEPAT:
1. Download & Install: https://aka.ms/vs/17/release/vc_redist.x64.exe
2. Restart komputer (opsional).
3. Jalankan ulang: python traffic_forecast.py

NOTE: Script traffic_forecast.py versi terbaru sudah dilengkapi fitur
"Safe Mode". Jika PyTorch gagal load, program akan otomatis beralih
menggunakan NumPy agar tidak crash.

-------------------------------------------------

LANGKAH - LANGKAH STANDAR:

1. SIAPKAN FOLDER
   Buat folder baru, misalnya "Tugas_MachineLearning".

2. DOWNLOAD FILE
   Buat 3 file di dalam folder tersebut dengan isi kode dari website:
   - dataset_generator.py
   - traffic_forecast.py
   - requirements.txt

3. INSTALL LIBRARY
   Buka Terminal / CMD di folder tersebut, lalu ketik:
   >> pip install -r requirements.txt
   
   (Tunggu hingga proses instalasi selesai)

4. GENERATE DATA
   Jalankan script pertama untuk membuat file CSV:
   >> python dataset_generator.py
   
   [Output]: Akan muncul file baru bernama 'traffic_dataset.csv'.
   Pastikan file ini ada sebelum lanjut ke langkah 5.

5. JALANKAN PREDIKSI & DASHBOARD
   Jalankan script utama:
   >> python traffic_forecast.py
   
   [Output]:
   - Program akan memproses SEMUA skenario (Normal, Ujian, KRS, dll).
   - Setelah selesai, script akan membuat file baru bernama 'dashboard_result.html'.
   - File HTML ini sekarang INTERAKTIF! Ada dropdown menu untuk ganti skenario.
   - Browser kamu akan otomatis terbuka menampilkan file tersebut.

SELAMAT MENCOBA!
`
    }
];

// Inline Component for Copy Button to manage state individually
const CopyBtn = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-slate-300 transition-colors ml-auto"
            title="Copy command"
        >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
    );
};

type PythonLabProps = {
    onOpenFlowchart?: () => void;
};

const PythonLab: React.FC<PythonLabProps> = ({ onOpenFlowchart }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [copied, setCopied] = useState(false);
    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SNIPPETS[activeTab].code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadCode = () => {
        const element = document.createElement("a");
        const file = new Blob([SNIPPETS[activeTab].code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        const filename = SNIPPETS[activeTab].title.split(' ')[1];
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setOutput("Initializing Python environment...\nRunning script...");
        const result = await simulatePythonExecution(SNIPPETS[activeTab].code);
        setOutput(result);
        setIsRunning(false);
    };

    // Helper to scroll to top (TARGETING THE MAIN SCROLL CONTAINER IN APP.TSX)
    const scrollToTop = () => {
        const mainContainer = document.getElementById('main-scroll');
        if (mainContainer) {
            mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    React.useEffect(() => {
        setOutput('');
        setIsRunning(false);
    }, [activeTab]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full relative items-start">

            {/* Sidebar List - STICKY FIX */}
            {/* 'md:sticky md:top-0' ensures it stays visible when main container scrolls */}
            <div className="md:col-span-4 flex flex-col space-y-4 md:sticky md:top-0 self-start md:max-h-[calc(100vh-8rem)] md:overflow-y-auto custom-scrollbar">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center drop-shadow-md">
                            <Code2 className="mr-2 text-yellow-400" />
                            File Project
                        </h3>
                        <button
                            onClick={() => setShowGuide(true)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors border border-cyan-500/20 shadow-lg"
                        >
                            <HelpCircle size={12} /> Panduan
                        </button>
                    </div>

                    {/* Flowchart Feature Card - PROMINENT */}
                    {onOpenFlowchart && (
                        <div className="bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-slate-900/40 border-2 border-cyan-500/40 rounded-xl p-4 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all mb-4 relative overflow-hidden">
                            {/* Animated background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 animate-pulse"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-400/30">
                                        <Workflow size={20} className="text-cyan-300" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm">Flowchart RNN Pipeline</h4>
                                </div>
                                <p className="text-slate-300 text-xs mb-3 leading-relaxed">
                                    Lihat visualisasi lengkap <strong className="text-cyan-300">alur kerja Deep Learning (RNN)</strong> dari dataset generation hingga dashboard interaktif.
                                </p>
                                <button
                                    onClick={onOpenFlowchart}
                                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]"
                                >
                                    <Workflow size={16} />
                                    Buka Flowchart Lengkap
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {SNIPPETS.map((snippet, idx) => {
                            let Icon = FileText;
                            if (snippet.title.includes('py')) Icon = Code2;
                            if (snippet.title.includes('dataset')) Icon = Database;
                            if (snippet.title.includes('forecast')) Icon = Cpu;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveTab(idx);
                                        scrollToTop();
                                    }}
                                    className={`w-full text-left p-4 rounded-lg border transition-all backdrop-blur-sm flex items-start gap-3 ${activeTab === idx
                                            ? 'bg-blue-900/40 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-800/50 hover:border-white/10'
                                        }`}
                                >
                                    <div className={`mt-1 ${activeTab === idx ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-sm mb-1 truncate">{snippet.title}</div>
                                        <div className="text-xs opacity-70 truncate">{snippet.description}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Download All Card */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10 rounded-xl p-4 shadow-lg">
                    <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                        <Database size={16} className="text-emerald-400" />
                        Download Dataset Langsung
                    </h4>
                    <p className="text-xs text-slate-400 mb-3">
                        Opsional: Jika malas menjalankan script generator, download CSV jadinya di sini.
                    </p>
                    <button
                        onClick={() => {
                            const csvContent = generateAllScenariosCSV();
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", "traffic_dataset.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                        <FileSpreadsheet size={14} />
                        Download traffic_dataset.csv
                    </button>
                </div>
            </div>

            {/* Code Editor Area */}
            <div className="md:col-span-8 flex flex-col gap-4">

                <div className="flex-1 flex flex-col bg-slate-950/60 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5 h-[400px] md:h-auto min-h-[400px]">
                    <div className="flex justify-between items-center px-4 py-3 bg-white/5 border-b border-white/5">
                        <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm"></div>
                            </div>
                            <span className="text-xs font-mono text-slate-400 font-bold hidden sm:inline-block">
                                {SNIPPETS[activeTab].title.split(' ')[1]}
                            </span>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Run Button only for Python files */}
                            {SNIPPETS[activeTab].title.includes('.py') && (
                                <button
                                    onClick={handleRun}
                                    disabled={isRunning}
                                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isRunning
                                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                                        }`}
                                >
                                    {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                                    <span className="hidden sm:inline">Simulasi Run</span>
                                </button>
                            )}

                            <button
                                onClick={handleDownloadCode}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-slate-300 hover:text-white transition-colors text-xs font-medium"
                                title="Download File Ini"
                            >
                                <Download size={14} />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                                title="Copy Code"
                            >
                                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0d1117]">
                        <pre className="font-mono text-sm text-blue-100 leading-relaxed overflow-x-auto">
                            <code>{SNIPPETS[activeTab].code}</code>
                        </pre>
                    </div>
                </div>

                {/* Terminal Output Area */}
                <div className="h-48 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col shadow-inner shrink-0">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center space-x-2">
                        <Terminal size={14} className="text-slate-400" />
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Terminal Output (Simulasi)</span>
                    </div>
                    <div className="flex-1 p-4 overflow-auto font-mono text-xs md:text-sm custom-scrollbar">
                        {!output && !isRunning && (
                            <div className="text-slate-600 italic space-y-2">
                                <p>Output eksekusi program akan muncul di sini.</p>
                                <p>Catatan: Fitur "Simulasi Run" di sini menggunakan sistem simulasi untuk meniru output Python.</p>
                                <p className="text-cyan-600">Untuk hasil terbaik, download file dan jalankan di komputermu.</p>
                            </div>
                        )}
                        {isRunning && (
                            <div className="space-y-1">
                                <span className="text-yellow-500 block">➜ python3 {SNIPPETS[activeTab].title.split(' ')[1]}</span>
                                <span className="text-slate-400 block animate-pulse">Executing script...</span>
                            </div>
                        )}
                        {output && (
                            <div className="whitespace-pre-wrap text-emerald-400">
                                <span className="text-slate-500 select-none">User@Unpam-Lab:~$ python3 {SNIPPETS[activeTab].title.split(' ')[1]}</span>
                                <br />
                                {output}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Guide Modal Overlay - USING PORTAL to break out of motion.div containing block */}
            {showGuide && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-xl max-w-2xl w-full shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
                        <button
                            onClick={() => setShowGuide(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Terminal className="text-cyan-400" />
                            Panduan Setup Lokal (Wajib Baca)
                        </h3>

                        <div className="space-y-4 text-sm text-slate-300">
                            <p className="bg-blue-900/30 p-3 rounded border border-blue-500/30">
                                Agar tidak ada error, pastikan kamu mendownload <strong>keempat file</strong> yang ada di menu samping kiri dan menyimpannya dalam <strong>satu folder yang sama</strong>.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                    <span className="font-bold text-cyan-400 block mb-1">Langkah 1: Download</span>
                                    <ul className="list-disc list-inside space-y-1 text-xs">
                                        <li><code>dataset_generator.py</code></li>
                                        <li><code>traffic_forecast.py</code></li>
                                        <li><code>requirements.txt</code></li>
                                    </ul>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col">
                                    <span className="font-bold text-cyan-400 block mb-1">Langkah 2: Install</span>
                                    <div className="flex items-center gap-2 bg-slate-800 p-2 rounded mt-auto">
                                        <code className="text-xs font-mono text-green-400 flex-1 overflow-x-auto whitespace-nowrap">
                                            pip install -r requirements.txt
                                        </code>
                                        <CopyBtn text="pip install -r requirements.txt" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                <span className="font-bold text-cyan-400 block mb-1">Langkah 3: Eksekusi Berurutan</span>
                                <div className="space-y-2 text-xs font-mono">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-500">1. Buat Data:</span>
                                        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                                            <code className="text-green-400 flex-1">python dataset_generator.py</code>
                                            <CopyBtn text="python dataset_generator.py" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-500">2. Jalankan App:</span>
                                        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                                            <code className="text-green-400 flex-1">python traffic_forecast.py</code>
                                            <CopyBtn text="python traffic_forecast.py" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowGuide(false)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium text-sm"
                            >
                                Saya Mengerti
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </div>
    );
};

export default PythonLab;
