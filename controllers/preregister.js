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
  const path = `/api/mongo/updateId/${req.body.token}`;
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
    requestOptions, (err) => {
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
  const path = `/api/mongo/getId/${req.body.token}`;
  const requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response) => {
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
          const path = `/api/mongo/updateId/${req.body.token}`;
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
              console.log(body);
              if (err) return next(new Error(err));
              res.render('preregister', {
                title: 'Pre-Registration',
                step: 3,
                token: body.token,
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

module.exports.finishRegister = (req, res, next) => {
  const path = `/api/mongo/getId/${req.params.token}`;
  const requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response) => {
      if (err) return next(new Error(err));
      console.log(JSON.parse(response.body).extra.profileHash);
      console.log(JSON.parse(response.body).extra.bioHash);
      console.log(JSON.parse(response.body).extra.accountAddress);
      const path = `/api/eth/updatePerson/${req.params.token}`;
      const requestOptions = {
        url: server + path,
        method: 'POST',
        form: {
          personalDataHash: JSON.parse(response.body).extra.profileHash,
          bioHash: JSON.parse(response.body).extra.bioHash,
          address: JSON.parse(response.body).extra.accountAddress
        },
        json: true
      };
      request(
        requestOptions, (err, response) => {
          if (err) return next(new Error(err));
          console.log(response.body);
        }
      );
    }
  );
};
