import { Router } from 'express';
import { ProviderController } from '../controllers/provider.controller.js';
import { ReviewController } from '../controllers/review.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public provider profile (privacy shielded) & reviews
router.get('/:id', ProviderController.getPublicProfile);
router.get('/:id/reviews', ReviewController.getProviderReviews);

// Authenticated provider routes
router.post('/onboard', requireAuth, requireRole('PROVIDER'), ProviderController.onboard);
router.get('/me/profile', requireAuth, requireRole('PROVIDER'), ProviderController.getMyProfile);
router.put('/me/availability', requireAuth, requireRole('PROVIDER'), ProviderController.updateAvailability);

export default router;
