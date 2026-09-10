const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const submissionController = require('../controllers/submissionController');

// Problems
router.get('/problems', problemController.getAllProblems);
router.get('/problems/:slug', problemController.getProblemBySlug);

// Submissions
router.post('/submissions', submissionController.createSubmission);
router.get('/submissions/:id', submissionController.getSubmissionById);
router.post('/submissions/:id/retry', submissionController.retrySubmission);

// History & Progress
router.get('/problems/:problemId/history', submissionController.getProblemHistory);

module.exports = router;
