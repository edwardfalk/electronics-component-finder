import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../config/database';

const router = express.Router();

interface QueryParams {
  searchTerm?: string;
  category?: string;
  shop?: string;
  inStock?: string;
}

// Get components with search and filters
const searchComponents: RequestHandler = async (req, res, next) => {
  try {
    const { searchTerm, category, shop, inStock } = req.query as QueryParams;
    
    let query = `
      SELECT * FROM components 
      WHERE ($1::text IS NULL OR 
            name ILIKE '%' || $1::text || '%' OR 
            description ILIKE '%' || $1::text || '%')
    `;
    
    const params: any[] = [searchTerm || null];
    let paramCount = 1;

    if (category && category !== 'all') {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (shop && shop !== 'all') {
      paramCount++;
      query += ` AND shop = $${paramCount}`;
      params.push(shop);
    }

    if (inStock && inStock !== 'all') {
      paramCount++;
      query += ` AND in_stock = $${paramCount}`;
      params.push(inStock === 'true');
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

// Get component categories
const getCategories: RequestHandler = async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM components ORDER BY category');
    res.json(result.rows.map(row => row.category));
  } catch (error) {
    next(error);
  }
};

// Get component shops
const getShops: RequestHandler = async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT DISTINCT shop FROM components ORDER BY shop');
    res.json(result.rows.map(row => row.shop));
  } catch (error) {
    next(error);
  }
};

// Get single component
const getComponent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM components WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Component not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

router.get('/', searchComponents);
router.get('/categories', getCategories);
router.get('/shops', getShops);
router.get('/:id', getComponent);

export default router; 