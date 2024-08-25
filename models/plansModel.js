const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const applyToJSON = require('../middlewares/applyToJson');

const featureSchema = new Schema({
    featureName: { type: String, required: true },
    featureDescription: { type: String },
    featureLimit: { type: Number, default: null },
}, { _id: false });

const plansSchema = new Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    features: [featureSchema],
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], required: true },
    count: { type: Number, default: 0 },
}, {
    timestamps: true,
});

plansSchema.methods.getFormattedFeatures = function() {
    return this.features.map(feature => ({
        name: feature.featureName,
        description: feature.featureDescription || 'No description',
        limit: feature.featureLimit !== null ? `${feature.featureLimit}` : 'Unlimited',
    }));
};

plansSchema.statics.updatePlanCounts = async function() {
    try {
        const Plans = this;
        const User = mongoose.model('User');

        const planCounts = await User.aggregate([
            { $group: { _id: '$plan', count: { $sum: 1 } } }
        ]);

        for (const { _id, count } of planCounts) {
            await Plans.findByIdAndUpdate(_id, { count }, { new: true });
        }

        await Plans.updateMany({ _id: { $nin: planCounts.map(pc => pc._id) } }, { count: 0 });
    } catch (err) {
        console.error('Error updating plan counts:', err);
        throw err;
    }
};

plansSchema.pre('save', async function(next) {
    if (!this.isNew) {
        await this.constructor.updatePlanCounts();
    }
    next();
});

plansSchema.post('remove', async function() {
    await this.constructor.updatePlanCounts();
});

applyToJSON(plansSchema);

module.exports = mongoose.model('Plans', plansSchema);
