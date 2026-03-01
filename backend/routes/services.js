// backend/routes/services.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/services
// @desc    Get all active services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const [services] = await db.query(
            'SELECT * FROM services WHERE isActive = true ORDER BY type, name'
        );
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/services/:id
// @desc    Get single service
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const [services] = await db.query(
            'SELECT * FROM services WHERE id = ?',
            [req.params.id]
        );
        
        if (services.length === 0) {
            return res.status(404).json({ msg: 'Service not found' });
        }
        
        res.json(services[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/services
// @desc    Create new service (Admin only)
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
    // Check if admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { name, type, description, basePrice, priceUnit, estimatedDuration } = req.body;

    // Validation
    if (!name || !type || !basePrice) {
        return res.status(400).json({ msg: 'Name, type, and price are required' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO services (name, type, description, basePrice, priceUnit, estimatedDuration, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, type, description, basePrice, priceUnit || 'per hour', estimatedDuration || null, req.user.id]
        );

        res.json({ 
            msg: 'Service created successfully',
            service: { id: result.insertId, name, type, basePrice }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/services/:id
// @desc    Update service (Admin only)
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { name, type, description, basePrice, priceUnit, estimatedDuration, isActive } = req.body;

    try {
        await db.query(
            'UPDATE services SET name = ?, type = ?, description = ?, basePrice = ?, priceUnit = ?, estimatedDuration = ?, isActive = ? WHERE id = ?',
            [name, type, description, basePrice, priceUnit, estimatedDuration, isActive, req.params.id]
        );

        res.json({ msg: 'Service updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/services/:id
// @desc    Delete service (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ msg: 'Service deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;