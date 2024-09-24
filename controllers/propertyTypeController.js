const initController = require('./genericController');
const PropertyType = require('../models/propertyTypeModel');

const propertyTypeController = initController(
  PropertyType, 
  "PropertyType", 
  [], 
  ['slug', 'name'], 
  ['media', 'owner']
);

module.exports = propertyTypeController;
