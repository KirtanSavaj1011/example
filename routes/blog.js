const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @desc    Get all blogs (public)
// @route   GET /api/blog
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { status: 'published' };
    
    if (req.query.category) query.category = req.query.category;
    if (req.query.author) query.author = req.query.author;
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(query);

    res.json({
      status: 'success',
      results: blogs.length,
      pagination: { page, totalPages: Math.ceil(total / limit), total },
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Get single blog
// @route   GET /api/blog/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar bio');
    if (!blog) return res.status(404).json({ status: 'error', message: 'Blog not found' });
    res.json({ status: 'success', data: blog });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;