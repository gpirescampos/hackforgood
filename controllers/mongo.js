const CONSTANTS = require('../constants');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ID = require('../models/Id');
const chrono = require('chrono-node')

const mongo = CONSTANTS.MONGO_SERVER + ':' + CONSTANTS.MONGO_PORT;

module.exports.createId = (req, res, next) => {
  const id = new ID({
    fingerPrint: req.body.fingerPrint,
    irisScan: req.body.irisScan,
    facialRecognition: req.body.facialRecognition,
    password: req.body.password,
    profile: {
      name: req.body.name,
      gender: req.body.gender,
      birthDay: chrono.parseDate(req.body.birthday),
      city: req.body.city,
      country: req.body.country,
      email: req.body.email
    },
    extra: {
      contractAddress: req.body.contractAddress
    }
  });
  id.hashProfile();
  id.save((err, data) => {
    if (err) {
      return next(new Error(err));
    }
    res.json(data).end();
  });
};

module.exports.getId = (req, res, next) => {
  ID.findOne({
    token: req.params.token
  }).select('')
  .exec((err, user) => {
    if (!err) res.json(user).end();
    else return next(new Error(err));
  });
};

module.exports.updateId = (req, res, next) => {
  ID.findOne({
    token: req.params.token
  }).select('')
  .exec((err, user) => {
    if (!err) {
      user.password = req.body.password ? req.body.password : user.extra.password;
      user.profile.name = req.body.name ? req.body.name : user.extra.name;
      user.profile.gender = req.body.gender ? req.body.gender : user.extra.gender;
      user.profile.birthDay = req.body.birthDay ? req.body.birthDay : user.extra.birthDay;
      user.profile.city = req.body.city ? req.body.city : user.extra.city;
      user.profile.country = req.body.country ? req.body.country : user.extra.country;
      user.profile.email = req.body.email ? req.body.email : user.extra.email;
      user.documents.picture = req.body.picture ? req.body.picture : user.extra.picture;
      user.documents.passport = req.body.passport ? req.body.passport : user.extra.passport;
      user.documents.idCard = req.body.idCard ? req.body.idCard : user.extra.idCard;
      user.documents.birthCertificate = req.body.birthCertificate ? req.body.birthCertificate : user.extra.birthCertificate;
      user.documents.proofOfResidence = req.body.proofOfResidence ? req.body.proofOfResidence : user.extra.proofOfResidence;
      user.documents.drivingLicense = req.body.drivingLicense ? req.body.drivingLicense : user.extra.drivingLicense;
      user.extra.contractAddress = req.body.contractAddress ? req.body.contractAddress : user.extra.contractAddress;
      user.save((err, id) => {
        if (!err) res.json(id).end();
      });
    } else return next(new Error(err));
  });
};