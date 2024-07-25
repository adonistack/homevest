const initController = require('./genericController');

const Lead = require('../models/leadModel');

const leadController = initController(Lead,  "Lead", {}, ['slug', 'name']);

module.exports = leadController