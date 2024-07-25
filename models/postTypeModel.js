const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postTypeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
    },
    description: {
        type: String,
    },
    media: {
        type: Schema.Types.ObjectId,
        ref: 'Media'
    },
    count: {
        type: Number,
        default: 0
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
}, { timestamps: true });

postTypeSchema.statics.updateCount = async function(postTypeId) {
    const count = await mongoose.model('RealEstate').countDocuments({ postType: postTypeId });
    await this.findByIdAndUpdate(postTypeId, { count: count });
};

postTypeSchema.pre('save', function(next) {
  // Populate fields from uploaded file data
  if (this.isNew && this.data) {
    this.slug = this.slug || 'default_slug'; // Update with actual slug logic
    this.owner = this.owner || 'default_owner'; // Update with actual owner logic

  }
  next();
});

module.exports = mongoose.model('PostType', postTypeSchema);
