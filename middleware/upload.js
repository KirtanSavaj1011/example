// const multer = require('multer');
// const path = require('path');

// // Configure storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Save directly into Hostinger's public_html/uploads folder
//     cb(null, path.join(__dirname, '../uploads'));

//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });


// // File filter
// const fileFilter = (req, file, cb) => {
//   // Allow images only
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Not an image! Please upload an image.'), false);
//   }
// };

// // Configure upload
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   },
//   fileFilter: fileFilter
// });

// // Single file upload
// exports.uploadSingle = upload.single('image');

const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Switch to Memory Storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// New middleware to handle Supabase upload logic
exports.uploadToSupabase = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const fileName = `blog-${Date.now()}${path.extname(req.file.originalname)}`;
    
    const { data, error } = await supabase.storage
      .from('blog-images') // You must create this bucket in Supabase dashboard
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName);

    // This replaces the old local path with a permanent Supabase URL
    req.body.imageUrl = publicData.publicUrl; 
    next();
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Cloud upload failed' });
  }
};

exports.uploadSingle = upload.single('image');
// ... keep your handleUploadError logic ...
// Multiple files upload
exports.uploadMultiple = upload.array('images', 5);

// Error handling middleware
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: 'error',
        message: 'Too many files. Maximum is 5 files.'
      });
    }
  }
  
  if (err.message === 'Not an image! Please upload an image.') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
  
  next(err);
}; 