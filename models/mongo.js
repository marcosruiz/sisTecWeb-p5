var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/memos_db');

// create instance of Schema
var mongoSchema = mongoose.Schema;

// create schema
var userSchema = {
  username : String,
  password : String,
  memos: [{text: String, date: String, route_file: String}]
};

// create model if not exists.
module.exports = mongoose.model('user',userSchema);
