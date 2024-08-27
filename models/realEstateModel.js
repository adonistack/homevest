const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applyToJSON = require('../middlewares/applyToJson');


const characteristicValueSchema = new Schema({
    characteristic: { type: Schema.Types.ObjectId, required: true, ref: 'Characteristic' },
    value: { type: Boolean, default: false }
}, { _id: false });

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
    characteristics: [characteristicValueSchema], 
    propertyType: { type: Schema.Types.ObjectId, ref: 'PropertyType', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
   
}, 
{
    timestamps: true,
    
});

applyToJSON(realEstateSchema);

module.exports = mongoose.model('RealEstate', realEstateSchema);
