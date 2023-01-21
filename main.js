var express = require('express');  
var app = express();  
var theme = "sevi";
var view_var = './' + theme + '/src/pug';
app.set("view engine","pug")
app.set('views', view_var)
const fs = require('fs').promises;
const utils = require('./code/utils.js');
const task = require('./code/task.js');
const trackers = require('./code/trackers.js');
const goals = require('./code/goals.js');
const logs = require('./code/logs.js');


app.get('/', function(req, res){
  var page = req.query.page;
 
  
  switch(page) {
    case 'daily_tasks':
      utils.renderDailyTasks(req, __dirname, res);
      break;
    case 'create_sheet':
      task.renderCreateTaskSheet(req, __dirname, res);
      break;
    case 'today_tasks':
      utils.renderTaskList(req, 'daysTasks', __dirname, res);
      break;
    case 'remaining_tasks':
      utils.renderTaskList(req, 'remainingTasks', __dirname, res);
      break;
    case 'taskSheet':
        task.renderTaskSheet(req, __dirname, res);
        break;
    case 'todaysTrackers':
      trackers.renderTrackers(req, __dirname, res);
      break;
    case 'goals':
      goals.renderGoals(req, __dirname, res);
      break;
    case 'logs':
      logs.renderLogs(req, __dirname, res);
      break;
    default:
      res.render('index' , {val:req.query.page});  
  }
})




// Resource Handlers

app.get('/:id1', function(req, res){
   res.sendFile( __dirname + "/"+ theme +"/public/" + req.params.id1 );  
});

app.get('/:id1/:id2', function(req, res){
   res.sendFile( __dirname + "/"+ theme +"/public/"  + req.params.id1 + "/" + req.params.id2 );  
});


app.get('/:id1/:id2/:id3', function(req, res){
   res.sendFile( __dirname + "/"+ theme +"/public/" + req.params.id1 + "/" + req.params.id2 + "/" + req.params.id3 );  
});

app.get('/:id1/:id2/:id3/:id4', function(req, res){
   res.sendFile( __dirname + "/"+ theme +"/public/" + req.params.id1 + "/" + req.params.id2 + "/" + req.params.id3 + "/" + req.params.id4 );  
});

app.get('/:id1/:id2/:id3/:id4/:id5', function(req, res){
   res.sendFile( __dirname + "/"+ theme +"/public/" + req.params.id1 + "/" + req.params.id2 + "/" + req.params.id3 + "/" + req.params.id4 + "/" + req.params.id5);  
});

app.get('/:id1/:id2/:id3/:id4/:id5/:id6', function(req, res){
   res.sendFile( __dirname + "/"+ theme +"/public/"  + req.params.id1 + "/" + req.params.id2 + "/" + req.params.id3 + "/" + req.params.id4 + "/" + req.params.id5+ "/" + req.params.id6);  
});


// Final 





















 app.listen(8989) ;


 // End
