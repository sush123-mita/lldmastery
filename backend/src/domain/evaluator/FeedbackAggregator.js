/**
 * FeedbackAggregator
 * Synthesizes deterministic findings, rubric scores, and AI recommendations into a unified, actionable evaluation response.
 */
class FeedbackAggregator {
  aggregate({ deterministicResult, rubricResult, aiResult, durationMs, evaluationSource }) {
    // Combine anti-patterns from deterministic checks and any AI notes
    const combinedAntiPatterns = [...(deterministicResult.antiPatterns || [])];

    // Combine refactoring suggestions
    const refactoringSuggestions = aiResult?.refactoringSuggestions || [];

    return {
      overallScore: rubricResult.overallScore,
      rubricBreakdown: rubricResult.rubrics,
      identifiedEntities: deterministicResult.identifiedEntities,
      detectedPatterns: deterministicResult.detectedPatterns,
      antiPatterns: combinedAntiPatterns,
      refactoringSuggestions,
      summary: aiResult?.summary || 'Evaluation completed successfully.',
      tradeOffAnalysis: aiResult?.tradeOffAnalysis || 'Evaluate domain trade-offs carefully.',
      nextMilestoneAdvice: aiResult?.nextMilestoneAdvice || 'Iterate on abstractions for attempt #2.',
      metrics: deterministicResult.metrics,
      diagramAnalysis: deterministicResult.diagramAnalysis,
      evaluationSource,
      evaluationDurationMs: durationMs
    };
  }
}

module.exports = new FeedbackAggregator();
