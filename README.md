# Network Monitor - Web Monitoring Real-time

Aplikasi Web Monitoring real-time untuk analisa perangkat jaringan. Dibuat untuk memenuhi tugas mata kuliah **Komunikasi Data**.

## Deskripsi

Network Monitor adalah aplikasi berbasis web yang memungkinkan monitoring perangkat jaringan secara real-time. Aplikasi ini mensimulasikan monitoring 3 perangkat jaringan (Router, Switch, dan Firewall) menggunakan protokol ICMP (ping) dan menampilkan data bandwidth serta packet loss secara live.

### Fitur Utama

- **Real-time Monitoring**: Update data setiap 5 detik via WebSocket
- **ICMP Ping**: Mengecek status online/offline dan latency perangkat
- **Bandwidth Monitoring**: Simulasi penggunaan bandwidth (10-100 Mbps)
- **Packet Loss Tracking**: Monitoring packet loss percentage (0-5%)
- **Alert System**: Notifikasi otomatis untuk:
  - Device down (3 ping berturut-turut gagal)
  - High latency (> 200ms)
  - High bandwidth (> 80 Mbps)
  - High packet loss (> 3%)
- **Simulate Down**: Fitur simulasi device offline selama 30 detik
- **Export Logs**: Download riwayat alert dalam format CSV
- **Live Charts**: Grafik real-time untuk latency, bandwidth, dan packet loss

## Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Backend | Node.js + Express.js |
| Real-time | Socket.IO |
| ICMP Ping | ping (npm package) |
| Timezone | moment-timezone |
| Frontend | HTML5 + Tailwind CSS |
| Charts | Chart.js |
| Data Storage | In-memory (Array) |

## Prerequisites

- **Node.js**: >= 16.x (Disarankan: 18.x atau lebih baru)
- **npm**: >= 8.x
- **Browser**: Chrome, Firefox, Edge, atau Safari versi terbaru

## Instalasi & Menjalankan

### 1. Clone/Download Project

```bash
# Jika menggunakan git
git clone <repository-url>
cd network-monitor

# Atau extract file zip ke folder yang diinginkan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan Server

```bash
npm start
```

### 4. Akses Dashboard

Buka browser dan akses:
```
http://localhost:3000
```

## Cara Test

### Test WebSocket Connection

1. Buka dashboard di browser
2. Perhatikan indikator koneksi di pojok kanan atas
3. Status **"Connected"** dengan indikator hijau = WebSocket aktif
4. Data akan update otomatis setiap 5 detik

### Test Fitur Simulate Down

1. Di tabel Device Status, klik tombol **"Simulate Down"** pada salah satu device
2. Device akan berubah status menjadi **Offline** (merah)
3. Timer countdown akan muncul (30 detik)
4. Alert akan muncul di panel Alert Logs
5. Setelah 30 detik, device akan otomatis **recovery** ke status Online

### Test Export CSV

1. Klik tombol **"Export CSV"** di panel Alert Logs
2. File CSV akan otomatis terdownload
3. Buka file dengan Excel atau text editor untuk melihat data

### Test API Endpoints

```bash
# Get semua devices
curl http://localhost:3000/api/devices

# Get detail device dengan history
curl http://localhost:3000/api/devices/router-1

# Get alert logs
curl http://localhost:3000/api/logs

# Export logs ke CSV
curl http://localhost:3000/api/logs/export -o logs.csv

# Simulate device down
curl -X POST http://localhost:3000/api/devices/router-1/simulate-down
```

## Screenshot

### Dashboard Utama
_[Screenshot dashboard dengan semua device online]_

### Device Offline (Simulate Down)
_[Screenshot saat ada device yang offline dengan countdown timer]_

### Alert Logs
_[Screenshot panel alert dengan berbagai jenis notifikasi]_

### Real-time Charts
_[Screenshot grafik latency, bandwidth, dan packet loss]_

**Cara mengambil screenshot:**
1. Jalankan aplikasi (`npm start`)
2. Buka browser ke `http://localhost:3000`
3. Gunakan Snipping Tool atau tekan `PrtSc` untuk capture
4. Simpan screenshot dan tambahkan ke folder `docs/screenshots/`

## Struktur Project

```
network-monitor/
├── server.js           # Backend utama (Express + Socket.IO)
├── package.json        # Dependencies dan scripts
├── README.md           # Dokumentasi ini
├── public/
│   └── index.html      # Frontend dashboard
└── docs/
    └── architecture.md # Penjelasan arsitektur sistem
```

## Konfigurasi

Aplikasi dapat dikonfigurasi melalui environment variables:

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| PORT | 3000 | Port server |

Contoh:
```bash
PORT=8080 npm start
```

## Troubleshooting

### Error: "Cannot find module 'express'"
**Solusi**: Jalankan `npm install` untuk menginstall dependencies

### Error: "EADDRINUSE: address already in use"
**Solusi**: Port 3000 sudah digunakan. Ganti port:
```bash
PORT=3001 npm start
```

### WebSocket tidak connect (Status: Disconnected)
**Solusi**:
1. Pastikan server berjalan (`npm start`)
2. Cek console browser untuk error
3. Refresh halaman (Ctrl+F5)
4. Pastikan tidak ada firewall yang memblokir WebSocket

### Grafik tidak update
**Solusi**:
1. Pastikan WebSocket terhubung (indikator hijau)
2. Tunggu minimal 5 detik untuk update pertama
3. Refresh halaman jika masalah berlanjut

### Error saat ping device
**Solusi**: Ini normal jika IP device tidak ada di jaringan lokal. Aplikasi akan tetap berjalan dengan simulasi data.

### Export CSV kosong
**Solusi**: Pastikan ada alert logs terlebih dahulu. Trigger beberapa simulate down untuk generate alerts.

## API Reference

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/devices | List semua devices |
| GET | /api/devices/:id | Detail device + history |
| GET | /api/logs | Get alert logs |
| GET | /api/logs/export | Export logs ke CSV |
| POST | /api/devices/:id/simulate-down | Simulate device down |
| GET | /api/status | Server status |

## WebSocket Events

| Event | Direction | Deskripsi |
|-------|-----------|-----------|
| deviceUpdate | Server → Client | Update status device |
| alert | Server → Client | Alert baru |
| ping | Client → Server | Heartbeat check |
| pong | Server → Client | Heartbeat response |

## Kontributor

- **Nadwa** - Tugas Mata Kuliah Komunikasi Data

## Lisensi

MIT License - Bebas digunakan untuk keperluan edukasi.

---

**Network Monitor v1.0.0** | Dibuat dengan Express.js, Socket.IO, Tailwind CSS & Chart.js
