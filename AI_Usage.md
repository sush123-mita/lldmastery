# AI Usage

AI tools were used as development assistants while building this project.

I used AI mainly for understanding, debugging, reviewing, and accelerating parts of the implementation. I reviewed the suggestions and made the final engineering decisions myself.

## 1. Understanding the LLD Domain

**AI suggested:** Different ways to structure an LLD practice platform, including separating problem management, submissions, and evaluation.

**Accepted:** I used this separation when structuring the backend.

**Why:** It matched the assignment's focus on clear domain responsibilities and made the code easier to reason about.

---

## 2. Evaluator Architecture

**AI suggested:** Keep evaluation logic separate from controllers instead of putting all evaluation behaviour directly inside request handlers.

**Accepted:** I separated the evaluation logic into dedicated components such as `EvaluatorPipeline`, `DeterministicEvaluator`, `RubricEvaluator`, `AIEvaluator`, and `FeedbackAggregator`.

**Why:** This gives each component a focused responsibility and makes the evaluation system easier to extend.

---

## 3. Debugging and Implementation

**AI suggested:** Various fixes and implementation approaches were considered while developing the frontend/backend integration and evaluation flow.

**Accepted/Rejected:** I used suggestions selectively and tested the resulting implementation locally rather than accepting generated code blindly.

**Why:** Some suggestions were useful for speeding up implementation, while others were simplified or changed to fit the existing project structure.

---

## 4. Code and Design Review

**AI suggested:** Review the project for separation of concerns, error handling, and possible edge cases.

**Accepted:** I used these suggestions to review the submission and evaluation flow and identify areas that needed clearer responsibilities or failure handling.

**Why:** AI was useful as a second pair of eyes, but the final implementation decisions were based on the assignment requirements and the actual behaviour of the application.

---

## Reflection

AI was used as a **development assistant, not as part of the product's runtime architecture**.

The most useful role of AI was helping me explore design alternatives, understand unfamiliar implementation details, debug issues, and review my decisions. I did not blindly accept generated solutions; I tested and adapted suggestions to the project's requirements and scope.
