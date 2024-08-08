const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postTypeSchema = new Schema({
    name: { type: String, trim: true, unique: true},
    slug: { type: String, trim: true, unique: true},
    description: { type: String, trim: true},
    media: { type: Schema.Types.ObjectId, ref: 'Media'},
    count: { type: Number, default: 0 },
    owner: { type: Schema.Types.ObjectId, ref: 'User',},
}, { timestamps: true });

postTypeSchema.statics.updateCount = async function(postTypeId) {
    const count = await mongoose.model('RealEstate').countDocuments({ postType: postTypeId });
    await this.findByIdAndUpdate(postTypeId, { count: count });
};


// Adding indexes for unique fields
postTypeSchema.index({ slug: 1 }, { unique: true });
postTypeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('PostType', postTypeSchema);
