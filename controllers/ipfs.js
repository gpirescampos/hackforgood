const ipfsAPI = require('ipfs-api');
const crypto = require('crypto');
const fs = require('fs');

const ipfs = ipfsAPI('localhost', '5001', {
  protocol: 'http'
});
const algorithm = 'aes-256-ctr';
const password = 'b73da1d54bf64f169e57cb7b71014803';

const encrypt = (buffer) => {
  let cipher;
  let crypted;
  try {
    cipher = crypto.createCipher(algorithm, password);
    crypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return crypted;
  } catch (ex) {
    return ex;
  }
};

module.exports.uploadDocument = (req, res, next) => {
  let file;
  if (req.file.path) {
    fs.readFile(req.file.path, (err, data) => {
      if (err) return next(new Error(err));
      ipfs.add(encrypt(data), (err, result) => {
        if (err || !result) {
          return next(new Error(err));
        } else if (result.length === 1) {
          file = result[0];
          res.json(file).end();
        }
      });
    });
  } else {
    return next(new Error('No file provided'));
  }
};

module.exports.downloadDocument = (req, res, next) => {
  const fileHash = req.params.hash;
  let decrypt;
  ipfs.cat(fileHash, (err, result) => {
    if (!fileHash || fileHash.length === 0) {
      return next(new Error('No hash provided'));
    } else if (err) {
      return next(new Error(err));
    } else if (!result) {
      return next(new Error('Empty response'));
    } else if (result.readable) {
      decrypt = crypto.createDecipher(algorithm, password);
      res.setHeader('content-disposition', 'attachment; filename=document');
      result.pipe(decrypt).pipe(res);
    } else {
      return next(new Error('Unknown error'));
    }
  });
};