const initController = require('./genericController');

const Lead = require('../models/leadModel');

const leadController = initController(Lead,  "Lead", {}, ['slug', 'name'],
    ['realEstate', 'owner']
);

module.exports = leadController