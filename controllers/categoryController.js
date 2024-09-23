const initController = require('./genericController');

const Category = require('../models/categoryModel');

const categoryController = initController(Category, 'Category', {}, ['slug', 'name'],
);

module.exports = categoryController;
