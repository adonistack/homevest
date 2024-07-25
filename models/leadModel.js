const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leadSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
}, {
    timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);