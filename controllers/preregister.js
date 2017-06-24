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
      facialRecognition: crypto.createHash('sha256').update(crypto.randomBytes(64)).digest('hex'),
      photo: req.body.photo
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
              if (err) return next(new Error(err));
              console.log(body.photo);
              res.render('preregister', {
                title: 'Pre-Registration',
                step: 3,
                token: body.token,
                name: body.profile.name,
                city: body.profile.city,
                country: body.profile.country,
                photo: body.photo
              });
            }
          );
        }
      );
    }
  );
};

module.exports.finishRegister = (req, res, next) => {
  let person;
  let path = `/api/mongo/getId/${req.params.token}`;
  let requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response) => {
      person = JSON.parse(response.body);
      if (err) return next(new Error(err));
      path = '/api/eth/unlockAccount';
      requestOptions = {
        url: server + path,
        method: 'POST',
        form: {
          password: 'admin',
          address: '0xe0c612a0aff548ceef71f96d651c27707538daec'
        },
        json: true
      };
      request(
        requestOptions, (err, response) => {
          if (err) return next(new Error(err));
          path = '/api/eth/sendTransaction';
          requestOptions = {
            url: server + path,
            method: 'POST',
            form: {
              sender: '0xe0c612a0aff548ceef71f96d651c27707538daec',
              receiver: person.extra.accountAddress,
              amount: 5
            },
            json: true
          };
          request(
            requestOptions, (err, response) => {
              if (err) return next(new Error(err));
              path = '/api/eth/unlockAccount';
              requestOptions = {
                url: server + path,
                method: 'POST',
                form: {
                  password: person.password,
                  address: person.extra.accountAddress
                },
                json: true
              };
              request(
                requestOptions, (err, response) => {
                  if (err) return next(new Error(err));
                  path = `/api/eth/updatePerson/${req.params.token}`;
                  requestOptions = {
                    url: server + path,
                    method: 'POST',
                    form: {
                      personalDataHash: person.extra.profileHash,
                      bioHash: person.extra.bioHash,
                      address: person.extra.accountAddress
                    },
                    json: true
                  };
                  request(
                    requestOptions, (err, response) => {
                      if (err) return next(new Error(err));
                      res.redirect('/', 200, {
                        title: 'Home'
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};
