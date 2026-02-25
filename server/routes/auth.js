import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

router.post('/register', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server error: JWT_SECRET is not set. Add it to server/.env' });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const emailNorm = email.toString().toLowerCase().trim();
    const existing = await User.findOne({ email: emailNorm });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name: name.trim(), email: emailNorm, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    const message = err.code === 11000 ? 'That email is already registered' : (err.message || 'Registration failed');
    return res.status(err.code === 11000 ? 400 : 500).json({ message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Login failed' });
  }
});

// Sign in or create account with Google (Gmail)
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'Google id token is required' });
    if (!googleClient) return res.status(503).json({ message: 'Google sign-in is not configured. Add GOOGLE_CLIENT_ID to server .env and VITE_GOOGLE_CLIENT_ID to client .env.' });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split('@')[0] || 'User';
    const googleId = payload.sub;

    if (!email) return res.status(400).json({ message: 'Google account has no email' });

    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (!user) {
      user = await User.create({ name, email, googleId });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Google sign-in failed' });
  }
});

export default router;
