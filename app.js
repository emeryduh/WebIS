/**

SSL CERT NOTES
It should be mentioned that the SSL certs used in this project are not secured
for obvious reasons.  If you wish to implement a website that provide OpenSSL
certs you need to generate your own, private certs.  DO NOT store these in a manner
for public acccess.  In any case, this is for a prototype.  Public knowledge
of the certificates is irrelevant for evaluation.  Proof-of-concept is all that
matters.

The Common Name (CN) for the cert is sit.yorku.ca.  The cert is not registered
with a Certificate Authority (CA).  As such it will provide errors about the
integrity of the ceritficate when using https.
*/
const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');
const db = mongoose.connection;

const routes = require('./routes/index');
const users = require('./routes/users');

// SSL Certs for HTTPS
const privateKey  = fs.readFileSync('sslcert/key.pem', 'utf8');
const certificate = fs.readFileSync('sslcert/certificate.pem', 'utf8');
//const bundle = fs.readFileSync('certificates/ca_bundle.crt', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  //ca: bundle
};

// Init app
const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express validator - https://github.com/VojtaStavik/GetBack2Work-Node/blob/master/node_modules/express-validator/README.md#middleware-options
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  //Passport sets it's own flash messages to 'error', hence the redundancy below
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', routes);
app.use('/users', users);

// Boot up the WebIS and listen on the given ports
const portHttp = 8080;
const portHttps = 8443;
http.createServer(app).listen(portHttp, () => {
  console.log('HTTP WebIS started.  Port: ' + portHttp);
});
https.createServer(credentials, app).listen(portHttps, () => {
  console.log('HTTPS WebIS started.  Port: ' + portHttps);
});
