var appRouter = function(app, mongoOp) {

  app.get("/", function(req, res) {
    console.log("GET / was called. ");

   res.send("Hello World");
  });

  app.get("/api/user/:userName", function(req, res) {
    console.log("GET /api/user was called. ");

    var response = {};
    mongoOp.find({username : req.params.userName},function(err,data){
      // Mongo command to fetch all data from collection.
      if(err) {
        response = {"error" : true,"message" : "Error fetching data"};
      } else {
        response = {"error" : false,"message" : data};
      }
      res.json(response);
    });
  });

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

  app.get("/api/memo/:userName/:idMemo", function(req, res) {
    console.log("GET /api/memo was called. ");

  });

  app.post("/api/memo/", function(req, res) {
    console.log("POST /api/memo was called. ");

    var db = new mongoOp();
    var response = {};
    db.username = req.body.username;
    db.password = require('crypto')
    .createHash('sha1')
    .update(req.body.password)
    .digest('base64');

    mongoOp.find({username: req.body.username, password: db.password},function(err,data){
      // Mongo command to fetch all data from collection.
      if(err) {
        response = {"error" : true,"message" : "Error fetching data"};
        res.json(response);
      } else {
        console.log(typeof data);
        var memo = {text: "blabla", date: "2016-01-01", route_file: ""};
        var ObjectID = require('mongodb').ObjectID;
        mongoOp.update({"_id" : data._id}, {$push: {memos: memo}}, false, true);
        res.json("fjdls");

        /*mongoOp.find({'username': db.username, 'password': db.password},function(err,data){
          if(err) {
            response = {"error" : true,"message" : "Error updating data"};
          } else {
            console.log(data);
            response = {"error" : false,"message" : data};
          }
          res.json(response);
        });*/
      }

    });


  });

  app.delete("/api/memo/:idMemo", function(req, res) {
    console.log("DELETE /api/memo was called. ");

  });

  app.get("/api/allMemo/", function(req, res) {
    console.log("GET /api/allMemo was called. ");

  });

}

module.exports = appRouter;
