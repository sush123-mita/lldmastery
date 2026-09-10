/**
 * DeterministicEvaluator
 * Performs deterministic AST-like and regex analysis on learner code:
 * 1. Entity Extraction (Classes, Interfaces, Enums, Abstract Classes, Methods)
 * 2. Coverage against expected domain entities
 * 3. Pattern detection (Strategy, Factory, State, Observer, Singleton)
 * 4. Deterministic Anti-Pattern flags (God Class, Deep Nesting, Hardcoded Switch/If-Else, Public Mutable State)
 */
class DeterministicEvaluator {
  /**
   * Evaluates code and diagram deterministically
   * @param {Object} params - { code, language, problem, diagram, designRationale }
   * @returns {Object} deterministic analysis result
   */
  evaluate({ code, language, problem, diagram = '', designRationale = '' }) {
    const identifiedEntities = this.extractEntities(code, language);
    const entityCoverage = this.checkEntityCoverage(identifiedEntities, problem.keyEntitiesExpected || []);
    const detectedPatterns = this.detectDesignPatterns(code, identifiedEntities, problem.suggestedPatterns || []);
    const antiPatterns = this.detectAntiPatterns(code, identifiedEntities);
    const diagramAnalysis = this.analyzeDiagram(diagram);

    return {
      identifiedEntities: entityCoverage.matchedEntities,
      missingEntities: entityCoverage.missingEntities,
      coverageScore: entityCoverage.coveragePercentage,
      detectedPatterns,
      antiPatterns,
      diagramAnalysis,
      metrics: {
        totalLines: code.split('\n').length,
        classCount: identifiedEntities.filter(e => e.type === 'CLASS' || e.type === 'ABSTRACT_CLASS').length,
        interfaceCount: identifiedEntities.filter(e => e.type === 'INTERFACE').length,
        enumCount: identifiedEntities.filter(e => e.type === 'ENUM').length
      }
    };
  }

  extractEntities(code, language) {
    const entities = [];
    const lines = code.split('\n');

    // Language-agnostic & specific regex patterns
    let classRegex, interfaceRegex, enumRegex, methodRegex;

    if (language === 'python') {
      classRegex = /class\s+([A-Za-z0-9_]+)(\s*\(([^)]*)\))?:/g;
      enumRegex = /class\s+([A-Za-z0-9_]+)\s*\(\s*(?:Enum|IntEnum|str,\s*Enum)\s*\):/g;
      methodRegex = /def\s+([A-Za-z0-9_]+)\s*\(/g;
    } else {
      // Java, TypeScript, C++
      classRegex = /(?:public\s+|abstract\s+|final\s+)*class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([^{]+))?/g;
      interfaceRegex = /(?:public\s+)*interface\s+([A-Za-z0-9_]+)(?:\s+extends\s+([^{]+))?/g;
      enumRegex = /(?:public\s+)*enum\s+([A-Za-z0-9_]+)/g;
      methodRegex = /(?:public|protected|private|def|function)?\s*(?:static\s+)?(?:[\w<>[\],]+\s+)+([A-Za-z0-9_]+)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*[{;]/g;
    }

    // Extract Interfaces
    if (interfaceRegex) {
      let match;
      while ((match = interfaceRegex.exec(code)) !== null) {
        entities.push({
          name: match[1],
          type: 'INTERFACE',
          methods: this.extractMethodsForBlock(code, match.index),
          fields: []
        });
      }
    }

    // Extract Enums
    if (enumRegex) {
      let match;
      while ((match = enumRegex.exec(code)) !== null) {
        entities.push({
          name: match[1],
          type: 'ENUM',
          methods: [],
          fields: []
        });
      }
    }

    // Extract Classes
    let classMatch;
    while ((classMatch = classRegex.exec(code)) !== null) {
      const className = classMatch[1];
      // Avoid duplicate if already marked as Enum in python
      if (entities.some(e => e.name === className)) continue;

      const isAbstract = classMatch[0].includes('abstract') || (language === 'python' && code.includes(`class ${className}(ABC)`));
      entities.push({
        name: className,
        type: isAbstract ? 'ABSTRACT_CLASS' : 'CLASS',
        methods: this.extractMethodsForBlock(code, classMatch.index),
        fields: []
      });
    }

    return entities;
  }

  extractMethodsForBlock(code, startIndex) {
    const methods = [];
    const snippet = code.slice(startIndex, startIndex + 600);
    const methodNames = snippet.match(/(?:public|protected|private|def)?\s*([a-zA-Z0-9_]+)\s*\(/g);
    if (methodNames) {
      methodNames.forEach(m => {
        const clean = m.replace(/(public|protected|private|def|\()|\s+/g, '');
        if (clean && !['if', 'for', 'while', 'switch', 'catch', 'constructor', 'class'].includes(clean)) {
          if (!methods.includes(clean)) methods.push(clean);
        }
      });
    }
    return methods.slice(0, 6);
  }

  checkEntityCoverage(identifiedEntities, keyEntitiesExpected) {
    const identifiedNames = identifiedEntities.map(e => e.name.toLowerCase());
    const matched = [];
    const missing = [];

    for (const exp of keyEntitiesExpected) {
      const expLower = exp.name.toLowerCase();
      // Match exact or substring (e.g. ParkingSpot vs Spot or NearestAllocationStrategy vs AllocationStrategy)
      const found = identifiedEntities.find(e => 
        e.name.toLowerCase() === expLower || 
        e.name.toLowerCase().includes(expLower) ||
        expLower.includes(e.name.toLowerCase())
      );

      if (found) {
        matched.push({
          name: exp.name,
          role: exp.role || 'Domain Entity',
          type: found.type,
          status: 'FOUND',
          methods: found.methods || []
        });
      } else {
        missing.push(exp);
        matched.push({
          name: exp.name,
          role: exp.role || 'Domain Entity',
          type: 'CLASS',
          status: 'MISSING',
          methods: []
        });
      }
    }

    // Also include other classes created by user that weren't in keyEntitiesExpected
    identifiedEntities.forEach(e => {
      if (!matched.some(m => m.name.toLowerCase() === e.name.toLowerCase())) {
        matched.push({
          name: e.name,
          role: 'Custom Domain Component',
          type: e.type,
          status: 'FOUND',
          methods: e.methods || []
        });
      }
    });

    const expectedCount = keyEntitiesExpected.length || 1;
    const foundExpectedCount = keyEntitiesExpected.filter(exp => 
      identifiedNames.some(name => name === exp.name.toLowerCase() || name.includes(exp.name.toLowerCase()) || exp.name.toLowerCase().includes(name))
    ).length;

    const coveragePercentage = Math.min(100, Math.round((foundExpectedCount / expectedCount) * 100));

    return {
      matchedEntities: matched,
      missingEntities: missing,
      coveragePercentage
    };
  }

  detectDesignPatterns(code, entities, suggestedPatterns) {
    const detected = [];
    const codeLower = code.toLowerCase();

    // 1. Strategy Pattern Check
    const hasStrategyKeywords = codeLower.includes('strategy') || 
      entities.some(e => e.type === 'INTERFACE' && (e.name.toLowerCase().includes('strategy') || e.name.toLowerCase().includes('policy') || e.name.toLowerCase().includes('algorithm')));
    const hasStrategyImplementations = entities.filter(e => 
      e.name.toLowerCase().includes('strategy') || 
      e.name.toLowerCase().includes('nearest') || 
      e.name.toLowerCase().includes('hourly') ||
      e.name.toLowerCase().includes('tokenbucket') ||
      e.name.toLowerCase().includes('equalsplit')
    ).length >= 2;

    if (hasStrategyKeywords || hasStrategyImplementations) {
      detected.push({
        name: 'Strategy Pattern',
        appliedProperly: true,
        note: 'Decouples algorithm behaviors (e.g. allocation/pricing/split) behind an interface, enabling runtime swapping and OCP compliance.'
      });
    }

    // 2. Factory Pattern Check
    const hasFactory = codeLower.includes('factory') || 
      codeLower.includes('createvehicle') || 
      codeLower.includes('createspot') ||
      codeLower.includes('getstrategy');
    if (hasFactory) {
      detected.push({
        name: 'Factory Pattern',
        appliedProperly: true,
        note: 'Encapsulates object instantiation logic away from client classes.'
      });
    }

    // 3. State Pattern Check
    const hasState = codeLower.includes('state') || 
      codeLower.includes('hasmoney') || 
      codeLower.includes('dispensing') ||
      entities.some(e => e.name.toLowerCase().includes('state'));
    if (hasState) {
      detected.push({
        name: 'State Pattern',
        appliedProperly: true,
        note: 'Encapsulates state-specific transitions and behavior in dedicated state objects.'
      });
    }

    // 4. Singleton Pattern Check
    const hasSingleton = codeLower.includes('getinstance') || 
      codeLower.includes('private static') || 
      codeLower.includes('__new__') ||
      codeLower.includes('_instance');
    if (hasSingleton) {
      detected.push({
        name: 'Singleton Pattern',
        appliedProperly: true,
        note: 'Guarantees a single centralized coordinator/manager instance across the application.'
      });
    }

    // 5. Observer Pattern Check
    const hasObserver = codeLower.includes('observer') || 
      codeLower.includes('listener') || 
      codeLower.includes('notify') || 
      codeLower.includes('subscribe');
    if (hasObserver) {
      detected.push({
        name: 'Observer Pattern',
        appliedProperly: true,
        note: 'Enables event-driven decoupled notifications (e.g. floor display listeners, sensor updates).'
      });
    }

    return detected;
  }

  detectAntiPatterns(code, entities) {
    const antiPatterns = [];

    // 1. God Object / Massive Coordinator
    const lines = code.split('\n');
    if (entities.length > 0 && entities.length <= 2 && lines.length > 80) {
      antiPatterns.push({
        name: 'God Object (Bloated Manager Class)',
        severity: 'HIGH',
        description: 'Your solution packs too many responsibilities (ticketing, parking spot allocation, billing, vehicle tracking) into 1 or 2 large classes.',
        locationSnippet: entities[0]?.name ? `Class: ${entities[0].name}` : 'Main controller',
        refactoringSuggestion: 'Decompose the manager by delegating spot search to an AllocationStrategy, payment to a PaymentProcessor, and ticket life-cycle to a TicketManager.'
      });
    }

    // 2. Hardcoded Conditionals instead of Polymorphism
    const ifElseCount = (code.match(/if\s*\(|elif\s+|switch\s*\(/g) || []).length;
    const vehicleTypeBranching = code.includes('vehicle.getType()') || code.includes('type ==') || code.includes("type === 'CAR'");
    if (ifElseCount >= 6 || (vehicleTypeBranching && !code.includes('interface') && !code.includes('Strategy'))) {
      antiPatterns.push({
        name: 'Conditional Complexity / Missing Polymorphism',
        severity: 'MEDIUM',
        description: 'Repeated if-else / switch branching on types (e.g., vehicle type or pricing rate) violates the Open/Closed Principle.',
        locationSnippet: 'Multiple if-else/switch statements',
        refactoringSuggestion: 'Replace conditional type checks with polymorphic strategies or enum-driven behavior.'
      });
    }

    // 3. Lack of Interfaces / Abstractions
    const interfaceCount = entities.filter(e => e.type === 'INTERFACE' || e.type === 'ABSTRACT_CLASS').length;
    if (entities.length >= 3 && interfaceCount === 0) {
      antiPatterns.push({
        name: 'Direct Concrete Coupling',
        severity: 'MEDIUM',
        description: 'All classes depend on concrete implementations rather than abstractions, violating Dependency Inversion (DIP).',
        locationSnippet: 'Class declarations without interfaces',
        refactoringSuggestion: 'Extract interfaces for core services and pluggable strategies to make components testable and swappable.'
      });
    }

    // 4. Public Mutable State
    const hasPublicFields = /public\s+(?:int|String|boolean|double|List|Map)\s+[a-zA-Z0-9_]+\s*;/g.test(code);
    if (hasPublicFields) {
      antiPatterns.push({
        name: 'Encapsulation Leak (Public Mutable Fields)',
        severity: 'LOW',
        description: 'Class attributes are exposed as public fields, allowing arbitrary external modification.',
        locationSnippet: 'Public field declarations',
        refactoringSuggestion: 'Make fields private or protected and provide explicit getter/mutation methods that enforce domain invariants.'
      });
    }

    return antiPatterns;
  }

  analyzeDiagram(diagram) {
    if (!diagram || diagram.trim().length < 10) {
      return {
        present: false,
        validMermaid: false,
        relationshipCount: 0,
        feedback: 'No Mermaid class diagram provided. Providing a diagram helps clarify class hierarchies and associations.'
      };
    }

    const hasClassDiagram = diagram.includes('classDiagram');
    const inheritanceCount = (diagram.match(/<\|--|--\|>/g) || []).length;
    const compositionCount = (diagram.match(/\*--|--\*/g) || []).length;
    const associationCount = (diagram.match(/-->|--/g) || []).length;

    return {
      present: true,
      validMermaid: hasClassDiagram,
      relationshipCount: inheritanceCount + compositionCount + associationCount,
      feedback: `Mermaid diagram detected with ${inheritanceCount} inheritance, ${compositionCount} composition, and ${associationCount} association links.`
    };
  }
}

module.exports = new DeterministicEvaluator();
