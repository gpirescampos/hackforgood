const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const crypto = require('crypto');

const idSchema = new mongoose.Schema({
  fingerPrint: { type: String, unique: true },
  irisScan: { type: String, unique: true },
  facialRecognition: { type: String, unique: true },
  password: String,
  token: String,

  profile: {
    name: String,
    gender: String,
    age: Number,
    birthDay: Date,
    city: String,
    country: String,
    idNumber: Number,
    email: { type: String, unique: true }
  },

  documents: {
    picture: String,
    passport: String,
    idCard: String,
    birthCertificate: String,
    proofOfResidence: String,
    drivingLicense: String
  },

  extra: {
    contractAddress: { type: String, unique: true },
    profileHash: { type: String, unique: true },
    bioHash: { type: String, unique: true }
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
idSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Hash full profile
 */
idSchema.methods.hashProfile = function hash() {
  const rand = crypto.randomBytes(64);
  const dataToHash = this.profile.name + this.profile.gender + this.profile.age.toString() + this.profile.birthDay.toString() + this.profile.city + this.profile.country + this.profile.idNumber.toString() + this.profile.email;
  const bioToHash = this.fingerPrint + this.irisScan + this.facialRecognition;
  this.extra.profileHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
  this.extra.bioHash = crypto.createHash('sha256').update(bioToHash).digest('hex');
  this.token = crypto.createHash('sha256').update(rand).digest('hex');
};

/**
 * Helper method for validating user's password.
 */
idSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const ID = mongoose.model('ID', idSchema);

module.exports = ID;
