const express = require('express');
const router = express.Router();
const transaksiController = require('../controller/transaksiController');
const { verifyToken } = require('../middleware/authMiddleware');

// --- SETUP MULTER (UPLOAD FILE) ---
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Simpan di folder uploads
    },
    filename: (req, file, cb) => {
        // Namai file: waktu-saat-ini.jpg (biar unik)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Lihat Tagihan
router.get('/', verifyToken, transaksiController.getTagihanUser); 

// 2. Upload Bukti (User) -> Pakai middleware upload.single('bukti')
router.post('/:id_tagihan/upload', verifyToken, upload.single('bukti'), transaksiController.uploadBukti);
// 3. Validasi (Juragan)
router.post('/:id_tagihan/validasi', verifyToken, transaksiController.validasiPembayaran); 

module.exports = router;