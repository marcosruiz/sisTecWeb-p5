var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var mongoOp = require("./models/mongo");
var mongodb = require('mongodb');

// Aceptaremos JSON y valores codificados en la propia URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Todos los endpoint del API los colocaremos en este fichero
var routes = require("./routes/routes.js")(app, mongoOp);

var server = app.listen(3000, function () {
 console.log("Listening on port %s...", server.address().port);
});
