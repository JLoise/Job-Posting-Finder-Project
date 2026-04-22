import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

function toProfile(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture || '',
    headline: user.headline || '',
    about: user.about || '',
    experience: user.experience || [],
    education: user.education || [],
    skills: user.skills || [],
  };
}

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(toProfile(user));
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to load profile' });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { profilePicture, headline, about, experience, education, skills } = req.body;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (headline !== undefined) user.headline = headline;
    if (about !== undefined) user.about = about;
    if (experience !== undefined) user.experience = experience;
    if (education !== undefined) user.education = education;
    if (skills !== undefined) user.skills = Array.isArray(skills) ? skills.filter(Boolean) : [];
    await user.save();
    return res.json(toProfile(user));
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update profile' });
  }
});

router.get('/saved-jobs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedJobs',
      populate: { path: 'postedBy', select: 'name email' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.savedJobs || []);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch saved jobs' });
  }
});

export default router;
