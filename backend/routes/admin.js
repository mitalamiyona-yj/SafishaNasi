// routes/admin.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats
// @access  Private/Admin
router.get('/stats', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const [totalCustomers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        const [totalCleaners] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "cleaner"');
        const [totalBookings] = await db.query('SELECT COUNT(*) as count FROM bookings');
        const [pendingCleaners] = await db.query('SELECT COUNT(*) as count FROM cleaners WHERE status = "pending"');
        
        // Get recent bookings
        const [recentBookings] = await db.query(
            `SELECT b.*, u.fullName as customerName, s.name as serviceName 
             FROM bookings b
             JOIN users u ON b.customerId = u.id
             JOIN services s ON b.serviceId = s.id
             ORDER BY b.createdAt DESC
             LIMIT 10`
        );

        res.json({
            totalUsers: totalUsers[0].count,
            totalCustomers: totalCustomers[0].count,
            totalCleaners: totalCleaners[0].count,
            totalBookings: totalBookings[0].count,
            pendingCleaners: pendingCleaners[0].count,
            recentBookings
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const [users] = await db.query(
            'SELECT id, fullName, email, phone, role, isActive, createdAt FROM users ORDER BY createdAt DESC'
        );
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;