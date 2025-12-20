const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 1. Load Environment Variables
require('dotenv').config({ path: './config.env' });

const app = express();

// 2. Global Error Handlers (Prevention for crashes)
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ----------------- MIDDLEWARE -----------------

// Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS Configuration
const allowedOrigins = ["http://localhost:3000", "https://we3vision.com"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("❌ Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));

// Rate Limiting (100 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: 'error', message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----------------- ROUTES -----------------

// Base Root Route
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: "We3Vision API is Online (Supabase Mode)",
    version: "1.0.0" 
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth')); // Converted to Supabase
app.use('/api/job', require('./routes/job'));   // Converted to Supabase

// Note: Ensure blog.js and user.js are converted to Supabase before uncommenting
// app.use('/api/blog', require('./routes/blog'));
// app.use('/api/user', require('./routes/user'));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "success", timestamp: new Date() });
});

// ----------------- ERROR HANDLING -----------------

// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ 404 Error: ${req.originalUrl} not found`);
  res.status(404).json({ 
    status: "error", 
    message: "Route not found",
    triedPath: req.originalUrl 
  });
});

// Global Error Middleware
app.use((err, req, res, next) => {
  console.error('❌ Internal Server Error:', err.message);
  res.status(500).json({ status: 'error', message: 'Something went wrong on the server!' });
});

// ----------------- STARTUP -----------------

const PORT = process.env.PORT || 5000;

// Directly starting the server (Mongoose logic removed)
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`✅ Supabase Integration Active`);
});