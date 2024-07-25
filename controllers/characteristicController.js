const initController = require('./genericController');

const Characteristics = require('../models/characteristicsModel');

const characteristicController = initController(Characteristics,  "Characteristics", {}, ['slug', 'name']);

module.exports = characteristicController