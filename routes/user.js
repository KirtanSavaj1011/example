// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const User = require('../models/User');
// const { protect, authorize } = require('../middleware/auth');

// const router = express.Router();

// // @desc    Get all users (admin only)
// // @route   GET /api/user
// // @access  Private (Admin only)
// router.get('/', protect, authorize('admin'), async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const users = await User.find()
//       .select('-password')
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const total = await User.countDocuments();
//     const totalPages = Math.ceil(total / limit);

//     res.json({
//       status: 'success',
//       data: users,
//       pagination: {
//         currentPage: page,
//         totalPages,
//         total,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       }
//     });
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error'
//     });
//   }
// });

// // @desc    Get single user
// // @route   GET /api/user/:id
// // @access  Private (Admin only)
// router.get('/:id', protect, authorize('admin'), async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select('-password');
    
//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     res.json({
//       status: 'success',
//       data: user
//     });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error'
//     });
//   }
// });

// // @desc    Update user role (admin only)
// // @route   PUT /api/user/:id/role
// // @access  Private (Admin only)
// router.put('/:id/role', protect, authorize('admin'), [
//   body('role')
//     .isIn(['user', 'admin'])
//     .withMessage('Role must be either user or admin')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         status: 'error',
//         errors: errors.array()
//       });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.params.id,
//       { role: req.body.role },
//       { new: true, runValidators: true }
//     ).select('-password');

//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     res.json({
//       status: 'success',
//       data: user
//     });
//   } catch (error) {
//     console.error('Update user role error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error'
//     });
//   }
// });

// // @desc    Toggle user active status (admin only)
// // @route   PUT /api/user/:id/status
// // @access  Private (Admin only)
// router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
    
//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     user.isActive = !user.isActive;
//     await user.save();

//     res.json({
//       status: 'success',
//       data: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         isActive: user.isActive
//       }
//     });
//   } catch (error) {
//     console.error('Toggle user status error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error'
//     });
//   }
// });

// // @desc    Delete user (admin only)
// // @route   DELETE /api/user/:id
// // @access  Private (Admin only)
// router.delete('/:id', protect, authorize('admin'), async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
    
//     if (!user) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }

//     // Prevent admin from deleting themselves
//     if (user._id.toString() === req.user.id) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Cannot delete your own account'
//       });
//     }

//     await User.findByIdAndDelete(req.params.id);

//     res.json({
//       status: 'success',
//       message: 'User deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error'
//     });
//   }
// });

// // @desc    Get user statistics (admin only)
// // @route   GET /api/user/stats/overview
// // @access  Private (Admin only)
// router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const activeUsers = await User.countDocuments({ isActive: true });
//     const adminUsers = await User.countDocuments({ role: 'admin' });
//     const recentUsers = await User.countDocuments({
//       createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
//     });

//     res.json({
//       status: 'success',
//       data: {
//         totalUsers,
//         activeUsers,
//         adminUsers,
//         recentUsers,
//         inactiveUsers: totalUsers - activeUsers
//       }
//     });
//   } catch (error) {
//     console.error('Get user stats error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Server error'
//     });
//   }
// });

// module.exports = router; 




const express = require('express');
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase'); 
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/user
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Supabase query for users from auth.users or a custom 'profiles' table
    // Note: To list all users from Supabase Auth, you usually need the Admin SDK
    const { data: users, error, count } = await supabase
      .from('profiles') // Assuming you have a profiles table linked to Auth
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    res.json({
      status: 'success',
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        total: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// @desc    Toggle user active status (admin only)
// @route   PUT /api/user/:id/status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    // 1. Get current status
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !user) return res.status(404).json({ status: 'error', message: 'User not found' });

    // 2. Toggle status
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ status: 'success', data: updatedUser });
  } catch (error) {
    console.error('Toggle status error:', error.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /api/user/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete your own account' });
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;