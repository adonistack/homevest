const initController = require('./genericController');
const RealEstate = require('../models/realEstateModel');


const realEstateController = initController(RealEstate,  "RealEstate", {},
     ['slug', 'name'],
     ['media', 'owner', 'category', 'propertyType', 'characteristics.characteristic']);



module.exports = realEstateController