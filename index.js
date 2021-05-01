const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const ejs = require('ejs');
const passwordValidator = require('password-validator');
const MongoClient = require('mongodb').MongoClient;



// express
const app = express();

// ejs
app.set('view engine', 'ejs'); 
app.set('views', __dirname + '/views'); 
app.use(express.static(__dirname + '/views'));

// mongoDB
const url = process.env.MONGO_URL;

// bodyParser
app.use(bodyParser.urlencoded({extended: false}));

// express session
app.use(session({secret: 'secret', resave: true, saveUninitialized: true}));


// passwordValidator
var schema = new passwordValidator();
let errors = [];


// GET request
app.get('/', function(request, response) {
  response.render('login');
});


app.get('/login', function(request, response) {
  response.render('login');
});


app.get('/register', function(request, response) {
	response.render('register');
});


app.get('/dashboard', function(request, response) {
	if (request.session.loggedin) {
    var user = request.session.username;

		response.render('dashboard', {username: user});
	} else {
    response.redirect('/');	
  };
});

app.get('/logout', function(request, response) {
  if (request.session.loggedin) {
  	request.session.loggedin = false;
    response.redirect('/');
  } else {
    response.redirect('/');	
  };
});



// POST requests
app.post('/login', function(request, response) {

  var {email, password} = request.body;

  MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {

    var dbo = db.db('website');
    
    // checks if user in database
    dbo.collection('credentials').find({email: email}).toArray(function(err, userData) {
      if (err) throw err;

      // if user not in database
      if (!userData.length) {

        // clear all previous errors
        errors.pop();

        // push error
        errors.push({msg: 'Invalid email or password'});

        response.render('login', {
          errors: errors,
          email: email,
          password: password
        });
      } else {
        // checks if password matches
        bcrypt.compare(password, userData[0].password, function(err, result) {
          if (err) throw err;

          if (result) {
            request.session.loggedin = true;

            // gets user data
				    request.session.userData = request.body.userData;

            response.redirect('/dashboard');
          } else {
            // clear all previous errors
            errors.pop();

            // push error
            errors.push({msg: 'Invalid email or password'});

            response.render('login', {
              errors: errors,
              email: email,
              password: password
            });
          };
        });
      }
      db.close();
    });
  });
});


app.post('/register', function(request, response) {
  var {firstName, lastName, email, password} = request.body;

  // password criterias
  schema.is().min(6)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()
  .is().not().oneOf([email, firstName, lastName]); 

  var strongPasword = schema.validate(password);

  if (strongPasword == false) {
    // clear all previous error
    errors.pop();

    // push error
    errors.push({msg: 'Your password must contain at least 6 characters with a mix of upper and lowercase letters, numbers and should not be your name or email address'});

    response.render('register', {
      errors: errors,
      firstName: firstName,
      lastName: lastName,
      email: email
    });
  } else {
    // clear all previous error
    errors.pop();

    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
      var dbo = db.db('website');
      
      // check if user is registerd 
      dbo.collection('credentials').find({email: email}).toArray(function(err, userData) {
        if (err) throw err;

        // if user is new
        if (!userData.length) {

          // generates salt
          bcrypt.genSalt(10, function(err, salt) {

            // encrypts password
            bcrypt.hash(password, salt, function(err, hashedPassword) {
              if (err) throw err;

              let userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: hashedPassword
              };

              // insert user in database
              dbo.collection('credentials').insertOne(userData, function(err, result) {
                if (err) throw err;

                request.session.loggedin = true;
				        request.session.userData = request.body.userData;
 
                response.redirect('/dashboard');
                db.close();
              });
            });
          });
        } else{
          // push error
          errors.push({msg: 'An account already exist with that email'});

          response.render('register', {
            errors: errors,
            firstName: firstName,
            lastName: lastName
          });
        };
      });
    });
  }; 
});


app.listen(8080);