# LLD Mastery

### A focused practice platform for solving Low-Level Design problems and receiving explainable design feedback.

live demo linnk : https://frontend-ig4jykt12-sushmita-singhs-projects.vercel.app/

LLD Mastery is a prototype built.

<img width="1917" height="906" alt="image" src="https://github.com/user-attachments/assets/3ff03a21-bb20-4409-a2b7-a7cb0e941295" />

<img width="1916" height="907" alt="image" src="https://github.com/user-attachments/assets/ebd2fd8d-2213-4385-a3a3-437b2ba18764" />

<img width="1912" height="882" alt="image" src="https://github.com/user-attachments/assets/030b3921-b0e6-4746-9cab-14a5f2fb883c" />

<img width="1903" height="832" alt="image" src="https://github.com/user-attachments/assets/462ca6fa-bcca-4cad-8645-41edc5874b81" />

<img width="1906" height="887" alt="image" src="https://github.com/user-attachments/assets/f7610c23-e19e-4edd-9003-bc6f10264d51" />





The goal is simple:

> **Practice an LLD problem → submit your design → receive structured feedback → review your attempt → try again.**

LLD problems are relatively easy to attempt, but evaluating whether a design has good responsibilities, abstractions, relationships, extensibility, and trade-offs is much harder.

LLD Mastery focuses specifically on closing that feedback gap.

---

## What the platform does

A learner can:

1. Choose an LLD problem.
2. Read the requirements and constraints.
3. Work on a solution using code, diagram, and design rationale.
4. Submit the attempt.
5. Receive structured evaluation and feedback.
6. Review strengths, weaknesses, and improvement areas.
7. Revisit previous attempts and improve over time.

The prototype intentionally focuses on the **practice loop** rather than becoming a full LMS or assessment platform.

---

## Core Practice Loop

```text
Choose Problem
      ↓
Understand Requirements
      ↓
Design / Implement
      ↓
Submit
      ↓
Evaluate
      ↓
Review Feedback
      ↓
Try Again
```

The objective is not simply to give the learner a score, but to explain **why** a design can be improved.

---

## Key Features

### 1. LLD Problem Library

The platform provides a focused set of LLD problems with:

* Problem statement
* Requirements
* Constraints
* Expected design considerations
* Difficulty/context

The problem model is separated from submission and evaluation logic so additional problems can be added without changing the evaluation pipeline.

### 2. Multi-part Submission

An attempt can contain multiple forms of design information:

* Code
* Programming language
* Design rationale
* Diagram

This gives the evaluator more context than evaluating code alone.

### 3. Hybrid Evaluation

LLD solutions can have multiple valid implementations, so relying only on exact expected output is not appropriate.

LLD Mastery therefore uses a layered evaluation approach:

```text
                Submission
                     │
                     ▼
          Deterministic Evaluation
                     │
                     ▼
             Rubric Evaluation
                     │
                     ▼
              AI Evaluation
                     │
                     ▼
            Feedback Aggregation
                     │
                     ▼
          Structured Final Feedback
```

The backend implements this through an `EvaluatorPipeline`.

The deterministic stage analyzes the submission using predictable rules. The rubric stage evaluates design-oriented criteria such as SOLID and responsibility-related concerns. The AI stage provides qualitative reasoning and contextual feedback.

### 4. AI Is Not the Only Evaluator

A key design decision is to avoid making the LLM the single source of truth.

If AI evaluation fails, the pipeline falls back to deterministic/heuristic feedback rather than failing the entire submission.

This makes the system:

* More reliable
* Easier to debug
* More explainable
* Easier to extend with another evaluator later

### 5. Feedback Aggregation

Different evaluation stages produce different signals.

The feedback aggregator combines them into a single structured evaluation result instead of exposing raw evaluator output directly to the learner.

### 6. Attempt History

Submissions are persisted so learners can review previous attempts.

This supports the intended learning loop:

```text
Attempt 1
   ↓
Feedback
   ↓
Improvement
   ↓
Attempt 2
   ↓
Compare / Review
```

---

# Architecture

LLD Mastery uses a deliberately simple monolithic architecture because the assignment is primarily focused on low-level/domain design rather than large-scale infrastructure.

```text
┌──────────────────────────────┐
│          React UI            │
│                              │
│ Problem List                 │
│ Problem Detail               │
│ Code Editor                  │
│ Diagram Viewer               │
│ Rationale Editor             │
│ Evaluation Results           │
│ Attempt History              │
└──────────────┬───────────────┘
               │ HTTP API
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│                              │
│ Controllers / Routes         │
│                              │
│ Domain Layer                 │
│ ┌──────────────────────────┐ │
│ │ Evaluator Pipeline       │ │
│ │                          │ │
│ │ Deterministic Evaluator  │ │
│ │ Rubric Evaluator         │ │
│ │ AI Evaluator             │ │
│ │ Feedback Aggregator      │ │
│ └──────────────────────────┘ │
│                              │
│ MongoDB / Mongoose Models    │
└──────────────────────────────┘
```

---

# Domain Design

The evaluation system is intentionally separated into independent components.

### EvaluatorPipeline

Coordinates the complete evaluation process.

```text
EvaluatorPipeline
 ├── DeterministicEvaluator
 ├── RubricEvaluator
 ├── AIEvaluator
 └── FeedbackAggregator
```

This separation allows another evaluation strategy to be introduced later without rewriting the entire submission flow.

For example:

```text
Evaluator
   │
   ├── DeterministicEvaluator
   ├── RubricEvaluator
   ├── AIEvaluator
   └── FutureEvaluator
```

The pipeline therefore acts as the orchestration layer while individual evaluators remain focused on their own responsibility.

---

# Evaluation Philosophy

The platform follows a hybrid approach because LLD evaluation contains both objective and subjective signals.

### Deterministic evaluation

Useful for things that can be checked consistently.

Examples:

* Structural/code-level signals
* Presence of expected design elements
* Detectable anti-patterns
* Basic complexity or responsibility heuristics

### Rubric evaluation

Useful for structured design criteria.

Examples:

* Responsibility separation
* SOLID-oriented checks
* Coupling/cohesion signals
* Extensibility
* Design rationale

### AI evaluation

Useful for qualitative reasoning where multiple valid solutions may exist.

Examples:

* Trade-off analysis
* Design alternatives
* Contextual weaknesses
* Improvement suggestions
* Reasoning about relationships and abstractions

This separation prevents the system from treating an LLM-generated score as an absolute truth.

---

# Failure Handling

Evaluation should not become unusable simply because the AI stage fails.

The pipeline therefore follows:

```text
Deterministic
     ↓
Rubric
     ↓
AI
     │
     ├── success → aggregate
     │
     └── failure → heuristic fallback → aggregate
```

If the complete pipeline encounters an unexpected failure, the submission receives a failed evaluation state with an actionable retry message.

This keeps failure handling inside the domain flow instead of introducing unnecessary distributed infrastructure.

---

# Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Evaluation

* Deterministic evaluation
* Rubric-based evaluation
* AI-assisted qualitative evaluation
* Heuristic fallback

### Development

* Git
* GitHub
* npm

---

# Project Structure

```text
lldmastery/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── domain/
│   │   │   ├── evaluator/
│   │   │   └── problems/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── assets/
│   └── package.json
│
└── package.json
```

---

# Running Locally

## Prerequisites

* Node.js
* npm
* MongoDB instance
* AI provider/API configuration if AI evaluation is enabled

---

## 1. Clone

```bash
git clone https://github.com/sush123-mita/lldmastery.git
cd lldmastery
```

---

## 2. Install backend dependencies

```bash
cd backend
npm install
```

---

## 3. Configure environment variables

Create:

```text
backend/.env
```

Add the required database and AI configuration.

Do not commit `.env`.

---

## 4. Seed problems

From the repository root:

```bash
npm run seed
```

---

## 5. Start backend

From the repository root:

```bash
npm run server
```

For development:

```bash
npm run server:dev
```

---

## 6. Start frontend

Open another terminal:

```bash
npm run client
```

The frontend will start through Vite.

---

# Root Scripts

The root `package.json` provides shortcuts for the main development tasks:

```bash
npm run server
npm run server:dev
npm run client
npm run seed
```

---

# Design Trade-offs

### Why a monolith?

The assignment is primarily an LLD/domain-design exercise.

A monolith keeps the prototype simple while allowing the important domain boundaries to remain explicit.

Introducing microservices would add operational complexity without improving the core learning experience.

### Why hybrid evaluation?

No single evaluation technique is sufficient.

Deterministic checks provide consistency, rubric evaluation provides structure, and AI provides qualitative reasoning.

### Why fallback evaluation?

AI services can fail or become unavailable.

The learner should still receive useful feedback whenever possible.

### Why store the design rationale?

Two implementations may look similar in code but have very different design reasoning.

The rationale gives the evaluator additional context about:

* Why a class exists
* Why responsibilities were assigned
* Why a pattern was selected
* What trade-offs were considered

---

# Current MVP Limitatations
Current limitations include:

* Limited problem catalogue
* Evaluation is heuristic rather than a definitive measure of design quality
* AI feedback can still be imperfect
* No authentication/user accounts
* No collaborative solving
* No full LMS functionality
* No large-scale asynchronous job infrastructure
* No production-grade observability

These are deliberate scope decisions rather than attempts to solve the entire LLD learning ecosystem.

---

# Future Improvements

If extended beyond the assignment, the platform could support:

* More LLD problem types
* Multiple submission formats
* Pluggable evaluation strategies
* Version-to-version design comparison
* Personalized practice recommendations
* More sophisticated AST analysis
* Test-case execution
* Instructor/mentor review
* Authentication and learner profiles
* Asynchronous evaluation jobs
* Evaluation confidence indicators

---

