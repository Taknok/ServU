'use strict';
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://127.0.0.1:27017/ServU';

var util = require('util');


module.exports = {
	postUsers,
  getUsersUsername,
  putUsersUsername,
  deleteUsersUsername,
  getUsersDevice,
  postUsersDevice,
  getUsersDeviceUuid,
  deleteUsersDeviceUuid,
  getUsersDeviceUuidProbes,
  getUsersDeviceUuidProbesName,
  postUsersDeviceUuidActions
}
//utilisé les $set

function postUsers(req, res, next) {
  MongoClient.connect(url,  function(err, db1) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    db1.collection("users").findOne({"username": req.body.username},function(error, exist) {
      if(exist == null && error == null){
        db1.collection("users").insert(req.body,function(err, probe) {
             if (!err) res.json({success: 1, description: "Users deleted"});
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

function getUsersUsername(req, res, next) {
  MongoClient.connect(url,  function(err, db1) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error, use) {
      if(use != null && error == null){
        var user = {"username": use.username, "firstname":use.firstname, "lastname": use.lastname, "email": use.email, "devices": use.devices};
        res.json(user)
      }
      else{
        res.status(409).send();
      }
    });

  });
}

// /PUT  /phone/{uuid}/probes
    function putUsersUsername(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        db1.collection("users").findOne({"username": req.body.username},function(error2, use2){
          if(use2 == null){
            db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error, use) {
              if(use != null && error == null){
                if (req.body.username) use.username = req.body.username;
                if (req.body.lastname) use.lastname = req.body.lastname;
                if (req.body.firstname) use.firstname = req.body.firstname;
                if (req.body.email) use.email = req.body.email;
                if (req.body.password) use.password = req.body.password;
                db1.collection("users").update({"username" : req.swagger.params.username.value}, use,  function(err2, modif){
                  if (!err2) res.json({success: 1, description: "Users modifié"});
                  else{
                       res.status(400).send();
                  }
                });
              }
              else{
                res.status(404).send();
              }
            });
          }
          else{
            res.status(409).send();
          }
        });
      });
    }


    function deleteUsersUsername(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error, exist) {
          if(exist != null && error == null){
            db1.collection("users").remove( { "username": req.swagger.params.username.value },function(err, val) {
                 if (!err) res.json({success: 1, description: "Users ajouté"});
                 else{
                     res.status(404).send();
                 }
               }
            );
          }
          else{
            res.status(404).send();
          }
        });

      });
    }


    function getUsersDevice(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error, use) {
          if(use != null && error == null){
           res.json(use.devices);
          }
          else{
            res.status(409).send();
          }
        });

      });
    }


    function postUsersDevice(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error, user) {
          if(user != null && error == null){
            var tmp = "devices." + String([req.body.uuid]);
            const device = { "$set" : {[tmp] : req.body}};
              db1.collection("users").update({"username" : req.swagger.params.username.value},  device,  function(err2, modif){
                if (!err2) res.json({success: 1, description: "Users modifié"});
                else{
                  console.log("1");
                     res.status(400).send();
                }
              });
           }
          else{
            console.log("2");
            res.status(404).send();
          }
        });
      });
    }

    function getUsersDeviceUuid(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error, use) {
          if(use != null && use.devices[req.swagger.params.uuid.value] != null && error == null){
            res.json(use.devices[req.swagger.params.uuid.value]);
          }
          else{
            res.status(404).send();
          }
        });
      });
    }

    function deleteUsersDeviceUuid(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        db1.collection("users").findOne({"username": req.swagger.params.username.value},function(error,use) {
          if(use != null && use.devices[req.swagger.params.uuid.value] != null && error == null){
                delete(use.devices[req.swagger.params.uuid.value]);
                const device = { "$set" : {"devices" : use.devices}};
                  db1.collection("users").update({"username" : req.swagger.params.username.value},  device,  function(err2, modif){
                    if (!err2) res.json({success: 1, description: "Users modifié"});
                    else{
                      console.log("1");
                         res.status(400).send();
                    }
                  });
          }
          else res.status(404).send();
        });

      });
    }


// GET /users/{username}/devices/{uuid}/probes


    function getUsersDeviceUuidProbes(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        const test = "devices."+String([req.swagger.params.uuid.value]+".uuid")
        db1.collection("users").findOne({"username": req.swagger.params.username.value, [test] : req.swagger.params.uuid.value},function(error, use) {
          if(use != null && error == null){
            db1.collection("phone").findOne({"uuid": req.swagger.params.uuid.value},function(err, phone) {
              if(phone != null && err == null){
                console.log(phone.probes);
                res.json(phone.probes)
              }
              else{
                res.status(404).send();
              }
            });
          }
          else{
            res.status(404).send();
          }
        });
      });
    }

    // GET /users/{username}/devices/{uuid}/probes/{name}
    function getUsersDeviceUuidProbesName(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        const test = "devices."+String([req.swagger.params.uuid.value]+".uuid")
        db1.collection("users").findOne({"username": req.swagger.params.username.value, [test] : req.swagger.params.uuid.value},function(error, use) {
          if(use != null && error == null){
            db1.collection("phone").findOne({"uuid": req.swagger.params.uuid.value, "probes.name":req.swagger.params.name.value},function(err, phone) {
              if(phone != null && err == null){
                var i = 0;
                while(i < phone.probes.length && phone.probes[i].name != req.swagger.params.name.value){
                  i++;
                }
                res.json(phone.probes[i])
              }
              else{
                res.status(404).send();
              }
            });
          }
          else{
            res.status(404).send();
          }
        });
      });
    }
// GET /users/{username}/devices/{uuid}/actions



// POST /users/{username}/devices/{uuid}/actions

    function postUsersDeviceUuidActions(req, res, next) {
    	MongoClient.connect(url,  function(err, db) {
    		assert.equal(null, err);
    		console.log("Connected correctly to server");
    		var actions = req.body;
        db.collection("phone").findOne({"uuid": req.swagger.params.uuid.value}, function(err, data){
          console.log(data);
          if ( data != null && data.actions[req.body.name]==null){
              var tmp = "actions." + String([req.body.name]);
              var updateAction = { "$set" : {[tmp] : req.body}};
              db.collection("phone").update({"uuid" : req.swagger.params.uuid.value, }, updateAction, { upsert: true}, function(err2) {
                if (!err2 ) res.json({success: 1, description: "Action Updated"})
                else{
                  res.status(409).send("");
                }
              });
          }
          else {
              res.status(409).send("");
          }
        });
    	});
    }
