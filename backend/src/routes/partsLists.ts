import express, { Request, Response } from 'express';
import pool from '../config/database';
import { PartsList } from '../types';

const router = express.Router();

// Get all parts lists
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT pl.*, 
             json_agg(json_build_object(
               'componentId', plc.component_id,
               'quantity', plc.quantity
             )) as components
      FROM parts_lists pl
      LEFT JOIN parts_list_components plc ON pl.id = plc.list_id
      GROUP BY pl.id
      ORDER BY pl.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching parts lists:', error);
    res.status(500).json({ error: 'Failed to fetch parts lists' });
  }
});

// Create new parts list
router.post('/', async (req: Request, res: Response) => {
  const { name, description } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO parts_lists (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating parts list:', error);
    res.status(500).json({ error: 'Failed to create parts list' });
  }
});

// Add component to parts list
router.post('/:listId/components/:componentId', async (req: Request, res: Response) => {
  const { listId, componentId } = req.params;
  const { quantity } = req.body;

  try {
    await pool.query(
      'INSERT INTO parts_list_components (list_id, component_id, quantity) VALUES ($1, $2, $3)',
      [listId, componentId, quantity]
    );
    res.status(201).json({ message: 'Component added to list' });
  } catch (error) {
    console.error('Error adding component to list:', error);
    res.status(500).json({ error: 'Failed to add component to list' });
  }
});

// Remove component from parts list
router.delete('/:listId/components/:componentId', async (req: Request, res: Response) => {
  const { listId, componentId } = req.params;

  try {
    await pool.query(
      'DELETE FROM parts_list_components WHERE list_id = $1 AND component_id = $2',
      [listId, componentId]
    );
    res.json({ message: 'Component removed from list' });
  } catch (error) {
    console.error('Error removing component from list:', error);
    res.status(500).json({ error: 'Failed to remove component from list' });
  }
});

// Delete parts list
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM parts_list_components WHERE list_id = $1', [id]);
    await pool.query('DELETE FROM parts_lists WHERE id = $1', [id]);
    res.json({ message: 'Parts list deleted' });
  } catch (error) {
    console.error('Error deleting parts list:', error);
    res.status(500).json({ error: 'Failed to delete parts list' });
  }
});

export default router; 