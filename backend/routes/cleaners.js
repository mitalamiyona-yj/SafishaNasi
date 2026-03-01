// routes/cleaners.js
const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// @route   POST /api/cleaners/upload
// @desc    Upload cleaner documents
// @access  Private (Cleaner only)
router.post('/upload', auth, upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
    if (req.user.role !== 'cleaner') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const cvUrl = req.files['cv'] ? `/uploads/${req.files['cv'][0].filename}` : null;
        const certificateUrl = req.files['certificate'] ? `/uploads/${req.files['certificate'][0].filename}` : null;

        await db.query(
            'UPDATE cleaners SET cvUrl = ?, certificateUrl = ? WHERE id = ?',
            [cvUrl, certificateUrl, req.user.id]
        );

        res.json({ 
            msg: 'Documents uploaded successfully',
            cvUrl,
            certificateUrl
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/cleaners/pending
// @desc    Get pending cleaners (Admin only)
// @access  Private/Admin
router.get('/pending', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    try {
        const [cleaners] = await db.query(
            `SELECT u.id, u.fullName, u.email, u.phone, c.* 
             FROM cleaners c
             JOIN users u ON c.id = u.id
             WHERE c.status = 'pending'`
        );
        res.json(cleaners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/cleaners/:id/verify
// @desc    Verify or reject cleaner (Admin only)
// @access  Private/Admin
router.put('/:id/verify', auth, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied' });
    }

    const { status } = req.body; // 'approved' or 'rejected'
    const cleanerId = req.params.id;

    try {
        await db.query(
            'UPDATE cleaners SET status = ?, verifiedBy = ?, verifiedAt = NOW() WHERE id = ?',
            [status, req.user.id, cleanerId]
        );

        res.json({ msg: `Cleaner ${status} successfully` });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;