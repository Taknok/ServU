const jwt = require('jsonwebtoken');
const config = require('../configToken');
const error = require('../error');

module.exports = checkToken,
                 createToken;

function createToken(username){
  return token = jwt.sign(username, configToken.secret, {expiresIn: 604800000}); //604800000 correspond à 7 jours en ms
}

function checkToken(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    //utilisé le salt comme clé secrete et utiliser décode avant verify afin de recuperer le salt dans la base de donnée.
    jwt.verify(token, config.secret, function(err, decoded) {
      if(!err){
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
      else if (err.name == 'TokenExpiredError') {
        next(new error.error(401, 'TokenExpiredError', err.expiredAt));
      }
      else{
        next(new error.error(401, 'JsonWebTokenError', err.message));
      }
      else
    });

  } else {
    // if there is no token
    // return an error
		console.log("pas de token");
    return res.status(401).send({
        success: false,
        message: 'No token provided.'
    });

  }
};
