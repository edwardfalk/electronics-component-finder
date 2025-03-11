import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import componentsRouter from './routes/components';
import partsListsRouter from './routes/partsLists';
import datasheetRouter from './routes/datasheets';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/components', componentsRouter);
app.use('/api/parts-lists', partsListsRouter);
app.use('/api/datasheets', datasheetRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 