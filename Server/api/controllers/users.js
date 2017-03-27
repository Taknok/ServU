'use strict';
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://127.0.0.1:27017/paul';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */

var db = require("../../config/db")();

var util = require('util');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
	getAll,
	save,
	getOne,
	update,
	delUser
}

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
//GET /movie operationId
function getAll(req, res, next) {
  res.json({ users: db.find()});
}

//POST /movie operationId
    function save(req, res, next) {
        res.json({success: db.save(req.body), description: "Movie added to the list!"});
    }

//GET /movie/{id} operationId
function getOne(req, res, next) {
	var username = req.swagger.params.username.value; //req.swagger contains the path parameters

  MongoClient.connect(url,  function(err, db1) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    db1.collection("users").find().toArray(function (error, user) {
      if (error) throw error;
      console.log(user[0]);
      if(user) {
    		res.json(user[0]);
    	}else {
    		res.status(204).send();
    	}

    });



  });

}
//PUT /movie/{id} operationId
function update(req, res, next) {
	var id = req.swagger.params.username.value; //req.swagger contains the path parameters
	var user = req.body;
	if(db.update(unsername, user)){
		res.json({success: 1, description: "Movie updated!"});
	}else{
		res.status(204).send();
	}

}
//DELETE /movie/{id} operationId
function delUser(req, res, next) {
	var id = req.swagger.params.username.value; //req.swagger contains the path parameters
	if(db.remove(username)){
		res.json({success: 1, description: "Movie deleted!"});
	}else{
		res.status(204).send();
	}

}
