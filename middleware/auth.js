// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Protect routes
// exports.protect = async (req, res, next) => {
//   console.log('Auth middleware - protect called');
//   console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//     console.log('Token found:', !!token);
//   } else {
//     console.log('No authorization header or invalid format');
//   }

//   if (!token) {
//     return res.status(401).json({
//       status: 'error',
//       message: 'Not authorized to access this route'
//     });
//   }

//   try {
//     console.log('Verifying token...');
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log('Token decoded successfully, user ID:', decoded.id);

//     console.log('Finding user in database...');
//     req.user = await User.findById(decoded.id);
//     console.log('User found:', !!req.user, 'Role:', req.user?.role);
    
//     next();
//   } catch (err) {
//     console.error('Auth middleware error:', err);
//     return res.status(401).json({
//       status: 'error',
//       message: 'Not authorized to access this route'
//     });
//   }
// };

// // Grant access to specific roles
// exports.authorize = (...roles) => {
//   return (req, res, next) => {
//     console.log('Auth middleware - authorize called');
//     console.log('Required roles:', roles);
//     console.log('User role:', req.user?.role);
//     console.log('User object:', req.user);
    
//     if (!req.user) {
//       console.log('No user found in request');
//       return res.status(403).json({
//         status: 'error',
//         message: 'User not found'
//       });
//     }
    
//     if (!roles.includes(req.user.role)) {
//       console.log('User role not authorized');
//       return res.status(403).json({
//         status: 'error',
//         message: `User role ${req.user.role} is not authorized to access this route`
//       });
//     }
    
//     console.log('User authorized successfully');
//     next();
//   };
// };

// // Optional auth - doesn't fail if no token
// exports.optionalAuth = async (req, res, next) => {
//   let token;

//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id);
//     } catch (err) {
//       // Token is invalid, but we don't fail the request
//       req.user = null;
//     }
//   }

//   next();
// }; 


const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Protect routes - Verify Supabase Session
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
  }

  try {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ status: 'error', message: 'Token is invalid or expired' });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Not authorized' });
  }
};

// Authorize roles (e.g., admin)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Supabase stores roles in user_metadata or you can check specific IDs
    const userRole = req.user.user_metadata.role || 'user'; 
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        status: 'error', 
        message: `User role ${userRole} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Optional Auth (for public routes that can show extra data if logged in)
exports.optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) req.user = user;
  }
  next();
};