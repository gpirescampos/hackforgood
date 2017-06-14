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
    birthDay: Date,
    city: String,
    country: String,
    email: String
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
    accountAddress: { type: String, unique: true },
    profileHash: { type: String, unique: true },
    bioHash: { type: String, unique: true }
  }
}, { timestamps: true });

/**
 * Hash full profile
 */
idSchema.methods.hashProfile = function hash() {
  if (this.profile.name && this.profile.gender && this.profile.birthDay && this.profile.city && this.profile.country && this.profile.email && this.fingerPrint && this.irisScan && this.facialRecognition) {
    const dataToHash = this.profile.name + this.profile.gender + this.profile.birthDay.toString() + this.profile.city + this.profile.country + this.profile.email;
    const bioToHash = this.fingerPrint + this.irisScan + this.facialRecognition;
    this.extra.profileHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    this.extra.bioHash = crypto.createHash('sha256').update(bioToHash).digest('hex');
  }
};

/**
 * Generate token
 */
idSchema.methods.generateToken = function hash() {
  const rand = crypto.randomBytes(64);
  this.token = crypto.createHash('sha256').update(rand).digest('hex');
};

const ID = mongoose.model('ID', idSchema);

module.exports = ID;
