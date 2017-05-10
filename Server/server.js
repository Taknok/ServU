const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require("./database/database");
const userRoute = require("./routes/users/users");
const phoneRoute = require("./routes/phones/devices");
const error = require("./error");
const jwt = require('jsonwebtoken');

let app = express();
const port = 8080;

//Handle cross-origin requests
app.use(cors());

//Log all request which are received
app.use(function (req, res, next) {
    req.SERVER = {};
    console.log("Request : " + req.method + " " + req.originalUrl);
    next();
});

//Parse body into json and error handler
app.use(bodyParser.json());
app.use(function (err, req, res, next) {
    if (err) {
        next(new error.error(400, "Wrong format", err.message));
    } else {
        next();
    }
});

//Connect routers
app.use("/", userRoute);
app.use("/", phoneRoute);

//Final error handler
app.use(function (err, req, res, next) {
    let errorSent = err;
    if (!err.api) {
        console.error(err);
        errorSent = new error.dbError(err.stack);
    }
    res.status(errorSent.status).json(errorSent);
});

//Initialization
db.connectMongo()
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(port, () => {
            console.log("Server listening on port " + port);
        });
    })
    .catch(err => {
        throw err
    });
