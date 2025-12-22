1.	Database: MySQL dengan 12 Tabel Relasional, dilengkapi logika otomatis (Trigger, Stored Procedure, View) untuk memenuhi syarat kompleksitas.
2.	Backend API: Node.js & Express.js .
•	Keamanan (Auth):
Bcrypt: Password user (misal: "123") diubah menjadi kode acak ($2b$10$Eix...) agar aman dari hacker.
JWT (JSON Web Token): Saat Login, user diberi "Tiket Digital".
Middleware (authMiddleware.js): Satpam digital.
Upload Gambar (multer): Fitur untuk menangkap file gambar dari user, memberinya nama unik (biar tidak bentrok), dan menyimpannya di folder uploads.

