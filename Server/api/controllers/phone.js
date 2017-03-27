'use strict';
var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = 'mongodb://127.0.0.1:27017/ServU';

var db = require("../../config/db")();

var util = require('util');


module.exports = {
	postProbes
}


//POST   /phone/{uuid}/probes
    function postProbes(req, res, next) {
      MongoClient.connect(url,  function(err, db1) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

          const phone = {
            "uuid": req.swagger.params.uuid.value,
             "device": req.body
          }
        db1.collection("phone").insert(phone,function(err, probe) {
             if (!err) res.json(phone);
           }
        );
      });
    }

// /PUT  /phone/{uuid}/probes
        function putProbes(req, res, next) {
          MongoClient.connect(url,  function(err, db1) {
            assert.equal(null, err);
            console.log("Connected correctly to server");
            db1.collection("phone").findOne({"uuid" : req.swagger.params.uuid.value},function(err, phone){
              if (error) throw error;
              
            });
          });

        }
