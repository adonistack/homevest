const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const applyToJSON = require('../middlewares/applyToJson');

const userSchema = new Schema({
  userName: {type: String, required: true},
  email: {type: String,required: true,unique: true},
  phone: {type: String,},
  roles: [{ type: String, enum: ['vendor', 'user', 'admin'], default: 'user'}],
  password: {type: String,required: true},
  about: {type: String,default: '',},
  location: {type: String,default: '',},
  preferredHours: [{day: {type: String,enum: [ 'ראשון','שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],},
    startTime: {type: String, },
    endTime: {type: String, }}],
  isAdmin: {type: Boolean,default: false},
  profilePicture: {type: Schema.Types.ObjectId,ref: 'Media'},
  plan: {type: Schema.Types.ObjectId, ref: 'Plans'},

}, { timestamps: true });


const isDevelopment = process.env.NODE_ENV === 'development';

userSchema.pre('save', function(next) {
  if (this.isAdmin) {
    if (!isDevelopment) {
      const error = new Error('Creating admin users is not allowed in production mode');
      return next(error);
    }

    if (!this.roles.includes('admin')) {
      this.roles.push('admin');
    }
  } else if (this.roles.includes('admin') && !isDevelopment) {
    const error = new Error('Creating admin users is not allowed in production mode');
    return next(error);
  }

  next();
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Method for comparing passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};


applyToJSON(userSchema);

module.exports = mongoose.model('User', userSchema);
