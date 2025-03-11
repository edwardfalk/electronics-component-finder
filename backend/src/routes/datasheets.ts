import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../config/database';

const router = express.Router();

interface DatasheetBody {
  componentId: string;
  url: string;
  filename: string;
}

interface ComponentIdParams {
  componentId: string;
}

interface IdParams {
  id: string;
}

// Get datasheets for a component
const getComponentDatasheets: RequestHandler<ComponentIdParams> = async (req, res, next) => {
  try {
    const { componentId } = req.params;
    const result = await pool.query(
      'SELECT * FROM datasheets WHERE component_id = $1',
      [componentId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Get a specific datasheet
const getDatasheet: RequestHandler<IdParams> = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM datasheets WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Datasheet not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Add datasheet for component
const addDatasheet: RequestHandler<{}, any, DatasheetBody> = async (req, res, next) => {
  try {
    const { componentId, url, filename } = req.body;
    const result = await pool.query(
      'INSERT INTO datasheets (component_id, url, filename) VALUES ($1, $2, $3) RETURNING *',
      [componentId, url, filename]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete datasheet
const deleteDatasheet: RequestHandler<IdParams> = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM datasheets WHERE id = $1', [id]);
    res.json({ message: 'Datasheet deleted' });
  } catch (error) {
    next(error);
  }
};

// Use the router.route() method for cleaner route definitions
router.route('/component/:componentId')
  .get(getComponentDatasheets);

router.route('/:id')
  .get(getDatasheet)
  .delete(deleteDatasheet);

router.route('/')
  .post(addDatasheet);

export default router; 