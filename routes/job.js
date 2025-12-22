
const express = require('express');
const supabase = require('../config/supabase'); 
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all jobs from Supabase
// @route   GET /api/job
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs') 
      .select('*')
      .eq('is_active', true) // Changed from 'isActive' to 'is_active' to match your DB
      .order('priority', { ascending: false });

    if (error) throw error;

    res.json({
      status: 'success',
      results: data.length,
      data: data
    });
  } catch (error) {
    // This will now show you the real error in your console if it fails again
    console.error('Supabase Error:', error.message); 
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;