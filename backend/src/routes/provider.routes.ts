import { Router } from 'express';
import { ProviderController } from '../controllers/provider.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public provider profile (privacy shielded)
router.get('/:id', ProviderController.getPublicProfile);

// Authenticated provider routes
router.post('/onboard', requireAuth, requireRole('PROVIDER'), ProviderController.onboard);
router.get('/me/profile', requireAuth, requireRole('PROVIDER'), ProviderController.getMyProfile);
router.put('/me/availability', requireAuth, requireRole('PROVIDER'), ProviderController.updateAvailability);

export default router;
