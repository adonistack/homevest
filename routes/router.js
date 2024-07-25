const express = require('express');
const createCrudRoutes = require('./crudRoutes');
const router = express.Router();

const authRoutes = require('./authRoute');
const categoryController = require('../controllers/categoryController');
const realEstateController = require('../controllers/realEstateController');
const postTypeController = require('../controllers/postTypeController');
const mediaController = require('../controllers/mediaController');
const leadController = require('../controllers/leadController');
const characteristicController = require('../controllers/characteristicController');

router.use('/', authRoutes);
router.use('/categories', createCrudRoutes(categoryController));
router.use('/realEstates', createCrudRoutes(realEstateController));
router.use('/post-types', createCrudRoutes(postTypeController));
router.use('/media', createCrudRoutes(mediaController));
router.use('/leads', createCrudRoutes(leadController));
router.use('/characteristics', createCrudRoutes(characteristicController));




module.exports = router;
