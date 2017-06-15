const CONSTANTS = require('../constants');
const request = require('request');
const crypto = require('crypto');
const server = CONSTANTS.SERVER_URL;

/**
 * Sign up render
 */
module.exports.getPreRegister = (req, res) => {
  res.render('preregister', {
    title: 'Pre-Registration',
    step: (req.params && req.params.step) ? req.params.step : 0,
    token: (req.params && req.params.token) ? req.params.token : ''
  });
};

module.exports.initId = (req, res, next) => {
  const path = '/api/mongo/createId';
  const requestOptions = {
    url: server + path,
    method: 'POST',
    form: req.body,
    json: true
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      res.render('preregister', {
        title: 'Pre-Registration',
        step: 1,
        token: body.token,
      });
    }
  );
};

module.exports.saveFaceRecon = (req, res, next) => {
  const path = '/api/mongo/updateId/' + req.body.token;
  const requestOptions = {
    url: server + path,
    method: 'POST',
    form: {
      irisScan: crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('hex'),
      facialRecognition: crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('hex')
    },
    json: true
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      res.render('preregister', {
        title: 'Pre-Registration',
        step: 2,
        token: req.body.token,
      });
    }
  );
};

module.exports.saveFingerprint = (req, res, next) => {
  const path = '/api/mongo/getId/' + req.body.token;
  const requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      const path = '/api/eth/newAccount';
      const requestOptions = {
        url: server + path,
        method: 'POST',
        form: {
          password: JSON.parse(response.body).password
        },
        json: true
      };
      request(
        requestOptions, (err, response, body) => {
          if (err) return next(new Error(err));
          const path = '/api/mongo/updateId/' + req.body.token;
          const requestOptions = {
            url: server + path,
            method: 'POST',
            form: {
              fingerPrint: crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('hex'),
              accountAddress: body
            },
            json: true
          };
          request(
            requestOptions, (err, response, body) => {
              if (err) return next(new Error(err));
              res.render('preregister', {
                title: 'Pre-Registration',
                step: 3,
                token: body.profile.token,
                name: body.profile.name,
                city: body.profile.city,
                country: body.profile.country
              });
            }
          );
        }
      );
    }
  );
};

module.exports.loadDetails = (req, res, next) => {
  res.render('details', {
    title: 'Details',
    token: (req.params && req.params.token) ? req.params.token : ''
  });
};

module.exports.loadPending = (req, res, next) => {
  res.render('pending', {
    title: 'Pending'
  });
};
