const CONSTANTS = require('../constants');
const mongoose = require('mongoose');
const ID = require('../models/Id');
const chrono = require('chrono-node')

const mongo = CONSTANTS.MONGO_SERVER + ':' + CONSTANTS.MONGO_PORT;

module.exports.createId = (req, res, next) => {
  console.log(req.body);
  const id = new ID({
    fingerPrint: req.body.fingerPrint,
    irisScan: req.body.irisScan,
    facialRecognition: req.body.facialRecognition,
    password: req.body.password,
    profile: {
      name: req.body.name,
      gender: req.body.gender,
      age: req.body.age,
      birthDay: chrono.parseDate(req.body.birthday),
      city: req.body.city,
      country: req.body.country,
      idNumber: req.body.idNumber,
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