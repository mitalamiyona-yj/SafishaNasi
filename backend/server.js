// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection
const db = require('./db');
db.getConnection()
    .then(conn => {
        console.log('✅ MySQL database connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/cleaners', require('./routes/cleaners'));
app.use('/api/admin', require('./routes/admin'));

// Root route
app.get('/', (req, res) => {
    res.json({ 
        msg: 'Welcome to Safi Shanasi API',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            services: '/api/services',
            bookings: '/api/bookings',
            cleaners: '/api/cleaners',
            admin: '/api/admin'
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});