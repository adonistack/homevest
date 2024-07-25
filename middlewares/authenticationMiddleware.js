const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.unauthorized('Please authenticate.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.unauthorized();
  }
};

const authorizeOwnerOrAdmin = (Model) => {
  return async (req, res, next) => {
    try {
      const item = await Model.findById(req.params._id);
      if (!item) {
        return res.notFound('Item not found');
      }

      if (item.owner.toString() !== req.user.id && !req.user.isAdmin) {
        return res.forbidden('Access Denied: You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      console.error('Authorization Error:', error.message);
      res.internalServerError('Something went wrong');
    }
  };
};

module.exports = { authenticate, authorizeOwnerOrAdmin };
