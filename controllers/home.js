const CONSTANTS = require('../constants');
const request = require('request');
const server = CONSTANTS.SERVER_URL;

/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('login', {
    title: 'Home'
  });
};

module.exports.loadDetails = (req, res) => {
  res.render('details', {
    title: 'Details',
    token: (req.params && req.params.token) ? req.params.token : ''
  });
};

module.exports.loadPending = (req, res) => {
  res.render('pending', {
    title: 'Pending'
  });
};

module.exports.loadSearch = (req, res, next) => {
  const path = '/api/mongo/getAll';
  const requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      res.render('search', {
        title: 'Search',
        tokens: JSON.parse(response.body).map(a => a.token)
      });
    }
  );
};
