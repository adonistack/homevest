const initController = require('./genericController');

const Plans = require('../models/plansModel');

const plansController = initController(Plans, 'Plans', {}, ['slug', 'name']);

module.exports = plansController;