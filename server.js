/**
 * Network Monitor Server
 * =====================
 * Web Monitoring Real-time untuk Analisa Perangkat Jaringan
 * Tugas Mata Kuliah: Komunikasi Data
 *
 * Fitur:
 * - ICMP Ping monitoring untuk 3 network devices
 * - Simulasi SNMP untuk bandwidth usage
 * - Real-time updates via WebSocket
 * - Alert system untuk device down, high latency, high bandwidth, packet loss
 * - Export logs ke CSV
 * - Simulate device down feature
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ping = require('ping');
const moment = require('moment-timezone');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================
const PORT = process.env.PORT || 3000;
const TIMEZONE = 'Asia/Jakarta';
const PING_INTERVAL = 5000; // 5 detik
const HISTORY_DURATION = 60 * 60 * 1000; // 1 jam dalam ms
const CONSECUTIVE_FAILS_FOR_DOWN = 3; // 3 ping gagal = device down

// Alert thresholds
const ALERT_THRESHOLDS = {
    HIGH_LATENCY: 200,      // ms
    HIGH_BANDWIDTH: 80,     // Mbps
    HIGH_PACKET_LOSS: 3     // %
};

// ============================================
// DEVICE CONFIGURATION
// ============================================
const devices = [
    {
        id: 'router-1',
        name: 'Router Utama',
        ip: '192.168.1.1',
        type: 'Router',
        status: 'online',
        latency: 0,
        bandwidth: 0,
        packetLoss: 0,
        consecutiveFails: 0,
        simulateDown: false,
        simulateDownUntil: null,
        // Base values untuk generate data yang konsisten per device
        baseBandwidth: 45,
        basePacketLoss: 0.5
    },
    {
        id: 'switch-1',
        name: 'Switch Core',
        ip: '192.168.1.2',
        type: 'Switch',
        status: 'online',
        latency: 0,
        bandwidth: 0,
        packetLoss: 0,
        consecutiveFails: 0,
        simulateDown: false,
        simulateDownUntil: null,
        baseBandwidth: 65,
        basePacketLoss: 0.3
    },
    {
        id: 'firewall-1',
        name: 'Firewall Security',
        ip: '192.168.1.3',
        type: 'Firewall',
        status: 'online',
        latency: 0,
        bandwidth: 0,
        packetLoss: 0,
        consecutiveFails: 0,
        simulateDown: false,
        simulateDownUntil: null,
        baseBandwidth: 55,
        basePacketLoss: 0.8
    }
];

// ============================================
// IN-MEMORY STORAGE
// ============================================

// History per device untuk 1 jam terakhir
// Format: { deviceId: [{ timestamp, latency, bandwidth, packetLoss, status }] }
const deviceHistory = {};
devices.forEach(d => deviceHistory[d.id] = []);

// Log/Alert history
// Format: [{ timestamp, deviceId, deviceName, deviceIp, eventType, severity, message }]
let alertLogs = [];

// ============================================
// EXPRESS & SOCKET.IO SETUP
// ============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current timestamp in WIB format
 */
function getTimestamp() {
    return moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Get timestamp for filename
 */
function getTimestampForFile() {
    return moment().tz(TIMEZONE).format('YYYY-MM-DD-HHmmss');
}

/**
 * Generate realistic bandwidth data
 * Uses base value + random fluctuation untuk consistency
 */
function generateBandwidth(device) {
    // Random fluctuation ±20 dari base
    const fluctuation = (Math.random() - 0.5) * 40;
    let bandwidth = device.baseBandwidth + fluctuation;

    // Clamp antara 10-100 Mbps
    bandwidth = Math.max(10, Math.min(100, bandwidth));

    // Occasional spikes (5% chance)
    if (Math.random() < 0.05) {
        bandwidth = Math.min(100, bandwidth + 20);
    }

    return parseFloat(bandwidth.toFixed(2));
}

/**
 * Generate realistic packet loss data
 * Mostly 0-2%, occasionally spikes to 3-5%
 */
function generatePacketLoss(device) {
    // 90% chance: normal packet loss (0-2%)
    // 10% chance: spike (3-5%)
    if (Math.random() < 0.1) {
        return parseFloat((3 + Math.random() * 2).toFixed(2));
    }

    const fluctuation = (Math.random() - 0.5) * 1;
    let packetLoss = device.basePacketLoss + fluctuation;
    packetLoss = Math.max(0, Math.min(2, packetLoss));

    return parseFloat(packetLoss.toFixed(2));
}

/**
 * Clean old history data (older than 1 hour)
 */
function cleanOldHistory() {
    const oneHourAgo = Date.now() - HISTORY_DURATION;

    Object.keys(deviceHistory).forEach(deviceId => {
        deviceHistory[deviceId] = deviceHistory[deviceId].filter(
            entry => new Date(entry.timestamp).getTime() > oneHourAgo
        );
    });

    // Clean old logs too
    alertLogs = alertLogs.filter(
        log => new Date(log.timestamp).getTime() > oneHourAgo
    );
}

/**
 * Add alert log
 */
function addAlert(device, eventType, severity, message) {
    const alert = {
        timestamp: getTimestamp(),
        deviceId: device.id,
        deviceName: device.name,
        deviceIp: device.ip,
        eventType,
        severity,
        message
    };

    alertLogs.push(alert);

    // Emit alert to all connected clients
    io.emit('alert', alert);

    console.log(`[ALERT] ${alert.timestamp} - ${severity.toUpperCase()}: ${message}`);
}

/**
 * Escape CSV field (handle commas and quotes)
 */
function escapeCSV(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// ============================================
// MONITORING LOGIC
// ============================================

/**
 * Ping a device and update its status
 */
async function pingDevice(device) {
    // Check if device is in simulate down mode
    if (device.simulateDown) {
        if (Date.now() < device.simulateDownUntil) {
            // Device is simulated as down
            handlePingFailure(device, 'Simulated device down');
            return;
        } else {
            // Simulation period ended, recover device
            device.simulateDown = false;
            device.simulateDownUntil = null;
            device.consecutiveFails = 0;
            addAlert(device, 'RECOVERY', 'success',
                `${device.name} (${device.ip}) telah kembali online setelah simulasi down`);
        }
    }

    try {
        // Actual ping to device
        const result = await ping.promise.probe(device.ip, {
            timeout: 3,
            extra: ['-c', '1']
        });

        if (result.alive) {
            handlePingSuccess(device, result.time);
        } else {
            handlePingFailure(device, 'Ping timeout');
        }
    } catch (error) {
        handlePingFailure(device, error.message);
    }
}

/**
 * Handle successful ping
 */
function handlePingSuccess(device, latency) {
    const wasDown = device.status === 'offline';
    const previousLatency = device.latency;

    // Update device status
    device.status = 'online';
    device.latency = parseFloat(latency) || Math.random() * 50 + 5; // Fallback jika latency tidak tersedia
    device.bandwidth = generateBandwidth(device);
    device.packetLoss = generatePacketLoss(device);
    device.consecutiveFails = 0;

    // Record history
    const historyEntry = {
        timestamp: getTimestamp(),
        latency: device.latency,
        bandwidth: device.bandwidth,
        packetLoss: device.packetLoss,
        status: device.status
    };
    deviceHistory[device.id].push(historyEntry);

    // Check for alerts

    // Recovery alert (device was down, now online)
    if (wasDown) {
        addAlert(device, 'RECOVERY', 'success',
            `${device.name} (${device.ip}) telah kembali online`);
    }

    // High latency alert
    if (device.latency > ALERT_THRESHOLDS.HIGH_LATENCY) {
        addAlert(device, 'HIGH_LATENCY', 'warning',
            `${device.name} (${device.ip}) latency tinggi: ${device.latency.toFixed(2)}ms`);
    }

    // High bandwidth alert
    if (device.bandwidth > ALERT_THRESHOLDS.HIGH_BANDWIDTH) {
        addAlert(device, 'HIGH_BANDWIDTH', 'warning',
            `${device.name} (${device.ip}) bandwidth tinggi: ${device.bandwidth.toFixed(2)} Mbps`);
    }

    // High packet loss alert
    if (device.packetLoss > ALERT_THRESHOLDS.HIGH_PACKET_LOSS) {
        addAlert(device, 'HIGH_PACKET_LOSS', 'warning',
            `${device.name} (${device.ip}) packet loss tinggi: ${device.packetLoss.toFixed(2)}%`);
    }

    // Emit device update
    emitDeviceUpdate(device);
}

/**
 * Handle failed ping
 */
function handlePingFailure(device, reason) {
    device.consecutiveFails++;

    // Generate fake data even when "down" untuk simulasi
    device.bandwidth = 0;
    device.packetLoss = 100;
    device.latency = 0;

    // Check if device should be marked as down (3 consecutive fails)
    if (device.consecutiveFails >= CONSECUTIVE_FAILS_FOR_DOWN && device.status !== 'offline') {
        device.status = 'offline';
        addAlert(device, 'DEVICE_DOWN', 'danger',
            `${device.name} (${device.ip}) tidak merespon - ${reason}`);
    }

    // Record history
    const historyEntry = {
        timestamp: getTimestamp(),
        latency: device.latency,
        bandwidth: device.bandwidth,
        packetLoss: device.packetLoss,
        status: device.status
    };
    deviceHistory[device.id].push(historyEntry);

    // Emit device update
    emitDeviceUpdate(device);
}

/**
 * Emit device update to all connected clients
 */
function emitDeviceUpdate(device) {
    io.emit('deviceUpdate', {
        id: device.id,
        name: device.name,
        ip: device.ip,
        type: device.type,
        status: device.status,
        latency: device.latency,
        bandwidth: device.bandwidth,
        packetLoss: device.packetLoss,
        simulateDown: device.simulateDown,
        simulateDownUntil: device.simulateDownUntil,
        timestamp: getTimestamp()
    });
}

/**
 * Start monitoring all devices
 */
function startMonitoring() {
    console.log('[MONITOR] Starting network monitoring...');

    // Initial ping for all devices
    devices.forEach(device => pingDevice(device));

    // Set interval for continuous monitoring
    setInterval(() => {
        devices.forEach(device => pingDevice(device));
        cleanOldHistory();
    }, PING_INTERVAL);

    console.log(`[MONITOR] Monitoring ${devices.length} devices every ${PING_INTERVAL/1000} seconds`);
}

// ============================================
// REST API ENDPOINTS
// ============================================

/**
 * GET /api/devices
 * List semua devices dengan status terkini
 */
app.get('/api/devices', (req, res) => {
    const deviceList = devices.map(d => ({
        id: d.id,
        name: d.name,
        ip: d.ip,
        type: d.type,
        status: d.status,
        latency: d.latency,
        bandwidth: d.bandwidth,
        packetLoss: d.packetLoss,
        simulateDown: d.simulateDown,
        simulateDownUntil: d.simulateDownUntil,
        lastUpdate: getTimestamp()
    }));

    res.json({
        success: true,
        data: deviceList,
        timestamp: getTimestamp()
    });
});

/**
 * GET /api/devices/:id
 * Detail device dengan history 1 jam terakhir
 */
app.get('/api/devices/:id', (req, res) => {
    const deviceId = req.params.id;

    // Sanitize input
    if (!/^[a-zA-Z0-9-]+$/.test(deviceId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid device ID format'
        });
    }

    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return res.status(404).json({
            success: false,
            error: 'Device not found'
        });
    }

    res.json({
        success: true,
        data: {
            id: device.id,
            name: device.name,
            ip: device.ip,
            type: device.type,
            status: device.status,
            latency: device.latency,
            bandwidth: device.bandwidth,
            packetLoss: device.packetLoss,
            simulateDown: device.simulateDown,
            simulateDownUntil: device.simulateDownUntil,
            history: deviceHistory[device.id] || []
        },
        timestamp: getTimestamp()
    });
});

/**
 * GET /api/logs
 * Ambil log/alert history
 */
app.get('/api/logs', (req, res) => {
    // Optional query params for filtering
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const severity = req.query.severity;

    let logs = [...alertLogs];

    // Filter by severity if specified
    if (severity && ['success', 'warning', 'danger'].includes(severity)) {
        logs = logs.filter(log => log.severity === severity);
    }

    // Return latest logs first, limited
    logs = logs.slice(-limit).reverse();

    res.json({
        success: true,
        data: logs,
        total: alertLogs.length,
        timestamp: getTimestamp()
    });
});

/**
 * GET /api/logs/export
 * Export logs ke CSV format
 */
app.get('/api/logs/export', (req, res) => {
    // CSV header
    const header = 'Timestamp,Device Name,Device IP,Event Type,Severity,Message';

    // CSV rows
    const rows = alertLogs.map(log => {
        return [
            escapeCSV(log.timestamp),
            escapeCSV(log.deviceName),
            escapeCSV(log.deviceIp),
            escapeCSV(log.eventType),
            escapeCSV(log.severity),
            escapeCSV(log.message)
        ].join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const filename = `network-logs-${getTimestampForFile()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
});

/**
 * POST /api/devices/:id/simulate-down
 * Simulasi device down selama 30 detik
 */
app.post('/api/devices/:id/simulate-down', (req, res) => {
    const deviceId = req.params.id;

    // Sanitize input
    if (!/^[a-zA-Z0-9-]+$/.test(deviceId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid device ID format'
        });
    }

    const device = devices.find(d => d.id === deviceId);

    if (!device) {
        return res.status(404).json({
            success: false,
            error: 'Device not found'
        });
    }

    // Check if already simulating
    if (device.simulateDown) {
        const remainingTime = Math.max(0, device.simulateDownUntil - Date.now());
        return res.status(400).json({
            success: false,
            error: 'Device is already in simulate down mode',
            remainingTime: Math.ceil(remainingTime / 1000)
        });
    }

    // Start simulation
    device.simulateDown = true;
    device.simulateDownUntil = Date.now() + 30000; // 30 seconds
    device.consecutiveFails = CONSECUTIVE_FAILS_FOR_DOWN; // Immediately mark as down
    device.status = 'offline';
    device.latency = 0;
    device.bandwidth = 0;
    device.packetLoss = 100;

    // Add alert
    addAlert(device, 'SIMULATE_DOWN', 'danger',
        `${device.name} (${device.ip}) - Simulasi device down dimulai (30 detik)`);

    // Emit update
    emitDeviceUpdate(device);

    res.json({
        success: true,
        message: `Simulasi down dimulai untuk ${device.name}`,
        duration: 30,
        recoveryTime: moment(device.simulateDownUntil).tz(TIMEZONE).format('HH:mm:ss')
    });
});

/**
 * GET /api/status
 * Server status endpoint
 */
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        server: 'Network Monitor',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: getTimestamp(),
        devices: devices.length,
        alerts: alertLogs.length
    });
});

// ============================================
// WEBSOCKET HANDLERS
// ============================================

io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Send current device status to newly connected client
    devices.forEach(device => {
        socket.emit('deviceUpdate', {
            id: device.id,
            name: device.name,
            ip: device.ip,
            type: device.type,
            status: device.status,
            latency: device.latency,
            bandwidth: device.bandwidth,
            packetLoss: device.packetLoss,
            simulateDown: device.simulateDown,
            simulateDownUntil: device.simulateDownUntil,
            timestamp: getTimestamp()
        });
    });

    // Send recent alerts (last 20)
    const recentAlerts = alertLogs.slice(-20);
    recentAlerts.forEach(alert => {
        socket.emit('alert', alert);
    });

    socket.on('disconnect', () => {
        console.log(`[WS] Client disconnected: ${socket.id}`);
    });

    // Handle ping request from client
    socket.on('ping', () => {
        socket.emit('pong', { timestamp: getTimestamp() });
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ============================================
// START SERVER
// ============================================

server.listen(PORT, () => {
    console.log('================================================');
    console.log('   NETWORK MONITOR - Web Monitoring Real-time');
    console.log('   Tugas Mata Kuliah Komunikasi Data');
    console.log('================================================');
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log(`[SERVER] Timezone: ${TIMEZONE}`);
    console.log(`[SERVER] Monitoring interval: ${PING_INTERVAL/1000}s`);
    console.log('================================================');

    // Start monitoring
    startMonitoring();
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[SERVER] Shutting down gracefully...');
    server.close(() => {
        console.log('[SERVER] Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('[SERVER] Received SIGINT, shutting down...');
    server.close(() => {
        process.exit(0);
    });
});
