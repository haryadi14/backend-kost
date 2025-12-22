const db = require('../config/database');

exports.createBooking = async (req, res) => {
    try {
        const id_pencari = req.user.id; 
        
        console.log("BODY DITERIMA SERVER:", req.body); 

        // 1. Ambil data dari Frontend
        const { id_kamar, tanggal_mulai, durasi_bulan } = req.body;

        // Validasi
        if (!id_kamar || !tanggal_mulai || !durasi_bulan) {
            return res.status(400).json({ message: 'Data booking tidak lengkap!' });
        }

        // 2. Cek Harga Kamar (Untuk menghitung tagihan)
        const [kamarInfo] = await db.query(`
            SELECT t.harga_bulanan 
            FROM kamar k 
            JOIN tipe_kamar t ON k.id_tipe = t.id_tipe 
            WHERE k.id_kamar = ?`, 
            [id_kamar]
        );
        
        if (kamarInfo.length === 0) {
            return res.status(404).json({ message: "Kamar tidak ditemukan!" });
        }

        const harga = kamarInfo[0].harga_bulanan;
        const totalTagihan = harga * durasi_bulan;

        // 3. INSERT KE TABEL 'pemesanan' (Sesuai Database Anda)
        // Kita isi 'durasi_sewa_bulan' karena itu kolom NOT NULL di database Anda
        const queryBooking = `
            INSERT INTO pemesanan (
                id_user, id_kamar, tanggal_masuk, durasi_sewa_bulan, 
                status_booking, status_pemesanan, tanggal_booking
            )
            VALUES (?, ?, ?, ?, 'Pending', 'Menunggu Pembayaran', NOW())
        `;
        
        const [resultBooking] = await db.query(queryBooking, [
            id_pencari,     
            id_kamar, 
            tanggal_mulai,  // Masuk ke 'tanggal_masuk'
            durasi_bulan    // Masuk ke 'durasi_sewa_bulan'
        ]);
        
        const newIdBooking = resultBooking.insertId; 

        // 4. INSERT KE TABEL 'tagihan' (Sesuai Database Anda)
        // Kolom: id_booking, judul_tagihan, jumlah_tagihan, tanggal_jatuh_tempo, status_bayar, jenis_tagihan
        const queryTagihan = `
            INSERT INTO tagihan (
                id_booking, judul_tagihan, jumlah_tagihan, 
                tanggal_jatuh_tempo, status_bayar, jenis_tagihan
            )
            VALUES (?, 'Pembayaran Bulan Pertama', ?, ?, 'Belum Lunas', 'Uang Muka')
        `;

        // Jatuh tempo kita set sama dengan tanggal masuk
        await db.query(queryTagihan, [newIdBooking, totalTagihan, tanggal_mulai]);

        // 5. Update Status Kamar (Opsional, langsung 'Terisi')
        await db.query(`
            UPDATE kamar SET status_ketersediaan = 'Terisi' WHERE id_kamar = ?`,
            [id_kamar]
        );

        res.status(201).json({ 
            message: 'Booking Berhasil & Tagihan Dibuat!',
            id_booking: newIdBooking,
            total_tagihan: totalTagihan
        });

    } catch (error) {
        console.error("Error Booking:", error);
        res.status(500).json({ 
            message: 'Gagal booking.',
            error: error.message 
        });
    }
};

// --- FUNGSI LIHAT BOOKING (Update agar sesuai nama tabel) ---
exports.getAllBookings = async (req, res) => {
    try {
        const query = `
            SELECT p.id_booking, p.status_booking, p.tanggal_masuk, p.durasi_sewa_bulan,
                   u.nama_lengkap AS nama_penyewa,
                   k.nomor_kamar,
                   t.nama_tipe
            FROM pemesanan p
            JOIN users u ON p.id_user = u.id_user
            JOIN kamar k ON p.id_kamar = k.id_kamar
            JOIN tipe_kamar t ON k.id_tipe = t.id_tipe
            ORDER BY p.id_booking DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};