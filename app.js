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

// Server environment libraries
const express = require('express');
const http = require('http');
const https = require('https');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const portHttp = 8080;
const portHttps = 8443;

// File system libraries
const path = require('path');
const fs = require('fs');

// MVC engine library
const exphbs = require('express-handlebars');

// Session libraries
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// MongoDB libraries
const mongo = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginapp');
const db = mongoose.connection;

// Setup route pointers
const routes = require('./routes/index');
const users = require('./routes/users');
const errors = require('./routes/error');

// SSL Certs for HTTPS
const privateKey = fs.readFileSync('sslcert/key.pem', 'utf8');
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
app.engine('handlebars', exphbs({
  defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

// BodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session configuration
app.use(session({
  secret: 'secret',
  cookie: { path: '/', httpOnly: false, maxAge: null },
  saveUninitialized: true,
  resave: true
}));

// Initialize passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Express validator - https://github.com/VojtaStavik/GetBack2Work-Node/blob/master/node_modules/express-validator/README.md#middleware-options
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Connect flash - used to store/send messages to client
app.use(flash());

app.use(function(req, res, next) {
  // Is true if the request is made via HTTPS
  if(req.secure) {
    next();
  } else {
    // Redirect to HTTPS
    let host = req.headers.host;
    res.redirect('https://' + host.substring(0, host.indexOf(':')) + portHttps + req.url);
  }
});

// Global variables
app.use(function(req, res, next) {
  /**
   * Response headers, this will prevent the browser from caching the page
   */
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');

  /**
   * Message data
   */
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  // Passport sets it's own flash messages to 'error', hence the redundancy below
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;

  // Prevents users from accessing images without being authenticated
  if (req.user == null && req.path.indexOf('/images') === 0) {
    //res.render('login', { message: 'Please login.' });
    res.redirect('/error');
  } else {
    next();
  }
});

// Routes
app.use('/', routes);
app.use('/users', users);
app.use('/error', errors)

// Keep this as the bottom handler
// Redirects if accessing a resource that does not exist
app.get('*', function(req, res) {
  res.redirect('/');
});

// Secure File serving, will not server if not authenticated above
app.use(express.static(path.join(__dirname, 'secure')));

// Boot up the WebIS and listen on the given ports
http.createServer(app).listen(portHttp, () => {
  console.log('HTTP WebIS started.  Port: ' + portHttp);
});
https.createServer(credentials, app).listen(portHttps, () => {
  console.log('HTTPS WebIS started.  Port: ' + portHttps);
});
