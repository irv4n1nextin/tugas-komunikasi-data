Simple Web Monitoring
Nama : Irfan Aflah Maulana

NIM : 241091900178

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


Requirement
Node.js v14+ (direkomendasikan v16/v18)
npm
Instal dan jalankan
Simpan semua file sesuai struktur:

package.json
server.js
devices.js
README.md
public/
index.html
main.js
Install dependensi: npm install

Jalankan server: npm start

Buka browser: http://localhost:3000

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

- **Irfan Aflah Maulana** - Tugas Mata Kuliah Komunikasi Data

## Lisensi

MIT License - Bebas digunakan untuk keperluan edukasi.

---

**Network Monitor v1.0.0** | Dibuat dengan Express.js, Socket.IO, Tailwind CSS & Chart.js


##### Arsitektur (Diagram)

# Arsitektur Sistem - Network Monitor

Dokumen ini menjelaskan arsitektur dan desain sistem Network Monitor untuk Web Monitoring Real-time.

## Diagram Alur Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NETWORK MONITOR SYSTEM                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ROUTER    │     │   SWITCH    │     │  FIREWALL   │
│ 192.168.1.1 │     │ 192.168.1.2 │     │ 192.168.1.3 │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │    ICMP PING      │    ICMP PING      │    ICMP PING
       │    (5 detik)      │    (5 detik)      │    (5 detik)
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND SERVER                                 │
│                         (Node.js + Express.js)                              │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  PING MODULE    │  │  DATA GENERATOR │  │  ALERT ENGINE   │            │
│  │  (ping npm)     │  │  (Bandwidth,    │  │  (Threshold     │            │
│  │                 │  │   Packet Loss)  │  │   Checking)     │            │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘            │
│           │                    │                    │                      │
│           └──────────┬─────────┴────────────────────┘                      │
│                      ▼                                                      │
│           ┌─────────────────────┐                                          │
│           │   IN-MEMORY STORE   │                                          │
│           │  - Device Status    │                                          │
│           │  - History (1 jam)  │                                          │
│           │  - Alert Logs       │                                          │
│           └──────────┬──────────┘                                          │
│                      │                                                      │
│     ┌────────────────┴────────────────┐                                    │
│     ▼                                 ▼                                    │
│ ┌───────────────┐            ┌───────────────┐                            │
│ │   REST API    │            │  SOCKET.IO    │                            │
│ │  (Express)    │            │  (WebSocket)  │                            │
│ │               │            │               │                            │
│ │ GET /devices  │            │ deviceUpdate  │                            │
│ │ GET /logs     │            │ alert         │                            │
│ │ POST /sim-down│            │               │                            │
│ └───────┬───────┘            └───────┬───────┘                            │
└─────────┼────────────────────────────┼─────────────────────────────────────┘
          │                            │
          │      HTTP/REST             │     WebSocket
          │      (Request-Response)    │     (Real-time Push)
          │                            │
          ▼                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND CLIENT                                │
│                    (HTML + Tailwind CSS + Chart.js)                        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         DASHBOARD UI                                  │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │  │
│  │  │ Device Table    │  │ Real-time       │  │ Alert Panel     │      │  │
│  │  │ - Status        │  │ Charts          │  │ - Logs          │      │  │
│  │  │ - Latency       │  │ - Latency       │  │ - Toast         │      │  │
│  │  │ - Bandwidth     │  │ - Bandwidth     │  │ - Export CSV    │      │  │
│  │  │ - Packet Loss   │  │ - Packet Loss   │  │                 │      │  │
│  │  │ - Sim Down Btn  │  │                 │  │                 │      │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘      │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      WebSocket Manager                                │  │
│  │  - Auto-reconnect                                                     │  │
│  │  - Event handlers (deviceUpdate, alert)                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Flow Monitoring Detail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING FLOW (Every 5 seconds)                   │
└─────────────────────────────────────────────────────────────────────────────┘

START
  │
  ▼
┌─────────────────┐
│ setInterval     │
│ (5000ms)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Check Simulate  │ YES │ Handle Simulate │
│ Down Active?    ├────►│ Down Logic      │
└────────┬────────┘     └────────┬────────┘
         │ NO                    │
         ▼                       │
┌─────────────────┐              │
│ Execute ICMP    │              │
│ Ping to Device  │              │
└────────┬────────┘              │
         │                       │
    ┌────┴────┐                  │
    ▼         ▼                  │
┌───────┐ ┌───────┐              │
│SUCCESS│ │FAILED │              │
└───┬───┘ └───┬───┘              │
    │         │                  │
    ▼         ▼                  │
┌─────────┐ ┌─────────────────┐  │
│Update:  │ │consecutiveFails │  │
│- status │ │     += 1        │  │
│- latency│ └────────┬────────┘  │
│- reset  │          │           │
│  fails  │     ┌────┴────┐      │
└────┬────┘     ▼         ▼      │
     │     ┌───────┐ ┌────────┐  │
     │     │ >= 3  │ │  < 3   │  │
     │     └───┬───┘ └────┬───┘  │
     │         │          │      │
     │         ▼          │      │
     │    ┌─────────┐     │      │
     │    │ Mark    │     │      │
     │    │ OFFLINE │     │      │
     │    └────┬────┘     │      │
     │         │          │      │
     └─────────┼──────────┴──────┘
               │
               ▼
       ┌───────────────┐
       │ Generate Fake │
       │ Data:         │
       │ - Bandwidth   │
       │ - Packet Loss │
       └───────┬───────┘
               │
               ▼
       ┌───────────────┐
       │ Check Alert   │
       │ Thresholds:   │
       │ - Latency>200 │
       │ - BW > 80     │
       │ - PL > 3%     │
       └───────┬───────┘
               │
          ┌────┴────┐
          ▼         ▼
     ┌─────────┐ ┌─────────┐
     │THRESHOLD│ │  OK     │
     │EXCEEDED │ │         │
     └────┬────┘ └────┬────┘
          │           │
          ▼           │
     ┌─────────┐      │
     │ Create  │      │
     │ Alert   │      │
     └────┬────┘      │
          │           │
          └─────┬─────┘
                │
                ▼
        ┌───────────────┐
        │ Save to       │
        │ History Array │
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ Emit via      │
        │ Socket.IO:    │
        │ - deviceUpdate│
        │ - alert       │
        └───────┬───────┘
                │
                ▼
              END
```

## Penjelasan Protokol

### 1. ICMP (Internet Control Message Protocol)

ICMP digunakan untuk mengecek ketersediaan (availability) dan latency dari network devices.

```
┌──────────────┐                    ┌──────────────┐
│   SERVER     │                    │   DEVICE     │
│              │                    │              │
│              │  ICMP Echo Request │              │
│              │ ──────────────────►│              │
│              │                    │              │
│              │  ICMP Echo Reply   │              │
│              │ ◄──────────────────│              │
│              │                    │              │
│  Hitung RTT  │                    │              │
│  (Latency)   │                    │              │
└──────────────┘                    └──────────────┘
```

**Karakteristik:**
- Layer: Network (Layer 3)
- Tidak memerlukan port
- Digunakan untuk: ping, traceroute
- Timeout: 3 detik per ping

**Implementasi di Kode:**
```javascript
const result = await ping.promise.probe(device.ip, {
    timeout: 3,
    extra: ['-c', '1']
});
```

### 2. HTTP/REST (Hypertext Transfer Protocol)

Digunakan untuk komunikasi request-response antara client dan server.

```
┌──────────────┐                    ┌──────────────┐
│   CLIENT     │                    │   SERVER     │
│              │                    │              │
│              │  HTTP GET Request  │              │
│              │ ──────────────────►│              │
│              │  /api/devices      │              │
│              │                    │              │
│              │  HTTP Response     │              │
│              │ ◄──────────────────│              │
│              │  200 OK + JSON     │              │
└──────────────┘                    └──────────────┘
```

**Endpoints yang tersedia:**
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | /api/devices | List semua device |
| GET | /api/devices/:id | Detail + history |
| GET | /api/logs | Alert logs |
| GET | /api/logs/export | Export CSV |
| POST | /api/devices/:id/simulate-down | Trigger simulate |

### 3. WebSocket (via Socket.IO)

Digunakan untuk komunikasi real-time bidirectional.

```
┌──────────────┐                    ┌──────────────┐
│   CLIENT     │                    │   SERVER     │
│              │                    │              │
│              │  WebSocket         │              │
│              │  Handshake         │              │
│              │ ◄────────────────► │              │
│              │                    │              │
│              │                    │  Monitor     │
│              │  deviceUpdate      │  Event       │
│              │ ◄──────────────────│              │
│              │                    │              │
│              │  alert             │              │
│              │ ◄──────────────────│              │
│              │                    │              │
│  Update UI   │                    │              │
│  Real-time   │                    │              │
└──────────────┘                    └──────────────┘
```

**Events:**
| Event | Direction | Data |
|-------|-----------|------|
| connection | Handshake | - |
| deviceUpdate | Server→Client | Device object |
| alert | Server→Client | Alert object |
| disconnect | Bidirectional | - |

**Keunggulan WebSocket:**
- Full-duplex communication
- Low latency
- Persistent connection
- Event-driven

## Sistem Alert

### Alert Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ALERT SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │ Device Update   │
                    │ Received        │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Check Device    │ │ Check Latency   │ │ Check Bandwidth │
│ Status Change   │ │ Threshold       │ │ Threshold       │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
    ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
    ▼         ▼         ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│OFFLINE│ │ONLINE │ │ >200  │ │ ≤200  │ │ >80   │ │ ≤80   │
│(DOWN) │ │(RECOV)│ │  ms   │ │  ms   │ │ Mbps  │ │ Mbps  │
└───┬───┘ └───┬───┘ └───┬───┘ └───────┘ └───┬───┘ └───────┘
    │         │         │                   │
    ▼         ▼         ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    CREATE ALERT                          │
│                                                          │
│  {                                                       │
│    timestamp: "2024-01-15 14:30:25",                    │
│    deviceId: "router-1",                                │
│    deviceName: "Router Utama",                          │
│    deviceIp: "192.168.1.1",                             │
│    eventType: "DEVICE_DOWN" | "HIGH_LATENCY" | ...,     │
│    severity: "danger" | "warning" | "success",          │
│    message: "Router Utama (192.168.1.1) tidak merespon" │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ Store in alertLogs Array    │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ Emit 'alert' via Socket.IO  │
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ Frontend receives & shows   │
              │ - Toast notification        │
              │ - Alert list entry          │
              └─────────────────────────────┘
```

### Alert Types & Thresholds

| Event Type | Severity | Threshold | Deskripsi |
|------------|----------|-----------|-----------|
| DEVICE_DOWN | danger | 3 ping fails | Device tidak merespon |
| RECOVERY | success | - | Device kembali online |
| HIGH_LATENCY | warning | > 200ms | Latency tinggi |
| HIGH_BANDWIDTH | warning | > 80 Mbps | Bandwidth usage tinggi |
| HIGH_PACKET_LOSS | warning | > 3% | Packet loss tinggi |
| SIMULATE_DOWN | danger | Manual trigger | Simulasi device down |

## Data Structure

### Device Object

```javascript
{
    id: 'router-1',           // Unique identifier
    name: 'Router Utama',     // Display name
    ip: '192.168.1.1',        // IP Address
    type: 'Router',           // Device type
    status: 'online',         // online | offline
    latency: 25.5,            // ms (float)
    bandwidth: 45.32,         // Mbps (float)
    packetLoss: 0.5,          // % (float)
    consecutiveFails: 0,      // Counter for failures
    simulateDown: false,      // Simulation flag
    simulateDownUntil: null,  // Timestamp end simulation
    baseBandwidth: 45,        // Base value for consistency
    basePacketLoss: 0.5       // Base value for consistency
}
```

### History Entry

```javascript
{
    timestamp: '2024-01-15 14:30:25',  // WIB timestamp
    latency: 25.5,                      // ms
    bandwidth: 45.32,                   // Mbps
    packetLoss: 0.5,                    // %
    status: 'online'                    // Status saat itu
}
```

### Alert Object

```javascript
{
    timestamp: '2024-01-15 14:30:25',
    deviceId: 'router-1',
    deviceName: 'Router Utama',
    deviceIp: '192.168.1.1',
    eventType: 'HIGH_LATENCY',
    severity: 'warning',
    message: 'Router Utama (192.168.1.1) latency tinggi: 250.00ms'
}
```

## Sequence Diagram - Simulate Down

```
┌────────┐          ┌────────┐          ┌────────┐
│Frontend│          │Backend │          │Device  │
└───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │
    │ POST /simulate    │                   │
    │──────────────────►│                   │
    │                   │                   │
    │                   │ Set simulateDown  │
    │                   │ = true            │
    │                   │                   │
    │ 200 OK            │                   │
    │◄──────────────────│                   │
    │                   │                   │
    │                   │──┐                │
    │                   │  │ setInterval    │
    │                   │◄─┘ (5 sec)        │
    │                   │                   │
    │                   │ Skip real ping    │
    │                   │ (simulated down)  │
    │                   │                   │
    │ WS: deviceUpdate  │                   │
    │◄──────────────────│                   │
    │ (status: offline) │                   │
    │                   │                   │
    │ WS: alert         │                   │
    │◄──────────────────│                   │
    │ (SIMULATE_DOWN)   │                   │
    │                   │                   │
    │  ... 30 seconds ...                   │
    │                   │                   │
    │                   │ simulateDownUntil │
    │                   │ expired           │
    │                   │                   │
    │                   │ Resume normal ping│
    │                   │──────────────────►│
    │                   │                   │
    │                   │◄──────────────────│
    │                   │ Ping response     │
    │                   │                   │
    │ WS: deviceUpdate  │                   │
    │◄──────────────────│                   │
    │ (status: online)  │                   │
    │                   │                   │
    │ WS: alert         │                   │
    │◄──────────────────│                   │
    │ (RECOVERY)        │                   │
    │                   │                   │
```

## Security Considerations

1. **Input Validation**: Device ID divalidasi dengan regex pattern
2. **No SQL Injection**: Tidak menggunakan database SQL
3. **CORS Configuration**: Dikonfigurasi untuk development
4. **No Authentication**: Tidak diperlukan untuk local development
5. **Rate Limiting**: Simulate down tidak bisa di-trigger berulang

## Performance Optimization

1. **In-Memory Storage**: Data disimpan di RAM untuk akses cepat
2. **History Cleanup**: Data >1 jam otomatis dihapus
3. **Chart Optimization**: Maksimal 30 data points per chart
4. **WebSocket**: Push-based updates lebih efisien dari polling
5. **Parallel Ping**: Semua device di-ping secara bersamaan

---

**Network Monitor Architecture v1.0** | Komunikasi Data irfan

