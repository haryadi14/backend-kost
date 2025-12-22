// routes/kosRoutes.js
const express = require('express');
const router = express.Router();
const kosController = require('../controller/kosController');
const { verifyToken } = require('../middleware/authMiddleware'); // Pastikan path middleware benar
const multer = require('multer');
const path = require('path');

// --- SETUP MULTER (UPLOAD GAMBAR) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Gambar disimpan di folder 'uploads'
    },
    filename: (req, file, cb) => {
        // Nama file unik: timestamp + ekstensi asli
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- DEFINISI ROUTES ---

// 1. GET ALL (Untuk Dashboard)
// URL: http://localhost:3000/api/kos
router.get('/', kosController.getAllKos);

// 2. GET ONE (Untuk Halaman Detail & Form Edit) - [PENTING: INI BARU DITAMBAHKAN]
// URL: http://localhost:3000/api/kos/1
router.get('/:id', kosController.getKosById);

// 3. POST (Tambah Kos Baru)
// Perhatikan: 'image' harus sama dengan formData.append('image', ...) di Vue
router.post('/', verifyToken, upload.single('foto_utama'), kosController.createKos);

// 4. PUT (Update/Edit Kos) - [PENTING: INI BARU DITAMBAHKAN]
// URL: http://localhost:3000/api/kos/1
router.put('/:id', verifyToken, upload.single('foto_utama'), kosController.updateKos);

// 5. DELETE (Hapus Kos)
// URL: http://localhost:3000/api/kos/1
router.delete('/:id', verifyToken, kosController.deleteKos);
router.get('/:id', kosController.getKosById); // <-- PENTING UTK EDIT
module.exports = router;