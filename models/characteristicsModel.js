const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applyToJSON = require('../middlewares/applyToJson');


const characteristicSchema = new Schema({
    name: {type: String,},
    description: {type: String},
    slug: {type: String},
    media: {type: Schema.Types.ObjectId,ref: 'Media'},
    owner: {type: Schema.Types.ObjectId,ref: 'User',required: true},
}, { timestamps: true });

applyToJSON(characteristicSchema);
module.exports = mongoose.model('Characteristic', characteristicSchema);
