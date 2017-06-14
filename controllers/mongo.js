const CONSTANTS = require('../constants');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ID = require('../models/Id');
const chrono = require('chrono-node')

const mongo = CONSTANTS.MONGO_SERVER + ':' + CONSTANTS.MONGO_PORT;

module.exports.createId = (req, res, next) => {
  const id = new ID({
    password: req.body.password,
    profile: {
      name: req.body.name,
      gender: req.body.gender,
      birthDay: chrono.parseDate(req.body.birthday),
      city: req.body.city,
      country: req.body.country,
      email: req.body.email
    }
  });
  id.generateToken();
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
      console.log(req.body);
      console.log(user);
      user.fingerPrint = !req.body.fingerPrint ? user.fingerPrint : req.body.fingerPrint;
      user.irisScan = !req.body.irisScan ? user.irisScan : req.body.irisScan;
      user.facialRecognition = !req.body.facialRecognition ? user.facialRecognition : req.body.facialRecognition;
      user.password = !req.body.password ? user.password : req.body.password;
      user.profile.name = !req.body.name ? user.profile.name : req.body.name;
      user.profile.gender = !req.body.gender ? user.profile.gender : req.body.gender;
      user.profile.birthDay = !req.body.birthDay ? user.profile.birthDay : req.body.birthDay;
      user.profile.city = !req.body.city ? user.profile.city : req.body.city;
      user.profile.country = !req.body.country ? user.profile.country : req.body.country;
      user.profile.email = !req.body.email ? user.profile.email : req.body.email;
      user.documents.picture = !req.body.picture ? user.documents.picture : req.body.picture;
      user.documents.passport = !req.body.passport ? user.documents.passport : req.body.passport;
      user.documents.idCard = !req.body.idCard ? user.documents.idCard : req.body.idCard;
      user.documents.birthCertificate = !req.body.birthCertificate ? user.documents.birthCertificate : req.body.birthCertificate;
      user.documents.proofOfResidence = !req.body.proofOfResidence ? user.documents.proofOfResidence : req.body.proofOfResidence;
      user.documents.drivingLicense = !req.body.drivingLicense ? user.documents.drivingLicense : req.body.drivingLicense;
      user.extra.contractAddress = !req.body.contractAddress ? user.extra.contractAddress : req.body.contractAddress;
      user.extra.accountAddress = !req.body.accountAddress ? user.extra.accountAddress : req.body.accountAddress;
      user.hashProfile();
      user.save((err, id) => {
        if (!err) res.json(id).end();
      });
    } else return next(new Error(err));
  });
};
