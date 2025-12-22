const express = require('express');
const router = express.Router();
const tipeController = require('../controller/tipeController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- PERBAIKAN DI SINI ---
// 1. GET ALL: Endpoint ini yang dipanggil oleh Frontend (fetchTipeKamar)
// URL: /api/tipe
router.get('/', verifyToken, tipeController.getAllTipe); 

// 2. GET BY KOS: Ambil daftar kamar KHUSUS untuk kos tertentu
// URL: /api/tipe/kos/1
router.get('/kos/:idKos', verifyToken, tipeController.getTipeByKos);

// 3. POST: Tambah Tipe Baru
router.post('/', verifyToken, tipeController.createTipe);

// 4. DELETE: Hapus Tipe
router.delete('/:id', verifyToken, tipeController.deleteTipe);

module.exports = router;