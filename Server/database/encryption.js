let crypto = require('crypto');
const SALT_LENGTH = 10;
/**
 * generates random string of characters i.e salt
 * @function
 */
exports.genRandomString = function(){
    return crypto.randomBytes(Math.ceil(SALT_LENGTH/2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0,SALT_LENGTH);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
exports.sha512 = function(password, salt){
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    return hash.digest('hex');
};