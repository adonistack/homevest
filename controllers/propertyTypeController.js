const initController = require('./genericController');
const PropertyType = require('../models/propertyTypeModel');

const propertyTypeController = initController(PropertyType, "PropertyType", {}, ['slug', 'name']);

module.exports = propertyTypeController;
