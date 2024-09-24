const initController = require('./genericController');

const Category = require('../models/categoryModel');

const categoryController = initController(Category, 'Category', {}, ['slug', 'name'],
    ['media', 'owner' ]
);

module.exports = categoryController;
