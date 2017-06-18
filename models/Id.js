const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');
const crypto = require('crypto');

const idSchema = new mongoose.Schema({
  fingerPrint: String,
  irisScan: String,
  facialRecognition: String,
  password: String,
  token: String,
  active: Boolean,

  profile: {
    name: String,
    gender: String,
    birthDay: Date,
    city: String,
    country: String,
    email: String
  },

  documents: {
    name: String,
    dateUploaded: Date,
    hash: String,
    validated: Boolean,
    docType: String
  },

  location: [{
    name: String,
    dateCreated: Date,
    latitude: Number,
    longitude: Number
  }],

  extra: {
    contractAddress: String,
    accountAddress: String,
    profileHash: String,
    bioHash: String
  }
}, {
  timestamps: true
});

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