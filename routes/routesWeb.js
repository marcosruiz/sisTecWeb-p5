var appRouter = function(app, http) {
  var path = "C:/Users/marco/Documents/GitHub/sisTecWeb-p5/tmp/";
  var multer  = require('multer');
  var upload = multer({ dest: path });
  var fs = require('fs');

  /*
  It sends a form log in and Sing up
  */
  app.get("/", function(req, res){
    console.log("GET / was called. ");

    var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<h1>Log in</h1>'+
    '<form action="/welcome" enctype="application/x-www-form-urlencoded" '+
    'method="post">'+
    'Username: <input type="text" id="username" name="username"/><br/>' +
    'Password: <input type="password" id="password" name="password"/><br/>' +
    '<input type="submit" value="Log in" />'+
    '</form>'+
    '<br/><br/><br/>'+
    '<h1>Sing up</h1>'+
    '<form action="/api/user" enctype="application/x-www-form-urlencoded" '+
    'method="post">'+
    'Username: <input type="text" id="username" name="username"/><br/>' +
    'Password: <input type="password" id="password" name="password"/><br/>' +
    '<input type="submit" value="Sing up" />'+
    '</form>'+
    '</body>'+
    '</html>';

    res.send(body);
  });

  /*
  It sends a form to create a new memo and a list of all memos of your user
  */
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
          aux = aux + '<form action="/api/memo" enctype="multipart/form-data" '+
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
            aux = aux + '<td>' + '<a href="./api/file/'+ memos[i]._id  +'">' + memos[i].route_file + '</a>' + '</td>';
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

  /*
  It sends a memo
  */
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
          var form = '<div><form action="../delete/'+memo._id+'" enctype="application/x-www-form-urlencoded" '+
          'method="get">'+
          '<input type="submit" value="Delete"></input>'+
          '</form></div>';
          response = response + '<tr>';
          response = response + '<td>' + memo._id + '</td>';
          response = response + '<td>' + memo.date + '</td>';
          response = response + '<td>' + memo.text + '</td>';
          response = response + '<td>' + '<a href="../api/file/'+ memo._id  +'">' + memo.route_file + '</a>' + '</td>';
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

  /*
  It sends if elimination of memo with _id = :idMemo was successful or not
  */
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
        res.send("Todo bien");
      }
    });
  });
  req2.end();
});
}

module.exports = appRouter;
