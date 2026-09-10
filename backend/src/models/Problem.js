const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  category: {
    type: String,
    default: 'System & Object Oriented Design'
  },
  timeEstimateMinutes: {
    type: Number,
    default: 45
  },
  description: {
    type: String,
    required: true
  },
  functionalRequirements: [{
    type: String
  }],
  nonFunctionalRequirements: [{
    type: String
  }],
  keyEntitiesExpected: [{
    name: String,
    description: String,
    role: String
  }],
  suggestedPatterns: [{
    name: String,
    reason: String
  }],
  interviewQuestions: [{
    question: String,
    answer: String
  }],
  starterTemplates: {
    java: String,
    python: String,
    typescript: String,
    cpp: String
  },
  sampleMermaidDiagram: {
    type: String
  },
  sampleSolution: {
    language: String,
    code: String,
    rationale: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Problem', ProblemSchema);
