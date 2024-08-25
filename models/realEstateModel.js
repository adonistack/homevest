const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applyToJSON = require('../middlewares/applyToJson');


const realEstateSchema = new Schema({
    title: { type: String },
    content: { type: String },
    description: { type: String },
    thumbnail: { type: String },
    slug: { type: String },
    location: { type: String },
    price: { type: Number },
    salePrice: { type: Number },
    bedrooms: { type: Number },
    area: { type: Number },
    yearBuilt: { type: Number },
    floor: { type: Schema.Types.Mixed }, 
    onSale: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
    characteristics: [{ _id: { type: Schema.Types.ObjectId, ref: 'Characteristic' }, value: Boolean }],
    propertyType: { type: Schema.Types.ObjectId, ref: 'PostType', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
   
}, 
{
    timestamps: true,
    
});

applyToJSON(realEstateSchema);

module.exports = mongoose.model('RealEstate', realEstateSchema);
