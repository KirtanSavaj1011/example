const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase'); 
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Register user via Supabase
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });

    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name } // Additional user data
      }
    });

    if (error) return res.status(400).json({ status: 'error', message: error.message });

    res.status(201).json({ status: 'success', user: data.user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Login user via Supabase
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ status: 'error', message: 'Invalid credentials' });

    res.json({
      status: 'success',
      token: data.session.access_token,
      user: data.user
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;