// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { fullName, email, password, phone, role } = req.body;

    // Simple validation
    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ msg: 'Please fill all required fields' });
    }

    try {
        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (fullName, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [fullName, email, hashedPassword, phone || null, role]
        );

        // If user is a cleaner, create entry in cleaners table
        if (role === 'cleaner') {
            await db.query(
                'INSERT INTO cleaners (id, status) VALUES (?, ?)',
                [result.insertId, 'pending']
            );
        }

        // Create JWT
        const payload = {
            user: {
                id: result.insertId,
                role: role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { id: result.insertId, fullName, email, role } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
        return res.status(400).json({ msg: 'Please enter email and password' });
    }

    try {
        // Check if user exists
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({ msg: 'Account is deactivated' });
        }

        // Create JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token, 
                    user: { 
                        id: user.id, 
                        fullName: user.fullName, 
                        email: user.email, 
                        role: user.role,
                        phone: user.phone
                    } 
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, fullName, email, phone, role, createdAt FROM users WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(users[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;