const bcrypt = require('bcrypt');
const passwordValidator = require('password-validator');


var schema = new passwordValidator();


// checks if password is strong
exports.checkStrongPwd = function(firstName, lastName, email, password) {
  schema.is().min(6)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces()
  .is().not().oneOf([email, firstName, lastName]); 

  var validPasword = schema.validate(password);

  return(validPasword);
};


// check if pwd match database
exports.checkValidPwd = function() {
  function r(inputPwd, databasePwd) {
    bcrypt.compare(inputPwd, databasePwd, function(err, result) {
      return(result);
    });
  };
  return(r);
};