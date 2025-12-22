// controller/kosController.js
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// 1. TAMBAH DATA KOS (Create)
exports.createKos = async (req, res) => {
    try {
        const { nama_kos, alamat, deskripsi, kota } = req.body;
        // Pastikan req.user ada (dari middleware auth)
        const id_owner = req.user ? req.user.id : null; 

        // Cek apakah ada file foto yang diupload
        const foto_utama = req.file ? req.file.filename : null;

        if (!foto_utama) {
            return res.status(400).json({ message: 'Foto Kos Wajib Diupload!' });
        }

        // Simpan ke database
        await db.query(`
            INSERT INTO kosan (nama_kos, alamat, deskripsi, foto_utama, kota, id_owner) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [nama_kos, alamat, deskripsi, foto_utama, kota, id_owner]
        );

        res.status(201).json({ message: 'Data Kos Berhasil Ditambahkan!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. LIHAT SEMUA KOS (Read) - Bisa filter by Owner kalau mau
// AMBIL SEMUA DATA KOS (Bisa dengan Filter Pencarian)
exports.getAllKos = async (req, res) => {
    try {
        // Ambil parameter 'search' dari URL (misal: /api/kos?search=bandung)
        const { search } = req.query;

        let query = "SELECT * FROM kosan";
        const params = [];

        // Jika ada pencarian, tambahkan WHERE
        if (search) {
            query += " WHERE nama_kos LIKE ? OR kota LIKE ? OR alamat LIKE ?";
            const keyword = `%${search}%`; // % artinya cocokkan sebagian kata
            params.push(keyword, keyword, keyword);
        }

        query += " ORDER BY id_kos DESC"; // Urutkan dari yang terbaru

        const [rows] = await db.query(query, params);
        
        // Format response konsisten
        res.json({ 
            success: true, 
            message: 'Data berhasil diambil',
            data: rows 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 3. AMBIL 1 DATA KOS (Detail/Edit)
exports.getKosById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM kosan WHERE id_kos = ?', [id]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'Kos tidak ditemukan' });

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 4. UPDATE KOS (Edit) - INI YANG BARU DITAMBAHKAN
exports.updateKos = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_kos, alamat, deskripsi, kota } = req.body;

        // Logika: Cek apakah user upload foto baru?
        if (req.file) {
            // Jika ADA foto baru, update semua kolom + foto_utama
            const foto_baru = req.file.filename;
            
            await db.query(`
                UPDATE kosan 
                SET nama_kos = ?, alamat = ?, deskripsi = ?, kota = ?, foto_utama = ? 
                WHERE id_kos = ?`, 
                [nama_kos, alamat, deskripsi, kota, foto_baru, id]
            );
        } else {
            // Jika TIDAK ADA foto baru, update tulisan saja (foto lama jangan dihapus)
            await db.query(`
                UPDATE kosan 
                SET nama_kos = ?, alamat = ?, deskripsi = ?, kota = ? 
                WHERE id_kos = ?`, 
                [nama_kos, alamat, deskripsi, kota, id]
            );
        }

        res.json({ success: true, message: 'Data kos berhasil diperbarui!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal update data', error: error.message });
    }
};

// 5. HAPUS KOSAN (Delete)
exports.deleteKos = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Opsional: Hapus file gambarnya dulu dari folder 'uploads' supaya server tidak penuh
        // const [data] = await db.query('SELECT foto_utama FROM kosan WHERE id_kos = ?', [id]);
        // if (data.length > 0) { ...hapus file fs.unlink... }

        // Hapus data dari DB
        await db.query('DELETE FROM kosan WHERE id_kos = ?', [id]);

        res.json({ success: true, message: 'Kosan berhasil dihapus.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};