const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const evaluatorPipeline = require('../domain/evaluator/EvaluatorPipeline');

exports.createSubmission = async (req, res) => {
  try {
    const { problemId, language = 'java', code, diagram = '', designRationale = '', userId = 'learner-demo-user' } = req.body;

    if (!problemId || !code || code.trim().length === 0) {
      return res.status(400).json({ error: 'Problem ID and code are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Determine attempt number
    const previousAttemptsCount = await Submission.countDocuments({ problemId, userId });
    const attemptNumber = previousAttemptsCount + 1;

    // Create queued submission
    const submission = new Submission({
      problemId,
      userId,
      attemptNumber,
      language,
      code,
      diagram,
      designRationale,
      status: 'QUEUED'
    });

    await submission.save();

    // Trigger evaluation asynchronously
    processEvaluationAsync(submission._id, {
      code,
      language,
      diagram,
      designRationale
    }, problem);

    res.status(202).json({
      message: 'Submission queued for evaluation',
      submissionId: submission._id,
      attemptNumber,
      status: 'QUEUED'
    });
  } catch (err) {
    console.error('Error creating submission:', err);
    res.status(500).json({ error: 'Failed to create submission' });
  }
};

async function processEvaluationAsync(submissionId, submissionData, problem) {
  try {
    // Update status to EVALUATING
    await Submission.findByIdAndUpdate(submissionId, { status: 'EVALUATING' });

    // Optional slight artificial delay for smooth UX transition if synchronous was under 200ms
    const evalResult = await evaluatorPipeline.process(submissionData, problem);

    // Save final results
    await Submission.findByIdAndUpdate(submissionId, {
      status: evalResult.status,
      overallScore: evalResult.overallScore,
      rubricBreakdown: evalResult.rubricBreakdown,
      identifiedEntities: evalResult.identifiedEntities,
      detectedPatterns: evalResult.detectedPatterns,
      antiPatterns: evalResult.antiPatterns,
      refactoringSuggestions: evalResult.refactoringSuggestions,
      evaluationSource: evalResult.evaluationSource,
      evaluationDurationMs: evalResult.evaluationDurationMs,
      summary: evalResult.summary || '',
      tradeOffAnalysis: evalResult.tradeOffAnalysis || '',
      nextMilestoneAdvice: evalResult.nextMilestoneAdvice || '',
      errorMessage: evalResult.errorMessage
    });
  } catch (err) {
    console.error(`Async evaluation failed for submission ${submissionId}:`, err);
    await Submission.findByIdAndUpdate(submissionId, {
      status: 'FAILED',
      errorMessage: err.message
    });
  }
}

exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id).populate('problemId', 'title slug difficulty');

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Error fetching submission:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

exports.getProblemHistory = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { userId = 'learner-demo-user' } = req.query;

    const submissions = await Submission.find({ problemId, userId })
      .sort({ attemptNumber: 1 })
      .select('attemptNumber language overallScore status evaluationSource evaluationDurationMs createdAt rubricBreakdown detectedPatterns antiPatterns');

    // Calculate score deltas across attempts
    const historyWithDeltas = submissions.map((sub, idx) => {
      const prevSub = idx > 0 ? submissions[idx - 1] : null;
      const scoreDelta = prevSub ? (sub.overallScore - prevSub.overallScore) : 0;
      return {
        ...sub.toObject(),
        scoreDelta
      };
    });

    res.json(historyWithDeltas);
  } catch (err) {
    console.error('Error fetching submission history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

exports.retrySubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Associated problem not found' });
    }

    submission.status = 'QUEUED';
    submission.errorMessage = null;
    await submission.save();

    processEvaluationAsync(submission._id, {
      code: submission.code,
      language: submission.language,
      diagram: submission.diagram,
      designRationale: submission.designRationale
    }, problem);

    res.json({ message: 'Evaluation restarted', submissionId: submission._id, status: 'QUEUED' });
  } catch (err) {
    console.error('Error retrying submission:', err);
    res.status(500).json({ error: 'Failed to retry submission' });
  }
};
