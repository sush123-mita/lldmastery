/**
 * AIEvaluator
 * Provides qualitative reasoning, trade-off analysis, and concrete Before/After refactoring recommendations.
 * Supports live Gemini LLM integration when API key is provided, with a rich fallback heuristics engine.
 */
class AIEvaluator {
  async evaluate({ code, language, problem, deterministicResult, rubricResult, designRationale = '', diagram = '' }) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const aiResponse = await this.callGeminiAPI(apiKey, {
          code,
          language,
          problem,
          deterministicResult,
          rubricResult,
          designRationale,
          diagram
        });
        if (aiResponse) return aiResponse;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to smart heuristic evaluator:', err.message);
      }
    }

    return this.generateSmartHeuristicFeedback({
      code,
      language,
      problem,
      deterministicResult,
      rubricResult,
      designRationale,
      diagram
    });
  }

  async callGeminiAPI(apiKey, context) {
    const prompt = `
You are a Principal Software Architect conducting an expert Low-Level Design (LLD) code review.
Problem: ${context.problem.title}
Problem Requirements: ${context.problem.functionalRequirements.join('; ')}
Learner Language: ${context.language}
Learner Code:
\`\`\`${context.language}
${context.code}
\`\`\`

Design Rationale provided by learner:
${context.designRationale || 'None provided'}

Mermaid Diagram provided:
${context.diagram || 'None provided'}

Deterministic Pre-analysis:
- Identified entities: ${context.deterministicResult.identifiedEntities.map(e => e.name).join(', ')}
- Detected patterns: ${context.deterministicResult.detectedPatterns.map(p => p.name).join(', ')}
- Anti-patterns detected: ${context.deterministicResult.antiPatterns.map(a => a.name).join(', ')}

Please evaluate this LLD attempt and return ONLY a JSON response matching this schema:
{
  "summary": "2-3 sentences overview of the design strengths and major areas of improvement",
  "strengths": ["string", "string"],
  "refactoringSuggestions": [
    {
      "title": "Clear refactoring title (e.g., Extract Spot Allocation Strategy)",
      "explanation": "Why this change makes the code more extensible or decoupled",
      "beforeCode": "relevant snippet from learner code or conceptual anti-pattern",
      "afterCode": "improved refactored snippet showing good OOP/LLD practice"
    }
  ],
  "tradeOffAnalysis": "Evaluation of trade-offs made in this design (e.g. memory vs latency, flexibility vs complexity)",
  "nextMilestoneAdvice": "Concrete next step for attempt #2"
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    return JSON.parse(text);
  }

  generateSmartHeuristicFeedback({ code, language, problem, deterministicResult, rubricResult, designRationale, diagram }) {
    const { antiPatterns, detectedPatterns, identifiedEntities } = deterministicResult;
    const refactoringSuggestions = [];

    // Problem-tailored refactoring suggestions
    if (problem.slug === 'parking-lot-system') {
      const hasStrategy = detectedPatterns.some(p => p.name.includes('Strategy'));
      if (!hasStrategy) {
        refactoringSuggestions.push({
          title: 'Extract Spot Allocation into Strategy Pattern',
          explanation: 'Hardcoding parking spot search inside the ParkingLot class violates the Open/Closed Principle. If business requires Nearest-to-Entrance, Lowest-Floor, or VIP-priority allocation tomorrow, ParkingLot must not be modified.',
          beforeCode: language === 'java' ? `public ParkingSpot findSpot(VehicleType type) {
    for (Floor f : floors) {
        for (ParkingSpot spot : f.getSpots()) {
            if (spot.isAvailable() && spot.getType() == type) {
                return spot;
            }
        }
    }
    return null;
}` : `def find_spot(self, vehicle_type):
    for floor in self.floors:
        for spot in floor.spots:
            if spot.is_available and spot.type == vehicle_type:
                return spot
    return None`,
          afterCode: language === 'java' ? `public interface ParkingStrategy {
    Optional<ParkingSpot> findSpot(List<Floor> floors, Vehicle vehicle);
}

public class NearestToEntranceStrategy implements ParkingStrategy {
    @Override
    public Optional<ParkingSpot> findSpot(List<Floor> floors, Vehicle vehicle) {
        // Look for spot closest to entry gate
        return floors.stream()
            .flatMap(f -> f.getSpots().stream())
            .filter(s -> s.canFit(vehicle) && s.isAvailable())
            .findFirst();
    }
}` : `class ParkingStrategy(ABC):
    @abstractmethod
    def find_spot(self, floors: List[Floor], vehicle: Vehicle) -> Optional[ParkingSpot]:
        pass

class NearestToEntranceStrategy(ParkingStrategy):
    def find_spot(self, floors: List[Floor], vehicle: Vehicle) -> Optional[ParkingSpot]:
        for floor in floors:
            for spot in floor.spots:
                if spot.can_fit(vehicle) and spot.is_available:
                    return spot
        return None`
        });
      }

      refactoringSuggestions.push({
        title: 'Decouple Fee Calculation with Strategy or Policy',
        explanation: 'Hourly billing, flat fee, or vehicle-type rate multipliers should be encapsulated in a FeeStrategy rather than hardcoded in Ticket or ExitGate.',
        beforeCode: `double fee = durationHours * 20.0; // hardcoded pricing`,
        afterCode: language === 'java' ? `public interface FeeStrategy {
    double calculateFee(Ticket ticket, LocalDateTime exitTime);
}

public class HourlyFeeStrategy implements FeeStrategy {
    private final double hourlyRate;
    public HourlyFeeStrategy(double rate) { this.hourlyRate = rate; }
    
    @Override
    public double calculateFee(Ticket ticket, LocalDateTime exitTime) {
        long hours = Duration.between(ticket.getEntryTime(), exitTime).toHours();
        return Math.max(1, hours) * hourlyRate;
    }
}` : `class FeeStrategy(ABC):
    @abstractmethod
    def calculate_fee(self, ticket: Ticket, exit_time: datetime) -> float:
        pass

class HourlyFeeStrategy(FeeStrategy):
    def __init__(self, hourly_rate: float = 20.0):
        self.hourly_rate = hourly_rate
        
    def calculate_fee(self, ticket: Ticket, exit_time: datetime) -> float:
        hours = max(1, (exit_time - ticket.entry_time).total_seconds() / 3600)
        return hours * self.hourly_rate`
      });
    } else if (problem.slug === 'elevator-system') {
      refactoringSuggestions.push({
        title: 'Use State Pattern for Elevator Dynamics',
        explanation: 'Representing elevator movements via simple integers or strings leads to scattered if-else guards. The State Pattern cleanly models state transitions: IDLE, MOVING_UP, MOVING_DOWN, MAINTENANCE.',
        beforeCode: `if (direction == 1 && currentFloor < targetFloor) {
    currentFloor++;
} else if (direction == -1 && currentFloor > targetFloor) {
    currentFloor--;
}`,
        afterCode: language === 'java' ? `public interface ElevatorState {
    void move(Elevator elevator);
    void handleRequest(Elevator elevator, Request request);
}

public class MovingUpState implements ElevatorState {
    @Override
    public void move(Elevator elevator) {
        elevator.setCurrentFloor(elevator.getCurrentFloor() + 1);
        if (elevator.hasReachedDestination()) {
            elevator.changeState(new IdleState());
        }
    }
}` : `class ElevatorState(ABC):
    @abstractmethod
    def move(self, elevator: 'Elevator') -> None:
        pass

class MovingUpState(ElevatorState):
    def move(self, elevator: 'Elevator') -> None:
        elevator.current_floor += 1
        if elevator.has_reached_destination():
            elevator.change_state(IdleState())`
      });
    } else if (problem.slug === 'vending-machine') {
      refactoringSuggestions.push({
        title: 'State Pattern for Coin Insertion & Item Dispensation',
        explanation: 'A vending machine transitions between states: NoCoinState, HasCoinState, DispensingState, SoldOutState. State-specific operations avoid invalid action bugs (e.g. dispensing without balance).',
        beforeCode: `if (balance >= itemPrice && item.count > 0) {
    balance -= itemPrice;
    dispenseItem();
}`,
        afterCode: language === 'java' ? `public interface VendingMachineState {
    void insertCoin(VendingMachine vm, Coin coin);
    void selectItem(VendingMachine vm, String code);
    void dispense(VendingMachine vm);
    void refund(VendingMachine vm);
}` : `class VendingMachineState(ABC):
    @abstractmethod
    def insert_coin(self, vm: 'VendingMachine', coin: Coin) -> None: pass
    @abstractmethod
    def select_item(self, vm: 'VendingMachine', code: str) -> None: pass
    @abstractmethod
    def dispense(self, vm: 'VendingMachine') -> None: pass`
      });
    } else {
      // General refactoring
      refactoringSuggestions.push({
        title: 'Apply Strategy Pattern for Core Domain Variations',
        explanation: 'Isolate volatile business policies behind clear strategy interfaces to protect core orchestrators from ripple modifications.',
        beforeCode: '// Switch cases or conditional branches on execution policy',
        afterCode: '// Pluggable strategy interfaces with dedicated implementation classes'
      });
    }

    const tradeOffAnalysis = designRationale && designRationale.trim().length > 20
      ? `You noted: "${designRationale.slice(0, 120)}...". This shows deliberate thinking about trade-offs. Balance runtime flexibility against over-engineering.`
      : 'No explicit trade-off rationale was recorded. Consider documenting why you favored composition over inheritance or synchronous vs asynchronous dispatch.';

    return {
      summary: `Design demonstrates good core structure with ${identifiedEntities.length} identified domain entities. Overall SOLID score is ${rubricResult.rubrics.find(r => r.name.includes('SOLID'))?.score || 70}%. Further refinement in strategy isolation and edge-case encapsulation will elevate this to production grade.`,
      strengths: [
        'Clear separation of basic domain entities',
        detectedPatterns.length > 0 ? `Applied ${detectedPatterns.map(p => p.name).join(', ')} effectively` : 'Logical entity naming and domain terminology',
        'Covers the primary use case workflow'
      ],
      refactoringSuggestions,
      tradeOffAnalysis,
      nextMilestoneAdvice: 'Focus on abstracting policy algorithms (Strategy Pattern) and adding synchronization primitives for thread-safe state mutations.'
    };
  }
}

module.exports = new AIEvaluator();
