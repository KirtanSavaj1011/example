// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const supabase = require('../config/supabase'); // Import the client you created
// const { protect, authorize, optionalAuth } = require('../middleware/auth');

// const router = express.Router();

// // @desc    Get all jobs
// // @route   GET /api/job
// router.get('/', optionalAuth, async (req, res) => {
//   try {
//     // Queries the 'jobs' table you created in the Supabase SQL Editor
//     const { data, error } = await supabase
//       .from('jobs')
//       .select('*')
//       .eq('is_active', true)
//       .order('priority', { ascending: false });

//     if (error) throw error;

//     res.json({
//       status: 'success',
//       results: data.length,
//       data: data
//     });
//   } catch (error) {
//     console.error('Supabase Get Jobs Error:', error.message);
//     res.status(500).json({ status: 'error', message: 'Database error' });
//   }
// });

// // @desc    Get single job by ID
// // @route   GET /api/job/:id
// router.get('/:id', optionalAuth, async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('jobs')
//       .select('*')
//       .eq('id', req.params.id)
//       .single();

//     if (error || !data) {
//       return res.status(404).json({ status: 'error', message: 'Job not found' });
//     }

//     res.json({ status: 'success', data: data });
//   } catch (error) {
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// });

// // @desc    Create a job (Admin only)
// // @route   POST /api/job
// router.post('/', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from('jobs')
//       .insert([req.body]) 
//       .select();

//     if (error) throw error;

//     res.status(201).json({ status: 'success', data: data[0] });
//   } catch (error) {
//     res.status(400).json({ status: 'error', message: error.message });
//   }
// });

// // @desc    Delete a job (Admin only)
// // @route   DELETE /api/job/:id
// router.delete('/:id', protect, authorize('admin'), async (req, res) => {
//   try {
//     const { error } = await supabase
//       .from('jobs')
//       .delete()
//       .eq('id', req.params.id);

//     if (error) throw error;

//     res.json({ status: 'success', message: 'Job deleted' });
//   } catch (error) {
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// });

// module.exports = router;  


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
      .eq('isActive', true) // Matches your Supabase 'isActive' column
      .order('priority', { ascending: false });

    if (error) throw error;

    res.json({
      status: 'success',
      results: data.length,
      data: data
    });
  } catch (error) {
    console.error('Supabase Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

module.exports = router;