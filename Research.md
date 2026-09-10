# LLD Mastery — Research Note

## 1. Problem

Low-Level Design practice has an important feedback problem.

A learner can attempt a Parking Lot, Elevator, Vending Machine, or similar problem and produce code that works, while still being unsure whether:

* Responsibilities are assigned correctly
* Classes are cohesive
* Abstractions are useful
* Dependencies are unnecessarily tight
* Interfaces are well designed
* The design is extensible
* Patterns are being used for a real reason
* The chosen trade-offs are reasonable

Existing practice resources make it relatively easy to find problems, but the learner often has to self-evaluate the solution or compare it with a reference implementation.

That creates a gap between **solving** and **learning from the solution**.

---

## 2. Existing Approaches

During the initial research, several broad approaches were considered.

### Traditional LLD problem repositories

Repositories and learning resources provide large collections of LLD questions, implementations, UML diagrams, and design-pattern examples.

Their strength is breadth and reference material.

However, they generally behave like static learning resources:

```text
Question → Reference Solution
```

The learner does not necessarily receive feedback on their own attempt.

### Coding practice platforms

Traditional coding platforms provide a strong submission and feedback loop.

Their evaluation works particularly well when correctness can be represented using deterministic test cases.

LLD is different.

There can be multiple valid implementations, meaning that:

```text
Different design ≠ Incorrect design
```

This makes pure expected-output evaluation insufficient.

### AI-assisted coding/learning tools

LLMs can provide contextual explanations and review suggestions.

Their strength is qualitative reasoning.

However, using an LLM alone for evaluation can produce inconsistent or poorly grounded feedback.

---

## 3. Key Gap

The main opportunity identified was:

> **Combine the repeatability of structured evaluation with the reasoning ability of AI.**

Instead of asking an AI to simply give a score, the platform should provide evidence and structure around the feedback.

This led to the hybrid evaluation model:

```text
Deterministic signals
        +
Rubric-based evaluation
        +
AI reasoning
        ↓
Structured feedback
```

---

## 4. Product Direction

The MVP focuses on one core loop:

```text
Choose problem
      ↓
Design solution
      ↓
Submit
      ↓
Receive feedback
      ↓
Review attempt
      ↓
Try again
```

The goal is not to build another LMS.

The goal is to answer one question well:

> **"I designed this LLD solution. What did I do well, what could be better, and why?"**

---

## 5. Product Principles

### Feedback over scores

A score alone does not teach the learner what to change.

Feedback should therefore explain the underlying design issue.

### Multiple valid solutions

The system should avoid treating one canonical implementation as the only correct answer.

### Hybrid evaluation

Objective checks should remain deterministic wherever possible, while AI should be used for qualitative reasoning.

### Retry should be easy

The learner should be able to use feedback immediately and attempt the problem again.

### Focused MVP

The prototype should solve the core learning loop rather than spending time on authentication, social features, LMS management, or large-scale infrastructure.

---

## 6. Resulting MVP

The research led to an MVP containing:

* LLD problem library
* Problem requirements
* Code submission
* Design rationale
* Diagram support
* Hybrid evaluation
* Structured feedback
* Evaluation status
* Attempt history

This directly maps to the assignment's requested practice loop while keeping the implementation achievable within the two-day constraint.

---

## 7. What I Would Validate Next

If this were continued beyond the assignment, the first product questions I would validate would be:

1. Which submission format gives learners the most useful feedback?
2. Do learners trust AI-generated design feedback?
3. Which feedback categories actually lead to improved second attempts?
4. Does showing a score help, or does it distract from the explanation?
5. How much deterministic analysis is necessary before AI feedback becomes meaningfully better?

These questions would guide the next iteration rather than adding features without evidence.
