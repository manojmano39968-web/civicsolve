import { Router } from 'express';
import { TaxonomyController } from '../controllers/taxonomy.controller.js';

const router = Router();

// GET /api/v1/taxonomy/categories
router.get('/categories', TaxonomyController.getCategories);

// GET /api/v1/taxonomy/categories/:slug/services
router.get('/categories/:slug/services', TaxonomyController.getCategoryServices);

// GET /api/v1/taxonomy/services
router.get('/services', TaxonomyController.getServices);

export default router;
