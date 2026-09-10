const seedProblems = [
  {
    slug: 'parking-lot-system',
    title: 'Design a Multi-Floor Parking Lot System',
    difficulty: 'Medium',
    category: 'Object Oriented Design',
    timeEstimateMinutes: 45,
    description: `Design a comprehensive low-level system for an automated multi-floor parking lot that can accommodate multiple vehicle types, allocate spots based on dynamic policies, issue tickets, calculate fees on exit, and notify status displays.`,
    functionalRequirements: [
      'The parking lot has multiple floors, and each floor has multiple parking spots.',
      'Supports multiple vehicle types: Motorcycle (Small), Car (Medium), Bus/Truck (Large).',
      'Spots are typed (Compact, Large, Handicapped, Electric, Motorcycle) and only fit compatible vehicles.',
      'System should allocate spots dynamically using pluggable strategies (e.g. Nearest to Entrance, Lowest Floor First).',
      'Issue a Ticket upon entry containing Entry Time, Spot ID, and Vehicle Info.',
      'Calculate parking fee on exit based on duration and vehicle type using pluggable Fee Strategies (e.g. Hourly, Flat Rate, Peak Hours).',
      'Real-time display boards on each floor showing count of available spots by type.'
    ],
    nonFunctionalRequirements: [
      'Extensibility: Adding new vehicle types (e.g. Electric SUV) or pricing algorithms should not modify core classes (Open/Closed Principle).',
      'Thread-Safety: Concurrent entry and exit gates must not allocate the same spot to two vehicles (Race condition prevention).',
      'Maintainability: Clear separation between spot management, ticketing, billing, and display notifications.'
    ],
    keyEntitiesExpected: [
      { name: 'ParkingLot', role: 'Main facade or singleton coordinator for floors and gates', description: 'Central controller maintaining floors, gates, and global state' },
      { name: 'ParkingFloor', role: 'Represents a level with spots and display board', description: 'Holds collection of spots on that floor and computes capacity' },
      { name: 'ParkingSpot', role: 'Individual slot with type, status, and occupancy', description: 'Represents atomic parking slot with isOccupied state' },
      { name: 'Vehicle', role: 'Abstract base class or hierarchy for vehicles', description: 'Car, Motorcycle, Truck subclasses with license plate' },
      { name: 'Ticket', role: 'Receipt issued at entrance with timestamps', description: 'Contains ticketId, entryTime, vehicle, and assigned spot' },
      { name: 'ParkingStrategy', role: 'Interface for spot allocation algorithms', description: 'Pluggable strategy (NearestToEntrance, LowestFloorFirst)' },
      { name: 'FeeStrategy', role: 'Interface for payment & billing calculations', description: 'Calculates monetary charge based on duration & vehicle type' },
      { name: 'EntranceGate', role: 'Gate handling vehicle arrival and ticket dispensing', description: 'Interacts with ParkingStrategy to find and assign spot' },
      { name: 'ExitGate', role: 'Gate processing payment and freeing spot', description: 'Calculates fee, marks ticket paid, and vacates spot' }
    ],
    suggestedPatterns: [
      { name: 'Strategy Pattern', reason: 'For pluggable spot allocation algorithms and dynamic fee calculation schemes.' },
      { name: 'Factory Pattern', reason: 'To instantiate different Vehicle and Spot types cleanly.' },
      { name: 'Observer Pattern', reason: 'To notify DisplayBoards when spots become occupied or vacant.' },
      { name: 'Singleton Pattern', reason: 'To maintain a single centralized ParkingLot management instance if required.' }
    ],
    interviewQuestions: [
      {
        question: 'How do you handle race conditions if two cars arrive at different entrance gates simultaneously when only 1 spot is left?',
        answer: 'Use synchronized methods or explicit locks (ReentrantLock) at the ParkingFloor / Spot level, or use Concurrent collections with atomic compare-and-swap operations (e.g., AtomicBoolean or atomic reserveSpot).'
      },
      {
        question: 'Can a motorcycle park in a car spot if no motorcycle spots are left?',
        answer: 'Model a `canFit(Vehicle vehicle)` method on ParkingSpot that checks if the spot type size is >= vehicle size, allowing smaller vehicles in larger spots if business rules permit.'
      }
    ],
    starterTemplates: {
      java: `// Write your code here`,
      python: `# Write your code here`,
      typescript: `// Write your code here`,
      cpp: `// Write your code here`
    },
    sampleMermaidDiagram: `classDiagram
    class ParkingLot {
        -List~ParkingFloor~ floors
        -List~EntranceGate~ entranceGates
        -List~ExitGate~ exitGates
        +parkVehicle(Vehicle) Ticket
        +unparkVehicle(Ticket) double
    }
    class ParkingFloor {
        -int floorNumber
        -List~ParkingSpot~ spots
        -DisplayBoard displayBoard
        +findAvailableSpot(VehicleType) ParkingSpot
    }
    class ParkingSpot {
        -String spotId
        -SpotType type
        -boolean isOccupied
        +assignVehicle(Vehicle) boolean
        +vacate() void
    }
    class Vehicle {
        <<abstract>>
        -String licensePlate
        -VehicleType type
    }
    class Ticket {
        -String ticketId
        -DateTime entryTime
        -ParkingSpot spot
        -Vehicle vehicle
    }
    class ParkingStrategy {
        <<interface>>
        +findSpot(List~ParkingFloor~, Vehicle) ParkingSpot
    }
    class FeeStrategy {
        <<interface>>
        +calculateFee(Ticket, DateTime) double
    }

    ParkingLot *-- ParkingFloor
    ParkingLot *-- EntranceGate
    ParkingLot *-- ExitGate
    ParkingFloor *-- ParkingSpot
    EntranceGate --> ParkingStrategy
    ExitGate --> FeeStrategy
    Ticket o-- ParkingSpot
    Ticket o-- Vehicle
    ParkingSpot o-- Vehicle`
  },
  {
    slug: 'elevator-system',
    title: 'Design an Elevator Controller System',
    difficulty: 'Hard',
    category: 'State Machine & Concurrency',
    timeEstimateMinutes: 50,
    description: `Design a scalable multi-elevator management system for a high-rise building capable of handling concurrent internal and external floor requests efficiently using scheduling algorithms.`,
    functionalRequirements: [
      'Control multiple elevators across an N-floor building.',
      'Process external hall calls (floor + UP/DOWN direction).',
      'Process internal cabin calls (destination floor button pressed inside an elevator).',
      'Elevator state transitions: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN, MAINTENANCE.',
      'Elevator controller uses pluggable dispatch strategy (e.g. SCAN / LOOK algorithm, Nearest Elevator, Shortest Seek Time First).',
      'Safety and edge cases: Door sensors, weight overload alarm, emergency stop.'
    ],
    nonFunctionalRequirements: [
      'High throughput and minimal passenger wait times.',
      'Thread safety for simultaneous requests from multiple floors and cabins.',
      'Extensibility to add destination dispatch algorithms without refactoring the elevator engine.'
    ],
    keyEntitiesExpected: [
      { name: 'ElevatorController', role: 'Central coordinator directing multiple elevators and dispatching requests', description: 'Receives hall calls and assigns best elevator' },
      { name: 'ElevatorCar', role: 'Individual elevator with state, current floor, and target queues', description: 'Handles moving, door operations, and direction' },
      { name: 'ElevatorState', role: 'State interface or enum for elevator dynamics', description: 'Models state transitions (MovingUp, MovingDown, Idle)' },
      { name: 'DispatchStrategy', role: 'Strategy interface for scheduling and elevator assignment', description: 'Implements SCAN / LOOK or proximity algorithms' },
      { name: 'HallRequest', role: 'External call from a floor with direction', description: 'Floor number and UP / DOWN direction' },
      { name: 'InternalRequest', role: 'Cabin button press for destination floor', description: 'Destination floor from inside elevator' },
      { name: 'Door', role: 'Physical door subsystem with open/close timeout and obstacle sensors', description: 'Controls door safety lifecycle' }
    ],
    suggestedPatterns: [
      { name: 'State Pattern', reason: 'To manage elevator states (Idle, MovingUp, MovingDown, DoorOpen) cleanly.' },
      { name: 'Strategy Pattern', reason: 'To plug in different elevator dispatch algorithms (SCAN, LOOK, Odd-Even).' },
      { name: 'Command Pattern', reason: 'To encapsulate floor requests as executable objects in priority queues.' }
    ],
    interviewQuestions: [
      {
        question: 'Why is the LOOK / SCAN algorithm preferred over simple FCFS (First-Come-First-Serve)?',
        answer: 'FCFS results in huge elevator starvation and zigzagging across floors. SCAN continues in the current direction serving all requests until the furthest request before reversing direction, minimizing turnaround time.'
      }
    ],
    starterTemplates: {
      java: `// Write your code here`,
      python: `# Write your code here`,
      typescript: `// Write your code here`,
      cpp: `// Write your code here`
    },
    sampleMermaidDiagram: `classDiagram
    class ElevatorController {
        -List~ElevatorCar~ elevators
        -DispatchStrategy dispatchStrategy
        +handleHallRequest(HallRequest)
        +stepAll()
    }
    class ElevatorCar {
        -int id
        -int currentFloor
        -ElevatorState currentState
        -Door door
        +addFloorRequest(int)
        +move()
        +changeState(ElevatorState)
    }
    class ElevatorState {
        <<interface>>
        +handleMove(ElevatorCar)
        +handleRequest(ElevatorCar, Request)
    }
    class DispatchStrategy {
        <<interface>>
        +selectElevator(List~ElevatorCar~, HallRequest) ElevatorCar
    }

    ElevatorController o-- ElevatorCar
    ElevatorController --> DispatchStrategy
    ElevatorCar --> ElevatorState`
  },
  {
    slug: 'vending-machine',
    title: 'Design a Vending Machine System',
    difficulty: 'Easy',
    category: 'State Pattern & Inventory',
    timeEstimateMinutes: 35,
    description: `Design a stateful vending machine that accepts cash/coins, lets customers choose products from slots, calculates exact change, dispenses items, and handles edge cases like insufficient balance or sold-out items.`,
    functionalRequirements: [
      'Inventory of products stored in numbered slots (e.g. A1: Coke $1.50, B2: Chips $1.00).',
      'Accept coins and notes (Cent, Dime, Quarter, Dollar).',
      'State transitions: NoMoneyState -> HasMoneyState -> DispensingState -> SoldOutState.',
      'Allow user to cancel transaction and receive a full refund.',
      'Dispense selected item and return exact change using minimum coin denomination algorithm.',
      'Admin mode to restock items and collect cash.'
    ],
    nonFunctionalRequirements: [
      'Strict state validation: cannot dispense without enough money, cannot take money during dispensing.',
      'Thread-safe inventory deduction.',
      'Open for new payment options (e.g. Card, UPI) via PaymentStrategy.'
    ],
    keyEntitiesExpected: [
      { name: 'VendingMachine', role: 'Context maintaining current state, inventory, and balance', description: 'Central machine context holding state pointer and cash inventory' },
      { name: 'VendingMachineState', role: 'State interface defining allowed operations', description: 'Interface with insertMoney, selectItem, dispense, refund' },
      { name: 'Product', role: 'Item details with name, price, code', description: 'Domain model for purchasable goods' },
      { name: 'Inventory', role: 'Manages slots and quantity count of each product', description: 'Stores Map of slotCode -> Product / Count' },
      { name: 'Coin', role: 'Enum representing supported denominations', description: 'DIME, QUARTER, DOLLAR with value attributes' },
      { name: 'ChangeCalculator', role: 'Service that computes change coins from available cash reserves', description: 'Greedy or DP change making algorithm' }
    ],
    suggestedPatterns: [
      { name: 'State Pattern', reason: 'Essential to encapsulate state-dependent behavior and transitions (NoMoney, HasMoney, Dispensing, SoldOut).' },
      { name: 'Strategy Pattern', reason: 'For pluggable change calculation or alternative payment processing.' }
    ],
    interviewQuestions: [
      {
        question: 'Why is the State Pattern preferred over large switch-cases for a Vending Machine?',
        answer: 'Switch cases scatter transition logic across methods and violate Single Responsibility and Open/Closed principles. State objects isolate state-specific rules and make adding states (e.g. MaintenanceState) trivial.'
      }
    ],
    starterTemplates: {
      java: `// Write your code here`,
      python: `# Write your code here`,
      typescript: `// Write your code here`,
      cpp: `// Write your code here`
    },
    sampleMermaidDiagram: `classDiagram
    class VendingMachine {
        -VendingMachineState state
        -Inventory inventory
        -double currentBalance
        +insertCoin(Coin)
        +selectProduct(String)
        +dispense()
        +refund()
        +setState(VendingMachineState)
    }
    class VendingMachineState {
        <<interface>>
        +insertCoin(VendingMachine, Coin)
        +selectProduct(VendingMachine, String)
        +dispense(VendingMachine)
        +refund(VendingMachine)
    }
    class IdleState
    class HasMoneyState
    class DispensingState
    class SoldOutState

    VendingMachine --> VendingMachineState
    VendingMachineState <|.. IdleState
    VendingMachineState <|.. HasMoneyState
    VendingMachineState <|.. DispensingState
    VendingMachineState <|.. SoldOutState`
  },
  {
    slug: 'rate-limiter-system',
    title: 'Design an API Rate Limiter',
    difficulty: 'Medium',
    category: 'Algorithms & Concurrency',
    timeEstimateMinutes: 40,
    description: `Design a high-performance in-memory API rate limiter supporting multiple rate limiting strategies (Token Bucket, Leaky Bucket, Sliding Window Log / Counter) per client ID or IP address.`,
    functionalRequirements: [
      'Throttle requests per client key (e.g. User ID, API Key, or Client IP).',
      'Support configurable thresholds (e.g., 100 requests per minute).',
      'Pluggable rate limiting algorithms: Token Bucket, Leaky Bucket, Sliding Window Counter.',
      'Return rate limit metadata with response: Allowed (true/false), Remaining tokens, Retry-After header duration in seconds.',
      'Thread-safe execution under heavy concurrent traffic.'
    ],
    nonFunctionalRequirements: [
      'Low latency overhead (sub-millisecond evaluation).',
      'Memory efficient: Expired or inactive client buckets should be evictable.',
      'Extensibility to add new distributed or local rate limiting policies.'
    ],
    keyEntitiesExpected: [
      { name: 'RateLimiter', role: 'Facade coordinator dispatching checks to chosen strategy', description: 'Main entry point for allowRequest(clientKey)' },
      { name: 'RateLimitStrategy', role: 'Interface for algorithm implementations', description: 'Contract defining isAllowed(clientKey, limit, timeWindow)' },
      { name: 'TokenBucketStrategy', role: 'Token refill algorithm implementation', description: 'Simulates token bucket with capacity and refill rate' },
      { name: 'SlidingWindowStrategy', role: 'Sliding timestamp or counter implementation', description: 'Maintains granular timestamp buckets' },
      { name: 'RateLimitResult', role: 'Value object returning allowance and headers', description: 'Contains allowed, remainingTokens, resetTime' }
    ],
    suggestedPatterns: [
      { name: 'Strategy Pattern', reason: 'To interchange algorithms (Token Bucket, Sliding Window, Leaky Bucket) at configuration time.' },
      { name: 'Factory Pattern', reason: 'To build appropriate rate limiter instances per client tier (Free vs Premium).' }
    ],
    interviewQuestions: [
      {
        question: 'What is the trade-off between Token Bucket and Sliding Window Log?',
        answer: 'Token Bucket is extremely memory efficient (stores only 2 integers: token count and lastRefillTimestamp) but can allow bursts up to capacity. Sliding Window Log provides strict precision without burst spikes but consumes high memory storing timestamps per request.'
      }
    ],
    starterTemplates: {
      java: `// Write your code here`,
      python: `# Write your code here`,
      typescript: `// Write your code here`,
      cpp: `// Write your code here`
    },
    sampleMermaidDiagram: `classDiagram
    class RateLimiter {
        -RateLimiterStrategy strategy
        +allowRequest(String clientId) RateLimitResult
    }
    class RateLimiterStrategy {
        <<interface>>
        +allowRequest(String clientId) boolean
    }
    class TokenBucketStrategy {
        -int capacity
        -int refillRate
        -Map~String, Bucket~ clientBuckets
    }
    class SlidingWindowStrategy {
        -int windowSizeSeconds
        -int maxRequests
        -Map~String, Deque~ timestampLogs
    }

    RateLimiter --> RateLimiterStrategy
    RateLimiterStrategy <|.. TokenBucketStrategy
    RateLimiterStrategy <|.. SlidingWindowStrategy`
  },
  {
    slug: 'splitwise-expense-sharing',
    title: 'Design an Expense Sharing App (Splitwise)',
    difficulty: 'Hard',
    category: 'Design Patterns & Graph Algorithms',
    timeEstimateMinutes: 55,
    description: `Design an expense sharing and debt settlement platform (like Splitwise) that supports unequal splits, percentage splits, multiple expense categories, group balances, and debt simplification.`,
    functionalRequirements: [
      'Create users and groups.',
      'Add expenses paid by one or more users, split among participants using pluggable strategies (Equal, Exact Amount, Percentage).',
      'Track individual balances and balance sheets between pairs of users.',
      'Settle debts directly between users.',
      'Simplify group debts using graph / greedy balance simplification algorithm to minimize total transactions.'
    ],
    nonFunctionalRequirements: [
      'Financial accuracy: Split validation must guarantee total split amounts equal the expense amount to 2 decimal places.',
      'Extensibility: Add new split modes (e.g. Share-based split, adjustment-based split) with zero changes to ExpenseManager.',
      'High modularity separating Split calculation, Validation, User Management, and Debt Graph algorithms.'
    ],
    keyEntitiesExpected: [
      { name: 'ExpenseManager', role: 'Facade coordinating users, groups, and expense recording', description: 'Central controller maintaining user balances' },
      { name: 'User', role: 'Individual participant with ID, name, email', description: 'Represents a user in the system' },
      { name: 'Group', role: 'Collection of users with group expenses', description: 'Group context holding members and group expenses' },
      { name: 'Expense', role: 'Represents a financial transaction with payer, amount, and splits', description: 'Core domain transaction entity' },
      { name: 'SplitStrategy', role: 'Strategy interface for dividing expenses', description: 'EqualSplit, ExactSplit, PercentageSplit implementations' },
      { name: 'Split', role: 'Individual user share of an expense', description: 'Holds user reference and amount owed' },
      { name: 'DebtSimplifier', role: 'Graph algorithm service to minimize settlement transactions', description: 'Minimizes cash flow using greedy / heap algorithm' }
    ],
    suggestedPatterns: [
      { name: 'Strategy Pattern', reason: 'For validating and computing Equal, Exact, Percentage, and Share-based expense splits.' },
      { name: 'Factory Pattern', reason: 'To build appropriate Expense and Split objects based on SplitType.' },
      { name: 'Observer Pattern', reason: 'To notify users when an expense is added or debt is settled.' }
    ],
    interviewQuestions: [
      {
        question: 'How does debt simplification work?',
        answer: 'Calculate net balance for each user (credit minus debit). Group into debtors (< 0) and creditors (> 0). Repeatedly settle the maximum debtor with the maximum creditor using min(abs(debt), credit), reducing O(N^2) pairwise debts to at most N-1 transactions.'
      }
    ],
    starterTemplates: {
      java: `// Write your code here`,
      python: `# Write your code here`,
      typescript: `// Write your code here`,
      cpp: `// Write your code here`
    },
    sampleMermaidDiagram: `classDiagram
    class ExpenseManager {
        -Map~String, User~ users
        -Map~String, Map~String, Double~~ balanceSheet
        +addExpense(Expense)
        +showBalance(String userId)
        +simplifyDebts()
    }
    class Expense {
        -String id
        -double amount
        -User paidBy
        -List~Split~ splits
        -SplitStrategy strategy
    }
    class SplitStrategy {
        <<interface>>
        +validate(double, List~Split~)
        +calculate(double, List~Split~)
    }
    class DebtSimplifier {
        +simplify(Map~String, Map~String, Double~~) List~Transaction~
    }

    ExpenseManager o-- Expense
    Expense --> SplitStrategy
    ExpenseManager --> DebtSimplifier`
  }
];

module.exports = seedProblems;
