const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController'); // Pastikan path benar
const { verifyToken } = require('../middleware/authMiddleware');

// Endpoint: /api/booking
router.post('/', verifyToken, bookingController.createBooking);

module.exports = router;