// ============================================
// ENGCE301 Week 6 Workshop - Express Server
// ============================================

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ===== IMPORT ROUTES =====
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// ===== ROOT ENDPOINT =====
app.get('/', (req, res) => {
    res.json({
        message: 'Week 6 Workshop - Express API',
        endpoints: {
            products: '/api/products'
        }
    });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found'
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('='.repeat(50));
});