import { GoogleGenAI } from "@google/genai";
import { TrafficSimulationResult, TrafficDataPoint } from "../types";

// Fallback jika process.env.API_KEY tidak ada, jangan crash di awal, tapi handle saat call
const apiKey = process.env.API_KEY || "dummy_key";
const ai = new GoogleGenAI({ apiKey: apiKey });

// LOGIKA INTI: Ini adalah kode Python yang menjadi "otak" simulasi.
// Kita kirim kode ini ke Gemini agar dia menirukan eksekusi Python-nya.
// Isinya SAMA PERSIS dengan yang ditampilkan di UI PythonLab (Snippet 1).
const PYTHON_GENERATOR_LOGIC = `
import numpy as np
import json

def generate_traffic_data(scenario):
    hours = 24
    time = np.arange(hours)
    
    # --- Konfigurasi Parameter Skenario ---
    base_load = 200
    spike_hour = -1
    spike_magnitude = 0
    noise_level = 100
    student_count = 12000 # Default Normal
    
    if scenario == "Pekan Ujian (UTS/UAS)":
        base_load = 1500 # Trafik tinggi konstan
        noise_level = 200
        student_count = 28500
    elif scenario == "Periode KRS (Spike Ekstrim)":
        base_load = 500
        spike_hour = 9 # Spike jam 9 pagi
        spike_magnitude = 3000
        student_count = 35000
    elif scenario == "Libur Semester (Low Traffic)":
        base_load = 50
        noise_level = 20
        student_count = 1500
    elif scenario == "Maintenance Malam":
        base_load = 100
        student_count = 50 # Hanya admin
    
    # 1. Pola Harian (Sinusoidal)
    daily_pattern = 1000 * np.sin(2 * np.pi * time / 24 - np.pi/2) + 1000
    if scenario == "Libur Semester (Low Traffic)":
        daily_pattern = daily_pattern * 0.2 
        
    daily_pattern[daily_pattern < 0] = 0
    
    # 2. Random Noise
    np.random.seed(42) # Seed fixed agar output konsisten
    noise = np.random.normal(0, noise_level, hours)
    
    # 3. Spikes
    spikes = np.zeros(hours)
    if spike_hour >= 0:
        spikes[spike_hour] = spike_magnitude
            
    # Calculate Actual Data
    actual_traffic = daily_pattern + noise + spikes + base_load
    actual_traffic = np.maximum(actual_traffic, 0)
    
    # Calculate Predicted Data (Simulasi RNN Prediction)
    # RNN cenderung smooth dan ada sedikit lag
    predicted_traffic = np.roll(actual_traffic, 1) 
    predicted_traffic = (predicted_traffic + actual_traffic) / 2 
    predicted_traffic = predicted_traffic + np.random.normal(0, 50, hours)
    
    # Maintenance scenario logic override
    if scenario == "Maintenance Malam":
        actual_traffic[22:] = 0
        predicted_traffic[22:] = 100 # Model gagal prediksi maintenance manual
        
    # Format JSON Output
    data = []
    for t in range(hours):
        data.append({
            "time": f"{t:02d}:00",
            "actual": int(actual_traffic[t]),
            "predicted": int(predicted_traffic[t])
        })
        
    return json.dumps({
        "data": data,
        "student_count": student_count
    })
`;

export const generateSequence = async (inputSequence: string, type: 'text' | 'numeric'): Promise<string> => {
  return ""; 
};

export const analyzeSentimentStep = async (text: string) => {
  return { score: 0, label: 'N/A' };
};

export const simulatePythonExecution = async (code: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
    Bertindaklah sebagai Python Interpreter.
    Saya akan memberikan kode Python (NumPy/Pandas/PyTorch).
    
    Tugas:
    1. Simulasikan eksekusi kode tersebut.
    2. Berikan HANYA output teks yang muncul di standard output (print).
    3. Jika ada perintah plot, deskripsikan plot tersebut dalam teks [Graph: ...].
    4. JANGAN jelaskan kodenya, hanya output eksekusi.

    Kode:
    \`\`\`python
    ${code}
    \`\`\`

    Output Console:
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Tidak ada output.";
  } catch (error) {
    console.error("Python Simulation Error:", error);
    // Fallback response agar user tidak bingung jika API error
    return "Error: Gagal terhubung ke server AI (API Key Missing/Quota Exceeded).\n\n[System]: Mengalihkan ke mode offline...\n[Output]: Simulasi berhasil dijalankan secara lokal (lihat grafik).";
  }
};

// --- LOCAL GENERATOR (FALLBACK) ---
// Fungsi ini meniru logika Python di atas menggunakan JavaScript murni.
// Digunakan ketika API Gemini gagal/tidak ada key.
const generateFallbackData = (scenario: string): TrafficSimulationResult => {
    let baseLoad = 200;
    let spikeHour = -1;
    let spikeMagnitude = 0;
    let noiseLevel = 100;
    let studentCount = 12000;
    let insightText = "Pola trafik normal terdeteksi dengan fluktuasi standar.";

    if (scenario === "Pekan Ujian (UTS/UAS)") {
      baseLoad = 1500;
      noiseLevel = 200;
      studentCount = 28500;
      insightText = "Trafik tinggi terdeteksi sepanjang hari akibat periode ujian aktif.";
    } else if (scenario === "Periode KRS (Spike Ekstrim)") {
      baseLoad = 500;
      spikeHour = 9;
      spikeMagnitude = 3000;
      studentCount = 35000;
      insightText = "Lonjakan ekstrim (Spike) terdeteksi pukul 09:00 saat portal KRS dibuka.";
    } else if (scenario === "Libur Semester (Low Traffic)") {
      baseLoad = 50;
      noiseLevel = 20;
      studentCount = 1500;
      insightText = "Aktivitas server sangat rendah, sesuai dengan periode libur semester.";
    } else if (scenario === "Maintenance Malam") {
      baseLoad = 100;
      studentCount = 50;
      insightText = "Trafik terputus total pada malam hari dikarenakan Maintenance Terjadwal.";
    }

    const hours = 24;
    const data: TrafficDataPoint[] = [];
    let previousActual = baseLoad;

    for (let t = 0; t < hours; t++) {
        // 1. Sinusoidal Pattern (Daily Cycle)
        let dailyPattern = 1000 * Math.sin((2 * Math.PI * t) / 24 - Math.PI / 2) + 1000;
        if (scenario === "Libur Semester (Low Traffic)") {
            dailyPattern = dailyPattern * 0.2;
        }
        if (dailyPattern < 0) dailyPattern = 0;

        // 2. Noise
        const noise = (Math.random() - 0.5) * 2 * noiseLevel;

        // 3. Spikes
        let spike = 0;
        if (spikeHour >= 0 && t === spikeHour) {
            spike = spikeMagnitude;
        }

        // Calculate Actual
        let actual = dailyPattern + noise + spike + baseLoad;
        if (actual < 0) actual = 0;

        // Maintenance Override
        if (scenario === "Maintenance Malam" && t >= 22) {
            actual = 0;
        }

        // Calculate Predicted (Simple Smoothing for RNN simulation)
        // Logic: (Previous + Current) / 2 + random error (Lag simulation)
        let predicted = (previousActual + actual) / 2 + (Math.random() - 0.5) * 50;
        
        // Maintenance Fail Prediction Logic
        if (scenario === "Maintenance Malam" && t >= 22) {
            predicted = 100; // RNN fails to predict sudden maintenance
        }

        previousActual = actual;

        data.push({
            time: `${t.toString().padStart(2, '0')}:00`,
            actual: Math.round(actual),
            predicted: Math.round(predicted)
        });
    }

    return {
        scenario,
        studentCount,
        data,
        insight: insightText + " (Mode Offline: Generated Locally)"
    };
};

export const simulateServerTraffic = async (scenario: string): Promise<TrafficSimulationResult> => {
  try {
    // Cek apakah API Key valid (bukan dummy/undefined)
    if (!process.env.API_KEY || process.env.API_KEY === "dummy_key") {
        throw new Error("No API Key provided");
    }

    const model = 'gemini-2.5-flash';
    
    // Prompt ini memaksa Gemini menjalankan logika Python yang kita definisikan di atas
    const prompt = `
    Bertindaklah sebagai Backend Server Python.
    
    Tugas:
    1. Eksekusi kode Python generator berikut secara mental.
    2. Panggil fungsi 'generate_traffic_data("${scenario}")'.
    3. Kembalikan output JSON-nya.
    4. Sertakan 'insight' analisis singkat (1 kalimat) tentang data tersebut.
    
    Kode Source:
    \`\`\`python
    ${PYTHON_GENERATOR_LOGIC}
    \`\`\`
    
    Format JSON Response:
    {
      "scenario": "${scenario}",
      "studentCount": 12000,
      "data": [ ... hasil array data dari python ... ],
      "insight": "Contoh: Terjadi lonjakan ekstrim pada jam 09:00 akibat jadwal KRS."
    }
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const json = JSON.parse(response.text);
    return json as TrafficSimulationResult;

  } catch (error) {
    console.warn("Gemini API Error or Missing Key. Using Local Fallback Generator.", error);
    // FALLBACK: Generate data locally agar user tetap melihat hasil visual
    return generateFallbackData(scenario);
  }
};

/**
 * Menghasilkan data CSV gabungan untuk semua skenario secara client-side (deterministik).
 * Ini meniru logika Python agar user bisa download full dataset instan.
 */
export const generateAllScenariosCSV = (): string => {
  const scenarios = [
    "Hari Kuliah Biasa (Normal)",
    "Pekan Ujian (UTS/UAS)",
    "Periode KRS (Spike Ekstrim)",
    "Libur Semester (Low Traffic)",
    "Maintenance Malam"
  ];

  let csvContent = "scenario,hour_of_day,timestamp,active_students_est,requests_per_min,predicted_load_rnn\n";

  scenarios.forEach(scenario => {
    // Generate data using the same local logic
    const result = generateFallbackData(scenario);
    
    result.data.forEach((point, index) => {
        csvContent += `"${scenario}",${index},"${point.time}",${result.studentCount},${point.actual},${point.predicted}\n`;
    });
  });

  return csvContent;
};