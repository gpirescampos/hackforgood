const CONSTANTS = require('../constants');
const mongoose = require('mongoose');
const crypto = require('crypto');
const ID = require('../models/Id');
const chrono = require('chrono-node');

const mongo = `${CONSTANTS.MONGO_SERVER}:${CONSTANTS.MONGO_PORT}`;

module.exports.createId = (req, res, next) => {
  const id = new ID({
    password: req.body.password,
    active: false,
    profile: {
      name: req.body.name,
      gender: req.body.gender,
      birthDay: chrono.parseDate(req.body.birthDay),
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
  }).lean()
  .exec((err, user) => {
    if (!err) res.json(user).end();
    else return next(new Error(err));
  });
};

module.exports.getAll = (req, res, next) => {
  ID.find({}).lean()
  .exec((err, users) => {
    if (!err) res.json(users).end();
    else return next(new Error(err));
  });
};

module.exports.updateId = (req, res, next) => {
  ID.findOne({
    token: req.params.token
  }).select('')
  .exec((err, user) => {
    if (!err) {
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
      user.extra.contractAddress = !req.body.contractAddress ? user.extra.contractAddress : req.body.contractAddress;
      user.extra.accountAddress = !req.body.accountAddress ? user.extra.accountAddress : req.body.accountAddress;
      user.hashProfile();
      user.save((err, id) => {
        if (!err) res.json(id).end();
        else return next(new Error(err));
      });
    } else return next(new Error(err));
  });
};

module.exports.addDocument = (req, res, next) => {
  const doc = {
    name: req.body.name,
    dateUploaded: Date.now(),
    hash: req.body.hash,
    validated: false,
    docType: req.body.type,
    userToken: req.params.token
  };
  console.log(doc);
  ID.update({ token: req.params.token },
    { $push: { documents: doc } },
    { upsert: true }, (err, data) => {
      if (!err) res.json(data).end();
      else return next(new Error(err));
    });
};

module.exports.validateDocument = (req, res, next) => {
  ID.update(
    { token: req.params.token, 'documents.hash': req.params.hash },
    { $set: {
      'documents.$.validated': true
    } },
    function(err, id) {
      if (!err) res.json(id).end();
      else return next(new Error(err));
    }
  );
};

module.exports.validateId = (req, res, next) => {
  ID.findOne({
    token: req.params.token
  }).select('')
  .exec((err, user) => {
    user.active = true;
    user.save((err, id) => {
      if (!err) res.json(id).end();
      else return next(new Error(err));
    });
  });
};

module.exports.addLocation = (req, res, next) => {
  ID.findOne({
    token: req.params.token
  }).select('')
  .exec((err, user) => {
    if (!err) {
      user.location.push(new mongoose.Schema({
        name: req.body.name,
        dateCreated: Date.now(),
        latitude: req.body.latitude,
        longitude: req.body.longitude
      }));
      user.save((err, id) => {
        if (!err) res.json(id).end();
        else return next(new Error(err));
      });
    } else return next(new Error(err));
  });
};

module.exports.findPendingUsers = (req, res, next) => {
  ID.find({
    active: false
  }).select('')
  .exec((err, user) => {
    if (!err) res.json(user).end();
    else return next(new Error(err));
  });
};

module.exports.findPendingDocuments = (req, res, next) => {
  let docs = [];
  ID.find(
    { 'documents.validated': 'false' }
  ).select('').exec((err, users) => {
    if (err) return next(new Error(err));
    else {
      for (const user of users) {
        docs.push(user.documents);
      }
      res.json(docs).end();
    }
  });
};
