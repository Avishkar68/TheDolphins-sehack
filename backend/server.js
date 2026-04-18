require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Routes
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Fraud Detection Backend is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum limit is 10MB.'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
