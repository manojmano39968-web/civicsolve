const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const challengesController = require('../controllers/challengesController');
const teamsController = require('../controllers/teamsController');
const tasksController = require('../controllers/tasksController');
const progressController = require('../controllers/progressController');
const impactController = require('../controllers/impactController');
const dashboardController = require('../controllers/dashboardController');
const demoController = require('../controllers/demoController');
const usersController = require('../controllers/usersController');

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'civicsolve-backend', timestamp: new Date() });
});

// Authentication / Demo Login
router.post('/auth/demo-login', authController.demoLogin);
router.get('/auth/me', authController.getCurrentUser);

// Challenges
router.get('/challenges', challengesController.getChallenges);
router.post('/challenges', challengesController.createChallenge);
router.get('/challenges/:id', challengesController.getChallengeById);
router.post('/challenges/:id/analyze', challengesController.analyzeChallenge);
router.get('/challenges/:id/matches', challengesController.getChallengeMatches);

// Teams
router.post('/teams', teamsController.createTeam);
router.get('/teams/:id', teamsController.getTeamById);
router.post('/teams/:id/members', teamsController.addTeamMember);
router.get('/teams/:id/tasks', tasksController.getTasksByTeam);
router.post('/teams/:id/tasks', tasksController.createTask);
router.post('/teams/:id/comments', teamsController.addComment);

// Tasks
router.patch('/tasks/:id', tasksController.patchTask);

// Progress Lifecycle
router.get('/challenges/:id/progress', progressController.getProgress);
router.post('/challenges/:id/progress', progressController.createProgressUpdate);

// Impact Dashboard (Demo / Pilot Data)
router.get('/challenges/:id/impact', impactController.getImpact);
router.post('/challenges/:id/impact', impactController.saveImpactMetric);

// User profiles & Reverse matching
router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUserProfile);
router.get('/users/:id/recommendations', usersController.getUserRecommendations);

// Dashboard KPI Summary
router.get('/dashboard/summary', dashboardController.getSummary);

// Demo State Reset
router.post('/demo/reset', demoController.resetDemo);

module.exports = router;
