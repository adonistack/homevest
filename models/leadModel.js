const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applyToJSON = require('../middlewares/applyToJson');

const leadSchema = new Schema({
    name: {type: String,required: true},
    email: {type: String,required: true},
    phone: {type: String,required: true},
    message: {type: String,required: true,trim: true,},
    realEstate: {type: Schema.Types.ObjectId,ref: 'RealEstate'},
    owner: {type: Schema.Types.ObjectId,ref: 'User',required: true},

}, {
    timestamps: true
});

applyToJSON(leadSchema);
module.exports = mongoose.model('Lead', leadSchema);