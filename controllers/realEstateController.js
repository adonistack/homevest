const initController = require('./genericController');
const RealEstate = require('../models/realEstateModel');
const realEstateController = initController(RealEstate,  "RealEstate", {}, ['slug', 'name']);
module.exports = realEstateController