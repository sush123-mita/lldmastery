const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const seedProblems = require('../domain/problems/seedData');

exports.getAllProblems = async (req, res) => {
  try {
    let problems = await Problem.find().select('-starterTemplates -sampleSolution').sort({ createdAt: 1 });
    
    // Auto-seed if empty
    if (!problems || problems.length === 0) {
      for (const p of seedProblems) {
        await Problem.findOneAndUpdate({ slug: p.slug }, p, { upsert: true });
      }
      problems = await Problem.find().select('-starterTemplates -sampleSolution').sort({ createdAt: 1 });
    }

    // Attach attempt stats per problem
    const problemsWithStats = await Promise.all(problems.map(async (prob) => {
      const submissionCount = await Submission.countDocuments({ problemId: prob._id });
      const bestSubmission = await Submission.findOne({ problemId: prob._id, status: 'COMPLETED' })
        .sort({ overallScore: -1 });

      return {
        ...prob.toObject(),
        submissionCount,
        bestScore: bestSubmission ? bestSubmission.overallScore : null
      };
    }));

    res.json(problemsWithStats);
  } catch (err) {
    console.error('Error fetching problems:', err);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
};

exports.getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let problem = await Problem.findOne({ slug });

    if (!problem) {
      // Check if it's in seed data
      const seedProb = seedProblems.find(p => p.slug === slug);
      if (seedProb) {
        problem = await Problem.create(seedProb);
      } else {
        return res.status(404).json({ error: 'Problem not found' });
      }
    }

    res.json(problem);
  } catch (err) {
    console.error('Error fetching problem details:', err);
    res.status(500).json({ error: 'Failed to fetch problem details' });
  }
};
