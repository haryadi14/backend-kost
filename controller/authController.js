const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'rahasia_negara_api_kosan_2025'; 

// 1. REGISTRASI USER BARU
exports.register = async (req, res) => {
    // Frontend mengirim 'role', tapi database butuh 'id_role'
    const { nama_lengkap, email, password, role } = req.body;

    try {
        const [cekUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (cekUser.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // PERBAIKAN: Gunakan kolom 'id_role' (bukan 'role')
        await db.query(`
            INSERT INTO users (nama_lengkap, email, password, id_role) 
            VALUES (?, ?, ?, ?)`, 
            [nama_lengkap, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'Registrasi Berhasil! Silakan Login.' });

    } catch (error) {
        console.error("Error Register:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'Email tidak ditemukan' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Password salah!' });
        }

        // PERBAIKAN: Ambil 'id_role' dari database
        const roleUser = user.id_role || user.role; // Cek dua kemungkinan biar aman

        const token = jwt.sign({ id: user.id_user, role: roleUser }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login Berhasil',
            token: token,
            user: {
                id_user: user.id_user,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: roleUser // PENTING: Kirim sebagai 'role' agar Frontend mengerti
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};