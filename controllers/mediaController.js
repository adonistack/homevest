const initController = require('./genericController');

const Media = require('../models/mediaModel');

const mediaController = initController(Media,  "Media", {}, ['url', 'slug', 'fileName']);

module.exports = mediaController