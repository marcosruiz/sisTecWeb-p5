var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoOp = require("./models/mongo");
var mongodb = require('mongodb');
var http = require('http');

// Aceptaremos JSON y valores codificados en la propia URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Todos los endpoint del API los colocaremos en este fichero
var routesAPI = require("./routes/routesAPI.js")(app, mongoOp, http);
var routesWeb = require("./routes/routesWeb.js")(app, http);

var server = app.listen(3000, function () {
 console.log("Listening on port %s...", server.address().port);
});
