// routes/bookings.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// Generate unique booking number
function generateBookingNumber() {
    return 'BK' + Date.now() + Math.floor(Math.random() * 1000);
}

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Customer only)
router.post('/', auth, async (req, res) => {
    // Check if user is customer
    if (req.user.role !== 'customer') {
        return res.status(403).json({ msg: 'Only customers can create bookings' });
    }

    const { serviceId, bookingDate, startTime, endTime, address, specialInstructions } = req.body;

    // Validation
    if (!serviceId || !bookingDate || !startTime || !endTime || !address) {
        return res.status(400).json({ msg: 'Please fill all required fields' });
    }

    try {
        // Get service details to calculate amount
        const [services] = await db.query('SELECT basePrice FROM services WHERE id = ?', [serviceId]);
        
        if (services.length === 0) {
            return res.status(404).json({ msg: 'Service not found' });
        }

        const bookingNumber = generateBookingNumber();
        const totalAmount = services[0].basePrice;

        const [result] = await db.query(
            `INSERT INTO bookings 
            (bookingNumber, customerId, serviceId, bookingDate, startTime, endTime, address, specialInstructions, totalAmount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bookingNumber, req.user.id, serviceId, bookingDate, startTime, endTime, address, specialInstructions, totalAmount]
        );

        res.json({ 
            msg: 'Booking created successfully',
            bookingId: result.insertId,
            bookingNumber
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, s.name as serviceName, s.basePrice 
             FROM bookings b
             JOIN services s ON b.serviceId = s.id
             WHERE b.customerId = ?
             ORDER BY b.createdAt DESC`,
            [req.user.id]
        );
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/bookings/cleaner-jobs
// @desc    Get jobs assigned to cleaner
// @access  Private (Cleaner only)
router.get('/cleaner-jobs', auth, async (req, res) => {
    if (req.user.role !== 'cleaner') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const [bookings] = await db.query(
            `SELECT b.*, s.name as serviceName, u.fullName as customerName
             FROM bookings b
             JOIN services s ON b.serviceId = s.id
             JOIN users u ON b.customerId = u.id
             WHERE b.cleanerId = ?
             ORDER BY b.createdAt DESC`,
            [req.user.id]
        );
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    const bookingId = req.params.id;

    try {
        // Check if booking exists
        const [bookings] = await db.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
        
        if (bookings.length === 0) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        const booking = bookings[0];

        // Check permissions
        if (req.user.role === 'customer' && booking.customerId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (req.user.role === 'cleaner' && booking.cleanerId !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

        res.json({ msg: 'Booking status updated successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;