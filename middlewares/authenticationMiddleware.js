const jwt = require('jsonwebtoken');

// Middleware to authenticate users based on JWT token
const authenticate = (req, res, next) => {
  try {
    // Extract token from header or query params
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;
    if (!token) {
      console.log('Authentication token not provided');
      return res.status(401).json({ msg: 'Authentication token is required.' });
    }

    // Verify the token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Unauthorized: Invalid token.' });
  }
};

// Middleware to check if the user has the required roles
const checkRole = (roles) => (req, res, next) => {
  const userRoles = req.user?.roles || [];

  // Use Set for efficient role checking
  const hasRequiredRole = roles.some(role => new Set(userRoles).has(role));
  
  if (hasRequiredRole) {
    next();
  } else {
    console.log(`User does not have the required roles: ${roles}`);
    res.status(403).json({ msg: 'Forbidden: Insufficient privileges.' });
  }
};

// Middleware to authorize the owner or a user with specific roles
const authorizeOwnerOrRole = (Model, roles = []) => {
  return async (req, res, next) => {
    try {
      const item = await Model.findById(req.params._id);

      if (!item) {
        console.log(`Item not found: ${req.params._id}`);
        return res.status(404).json({ msg: 'Item not found' });
      }

      const itemOwnerId = item.owner ? item.owner.toString() : null;
      const userId = req.user?.id ? req.user.id.toString() : null;

      if (!itemOwnerId || !userId) {
        console.error('Authorization data is missing');
        return res.status(500).json({ msg: 'Authorization data is missing' });
      }

      const isOwner = itemOwnerId === userId;
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : []; // Ensure roles is an array

      // Ensure the roles passed to this middleware are also an array
      const validRoles = Array.isArray(roles) ? roles : [];

      const hasRole = validRoles.some(role => userRoles.includes(role));

      if (!isOwner && !hasRole) {
        console.log(`User is not authorized: User ID: ${userId}, Item Owner ID: ${itemOwnerId}`);
        return res.status(403).json({ msg: 'Forbidden' });
      }

      req.actionMadeBy = isOwner ? 'owner' : hasRole ? 'role' : 'unknown';
      next();
    } catch (error) {
      console.error('Authorization Error:', error.message);
      res.status(500).json({ msg: 'Internal error during authorization.', error: error.message });
    }
  };
};


module.exports = { authenticate, checkRole, authorizeOwnerOrRole };
