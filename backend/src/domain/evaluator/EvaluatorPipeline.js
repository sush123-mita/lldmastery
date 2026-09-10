const deterministicEvaluator = require('./DeterministicEvaluator');
const rubricEvaluator = require('./RubricEvaluator');
const aiEvaluator = require('./AIEvaluator');
const feedbackAggregator = require('./FeedbackAggregator');

/**
 * EvaluatorPipeline
 * Implements the Pipeline & Strategy patterns to execute deterministic, rubric, and reasoning-based evaluations.
 * Supports graceful fallback if any stage takes time or throws an error.
 */
class EvaluatorPipeline {
  async process(submissionData, problem) {
    const startTime = Date.now();
    let evaluationSource = 'HYBRID_AI';

    try {
      // Step 1: Deterministic Static / AST Analysis
      const deterministicResult = deterministicEvaluator.evaluate({
        code: submissionData.code,
        language: submissionData.language,
        problem,
        diagram: submissionData.diagram,
        designRationale: submissionData.designRationale
      });

      // Step 2: Rubric & SOLID Principle Scoring
      const rubricResult = rubricEvaluator.evaluate({
        code: submissionData.code,
        language: submissionData.language,
        problem,
        deterministicResult,
        designRationale: submissionData.designRationale
      });

      // Step 3: AI / Qualitative Reasoning (with heuristic fallback)
      let aiResult = null;
      try {
        aiResult = await aiEvaluator.evaluate({
          code: submissionData.code,
          language: submissionData.language,
          problem,
          deterministicResult,
          rubricResult,
          designRationale: submissionData.designRationale,
          diagram: submissionData.diagram
        });
      } catch (aiErr) {
        console.warn('AI evaluation phase encountered error, falling back to deterministic heuristics:', aiErr.message);
        evaluationSource = 'DETERMINISTIC_ENGINE';
        aiResult = aiEvaluator.generateSmartHeuristicFeedback({
          code: submissionData.code,
          language: submissionData.language,
          problem,
          deterministicResult,
          rubricResult,
          designRationale: submissionData.designRationale,
          diagram: submissionData.diagram
        });
      }

      const durationMs = Date.now() - startTime;

      // Step 4: Aggregate into final structured report
      const aggregatedFeedback = feedbackAggregator.aggregate({
        deterministicResult,
        rubricResult,
        aiResult,
        durationMs,
        evaluationSource
      });

      return {
        status: 'COMPLETED',
        ...aggregatedFeedback
      };
    } catch (err) {
      console.error('EvaluatorPipeline fatal error:', err);
      return {
        status: 'FAILED',
        errorMessage: `Evaluation failed: ${err.message}. Please click Retry to re-evaluate.`,
        overallScore: 0,
        evaluationDurationMs: Date.now() - startTime
      };
    }
  }
}

module.exports = new EvaluatorPipeline();
