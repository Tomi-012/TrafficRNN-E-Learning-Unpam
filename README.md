# 🚀 TrafficRNN E-Learning UNPAM

<div align="center">

![TrafficRNN](https://img.shields.io/badge/TrafficRNN-E--Learning-00d4ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)

**Platform Pembelajaran Interaktif untuk Memahami RNN dalam Prediksi Trafik Server**

[🌐 Live Demo](https://trafficrnn-e-learning-unpam-production.up.railway.app/) • [📚 Dokumentasi](#fitur-utama) • [🤝 Kontribusi](#kontribusi)

</div>

---

## 📖 Tentang Project

**TrafficRNN E-Learning** adalah aplikasi web interaktif yang dikembangkan oleh **Kelompok 4** untuk **Universitas Pamulang** sebagai studi kasus penerapan *Recurrent Neural Network (RNN)* dalam memprediksi beban trafik server e-learning.

### 🎯 Tujuan Pembelajaran
- **Memahami konsep** RNN dan Time Series Forecasting
- **Visualisasi** cara kerja RNN secara interaktif
- **Eksperimen** dengan berbagai skenario trafik server
- **Praktik** kode Python untuk machine learning

### 🏫 Studi Kasus
Memprediksi lonjakan trafik server E-Learning UNPAM pada periode kritis:
- 📚 **Periode UTS/UAS** - Trafik tinggi konstan
- 📝 **Periode KRS** - Spike ekstrim pada jam tertentu
- 🏖️ **Libur Semester** - Trafik rendah
- 🔧 **Maintenance** - Downtime terjadwal

---

## ✨ Fitur Utama

### 1. 🧠 **Konsep & Alur RNN**
- Visualisasi arsitektur RNN dengan animasi interaktif
- Penjelasan matematika di balik LSTM dan GRU
- Flowchart pembelajaran step-by-step

### 2. 📊 **Simulasi Trafik Real-Time**
- 5 skenario trafik server yang berbeda
- Grafik perbandingan Actual vs Predicted
- Download dataset CSV untuk analisis lanjutan
- AI-powered insights menggunakan Google Gemini

### 3. 💻 **Python Lab Live Coding**
- Editor kode Python dengan syntax highlighting
- Eksekusi kode NumPy/Pandas via AI simulation
- 3 snippet kode siap pakai
- Visualisasi output real-time

### 4. 🎨 **UI/UX Modern**
- Dark theme dengan ethereal effects
- Smooth animations menggunakan Framer Motion
- Responsive design (Mobile & Desktop)
- Glassmorphism design language

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x atau lebih baru
- **Gemini API Key** (opsional, ada fallback mode)

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/Tomi-012/TrafficRNN-E-Learning-Unpam.git
cd TrafficRNN-E-Learning-Unpam

# 2. Install dependencies
npm install

# 3. Setup environment variables (Opsional)
# Copy .env.local.example ke .env.local
# Tambahkan GEMINI_API_KEY (atau biarkan kosong untuk mode offline)

# 4. Jalankan development server
npm run dev
```

Buka browser di `http://localhost:3000`

### Build untuk Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | React 19, TypeScript |
| **Build Tool** | Vite 6.2 |
| **Styling** | Tailwind CSS (via tailwind-merge) |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **AI Integration** | Google Gemini 2.5 Flash |
| **Charts** | Custom Canvas-based visualizations |

---

## 📁 Struktur Project

```
trafficrnn_server-e-learning-unpam/
├── components/
│   ├── RnnVisualizer.tsx      # Visualisasi konsep RNN
│   ├── Playground.tsx          # Simulasi trafik interaktif
│   ├── PythonLab.tsx           # Python code editor
│   ├── FlowchartPage.tsx       # Flowchart pembelajaran
│   ├── LoadingScreen.tsx       # Loading animation
│   ├── EtheralShadow.tsx       # Background effects
│   └── AuroraBackground.tsx    # Aurora animation
├── services/
│   └── geminiService.ts        # Gemini AI integration
├── App.tsx                     # Main application
├── index.tsx                   # Entry point
├── types.ts                    # TypeScript definitions
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies
```

---

## 🎓 Tim Pengembang

**Kelompok 4 - Universitas Pamulang**

Topik: *Penerapan RNN untuk Prediksi Beban Trafik Server E-Learning*

---

## 🌟 Highlights

- ✅ **Zero-config setup** - Langsung jalan setelah `npm install`
- ✅ **Offline-first** - Fallback mode tanpa API key
- ✅ **Educational** - Dirancang untuk pembelajaran
- ✅ **Production-ready** - TypeScript + Build optimizations
- ✅ **Open Source** - Free untuk digunakan dan dimodifikasi

---

## 📸 Screenshots

### Visualisasi RNN
![Visualizer](https://via.placeholder.com/800x400/0f172a/06b6d4?text=RNN+Visualizer)

### Simulasi Trafik
![Playground](https://via.placeholder.com/800x400/0f172a/06b6d4?text=Traffic+Simulation)

### Python Lab
![Python Lab](https://via.placeholder.com/800x400/0f172a/06b6d4?text=Python+Lab)

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📄 Lisensi

Project ini dibuat untuk keperluan **edukasi** di Universitas Pamulang.

---

## 🔗 Links

- **Live Demo**: [trafficrnn-e-learning-unpam-production.up.railway.app](https://trafficrnn-e-learning-unpam-production.up.railway.app/)
- **Repository**: (https://github.com/Tomi-012/TrafficRNN-E-Learning-Unpam)

---

<div align="center">

**Made with ❤️ by Kelompok 4 UNPAM**

![Built with Love](https://img.shields.io/badge/Built%20with-❤️-ff69b4?style=for-the-badge)

</div>
