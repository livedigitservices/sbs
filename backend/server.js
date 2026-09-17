const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sbs-chi-ten.vercel.app',
    'https://sbs.ind.in',
    'https://www.sbs.ind.in',
  ],
  credentials: true,
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => res.json({ message: 'SBS API is running' }));

// Routes

app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/franchise-partners', require('./routes/franchisePartnerRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/associate', require('./routes/associateRoutes'));
app.use('/api/associate/leads', require('./routes/leadRoutes'));
app.use('/api/posters', require('./routes/posterRoutes'));
app.use('/api/tutors', require('./routes/tutorRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'SBS API running' }));

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File is too large. Max size is 95MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Something went wrong. Please try again.' });
  }
  next();
});

// Connect DB and start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });