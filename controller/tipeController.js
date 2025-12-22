const db = require('../config/database');

// 1. AMBIL SEMUA TIPE (WAJIB ADA: Untuk mengisi dropdown di Frontend)
exports.getAllTipe = async (req, res) => {
    try {
        // Ambil semua data tipe kamar
        const [rows] = await db.query('SELECT * FROM tipe_kamar');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. AMBIL TIPE KAMAR BERDASARKAN ID KOS (Untuk Detail Kos)
exports.getTipeByKos = async (req, res) => {
    try {
        const { idKos } = req.params;
        const [rows] = await db.query('SELECT * FROM tipe_kamar WHERE id_kos = ?', [idKos]);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. BUAT TIPE BARU (Create)
exports.createTipe = async (req, res) => {
    try {
        // Pastikan nama kolom 'stok_total' & 'deskripsi' benar-benar ada di database Anda
        // Jika di database tidak ada kolom 'stok_total', hapus dari query ini
        const { id_kos, nama_tipe, harga_bulanan, deskripsi, stok_total } = req.body;

        // Validasi input
        if (!nama_tipe || !harga_bulanan) {
            return res.status(400).json({ message: 'Nama Tipe dan Harga wajib diisi!' });
        }
        
        // Gunakan default id_kos = 1 jika user tidak mengirimnya (sementara)
        const finalIdKos = id_kos || 1; 
        const stok = stok_total || 0;

        const query = `INSERT INTO tipe_kamar (id_kos, nama_tipe, harga_bulanan, deskripsi, stok_total) VALUES (?, ?, ?, ?, ?)`;
        
        await db.query(query, [finalIdKos, nama_tipe, harga_bulanan, deskripsi, stok]);

        res.status(201).json({ success: true, message: 'Tipe kamar berhasil dibuat!' });
    } catch (error) {
        console.error("Error Create Tipe:", error); // Biar kelihatan di terminal kalau error
        res.status(500).json({ error: error.message });
    }
};

// 4. HAPUS TIPE KAMAR (Delete)
exports.deleteTipe = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM tipe_kamar WHERE id_tipe = ?', [id]);
        
        res.json({ success: true, message: 'Tipe kamar berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};