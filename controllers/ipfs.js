const ipfsAPI = require('ipfs-api');
const crypto = require('crypto');

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

exports.uploadDocument = (req, res, next) => {
  let file;
  if (req.file) {
    ipfs.add(encrypt(req.file.buffer), (err, result) => {
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

exports.downloadDocument = (req, res, next) => {
  const fileHash = req.params.documentHash;
  let decrypt;
  ipfs.cat(fileHash, (err, result) => {
    if (!fileHash || err || !result) {
      return next(err);
    }
    if (result.readable) {
      decrypt = crypto.createDecipher(algorithm, password);
      res.setHeader('content-disposition', 'attachment; filename=document');
      result.pipe(decrypt).pipe(res);
    }
  });
};
