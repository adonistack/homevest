const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applyToJSON = require('../middlewares/applyToJson');

const propertyTypeSchema = new Schema({
    name: { type: String, trim: true, unique: true },
    slug: { type: String, trim: true, unique: true },
    description: { type: String, trim: true },
    count: { type: Number, default: 0 },
    media: { type: Schema.Types.ObjectId, ref: 'Media' },
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

propertyTypeSchema.statics.updatePropertyTypeCounts = async function() {
    try {
        const propertyTypes = await this.find(); 

        for (const propertyType of propertyTypes) {
            const count = await mongoose.model('RealEstate').countDocuments({ propertyType: propertyType._id });
            await this.findByIdAndUpdate(propertyType._id, { count });
        }
    } catch (err) {
        console.error('Error updating property type counts:', err);
        throw err;
    }
};

propertyTypeSchema.pre('save', async function(next) {
    if (!this.isNew) {
        await this.constructor.updatePropertyTypeCounts();
    }
    next();
});

propertyTypeSchema.post('remove', async function() {
    await this.constructor.updatePropertyTypeCounts();
});

propertyTypeSchema.index({ slug: 1 }, { unique: true });
propertyTypeSchema.index({ name: 1 }, { unique: true });

applyToJSON(propertyTypeSchema);

module.exports = mongoose.model('PropertyType', propertyTypeSchema);
