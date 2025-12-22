const db = require('../config/database');

// 1. LIHAT TAGIHAN (User & Owner)
exports.getTagihanUser = async (req, res) => {
    try {
        const id_user = req.user.id_user || req.user.id; 
        const role = req.user.role; 

        let query = '';
        let params = [];

        if (role === 2) { 
            // OWNER
            query = `
                SELECT tg.id_tagihan, tg.jumlah_tagihan, tg.status_bayar AS status_tagihan, tg.bukti_bayar,
                       u.nama_lengkap, k.nomor_kamar, t.nama_tipe, ks.nama_kos
                FROM tagihan tg
                JOIN pemesanan p ON tg.id_booking = p.id_booking
                JOIN users u ON p.id_user = u.id_user
                JOIN kamar k ON p.id_kamar = k.id_kamar
                JOIN tipe_kamar t ON k.id_tipe = t.id_tipe
                JOIN kosan ks ON t.id_kos = ks.id_kos 
                WHERE ks.id_owner = ? 
                ORDER BY tg.id_tagihan DESC`;
            params = [id_user];
        } else {
            // PENCARI
            query = `
                SELECT 
                    tg.id_tagihan, 
                    tg.jumlah_tagihan, 
                    tg.status_bayar AS status_tagihan, 
                    tg.tanggal_jatuh_tempo,
                    tg.bukti_bayar,
                    k.nomor_kamar,
                    t.nama_tipe,
                    ks.nama_kos,
                    ks.alamat
                FROM tagihan tg
                JOIN pemesanan p ON tg.id_booking = p.id_booking
                JOIN kamar k ON p.id_kamar = k.id_kamar
                JOIN tipe_kamar t ON k.id_tipe = t.id_tipe
                JOIN kosan ks ON t.id_kos = ks.id_kos
                WHERE p.id_user = ? 
                ORDER BY tg.id_tagihan DESC`;
            params = [id_user];
        }

        const [rows] = await db.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error("Error SQL:", error);
        res.status(500).json({ error: error.message });
    }
};

// 2. UPLOAD BUKTI (User)
exports.uploadBukti = async (req, res) => {
    try {
        const { id_tagihan } = req.params;
        const file = req.file; // File dari multer

        if (!file) {
            return res.status(400).json({ message: 'Wajib upload foto bukti!' });
        }

        // Update database: Simpan nama file & Ubah status
        await db.query(`
            UPDATE tagihan 
            SET bukti_bayar = ?, status_bayar = 'Menunggu Konfirmasi' 
            WHERE id_tagihan = ?`, 
            [file.filename, id_tagihan]
        );

        res.json({ message: 'Bukti terkirim! Menunggu konfirmasi pemilik.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// 3. VALIDASI PEMBAYARAN (Juragan)
exports.validasiPembayaran = async (req, res) => {
    try {
        const { id_tagihan } = req.params;
        const { aksi } = req.body; // 'terima' atau 'tolak'

        let statusBaru = aksi === 'terima' ? 'Lunas' : 'Ditolak';

        // Update Tagihan
        await db.query(`UPDATE tagihan SET status_bayar = ? WHERE id_tagihan = ?`, [statusBaru, id_tagihan]);
        
        // Jika diterima, update juga status pemesanan jadi Lunas
        if (aksi === 'terima') {
            await db.query(`
                UPDATE pemesanan p 
                JOIN tagihan t ON p.id_booking = t.id_booking 
                SET p.status_pemesanan = 'Lunas' 
                WHERE t.id_tagihan = ?`, 
                [id_tagihan]
            );
        }

        res.json({ message: `Pembayaran berhasil di-${aksi}` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};