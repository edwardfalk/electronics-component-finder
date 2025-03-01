import express from 'express';
import { 
  searchComponentsHandler, 
  getComponentByIdHandler,
  findAlternativesHandler
} from '../controllers/componentController';

const router = express.Router();

/**
 * GET /api/components
 * Search for components
 */
router.get('/', searchComponentsHandler);

/**
 * GET /api/components/:id
 * Get a specific component by ID
 */
router.get('/:id', getComponentByIdHandler);

/**
 * GET /api/components/:id/alternatives
 * Find alternative components
 */
router.get('/:id/alternatives', findAlternativesHandler);

export default router;
