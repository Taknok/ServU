'use strict';
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://127.0.0.1:27017/ServU';

var util = require('util');


module.exports = {
	postPhone,
	postProbes,
	putProbes,
	postActions,
	getActions,
	putActions,
	getActionsUser,
	putActionsUser
}


// NE MARHCE PAS
function postPhone(req, res, next) {
	MongoClient.connect(url,  function(err, db1) {
    assert.equal(null, err);

		var obj = {};

    db1.collection("phone").insert({
		"uuid": req.swagger.params.uuid.value,
		"actionsUser" : obj
	},function(error, exist) {
		if (error) {
			console.error(error);
			res.status(409).send();
		}else{
			res.status(201).send();
		}
    });

  });
}

function postProbes(req, res, next) {
  MongoClient.connect(url,  function(err, db1) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    const phone = {
      "uuid": req.swagger.params.uuid.value,
       "probes": req.body,
	   "actionsUser" : "{}"
    }
    console.log(phone);
    db1.collection("phone").findOne({"uuid": req.swagger.params.uuid.value},function(error, exist) {
      console.log(error);
      if(exist == null && error == null){
        db1.collection("phone").insert(phone,function(err, probe) {
             if (!err) res.json(phone);
             else{
                 res.status(204).send();
             }
           }
        );
      }
      else{
        res.status(409).send();
      }
    });

  });
}

// /PUT  /phone/{uuid}/probes
    function putProbes(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        console.log( req.swagger.params.uuid.value);
        const phone = {
			"uuid": req.swagger.params.uuid.value,
			"probes": req.body
        }
           db1.collection("phone").update({"uuid" : req.swagger.params.uuid.value}, phone,  function(err, modif){
               if (!err) res.json(modif);
           else{
               res.status(204).send();
           }
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
      console.log("ok");
			res.status(400).send("")
			return;
		}
    var count = 0;
    var test3;//='{"uuid":"' +String([req.swagger.params.uuid.value])+'",$or:['
    actions.forEach(function(action) {
      var test1 = '{"actions.'+String([action.name])+'.name":"'+String([action.name])+'"}'
      if(req.body[0]==action) test3 ="[" + test1
      else test3 = test3+","+test1;
    });
    test3 = test3+"]"
    // console.log(test3);
    var test2 = JSON.parse(test3)
    // console.log(test2);
    db.collection("phone").findOne({"uuid": req.swagger.params.uuid.value, $or: test2}, function(err, data){
      console.log(data);
      if ( data == null){
        actions.forEach(function(action) {

          var tmp = "actions." + String([action.name]);
          var updateAction = { "$set" : {[tmp] : action}};
          db.collection("phone").update({"uuid" : req.swagger.params.uuid.value, }, updateAction, { upsert: true}, function(err2) {
            count++;
            if (!err2 && count == actions.length) res.json({success: 1, description: "Action Updated"});
            else if (!err2);
            else{
              res.status(409).send("");
            }
          });
        });
      }
      else {
          res.status(409).send("");
      }
    });
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
        console.log(phone.actions);
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
