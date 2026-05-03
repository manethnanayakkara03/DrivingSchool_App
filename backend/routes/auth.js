const router = require('express').Router();
const jwt = require('jsonwebtoken');
const localAuth = require('../localAuth');

// Initialize local auth system
localAuth.initializeUsers();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    const admin = localAuth.findUserByEmail(email.trim());
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const match = localAuth.validatePassword(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      admin: { id: admin.id, email: admin.email, name: admin.name } 
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: err.message || 'Login failed. Server error.' });
  }
});

module.exports = router;
