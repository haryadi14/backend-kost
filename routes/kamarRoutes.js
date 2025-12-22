const express = require('express');
const router = express.Router();
// Pastikan path ini benar mengarah ke file controller Anda
const kamarController = require('../controller/kamarController');

// 1. GET Semua Kamar di Kos tertentu (Untuk DetailKos.vue)
// Endpoint: GET /api/kamar/kos/:id_kos
router.get('/kos/:id_kos', kamarController.getKamarByKos);

// 2. GET Detail 1 Kamar (Untuk Form Edit di EditKamar.vue)
// Endpoint: GET /api/kamar/:id
router.get('/:id', kamarController.getKamarById);

// 3. POST Tambah Kamar Baru (Create)
// Endpoint: POST /api/kamar
router.post('/', kamarController.createKamar);

// 4. PUT Update Kamar (Simpan Perubahan Edit)
// Endpoint: PUT /api/kamar/:id
router.put('/:id', kamarController.updateKamar);

// 5. DELETE Hapus Kamar
// Endpoint: DELETE /api/kamar/:id
router.delete('/:id', kamarController.deleteKamar);

module.exports = router;