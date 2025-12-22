// --- 1. IMPORT LIBRARY UTAMA ---
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./config/database');

// --- 2. IMPORT ROUTES (Wajib dikumpulkan di atas sini!) ---
const authRoutes = require('./routes/authRoutes');
const kosRoutes = require('./routes/kosRoutes');
const tipeRoutes = require('./routes/tipeRoutes');       // <-- Posisi Benar
const kamarRoutes = require('./routes/kamarRoutes');     // <-- Posisi Benar
const bookingRoutes = require('./routes/bookingRoutes'); // <-- Posisi Benar
const transaksiRoutes = require('./routes/transaksiRoutes');

// --- 3. KONFIGURASI APLIKASI ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --- 4. MIDDLEWARE (Settingan Wajib) ---
app.use(cors()); // Izin akses dari Frontend
app.use(express.json()); // Agar bisa baca JSON

// Setting Folder Uploads agar Gambar bisa dibuka di browser
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 5. DAFTAR ROUTES (API Endpoint) ---
app.use('/api/auth', authRoutes);
app.use('/api/kos', kosRoutes);
app.use('/api/tipe', tipeRoutes);      // <-- Sudah aman karena sudah di-import di atas
app.use('/api/kamar', kamarRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/transaksi', transaksiRoutes);


// --- 6. TEST KONEKSI DATABASE (Route Halaman Utama) ---
app.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        res.json({ 
            message: 'API Kosan Service is Running! 🚀', 
            database_status: 'Connected ✅',
            test_query: rows 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Database Connection Failed ❌', 
            error: error.message 
        });
    }
});

// --- 7. JALANKAN SERVER ---
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});