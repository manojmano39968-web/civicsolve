import { Router } from 'express';
import { SearchController } from '../controllers/search.controller.js';

const router = Router();

// Understand natural language query
router.get('/understand', SearchController.understand);

// Ranked search & matching
router.post('/providers', SearchController.searchProviders);

// Post unmet requirement (when 0 providers found)
router.post('/requirements', SearchController.postRequirement);

export default router;
