var appRouter = function(app, mongoOp, http) {
  var path = "C:/Users/marco/Documents/GitHub/sisTecWeb-p5/tmp/";

  ////////////////////////////////////////////////
  ////////////////API
  ////////////////////////////////////////////////

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
    username
    password
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
  Add a memo:
    username
    password
    text
    date
    file
  */
  app.post("/api/memo/", function(req, res) {
    console.log("POST /api/memo was called. ");

    var db = new mongoOp();
    var response = {};
    db.username = req.body.username;
    db.password = require('crypto')
    .createHash('sha1')
    .update(req.body.password)
    .digest('base64');
    mongoOp.findOne({username: req.body.username, password: db.password},function(err,data){
      // Mongo command to fetch all data from collection.

      if(err) {
        response = {"error" : true,"message" : "Error fetching data"};
        res.json(response);
      } else {
        var formidable = require("formidable");
        var fs = require('fs');
        var form = new formidable.IncomingForm();
        var memo = {text: req.body.text, date: req.body.date};
      	form.parse(req, function(error, fields, files) {
          console.log("llego aqui");
      		//If there are a file it will save it
      		var route = "";
      		if(typeof files.file !== 'undefined'){
      			if(files.file.name != ''){
      				route = path + files.file.name;
      				/* Possible error on Windows systems:
      				tried to rename to an already existing file */
      				fs.rename(files.file.path, route, function(error) {
      					if (error) {
      						fs.unlink(route);
      						fs.rename(files.file.path, route);
      					}
      				});
              memo = {text: req.body.text, date: req.body.date, route_file: req.body.file};
      			}
      		}

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
        });
      }
    });
  });

  /*
  Delete a note
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


  ////////////////////////////////////////////////
  ////////////////WEB
  ////////////////////////////////////////////////

  app.get("/", function(req, res) {
    console.log("GET / was called. ");

    res.send("Hello World");
  });

  /*
  Download undefined file
  */
  app.get("/file/:idMemo", function(req, res){
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

  app.get("/login", function(req, res){
    console.log("GET /login was called. ");

    var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/welcome" enctype="application/x-www-form-urlencoded" '+
    'method="post">'+
    'Username: <input type="text" id="username" name="username"/><br/>' +
    'Password: <input type="password" id="password" name="password"/><br/>' +
    '<input type="submit" value="Login" />'+
    '</form>'+
    '</body>'+
    '</html>';

    res.send(body);
  });

  app.post("/welcome", function(req, res){
    console.log("POST /welcome was called. ");
    //Llamar a la funcion /api/user/:username/:password
    var options = {hostname: 'localhost',
    port: '3000',
    path: '/api/user/' + req.body.username + '/' + req.body.password,
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
          var aux;
          aux = "Hola "+ json.message.username + "\n\n";
          //Form to add memos
          aux = aux + '<form action="/api/memo" enctype="application/x-www-form-urlencoded" '+
					'method="post">'+
					'Date*: <input type="date" name="date"/><br/>' +
					'Text*: <input type="text" name="text"/><br/>' +
					'File: <input type="file" name="file" multiple="multiple"/><br/>'+
					'<input type="hidden" name="username" value="'+ req.body.username +'"/>' +
					'<input type="hidden" name="password" value="'+ req.body.password +'"/>' +
					'<input type="submit" value="Save note" /></form><br/>\n\n';

          //End
          var memos = json.message.memos;
          aux = aux + '<table>';
		      aux = aux + '<tr><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th><th>Delete</th></tr>';
          for(var i = 0; i<memos.length; i++){
            var form = '<div><form action="delete/'+memos[i]._id+'" enctype="application/x-www-form-urlencoded" '+
      				'method="get">'+
      				'<input type="submit" value="Delete"></input>'+
      				'</form></div>';
      			aux = aux + '<tr>';
      			aux = aux + '<td>' + memos[i]._id + '</td>';
      			aux = aux + '<td>' + memos[i].date + '</td>';
      			aux = aux + '<td>' + memos[i].text + '</td>';
      			aux = aux + '<td>' + '<a href="./file/'+ memos[i]._id  +'">' + memos[i].route_file + '</a>' + '</td>';
      			aux = aux + '<td>' + '<a href="./memo/'+ memos[i]._id  +'">Details</a>' + '</td>';
      			aux = aux + '<td>' + form + '</td>';
      			aux = aux + '</tr>';
          }
          aux = aux + '</table>';

          res.send(aux);
        }
      });
    });
    req2.end();
  });

  app.get("/memo/:idMemo", function(req, res){
    console.log("GET /memo was called. ");

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
          var memo = json.message;
          var response = "";
          var memos = json.message.memos;
          response = response + '<table>';
          response = response + '<tr><th>Id</th><th>Date</th><th>Text</th><th>File</th><th>Info</th><th>Delete</th></tr>';
          var form = '<div><form action="delete/'+memo._id+'" enctype="application/x-www-form-urlencoded" '+
          	'method="get">'+
          	'<input type="submit" value="Delete"></input>'+
          	'</form></div>';
          response = response + '<tr>';
          response = response + '<td>' + memo._id + '</td>';
          response = response + '<td>' + memo.date + '</td>';
          response = response + '<td>' + memo.text + '</td>';
          response = response + '<td>' + '<a href="./file/'+ memo._id  +'">' + memo.route_file + '</a>' + '</td>';
          response = response + '<td>' + '<a href="./'+ memo._id  +'">Details</a>' + '</td>';
          response = response + '<td>' + form + '</td>';
          response = response + '</tr>';
          response = response + '</table>';

          res.send(response);
        }
      });
    });
    req2.end();
  });

  app.get("/delete/:idMemo", function(req, res){
      console.log("GET /delete was called. ");
      var options = {host: 'localhost',
        port: 3000,
        path: '/api/memo/' + req.params.idMemo + '/',
        method: 'DELETE'
      };
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
            console.log(json);
            res.send("Todo bien");
          }
        });
      });
      req2.on('error', function(){
        console.log("error");
      });
      req2.end();
  });


}

module.exports = appRouter;
