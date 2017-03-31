'use strict';
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://127.0.0.1:27017/ServU';

var util = require('util');


module.exports = {
	postProbes,
	putProbes,
	postActions,
	getActions,
	putActions,
	getActionsUser,
	putActionsUser
}


//POST   /phone/{uuid}/probes
function postProbes(req, res, next) {
  MongoClient.connect(url,  function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	  const phone = {
		"uuid": req.swagger.params.uuid.value,
		"probes": req.body
	  }
	db.collection("phone").insert(phone,function(err) {
		 if (!err) res.json({success: 1, description: "Probes Added"});
	   }
	);
  });
}

// /PUT  /phone/{uuid}/probes
function putProbes(req, res, next) {
  MongoClient.connect(url,  function(err, db) {
	assert.equal(null, err);
	console.log("Connected correctly to server");
	db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value,},function(err, phone){
	  if (err) throw err;
	  console.log(phone);
	  //  var id = req.swagger.params.uuid.value; //req.swagger contains the path parameters
	  //  if(db.update({"uuid" : }, req.body)){
	  //      res.json({success: 1, description: "Movie updated!"});
	  //  }else{
	  //      res.status(204).send();
	  //  }
	});
  });
}


function checkActions(actions){
	if (typeof actions == 'undefined'){
		return false;
	}
	if (actions.length == 0){
		return false;
	}
	return true;
}

// /POST  /phone/{uuid}/actions
function postActions(req, res, next) {
	MongoClient.connect(url,  function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server");
		
		var actions = req.body;
		
		if (!checkActions(actions)){
			res.status(400).send("")
			return;
		}
		var action;
		for(var i = 0; i < actions.length; i++){ //for in ne marche pas ici :(
			action = actions[i]
			
			db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value, "actions" : { "$elemMatch" : {"name" : action.name }}}, function(err, data){
				if ( data == null){
					
					const updateAction = { "$push" :{
							"actions": action
						}
					}
					
					db.collection("phone").update({"uuid" : req.swagger.params.uuid.value, }, updateAction, { upsert: true}, function(err) {
						if (!err) res.json({success: 1, description: "Action Added"});	
					});
					
				} else {
					res.status(409).send("");
				}
			});
		}
	});
}

// /GET  /phone/{uuid}/actions
function getActions(req, res, next) {
	MongoClient.connect(url,  function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server");
		
		db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value, "actions" : { "$exists" : true }}, function(err, phone){ //on pourrait demander de ret que actions mais flemme
			if (phone != null){
				if (err) throw err;
				res.json(phone.actions);
			} else {
				res.status(404).send();
			}
		});
	});
}

// /PUT  /phone/{uuid}/actions
function putActions(req, res, next) {
	MongoClient.connect(url,  function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server");
		
		var actions = req.body;

		if (!checkActions(actions)){
			res.status(400).send("")
			return;
		}
		
		var action;
		for(var i = 0; i < actions.length; i++){ //for in ne marche pas ici :(
			action = actions[i]
			
			db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value, "actions" : { "$elemMatch" : {"name" : action.name }}}, function(err, data){
				if ( data == null){
					res.status(404).send("");
				} else {
					const updateAction = { "$set" : {
							"actions.$": action
						}
					}
					res.json({success: 1, description: "Action Updated"});
					db.collection("phone").update({"uuid" : req.swagger.params.uuid.value, "actions" : { "$elemMatch" : {"name" : action.name }}}, updateAction, {}, function(err) {
						if (!err) res.json({success: 1, description: "Action Updated"});
					});
				}
			});
		}
	});
}


// /GET  /phone/{uuid}/actions_user
function getActionsUser(req, res, next) {
	MongoClient.connect(url,  function(err, db) {
		assert.equal(null, err);
		console.log("Phone " + req.swagger.params.uuid.value + " getActionsUser");
		console.log("Connected correctly to server");
		
		db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value, "actionsUser" : { "$exists" : true }}, function(err, phone){ //idem pour ce get
			if (err) throw err;
			if (phone != null){	//if uuid there
				db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value, "actionsUser" : { "$elemMatch" : {"status" : {"$eq" : "pending"} }}}, function(err, phone){
					if (phone != null){	
						res.json(phone.actionsUser);
					} else { //if nothing send null array
						res.json([]);
					}
				});
				
			} else { //uuid not found
				res.status(404).send();
			}
		});
	});
}

// /PUT  /phone/{uuid}/actions_user/
function putActionsUser(req, res, next) {
	MongoClient.connect(url,  function(err, db) {
		assert.equal(null, err);
		console.log("Phone " + req.swagger.params.uuid.value + " putActionsUser");
		console.log("Connected correctly to server");
		
		var actionsStatus = req.body;

		// faudra veriefier que c'est sous le bon format
		
		var actionStatus;
		for(var i = 0; i < actionsStatus.length; i++){ //for in ne marche pas ici :(
			actionStatus = actionsStatus[i]
			console.log(actionStatus);
			db.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value, "actionsUser" : { "$elemMatch" : {"actionId" : actionStatus.actionId }}}, function(err, data){
				if ( data == null){
					res.status(404).send("");
				} else {
					console.log(data);
					const updateActionUser = { "$set" : {
							"actionsUser.$.status": actionStatus.status
						}
					}
					
					db.collection("phone").update({"uuid" : req.swagger.params.uuid.value, "actionsUser" : { "$elemMatch" : {"actionId" : actionStatus.actionId }}}, updateActionUser, {}, function(err) {
						if (!err) res.json({success: 1, description: "Action user Updated"});
					});
				}
			});
		}
	});

}