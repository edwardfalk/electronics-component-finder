import { Request, Response } from 'express';
import { searchComponents } from '../services/shopService';
import { getDatabase } from '../models/database';

/**
 * Search for components
 */
export async function searchComponentsHandler(req: Request, res: Response): Promise<void> {
  try {
    const { q, category, shop, inStock } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }
    
    // Convert query parameters to the right types
    const categoryStr = category && typeof category === 'string' ? category : undefined;
    const shopStr = shop && typeof shop === 'string' ? shop : undefined;
    const inStockBool = inStock === 'true';
    
    // Search for components
    const results = await searchComponents(q, categoryStr, shopStr, inStockBool);
    
    res.json({ results });
  } catch (error) {
    console.error('Error searching components:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get a specific component by ID
 */
export async function getComponentByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Component ID is required' });
      return;
    }
    
    const db = await getDatabase();
    
    // Get component details
    db.get('SELECT * FROM components WHERE id = ?', [id], (err, component: any) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      if (!component) {
        res.status(404).json({ error: 'Component not found' });
        return;
      }
      
      // Get listings for this component
      db.all(
        `SELECT l.*, s.name as shop_name 
         FROM listings l 
         JOIN shops s ON l.shop_id = s.id 
         WHERE l.component_id = ?`,
        [id],
        (err, listings) => {
          if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
            return;
          }
          
          // Format listings
          const shops = listings.map((listing: any) => ({
            name: listing.shop_name,
            price: listing.price,
            currency: listing.currency,
            stockQuantity: listing.stock_quantity,
            inStock: Boolean(listing.in_stock),
            url: listing.url,
            lastChecked: listing.last_checked
          }));
          
          // Get datasheets for this component
          db.all(
            'SELECT * FROM datasheets WHERE component_id = ?',
            [id],
            (err, datasheets) => {
              if (err) {
                console.error('Database error:', err);
                res.status(500).json({ error: 'Database error' });
                return;
              }
              
              res.json({
                ...component,
                shops,
                datasheets
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Error getting component:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Find alternative components
 */
export async function findAlternativesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ error: 'Component ID is required' });
      return;
    }
    
    const db = await getDatabase();
    
    // Get component details
    db.get('SELECT * FROM components WHERE id = ?', [id], (err, component: any) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error' });
        return;
      }
      
      if (!component) {
        res.status(404).json({ error: 'Component not found' });
        return;
      }
      
      // In a real implementation, we would search for alternatives based on the component's specifications
      // For now, we'll just return a mock response
      
      res.json({
        component,
        alternatives: [
          {
            id: 999,
            name: `Alternative to ${component.name}`,
            description: `Similar to ${component.name} but with different specifications`,
            manufacturer: 'Another Manufacturer',
            category: component.category,
            compatibilityRating: 85,
            differences: 'Slightly different pinout, higher voltage rating'
          }
        ],
        aiLink: `https://claude.ai/chat?prompt=What%20are%20good%20alternatives%20to%20${encodeURIComponent(component.name)}%20with%20similar%20specifications%3F`
      });
    });
  } catch (error) {
    console.error('Error finding alternatives:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
