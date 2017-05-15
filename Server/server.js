const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require("./database/database");
const userRoute = require("./routes/users/users");
const phoneRoute = require("./routes/phones/devices");
const loginRoute = require("./routes/authentication").router;
const error = require("./error");
const jwt = require('jsonwebtoken');

let app = express();
const port = 3000;
const serv_addr = "127.0.0.1";

//Handle cross-origin requests
app.use(cors());

//Log all request which are received
app.use(function (req, res, next) {
    console.log(req.body);
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
app.use("/api/", userRoute);
app.use("/api/", phoneRoute);
app.use("/api/", loginRoute);

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
        app.listen(port, serv_addr, 511, () => {
            console.log("Server listening on port " + serv_addr + ":" + port);
        });
    })
    .catch(err => {
        throw err
    });
