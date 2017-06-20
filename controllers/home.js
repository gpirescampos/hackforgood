const CONSTANTS = require('../constants');
const request = require('request');
const fs = require('fs');
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

module.exports.loadDetails = (req, res, next) => {
  const path = `/api/mongo/getId/${req.params.token}`;
  const requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      res.render('details', {
        title: 'Details',
        token: JSON.parse(response.body).token,
        active: JSON.parse(response.body).active,
        details: JSON.parse(response.body).profile,
        documents: JSON.parse(response.body).documents,
        locations: JSON.parse(response.body).location
      });
    }
  );
};

module.exports.loadPending = (req, res, next) => {
  let pendingIds = [];
  let pendingDocs = [];
  let path = '/api/mongo/findPendingUsers';
  let requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      pendingIds = body;
      path = '/api/mongo/findPendingDocuments';
      requestOptions = {
        url: server + path,
        method: 'GET'
      };
      request(
        requestOptions, (err, response, body) => {
          if (err) return nex
          t(new Error(err));
          pendingDocs = body;
          res.render('pending', {
            title: 'Pending',
            ids: JSON.parse(pendingIds),
            docs: JSON.parse(pendingDocs)[0]
          });
        }
      );
    }
  );
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

module.exports.preview = (req, res, next) => {
  const path = `/api/ipfs/download/${req.params.hash}`;
  const requestOptions = {
    url: server + path,
    method: 'GET'
  };
  request(
    requestOptions, (err, response, body) => {
      if (err) return next(new Error(err));
      fs.writeFile(`public/downloads/file.${req.params.type}`, body, (err) => {
        if (err) throw err;
        res.redirect(`/downloads/file.${req.params.type}`);
      });
    }
  );
};
