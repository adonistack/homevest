const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
  fileName: { type: String,  },
  mediaType: { type: String,  },
  altText: String,
  slug: { type: String, },
  url: { type: String,  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true,
});

mediaSchema.index({ url: 1 }, { unique: true });

module.exports = mongoose.model('Media', mediaSchema);
