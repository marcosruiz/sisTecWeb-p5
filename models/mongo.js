var mongoose = require("mongoose");

// create instance of Schema
var mongoSchema = mongoose.Schema;

// create schema
var userSchema = {
 "userEmail" : String,
 "userPassword" : String
};

// create model if not exists.
module.exports = mongoose.model('userLogin',userSchema);
