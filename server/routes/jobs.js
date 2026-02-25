import express from 'express';
import Job from '../models/Job.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Build flexible search: "dev" matches "Developer", "developer", "Dev", etc.
// Same for location: partial + case-insensitive
function buildSearchFilter(query) {
  const filter = {};
  const q = (query.q || query.search || '').trim();
  const location = (query.location || '').trim();
  const type = (query.type || '').trim();

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }
  if (type) {
    filter.type = type;
  }

  if (query.salaryMin != null && query.salaryMin !== '') {
    filter.salaryMax = { $gte: Number(query.salaryMin) };
  }
  if (query.salaryMax != null && query.salaryMax !== '') {
    filter.salaryMin = { ...(filter.salaryMin || {}), $lte: Number(query.salaryMax) };
  }

  return filter;
}

// GET /api/jobs — list with flexible search (auth optional; ?mine=1 requires auth)
router.get('/', async (req, res) => {
  try {
    const filter = buildSearchFilter(req.query);
    if (req.query.mine === '1' || req.query.mine === 'true') {
      const authHeader = req.headers.authorization?.replace('Bearer ', '');
      if (!authHeader) return res.status(401).json({ message: 'Not authorized' });
      const jwt = await import('jsonwebtoken');
      let decoded;
      try {
        decoded = jwt.default.verify(authHeader, process.env.JWT_SECRET);
      } catch (_) {
        return res.status(401).json({ message: 'Invalid token' });
      }
      filter.postedBy = decoded.id;
    }
    const sort = req.query.sort === 'salary' ? { salaryMin: -1 } : { createdAt: -1 };
    const jobs = await Job.find(filter).sort(sort).populate('postedBy', 'name email').lean();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to fetch job' });
  }
});

// POST /api/jobs — create (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, company, location, type, salaryMin, salaryMax, description } = req.body;
    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: 'Title, company, location and description are required' });
    }
    const job = await Job.create({
      title,
      company,
      location,
      type: type || 'Full-time',
      salaryMin: salaryMin != null ? Number(salaryMin) : undefined,
      salaryMax: salaryMax != null ? Number(salaryMax) : undefined,
      description,
      postedBy: req.user._id,
    });
    const populated = await Job.findById(job._id).populate('postedBy', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create job' });
  }
});

// PUT /api/jobs/:id — update (protected, owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
    const { title, company, location, type, salaryMin, salaryMax, description } = req.body;
    if (title != null) job.title = title;
    if (company != null) job.company = company;
    if (location != null) job.location = location;
    if (type != null) job.type = type;
    if (salaryMin != null) job.salaryMin = Number(salaryMin);
    if (salaryMax != null) job.salaryMax = Number(salaryMax);
    if (description != null) job.description = description;
    await job.save();
    const populated = await Job.findById(job._id).populate('postedBy', 'name email');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id — delete (protected, owner only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to delete job' });
  }
});

export default router;
