/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const preController = require('./controllers/preregister');
const mongoController = require('./controllers/mongo');
const ipfsController = require('./controllers/ipfs');
const ethereumController = require('./controllers/ethereum');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/hackforgood');
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.locals.basedir = app.get('views');
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: 'mongodb://localhost/hackforgood',
    autoReconnect: true,
    clear_interval: 3600
  })
}));
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
      req.path === '/account') {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

const upload = multer({
  dest: '../uploads/',
});

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', homeController.index);
app.get('/details/:token', homeController.loadDetails);
app.get('/pending', homeController.loadPending);
app.get('/search', homeController.loadSearch);
app.get('/preview/:hash/:type', homeController.preview);
app.post('/validateId/:token', homeController.validateId);
app.post('/validateDocument/:hash/:token', homeController.validateDocument);
app.get('/preregister', preController.getPreRegister);
app.get('/preregister/:step/:token', preController.getPreRegister);
app.post('/finishRegister/:token', preController.finishRegister);
app.post('/initId', preController.initId);
app.post('/saveFaceRecon', preController.saveFaceRecon);
app.post('/saveFingerprint', preController.saveFingerprint);

/**
 * IPFS routes
 */
app.post('/api/ipfs/upload', upload.single('document'), ipfsController.uploadDocument);
app.get('/api/ipfs/download/:hash', ipfsController.downloadDocument);

/**
 * Ethereum routes
 */
app.post('/api/eth/newAccount', ethereumController.newAccount);
app.post('/api/eth/unlockAccount', ethereumController.unlockAccount);
app.post('/api/eth/sendTransaction', ethereumController.sendTransaction);
app.get('/api/eth/getPerson/:token', ethereumController.getPerson);
app.post('/api/eth/updatePerson/:token', ethereumController.updatePerson);

/**
 * Mongo routes
 */
app.post('/api/mongo/createId', mongoController.createId);
app.get('/api/mongo/getId/:token', mongoController.getId);
app.post('/api/mongo/updateId/:token', mongoController.updateId);
app.post('/api/mongo/addDocument/:token', mongoController.addDocument);
app.post('/api/mongo/addLocation/:token', mongoController.addLocation);
app.get('/api/mongo/getAll', mongoController.getAll);
app.get('/api/mongo/findPendingUsers', mongoController.findPendingUsers);
app.get('/api/mongo/findPendingDocuments', mongoController.findPendingDocuments);
app.post('/api/mongo/validateId/:token', mongoController.validateId);
app.post('/api/mongo/validateDocument/:hash/:token', mongoController.validateDocument);

/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
