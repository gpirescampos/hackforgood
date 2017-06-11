const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const idSchema = new mongoose.Schema({
  fingerPrint: { type: String, unique: true },
  irisScan: { type: String, unique: true },
  facialRecognition: { type: String, unique: true },
  password: String,
  id: String,

  profile: {
    name: String,
    gender: String,
    age: Number,
    birthDay: Date,
    city: String,
    country: String,
    idNumber: Number
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
