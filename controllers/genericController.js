const { validationResult } = require('express-validator');
const { dynamicUpload } = require('../middlewares/uploadFilesMiddleware');
const { authenticate, authorizeOwnerOrRole } = require('../middlewares/authenticationMiddleware');

const initController = (Model, modelName, customMethods = [], uniqueFields = []) => {

  const validateRequest = (validations) => {
    return async (req, res, next) => {
      await Promise.all(validations.map(validation => validation.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    };
  };

  const checkUniqueFields = (uniqueFields, Model, modelName, isUpdate = false) => async (req, res, next) => {
    try {
      for (const field of uniqueFields) {
        if (req.body[field]) {
          const query = { [field]: req.body[field] };
          
          if (isUpdate && req.params._id) {
            query._id = { $ne: req.params._id };
          }

          const existingItem = await Model.findOne(query);
          if (existingItem) {
            return res.status(400).json({
              message: `${modelName} with this ${field} already exists`,
            });
          }
        }
      }
      next();
    } catch (error) {
      res.status(500).json({
        message: `Failed to check unique fields for ${modelName}`,
        error: error.message,
      });
    }
  };

  const createOrUpdateLinkedObjects = async (linkedObjects, Model) => {
    const result = {};

    for (const [key, value] of Object.entries(linkedObjects)) {
      if (Array.isArray(value)) {
        result[key] = await Promise.all(value.map(async (item) => {
          if (item) {
            if (item._id) {
              return item._id;
            } else {
              const existingItem = await Model.findOne({ fileName: item.fileName });
              if (existingItem) {
                return existingItem._id;
              } else {
                const newItem = new Model(item);
                await newItem.save();
                return newItem._id;
              }
            }
          }
          return '';
        }));
      } else {
        if (value) {
          if (value._id) {
            result[key] = value._id;
          } else {
            const existingItem = await Model.findOne({ fileName: value.fileName });
            if (existingItem) {
              result[key] = existingItem._id;
            } else {
              const newItem = new Model(value);
              await newItem.save();
              result[key] = newItem._id;
            }
          }
        } else {
          result[key] = '';
        }
      }
    }

    return result;
  };

  return {
    createItem: [
      authenticate,
      dynamicUpload,
      validateRequest([]),
      checkUniqueFields(uniqueFields, Model, modelName),
      async (req, res) => {
        try {
          const owner = req.user ? req.user.id : null;
          
          const linkedObjects = {};
          for (const [key, value] of Object.entries(req.body)) {
            if (key.startsWith('linkedObject_')) {
              linkedObjects[key] = value;
            }
          }

          const linkedObjectIds = await createOrUpdateLinkedObjects(linkedObjects, Model);
          const itemData = { ...req.body, ...linkedObjectIds, owner };

          if (req.media) {
            itemData.media = req.media._id;
          }

          const item = await Model.create(itemData);

          res.status(201).json({
            message: `${modelName} created successfully`,
            data: item.toJSON(),
          });
        } catch (error) {
          res.status(500).json({
            message: `Error creating ${modelName}`,
            error: error.message,
          });
        }
      }
    ],

    createManyItems: [
      authenticate,
      dynamicUpload,
      validateRequest([]),
      checkUniqueFields(uniqueFields, Model, modelName),
      async (req, res) => {
        const owner = req.user ? req.user.id : null;
    
        try {
          const items = [];
          for (const itemData of req.body.items) {
            const linkedObjects = {};
            for (const [key, value] of Object.entries(itemData)) {
              if (key.startsWith('linkedObject_')) {
                linkedObjects[key] = value;
              }
            }
    
            const linkedObjectIds = await createOrUpdateLinkedObjects(linkedObjects, Model);
            const finalItemData = { ...itemData, ...linkedObjectIds, owner };
    
            if (req.media) {
              finalItemData.media = req.media._id;
            }
    
            const item = await Model.create(finalItemData);
            items.push(item);
          }
    
          res.status(201).json({
            message: `${modelName}s created successfully`,
            data: items.map(item => item.toJSON()),
          });
        } catch (error) {
          res.status(500).json({
            message: `Error creating ${modelName}s`,
            error: error.message,
          });
        }
      }
    ],
    
    getItems: [
  async (req, res) => {
    const { page = 1, limit = 10, ...filters } = req.query;
    try {
      const query = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'keyword') {
          query.name = { $regex: value, $options: 'i' };
        } else if (value.includes(',')) {
          query[key] = { $in: value.split(',').map(val => val.trim()) };
        } else {
          if (isNaN(value)) {
            query[key] = { $regex: value, $options: 'i' };
          } else {
            query[key] = value; 
          }
        }
      });
      const items = await Model.find(query)
        .populate('media')
        .skip((page - 1) * limit)
        .limit(Number(limit));
      const total = await Model.countDocuments(query);
      res.status(200).json({ items, total });
    } catch (error) {
      res.status(500).json({ message: `Failed to retrieve ${modelName}s`, error: error.message });
    }
  }
],
    getItem:[ 
      async (req, res) => {
      try {
        const item = await Model.findById(req.params._id).populate('media');
        if (!item) {
          return res.status(404).json({ message: `${modelName} not found` });
        }
        res.status(200).json(item);
      } catch (error) {
        res.status(500).json({ message: `Failed to retrieve ${modelName}`, error: error.message });
      }
    }],

    getItemBySlug: [
      async (req, res) => {
      try {
        const item = await Model.findOne({ slug: req.params.slug }).populate('media');
        if (!item) {
          return res.status(404).json({ message: `${modelName} not found` });
        }
        res.status(200).json(item);
      } catch (error) {
        res.status(500).json({ message: `Failed to retrieve ${modelName} by slug`, error: error.message });
      }
    }],

    updateItem: [
      authenticate,
      authorizeOwnerOrRole(Model, ['admin']),
      dynamicUpload,
      validateRequest([]),
      checkUniqueFields(uniqueFields, Model, modelName, true),
      async (req, res) => {
        try {
          const linkedObjects = {};
          for (const [key, value] of Object.entries(req.body)) {
            if (key.startsWith('linkedObject_')) {
              linkedObjects[key] = value;
            }
          }
          const linkedObjectIds = await createOrUpdateLinkedObjects(linkedObjects, Model);
          const itemData = { ...req.body, ...linkedObjectIds };
          if (req.media) {
            itemData.media = req.media._id;
          }
          const item = await Model.findByIdAndUpdate(req.params._id, itemData, { new: true });
          if (!item) {
            return res.status(404).json({ message: `${modelName} not found` });
          }
          res.status(200).json({
            message: `${modelName} updated successfully`,
            data: item.toJSON(),
          });
        } catch (error) {
          res.status(500).json({
            message: `Error updating ${modelName}`,
            error: error.message,
          });
        }
      }
    ],

    updateManyItems: [
      authenticate,
      authorizeOwnerOrRole(Model, ['admin']),
      dynamicUpload,
      validateRequest([]),
      checkUniqueFields(uniqueFields, Model, modelName),
      async (req, res) => {
        const { updates } = req.body;
        try {
          const updatedItems = [];
          for (const update of updates) {
            const linkedObjects = {};
            for (const [key, value] of Object.entries(update.data)) {
              if (key.startsWith('linkedObject_')) {
                linkedObjects[key] = value;
              }
            }

            const linkedObjectIds = await createOrUpdateLinkedObjects(linkedObjects, Model);
            const itemData = { ...update.data, ...linkedObjectIds };
            
            if (req.media) {
              itemData.media = req.media._id;
            }

            const item = await Model.findByIdAndUpdate(update._id, itemData, { new: true });
            if (item) {
              updatedItems.push(item);
            }
          }

          res.status(200).json({
            message: `${modelName}s updated successfully`,
            data: updatedItems,
          });
        } catch (error) {
          res.status(500).json({
            message: `Error updating ${modelName}s`,
            error: error.message,
          });
        }
      }
    ],

    deleteItem: [
      authenticate,
      authorizeOwnerOrRole(Model, ['admin']),
      async (req, res) => {
        try {
          const item = await Model.findByIdAndDelete(req.params._id);
          if (!item) {
            return res.status(404).json({ message: `${modelName} not found` });
          }
          res.status(200).json({
            message: `${modelName} deleted successfully`,
            deletedBy: req.user ? req.user.id : null,
          });
        } catch (error) {
          res.status(500).json({ message: `Failed to delete ${modelName}`, error: error.message });
        }
      }
    ],

    deleteManyItems: [
      authenticate,
      authorizeOwnerOrRole(Model, ['admin']),
      async (req, res) => {
        const { ids } = req.body;
        try {
          const deleteResults = await Model.deleteMany({ _id: { $in: ids } });
          if (deleteResults.deletedCount === 0) {
            return res.status(404).json({ message: `No ${modelName}s found to delete` });
          }
          
          res.status(200).json({
            message: `${modelName}s deleted successfully`,
            deletedBy: req.user ? req.user.id : null,
          });
        } catch (error) {
          res.status(500).json({
            message: `Failed to delete ${modelName}s`,
            error: error.message,
          });
        }
      }
    ],

    ...customMethods
  };
};

module.exports = initController;
