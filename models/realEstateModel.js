const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const realEstateSchema = new Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
    },
    description: {
        type: String
    },
    price: {
        type: String,
    },
    location: {
        type: String,
    },
    thumbnail: {
        type: String
    },
    media: {
        type: Schema.Types.ObjectId,
        ref: 'Media'
        
    },
    slug: {
        type: String,
    },
    sqft: {
        type: Number,
    },
    bedrooms: {
        type: Number,
    },
    bathrooms: {
        type: Number,
    },
    garage: {
        type: Number
    },
    yearBuilt: {
        type: Number
    },
    propertyType: {type: Schema.Types.ObjectId, ref: 'PostType',required: true},
    category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
   
}, { timestamps: true });



module.exports = mongoose.model('RealEstate', realEstateSchema);
