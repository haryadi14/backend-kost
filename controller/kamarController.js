const db = require('../config/database');

// ------------------------------------------------------------------
// 1. AMBIL SEMUA KAMAR BERDASARKAN ID KOS (Untuk Tampilan Detail Kos)
// ------------------------------------------------------------------
exports.getKamarByKos = async (req, res) => {
    try {
        const { id_kos } = req.params;

        // Kita perlu JOIN ke tabel tipe_kamar untuk memfilter berdasarkan id_kos
        // dan mengambil info harga dari tipe tersebut
        const query = `
            SELECT k.*, t.nama_tipe, t.harga_bulanan, t.luas_kamar
            FROM kamar k
            JOIN tipe_kamar t ON k.id_tipe = t.id_tipe
            WHERE t.id_kos = ?
            ORDER BY k.lantai ASC, k.nomor_kamar ASC
        `;

        const [rows] = await db.query(query, [id_kos]);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error Get Kamar:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// ------------------------------------------------------------------
// 2. AMBIL DETAIL 1 KAMAR SAJA (Untuk Form Edit)
// ------------------------------------------------------------------
exports.getKamarById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM kamar WHERE id_kamar = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ------------------------------------------------------------------
// 3. TAMBAH KAMAR BARU (Create)
// ------------------------------------------------------------------
exports.createKamar = async (req, res) => {
    try {
        // Data dikirim dari frontend
        const { id_tipe, nomor_kamar, lantai, status_ketersediaan } = req.body;

        // Validasi sederhana
        if (!id_tipe || !nomor_kamar || !lantai) {
            return res.status(400).json({ message: 'Mohon lengkapi data kamar (Tipe, Nomor, Lantai)!' });
        }

        const query = `
            INSERT INTO kamar (id_tipe, nomor_kamar, lantai, status_ketersediaan)
            VALUES (?, ?, ?, ?)
        `;

        await db.query(query, [
            id_tipe, 
            nomor_kamar, 
            lantai, 
            status_ketersediaan || 'Tersedia' // Default 'Tersedia' jika kosong
        ]);

        res.status(201).json({ message: 'Kamar berhasil ditambahkan!' });

    } catch (error) {
        console.error("Error Create Kamar:", error);
        res.status(500).json({ message: 'Gagal tambah kamar', error: error.message });
    }
};

// ------------------------------------------------------------------
// 4. UPDATE DATA KAMAR (Untuk Simpan Edit)
// ------------------------------------------------------------------
exports.updateKamar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nomor_kamar, lantai, status_ketersediaan } = req.body;

        const query = `
            UPDATE kamar 
            SET nomor_kamar = ?, 
                lantai = ?, 
                status_ketersediaan = ? 
            WHERE id_kamar = ?
        `;

        await db.query(query, [nomor_kamar, lantai, status_ketersediaan, id]);

        res.json({ message: 'Data kamar berhasil diperbarui!' });

    } catch (error) {
        console.error("Error Update Kamar:", error);
        res.status(500).json({ message: 'Gagal update kamar', error: error.message });
    }
};

// ------------------------------------------------------------------
// 5. HAPUS KAMAR (Delete)
// ------------------------------------------------------------------
exports.deleteKamar = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Hapus data kamar
        await db.query('DELETE FROM kamar WHERE id_kamar = ?', [id]);
        
        res.json({ message: 'Kamar berhasil dihapus!' });

    } catch (error) {
        console.error("Error Delete Kamar:", error);
        // Error biasanya terjadi jika kamar masih terikat dengan data booking (Foreign Key)
        res.status(500).json({ 
            message: 'Gagal menghapus kamar. Pastikan tidak ada data booking/tagihan terkait kamar ini.', 
            error: error.message 
        });
    }
};