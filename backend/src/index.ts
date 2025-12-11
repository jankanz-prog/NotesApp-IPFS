import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes'
import noteRoutes from './routes/notes.routes'
import folderRoutes from './routes/folders.routes'
import transactionRoutes from './routes/transactions.routes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Debug endpoint to check environment
app.get('/api/debug', (req, res) => {
  res.json({ 
    status: 'ok',
    jwtSecret: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    port: process.env.PORT || 4000,
  });
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});