const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  url: {
    type: String,
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    trim: true,
    unique: true,
  },
  fileName: {
    type: String,
    trim: true,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'voice', 'file'],
    lowercase: true,
  },
  altText: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
}, { timestamps: true });

mediaSchema.pre('save', function(next) {
  // Populate fields from uploaded file data
  if (this.isNew && this.data) {
    this.url = this.url || 'default_url'; // Update with actual URL logic
    this.owner = this.owner || 'default_owner'; // Update with actual owner logic
    this.slug = this.slug || 'default_slug'; // Update with actual slug logic
    this.fileName = this.fileName || 'default_filename'; // Update with actual filename logic
    this.mediaType = this.mediaType || 'image'; // Update with actual media type logic
    this.altText = this.altText || 'default_alt_text'; // Update with actual alt text logic
  }
  next();
});


module.exports = mongoose.model('Media', mediaSchema);
