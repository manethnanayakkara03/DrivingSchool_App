const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'admin',
        nic: user.nic,
        phone: user.phone,
        address: user.address,
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: err.message || 'Login failed. Server error.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, nic, phone, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = await User.create({
      email: email.trim().toLowerCase(),
      password,
      name,
      nic,
      phone,
      address,
      role: 'learner', // Default to learner for public registration
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        nic: newUser.nic,
        phone: newUser.phone,
        address: newUser.address,
      },
      message: 'Registration successful'
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: err.message || 'Registration failed. Server error.' });
  }
});

module.exports = router;
