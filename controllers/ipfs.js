const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI('localhost', '5001', {
  protocol: 'http'
});

exports.uploadDocument = (req, res, next) => {
  let file;
  if (req.file) {
    ipfs.add(req.file.buffer, (err, result) => {
      if (err || !result) {
        return next(err);
      } else if (result.length === 1) {
        file = result[0];
        res.json(file).end();
      } else {
        return next(err);
      }
    });
  } else {
    return next();
  }
};
