import { Router } from 'express';
import { RequestController } from '../controllers/request.controller.js';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// All request operations require an authenticated user
router.use(requireAuth);

// Base CRUD & List
router.post('/', RequestController.create);
router.get('/', RequestController.list);
router.get('/:id', RequestController.getById);

// State Machine Transitions
router.patch('/:id/accept', RequestController.accept);
router.patch('/:id/reject', RequestController.reject);
router.patch('/:id/start', RequestController.start);
router.patch('/:id/complete', RequestController.complete);
router.patch('/:id/cancel', RequestController.cancel);
router.patch('/:id/dispute', RequestController.dispute);

// Verified Reviews (Milestone 8)
router.post('/:id/reviews', ReviewController.create);

export default router;
