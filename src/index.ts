import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createDatabaseTables } from './models/database';
import componentsRoutes from './routes/components';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize database
createDatabaseTables().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    version: process.env.npm_package_version || '0.1.0'
  });
});

// API Routes
app.use('/api/components', componentsRoutes);

// Serve the main HTML page for all other routes (SPA style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
