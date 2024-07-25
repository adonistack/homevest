const { body, validationResult } = require('express-validator');
const { handleFileUpload, dynamicUpload } = require('../middlewares/uploadFilesMiddleware');
const { authenticate, authorizeOwnerOrAdmin } = require('../middlewares/authenticationMiddleware');

const initController = (Model, modelName, customMethods = [], uniqueFields = []) => {

  const validateRequest = (validations) => {
    return async (req, res, next) => {
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.badRequest(errors.array().map(err => ({ field: err.param, message: err.msg })));
      }
      next();
    };
  };

  const checkUniqueFields = async (req, res, next) => {
    try {
      for (const field of uniqueFields) {
        if (req.body[field]) {
          const query = { [field]: req.body[field] };
          const existingItem = await Model.findOne(query);
          if (existingItem) {
            return res.badRequest({ message: `${modelName} with this ${field} already exists` });
          }
        }
      }
      next();
    } catch (error) {
      res.internalServerError({ message: `Failed to check unique fields for ${modelName}`, error: error.message });
    }
  };

  const authenticateAndAuthorize = (req, res, next) => {
    authenticate(req, res, () => {
      authorizeOwnerOrAdmin(Model)(req, res, next);
    });
  };

  return {
    createItem: [
      authenticate,
      dynamicUpload,
      handleFileUpload,
      validateRequest([
        body('name').isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
        body('slug').optional().isString().trim().notEmpty().withMessage('Slug must be a non-empty string'),
      ]),
      checkUniqueFields,
      async (req, res) => {
        try {
          if (!req.body.owner) {
            req.body.owner = req.user.id;
          }
          let item = await Model.create(req.body);
          item = await item.populate('media');
          res.created(item, `${modelName} created successfully`);
        } catch (error) {
          res.internalServerError({ message: `Failed to create ${modelName}`, error: error.message });
        }
      }
    ],

    createManyItems: [
      dynamicUpload,
      handleFileUpload,
      validateRequest([
        body('items').isArray().withMessage('Items must be an array'),
        body('items.*.name').isString().trim().notEmpty().withMessage('Each item name must be a non-empty string'),
        body('items.*.slug').optional().isString().trim().notEmpty().withMessage('Each item slug must be a non-empty string'),
      ]),
      checkUniqueFields,
      async (req, res) => {
        try {
          if (!req.body.owner) {
            req.body.owner = req.user.id;
          }
          const items = await Model.insertMany(req.body.items);
          const populatedItems = await Promise.all(items.map(item => item.populate('media')));
          res.created({ message: `${modelName}s created successfully`, data: populatedItems });
        } catch (error) {
          res.internalServerError({ message: `Failed to create ${modelName}s`, error: error.message });
        }
      }
    ],

    getItems: async (req, res) => {
      const { page = 1, limit = 10 } = req.query;
      try {
        const items = await Model.find()
          .populate('media')
          .skip((page - 1) * limit)
          .limit(Number(limit));
        const total = await Model.countDocuments();
        res.status(200).json({ items, total });
      } catch (error) {
        res.internalServerError({ message: `Failed to retrieve ${modelName}s`, error: error.message });
      }
    },

    getItem: async (req, res) => {
      try {
        const item = await Model.findById(req.params._id).populate('media');
        if (!item) {
          return res.notFound({ message: `${modelName} not found` });
        }
        res.success(item);
      } catch (error) {
        res.internalServerError({ message: `Failed to retrieve ${modelName}`, error: error.message });
      }
    },

    getItemBySlug: async (req, res) => {
      try {
        const item = await Model.findOne({ slug: req.params.slug }).populate('media');
        if (!item) {
          return res.notFound({ message: `${modelName} not found` });
        }
        res.success(item);
      } catch (error) {
        res.internalServerError({ message: `Failed to retrieve ${modelName}`, error: error.message });
      }
    },

    updateItem: [
      authenticateAndAuthorize,
      dynamicUpload,
      handleFileUpload,
      validateRequest([
        body('name').optional().isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
        body('slug').optional().isString().trim().notEmpty().withMessage('Slug must be a non-empty string'),
      ]),
      async (req, res) => {
        try {
          const item = await Model.findByIdAndUpdate(req.params._id, req.body, { new: true }).populate('media');
          if (!item) {
            return res.notFound({ message: `${modelName} not found` });
          }
          res.success({ message: `${modelName} updated successfully`, data: item });
        } catch (error) {
          res.internalServerError({ message: `Failed to update ${modelName}`, error: error.message });
        }
      }
    ],

    updateManyItems: [
      authenticateAndAuthorize,
      dynamicUpload,
      handleFileUpload,
      validateRequest([
        body('items').isArray().withMessage('Items must be an array'),
        body('items.*._id').isMongoId().withMessage('Each item must have a valid ID'),
        body('items.*.name').optional().isString().trim().notEmpty().withMessage('Each item name must be a non-empty string'),
        body('items.*.slug').optional().isString().trim().notEmpty().withMessage('Each item slug must be a non-empty string'),
      ]),
      async (req, res) => {
        try {
          const items = await Promise.all(req.body.items.map(async item => {
            return await Model.findByIdAndUpdate(item._id, item, { new: true }).populate('media');
          }));
          res.success({ message: `${modelName}s updated successfully`, data: items });
        } catch (error) {
          res.internalServerError({ message: `Failed to update ${modelName}s`, error: error.message });
        }
      }
    ],

    deleteItem: [
      authenticateAndAuthorize,
      async (req, res) => {
        try {
          const item = await Model.findByIdAndDelete(req.params._id);
          if (!item) {
            return res.notFound({ message: `${modelName} not found` });
          }
          res.success({ message: `${modelName} deleted successfully` });
        } catch (error) {
          res.internalServerError({ message: `Failed to delete ${modelName}`, error: error.message });
        }
      }
    ],

    deleteManyItems: [
      authenticateAndAuthorize,
      async (req, res) => {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
          return res.badRequest({ message: 'Invalid or empty IDs array' });
        }
        try {
          const result = await Model.deleteMany({ _id: { $in: ids } });
          res.success({ message: `${result.deletedCount} ${modelName}s deleted successfully` });
        } catch (error) {
          res.internalServerError({ message: `Failed to delete ${modelName}s`, error: error.message });
        }
      }
    ],

    ...customMethods
  };
};

module.exports = initController;
