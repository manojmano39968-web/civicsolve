import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// All admin routes strictly require authentication and ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

// Platform Analytics & Metrics
router.get('/metrics', AdminController.getMetrics);

// Verification Queue Triage
router.get('/attestations', AdminController.getAttestations);
router.patch('/attestations/:id', AdminController.reviewAttestation);

// Transparent Matching Weights Configuration
router.get('/weights', AdminController.getWeights);
router.put('/weights', AdminController.updateWeights);
router.post('/weights/reset', AdminController.resetWeights);

// System Audit Logs
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
