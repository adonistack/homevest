const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    media: [{
        type: Schema.Types.ObjectId,
        ref: 'Media'
        
    }],
    slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
   
description: {
        type: String,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    }, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);