const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log('Authentication token not provided');
    return res.status(401).json({ msg: 'Please authenticate.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Unauthorized' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    if (roles.some(role => userRoles.includes(role))) {
      next();
    } else {
      console.log(`User does not have required roles: ${roles}`);
      res.status(403).json({ msg: 'Forbidden' });
    }
  };
};

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
      const userRoles = req.user.roles || [];
      const hasRole = roles.some(role => userRoles.includes(role));

      if (!isOwner && !hasRole) {
        console.log(`User is not authorized: User ID: ${userId}, Item Owner ID: ${itemOwnerId}`);
        return res.status(403).json({ msg: 'Forbidden' });
      }

      req.actionMadeBy = isOwner ? 'owner' : hasRole ? 'role' : 'unknown';
      next();
    } catch (error) {
      console.error('Authorization Error:', error.message);
      res.status(500).json({ msg: 'Something went wrong' });
    }
  };
};

module.exports = { authenticate, checkRole, authorizeOwnerOrRole };
