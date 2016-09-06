var appRouter = function(app, mongoOp, http) {
  var path = "C:/Users/marco/Documents/GitHub/sisTecWeb-p5/tmp/";
  var multer  = require('multer');
  var upload = multer({ dest: path });
  var fs = require('fs');

  ///////////////USERS///////////////

  /*
  Login
  */
  app.get("/api/user/:userName/:password", function(req, res) {
    console.log("GET /api/user was called. ");

    var passwordEn;
    passwordEn = require('crypto')
    .createHash('sha1')
    .update(req.params.password)
    .digest('base64');
    var response = {};
    mongoOp.findOne({username : req.params.userName, password: passwordEn},function(err,data){
      // Mongo command to fetch all data from collection.
      if(err) {
        response = {"error" : true, "message" : "Incorrect login"};
      } else {
        data.password
        response = {"error" : false, "message" : data};
      }
      res.json(response);
    });
  });

  /*
  Create user:
  Body: username, password
  */
  app.post("/api/user", function(req, res) {
    console.log("POST /api/user was called. ");

    var db = new mongoOp();
    var response = {};
    // fetch email and password from REST request.
    // Add strict validation when you use this in Production.
    db.username = req.body.username;
    // Hash the password using SHA1 algorithm.
    db.password = require('crypto')
    .createHash('sha1')
    .update(req.body.password)
    .digest('base64');
    db.memos = [];
    db.save(function(err){
      if(err) {
        response = {"error" : true,"message" : "Error adding data"};
      } else {
        response = {"error" : false,"message" : "Data added"};
      }
      res.json(response);
    });
  });

  /*
  Show all users with their notes
  */
  app.get("/api/allMemo/", function(req, res) {
    console.log("GET /api/allMemo was called. ");
    var response = {};
    mongoOp.find({}, function(err, data){
      if(err){
        response = {"error" : true,"message" : "Error fetching data"};
      }else{
        response = {"error" : false,"message" : data};
      }
      res.json(response);
    });
  });

  ///////////////MEMOS///////////////

  /*
  Get a memo
  */
  app.get("/api/memo/:idMemo", function(req, res) {
    console.log("GET /api/memo was called. ");
    var response = {};
    mongoOp.findOne({memos: {$elemMatch: {_id: req.params.idMemo}}}, function(err, data){
      if(err){
        response = {"error" : true, "message" : "Note not found"}
      }else{
        var memos = data.memos;
        for(i = 0; i < memos.length; i++){
          var myMemo;
          idString = memos[i]._id.toString();
          if(idString==req.params.idMemo){
            myMemo = memos[i];
          }
        }
        response = {"error" : false, "message" : myMemo}
      }
      res.json(response);
    });
  });

  /*
  Delete a memo
  */
  app.delete("/api/memo/:idMemo", function(req, res) {
    console.log("DELETE /api/memo was called. ");
    var response = {};
    mongoOp.update({}, {$pull: {memos: {_id: req.params.idMemo}}}, function(err, data){
      if(err){
        response = {"error" : true,"message" : "Error deleting data"};
      }else{
        response = {"error" : false,"message" : data};
      }
      res.json(response);
    });
  });

  /*
  Add a memo
  Body: username, password, text, date, file
  */
  app.post("/api/memo/", upload.single('file'), function(req, res) {
    console.log("POST /api/memo was called. ");

    var db = new mongoOp();
    var response = {};
    db.username = req.body.username;
    db.password = require('crypto')
    .createHash('sha1')
    .update(req.body.password)
    .digest('base64');

    //It creates a memo
    var memo;
    if (req.file) {
      //Rename file
      route = path + req.file.originalname;
      fs.rename(req.file.path, route, function(error) {
  			if (error) {
  				fs.unlink(route);
  				fs.rename(req.file.path, route);
  			}
  		});

      memo = {text: req.body.text, date: req.body.date, route_file: req.file.originalname};
    }else{
      memo = {text: req.body.text, date: req.body.date, route_file: ""};
    }

    //Add a new memo
    mongoOp.findOne({username: req.body.username, password: db.password},function(err,data){
      if(err) {
        response = {"error" : true,"message" : "Error fetching data"};
        res.json(response);
      } else {
        mongoOp.update(data, {$push: {memos: memo}},  { upsert: true }, function(err, user){
          if(err){
            res.send(err);
          } else {
            //return res.json(user);
            //It returns user updated
            mongoOp.findOne({'username': db.username, 'password': db.password},function(err,data){
              if(err) {
                response = {"error" : true,"message" : "Error updating data"};
              } else {
                response = {"error" : false,"message" : data};
              }
              res.json(response);
            });
          }
        });
      }
    });
  });

  /*
  Download undefined file
  */
  app.get("/api/file/:idMemo", function(req, res){
    console.log("GET /file was called. ");

    var options = {hostname: 'localhost',
    port: '3000',
    path: '/api/memo/' + req.params.idMemo,
    method: 'GET'};
    var req2 = http.request(options, function(res2){
      var bodyChunks = [];
      res2.on('data', function(chunk){
        bodyChunks.push(chunk);
      });
      res2.on('end', function(){
        var body = Buffer.concat(bodyChunks);
        var json = JSON.parse(body);
        if(json.error){
          res.send("Hay problemas");
        }else{
          res.sendFile(path + json.message.route_file);
        }
      });
    });
    req2.end();
  });
}
module.exports = appRouter;
