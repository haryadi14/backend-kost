// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'rahasia_negara_api_kosan_2025'; // Harus sama dengan di authController

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format token biasanya: "Bearer <token_panjang>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Akses Ditolak! Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Simpan data user (id & role) ke request
        next(); // Lanjut ke function controller
    } catch (error) {
        return res.status(401).json({ message: 'Token Tidak Valid!' });
    }
};