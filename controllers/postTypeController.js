const initController = require('./genericController');
const PostType = require('../models/postTypeModel');

const postTypeController = initController(PostType, "PostType", {}, ['slug', 'name']);

module.exports = postTypeController;
