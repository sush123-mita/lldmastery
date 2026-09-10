/**
 * RubricEvaluator
 * Evaluates the learner's design along 5 core dimensions with weighted rubric scoring.
 */
class RubricEvaluator {
  evaluate({ code, language, problem, deterministicResult, designRationale = '' }) {
    const { coverageScore, detectedPatterns, antiPatterns, metrics } = deterministicResult;

    // Dimension 1: Class Responsibility & Abstraction (Weight: 20%)
    const responsibilityScore = this.evaluateResponsibility(metrics, antiPatterns, coverageScore);

    // Dimension 2: SOLID Principles Compliance (Weight: 25%)
    const solidScore = this.evaluateSOLID(code, deterministicResult, metrics);

    // Dimension 3: Design Pattern Suitability & Composition (Weight: 20%)
    const patternScore = this.evaluatePatterns(detectedPatterns, problem.suggestedPatterns || []);

    // Dimension 4: Extensibility & Modularity (Weight: 20%)
    const extensibilityScore = this.evaluateExtensibility(code, metrics, detectedPatterns);

    // Dimension 5: Concurrency, Error Handling & Invariants (Weight: 15%)
    const concurrencyScore = this.evaluateConcurrencyAndEdgeCases(code, language, problem);

    const rubrics = [
      {
        name: 'Class Responsibility & Abstraction',
        weight: 0.20,
        score: responsibilityScore.score,
        feedback: responsibilityScore.feedback,
        strengths: responsibilityScore.strengths,
        improvements: responsibilityScore.improvements
      },
      {
        name: 'SOLID Principles Compliance',
        weight: 0.25,
        score: solidScore.score,
        feedback: solidScore.feedback,
        strengths: solidScore.strengths,
        improvements: solidScore.improvements
      },
      {
        name: 'Design Pattern Application',
        weight: 0.20,
        score: patternScore.score,
        feedback: patternScore.feedback,
        strengths: patternScore.strengths,
        improvements: patternScore.improvements
      },
      {
        name: 'Extensibility & Modularity',
        weight: 0.20,
        score: extensibilityScore.score,
        feedback: extensibilityScore.feedback,
        strengths: extensibilityScore.strengths,
        improvements: extensibilityScore.improvements
      },
      {
        name: 'Concurrency & Edge-Case Resilience',
        weight: 0.15,
        score: concurrencyScore.score,
        feedback: concurrencyScore.feedback,
        strengths: concurrencyScore.strengths,
        improvements: concurrencyScore.improvements
      }
    ];

    const overallScore = Math.round(
      rubrics.reduce((acc, r) => acc + r.score * r.weight, 0)
    );

    return {
      overallScore,
      rubrics
    };
  }

  evaluateResponsibility(metrics, antiPatterns, coverageScore) {
    let score = 50;
    const strengths = [];
    const improvements = [];

    // Entity coverage bonus
    score += (coverageScore * 0.35);

    // Penalize if God Object anti-pattern exists
    const hasGodObject = antiPatterns.some(a => a.name.includes('God Object'));
    if (hasGodObject) {
      score -= 25;
      improvements.push('Decompose the primary manager class to separate ticket generation, spot allocation, and payment calculations.');
    } else if (metrics.classCount >= 3) {
      strengths.push(`Good domain decomposition across ${metrics.classCount} distinct classes.`);
      score += 10;
    }

    if (coverageScore >= 80) {
      strengths.push('Covers essential domain abstractions required for the problem specification.');
    } else {
      improvements.push('Consider defining separate models for intermediate domain concepts (e.g. Ticket, Spot, AllocationPolicy).');
    }

    score = Math.min(100, Math.max(20, Math.round(score)));

    return {
      score,
      feedback: score >= 80 
        ? 'High cohesion: classes have well-defined, single responsibilities without bloat.'
        : 'Moderate cohesion: some classes are handling multiple orthogonal responsibilities.',
      strengths,
      improvements
    };
  }

  evaluateSOLID(code, deterministicResult, metrics) {
    let score = 55;
    const strengths = [];
    const improvements = [];

    const hasInterface = metrics.interfaceCount > 0;
    if (hasInterface) {
      score += 15;
      strengths.push('Dependency Inversion (DIP): High-level modules depend on abstractions/interfaces.');
    } else {
      improvements.push('Introduce interfaces for pluggable algorithms to fulfill the Dependency Inversion Principle.');
      score -= 10;
    }

    const hasStrategyOrPolymorphism = deterministicResult.detectedPatterns.some(p => p.name === 'Strategy Pattern');
    if (hasStrategyOrPolymorphism) {
      score += 20;
      strengths.push('Open/Closed Principle (OCP): New business rules can be added via new strategy classes without modifying core logic.');
    } else {
      improvements.push('Avoid switch/if-else ladders for business variations; use polymorphism to adhere to OCP.');
    }

    if (code.includes('abstract') || code.includes('interface') || code.includes('ABC')) {
      strengths.push('Clear segregation between contract definitions and concrete implementations.');
      score += 10;
    }

    score = Math.min(100, Math.max(25, Math.round(score)));

    return {
      score,
      feedback: score >= 80
        ? 'Strong SOLID compliance with decoupled abstractions and open-for-extension design.'
        : 'Room for improvement in Open/Closed and Dependency Inversion principles.',
      strengths,
      improvements
    };
  }

  evaluatePatterns(detectedPatterns, suggestedPatterns) {
    let score = 40;
    const strengths = [];
    const improvements = [];

    if (detectedPatterns.length > 0) {
      score += (detectedPatterns.length * 20);
      detectedPatterns.forEach(p => {
        strengths.push(`Appropriately applied ${p.name}: ${p.note}`);
      });
    }

    // Check if suggested patterns are covered
    const missingPatterns = suggestedPatterns.filter(sp => 
      !detectedPatterns.some(dp => dp.name.toLowerCase().includes(sp.name.toLowerCase()))
    );

    if (missingPatterns.length > 0) {
      missingPatterns.forEach(mp => {
        improvements.push(`Consider applying ${mp.name}: ${mp.reason}`);
      });
    } else if (suggestedPatterns.length > 0) {
      score += 15;
      strengths.push('Effectively leveraged key recommended design patterns for this problem type.');
    }

    score = Math.min(100, Math.max(30, Math.round(score)));

    return {
      score,
      feedback: detectedPatterns.length > 0
        ? `Applied ${detectedPatterns.map(p => p.name).join(', ')} cleanly.`
        : 'Minimal design pattern usage detected. Classic design patterns simplify future requirement changes.',
      strengths,
      improvements
    };
  }

  evaluateExtensibility(code, metrics, detectedPatterns) {
    let score = 50;
    const strengths = [];
    const improvements = [];

    if (metrics.interfaceCount >= 1 && metrics.classCount >= 4) {
      score += 25;
      strengths.push('High modularity: easy to introduce new vehicle types, strategies, or payment methods.');
    } else {
      improvements.push('Define pluggable interfaces so new features can be introduced with minimal code perturbation.');
    }

    if (code.includes('enum') || code.includes('Enum')) {
      score += 10;
      strengths.push('Strong type safety for domain states and vehicle/device classifications.');
    }

    score = Math.min(100, Math.max(30, Math.round(score)));

    return {
      score,
      feedback: score >= 75
        ? 'Design is easily extensible to upcoming requirements without modifying existing classes.'
        : 'Coupling in core modules makes adding new features require modifying existing code.',
      strengths,
      improvements
    };
  }

  evaluateConcurrencyAndEdgeCases(code, language, problem) {
    let score = 50;
    const strengths = [];
    const improvements = [];

    const codeLower = code.toLowerCase();
    const hasSync = codeLower.includes('synchronized') || 
      codeLower.includes('lock') || 
      codeLower.includes('reentrantlock') ||
      codeLower.includes('concurrenthashmap') ||
      codeLower.includes('atomic') ||
      codeLower.includes('threading') ||
      codeLower.includes('mutex');

    const hasValidation = codeLower.includes('throw new') || 
      codeLower.includes('raise ') || 
      codeLower.includes('illegalargumentexception') ||
      codeLower.includes('null') || 
      codeLower.includes('if (!') || 
      codeLower.includes('optional');

    if (hasSync) {
      score += 25;
      strengths.push('Thread-safety considered: uses synchronization primitives / thread-safe data structures.');
    } else {
      improvements.push('Consider multi-threading race conditions when concurrent entities (e.g. multiple gates or elevator buttons) access shared state.');
    }

    if (hasValidation) {
      score += 15;
      strengths.push('Defensive validation and explicit error signaling for domain boundary violations.');
    } else {
      improvements.push('Add input validation and boundary condition handling (e.g. parking full, invalid coin, out of range floor).');
    }

    score = Math.min(100, Math.max(35, Math.round(score)));

    return {
      score,
      feedback: score >= 75
        ? 'Addresses concurrency safeguards and edge-case exceptions proactively.'
        : 'Review thread synchronization on shared mutable collections and add boundary validations.',
      strengths,
      improvements
    };
  }
}

module.exports = new RubricEvaluator();
