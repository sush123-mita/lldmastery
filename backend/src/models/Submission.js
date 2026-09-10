const mongoose = require('mongoose');

const RubricScoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  weight: { type: Number, default: 0.2 },
  feedback: { type: String, required: true },
  strengths: [String],
  improvements: [String]
}, { _id: false });

const AntiPatternSchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  description: { type: String, required: true },
  locationSnippet: String,
  refactoringSuggestion: String
}, { _id: false });

const SubmissionSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
    index: true
  },
  userId: {
    type: String,
    default: 'learner-demo-user',
    index: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  language: {
    type: String,
    enum: ['java', 'python', 'typescript', 'cpp'],
    default: 'java'
  },
  code: {
    type: String,
    required: true
  },
  diagram: {
    type: String,
    default: ''
  },
  designRationale: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['QUEUED', 'EVALUATING', 'COMPLETED', 'FAILED'],
    default: 'QUEUED',
    index: true
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  rubricBreakdown: [RubricScoreSchema],
  identifiedEntities: [{
    name: String,
    type: { type: String, enum: ['CLASS', 'INTERFACE', 'ENUM', 'ABSTRACT_CLASS'] },
    status: { type: String, enum: ['FOUND', 'MISSING', 'PARTIAL'] },
    methods: [String],
    fields: [String]
  }],
  detectedPatterns: [{
    name: String,
    appliedProperly: Boolean,
    note: String
  }],
  antiPatterns: [AntiPatternSchema],
  refactoringSuggestions: [{
    title: String,
    explanation: String,
    beforeCode: String,
    afterCode: String
  }],
  evaluationSource: {
    type: String,
    enum: ['HYBRID_AI', 'DETERMINISTIC_ENGINE', 'MOCK_FALLBACK'],
    default: 'HYBRID_AI'
  },
  evaluationDurationMs: {
    type: Number,
    default: 0
  },
  summary: {
    type: String,
    default: ''
  },
  tradeOffAnalysis: {
    type: String,
    default: ''
  },
  nextMilestoneAdvice: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', SubmissionSchema);
