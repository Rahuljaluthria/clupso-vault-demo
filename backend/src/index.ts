import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import vaultRoutes from './routes/vault';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '10000', 10);

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://clupso-frontend.onrender.com',
      'http://clupso-frontend.onrender.com',
      'http://localhost:8080', 
      'http://localhost:8081', 
      'http://localhost:8082', 
      'http://localhost:8083'
    ]
  : ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Log but allow the request (for debugging)
    console.log('CORS: Origin not in allowedOrigins:', origin);
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection check middleware (only for API routes)
const checkMongoConnection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ MongoDB not connected, request to:', req.path);
    res.status(503).json({ 
      error: 'Database unavailable', 
      message: 'MongoDB is not connected. Please check environment variables or try again later.' 
    });
    return;
  }
  next();
};

// Routes
app.use('/api/auth', checkMongoConnection, authRoutes);
app.use('/api/vault', checkMongoConnection, vaultRoutes);

// Simple test endpoint (no DB required)
app.get('/', (req, res) => {
  res.json({ 
    message: 'CLUPSO Backend is running!', 
    timestamp: new Date().toISOString(),
    version: '1.0.1'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const mongoStatus = mongoose.connection.readyState;
  const mongoStatusMap: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoStatusMap[mongoStatus] || 'unknown'
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;