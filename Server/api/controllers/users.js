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
  deleteUsersDeviceUuid
}


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
        var user = {"username": use.username, "firstname":use.firstname, "lastname": use.lastname, "email": use.email};
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
            if (use.devices == null && error == null) {
              res.json([]);
            }
            else res.json(use.devices)
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
            var existe = false;
            for (var i = 0; i < user.devices.length; i++) {
              if (user.devices[i].uuid == req.body.uuid) {
                existe = true;
              }
            }
            if(!existe){
              if (!user.devices) {
                user.devices = [req.body]
              }
              else{
                user.devices[user.devices.length] = req.body
              }
              db1.collection("users").update({"username" : req.swagger.params.username.value}, user,  function(err2, modif){
                if (!err2) res.json({success: 1, description: "Users modifié"});
                else{
                     res.status(400).send();
                }
              });
            }
            else{
              res.status(400).send();
            }
          }
          else{
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
          if(use != null && use.devices != null && error == null){
            console.log(use.devices[i]);
            for (var i = 0; i < use.devices.length; i++) {
              if(use.devices[i].uuid == req.swagger.params.uuid.value){
                res.json(use.devices[i]);
              }
            }
              res.status(404).send();
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
            if(use != null && use.devices != null && error == null){
              var i = 0
              console.log(use.devices);
                delete use.devices[0];
              console.log(use.devices);
                // while(use.devices[i].uuid == req.swagger.params.uuid.value){
                //   i++;
                //   console.log("0");
                // }
                // if (use.devices[i-1].uuid == req.swagger.params.uuid.value) {
                //   console.log("1");
                //   while (i < use.devices.length-1) {
                //     use.devices[i-1] = use.devices[i]
                //     i++;
                //   }
                  use.devices[i] = null
                  // db1.collection("users").update({"username" : req.swagger.params.username.value}, use,  function(err2, modif){
                  //   if (!err2) res.json({success:1, description:"Device deleted"});
                  //   else{
                  //        res.status(400).send();
                  //   }
                  // });
          //       }
          //       else{
          //         res.status(404).send();
          //       }
          //     }
          // else{
          //   res.status(404).send();
          }
        });

      });
    }
