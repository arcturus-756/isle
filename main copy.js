var express = require('express');  
var app = express();  
var theme = "sevi";
var view_var = './' + theme + '/src/pug';
app.set("view engine","pug")
app.set('views', view_var)
const fs = require('fs').promises;

async function createjson(filePath) {
  try {
    const data = await readFileCore(filePath);
    var array = data.toString().split("\n");
    var arr = [];   
    for(i in array) {
      var node = {};
      if(array[i].indexOf(":")!=-1){
        var arr2 = array[i].split(":");
        node["sched_time"]=arr2[1].trim();
        node["id"]=arr2[0].trim();
        node["status"]="";
        node["end_time"]="";
        node["done_by"]="";
        arr.push(node);
      }
    }
  return arr;
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function createTrackerFile(filePath) {
  try {
   
   var trackers = {};
   var tracks = [];
   var inProgress =[];
   var table=[];
   var completed=[]
   //var cupboard=[];
   //var icebox=[];
   //var warehouse=[];
   trackers["tracks"] = tracks;
   trackers["inProgress"] = inProgress ;
   trackers["table"] = table;
   trackers["completed"] = completed;
   var currentdate = new Date();
   var dir = filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
   await writeFileCore(dir + "/trackers.txt", JSON.stringify(trackers));
    
  return arr;
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function createTodaysJson(filePath) {
  var currentdate = new Date();
  var dir = filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
  await fs.mkdir(dir, { recursive: true });
  try {
    const data = await readFileCore(dir + "/tasks.txt");
    var array = JSON.parse(data.toString());
    return array;
  } catch (error) {
    try {
    const data = await readFileCore(filePath + "/jrnl/DailyRules.txt" );
    var array = data.toString().split("\n");
    var arr = [];
    for(i in array) {
      var node = {};
      if(array[i].indexOf(":")!=-1){
        var arr2 = array[i].split(":");
        node["sched_time"]=arr2[1].trim();
        node["id"]=arr2[0].trim();
        node["status"]="Draft";
        node["end_time"]="";
        node["done_by"]="";
        arr.push(node);
      }
   }  
  await writeFileCore(dir + "/tasks.txt", JSON.stringify(arr));
  await writeFileCore(dir + "/logs.txt", "");
  return arr; 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
  }
}


async function editTodaysJson(filePath, name, status, doneby, time) {
  var currentdate = new Date();
  var dir = filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
  try {
    const data = await readFileCore(dir + "/tasks.txt");
    var dataString = data.toString()
    var array = JSON.parse(dataString);
    for(i in array) {
      var node = array[i];
      console.log("Iterating Array " + i);
      if ( node["id"]==name) {
        node["status"]=status;
        node["end_time"]=time ;
        node["done_by"]=doneby;
      } 
   }
  await writeFileCore(dir + "/tasks.txt", JSON.stringify(array)); 
  await appendFileCore(dir + "/logs.txt", currentdate.getHours() + currentdate.getMinutes() + " : " + name + " " +  status );
  return array; 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function startTask(name, filePath, cat) { 
  var currentdate = new Date();
  var dir = filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
  try {
    const data = await readFileCore(dir + "/trackers.txt");
    var dataString = data.toString()
    var trackers = JSON.parse(dataString);
    var inProgress  = trackers["inProgress"];
    
    var node = {};
    node["start_time"] = currentdate.getHours()*100 + currentdate.getMinutes() ;
    node["task"] = name;
    node["cat"] = cat;
    inProgress.push(node);
  await writeFileCore(dir + "/trackers.txt", JSON.stringify(trackers)); 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function stopTask(name, filePath) { 
  var currentdate = new Date();
  var dir = filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
  try {
    const data = await readFileCore(dir + "/trackers.txt");
    var dataString = data.toString()
    var trackers = JSON.parse(dataString);
    var inProgress  = trackers["inProgress"];
    var tracks = trackers["tracks"];
    
    for(i in inProgress) {
      var node = inProgress[i];
      if(node["task"]==name) {
        inProgress.splice(i,1);
        node["stop_time"] = currentdate.getHours()*100 + currentdate.getMinutes() ;
        tracks.push(node);
      }
    }
  await writeFileCore(dir + "/trackers.txt", JSON.stringify(trackers)); 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}


app.get('/', function(req, res){
  var page = req.query.page;
 
  
  switch(page) {
    case 'daily_tasks':
      renderDailyTasks(req, __dirname, res);
      break;
    case 'today_tasks':
      renderTaskList(req, 'daysTasks', __dirname, res);
      break;
    case 'remaining_tasks':
      renderTaskList(req, 'remainingTasks', __dirname, res);
      break;
    case 'todaysTrackers':
        renderTrackers(req, __dirname, res);
        break;
    default:
      res.render('index' , {val:req.query.page});  
  }
})

function renderDailyTasks(req ,dirpath , res){
  var a =(createjson(__dirname + "/jrnl/DailyRules.txt"));
  a.then(function(result) {
    res.render('dailyTasks' , { now:datetime ,arr:result});  
  })
}

function timeint(){
  var currentdate = new Date();
  var timeint = currentdate.getHours()*100 + currentdate.getMinutes();
  return timeint;
}

function datetime(){
  var currentdate = new Date();
  var datetime = "Page Refreshed: " + currentdate.getDate() + "/" + (currentdate.getMonth() +1)
  + "/" + currentdate.getFullYear() + " | " 
  + currentdate.getHours() + ":" 
  + currentdate.getMinutes() + ":" + currentdate.getSeconds();  
  return datetime;
}

async function renderTrackers(req , dirpath, res){
var act = req.query.act;
if (act!=null && act=="start"){
  startTask(req.query.task, dirpath, req.query.cat) 

}
else if (act!=null && act=="stop"){
  stopTask(req.query.task, dirpath) 

} else{


  try { 
    const data = await readFileCore(__dirname + "/jrnl/Trackers.txt");
    var array = data.toString().split("\n");
    var tasks = []; 
    var cats = new Set();  
    
    for(i in array) {
      var node = {};
      if(array[i].indexOf(":")!=-1){
        var arr3 = array[i].split(":");
        node["desc"]=arr3[0].trim();
        node["parent"]=arr3[1].trim();
        cats.add(arr3[0].trim());
        cats.add(arr3[1].trim());
        tasks.push(node);
      }

    }
  
    console.log(JSON.stringify(tasks));

    res.render('trackers' , {now:datetime() , arr:tasks, set:cats, time:timeint()});  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}
}

function renderTaskList(req , page, dirpath, res){
  var name = req.query.name;  
  if (name==null) {
    var a =(createTodaysJson(dirpath));
    a.then(function(result) {
      console.log(JSON.stringify(result));
      res.render(page , {now:datetime() , arr:result, time:timeint()});  
      })
    } else {
      if(req.query.action==null) {
        var status = req.query.status; 
        if(status=="Rescheduled") {
          var a =editTodaysSchedule(dirpath, "Resched", name, req.query.time)
        } else {
         
          var doneby = req.query.doneby;  
          var time = req.query.time; 
          var a =(editTodaysJson(dirpath, name, status, doneby, time));
        }
        a.then(function(result) {
          console.log(JSON.stringify(result));
          res.render(page , {now:datetime() , arr:result, time:timeint()});  
        })
      
      } else {
        var action = req.query.action; 
        var name = req.query.name;  
        var time = req.query.time; 
        var a =(editTodaysSchedule(dirpath, action, name, time));
        a.then(function(result) {
          console.log(JSON.stringify(result));
          res.render(page , {now:datetime() , arr:result, time:timeint()});  
        })
    
      }
  } 
}

async function editTodaysSchedule(filePath, action, name, time) {
  var currentdate = new Date();
  var dir = filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
  try {
    const data = await readFileCore(dir + "/tasks.txt");
    var dataString = data.toString()
    var array = JSON.parse(dataString);

    var count = 0;

    if (action == "Cancel" || action == "Resched") {
      for(i in array) {
        var node = array[i];
        console.log("Iterating Array " + i);
        if ( node["id"]==name)  
         count = i;
      }
      array.splice(count,1);
    }
    
    count = 0;

    

    if (action == "Add" || action == "Resched") {
      var insertNode = {};
      insertNode["end_time"]="" ;
      insertNode["id"]=name;
      insertNode["status"]="Draft";
      insertNode["sched_time"]=time ;
      
      insertNode["done_by"]="" ;

      for(i in array) {
        var node = array[i];
        if ( parseInt(node["sched_time"]) < parseInt(time)) {
        console.error(node["sched_time"]+"<"+time);
         count ++;
        }
      }
      console.error("count:"+count);
      array.splice(count,0, insertNode);
    }


  await writeFileCore(dir + "/tasks.txt", JSON.stringify(array)); 
  await appendFileCore(dir + "/logs.txt", currentdate.getHours() + currentdate.getMinutes() + " : " + name + " " +  action );
  return array; 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

app.get('/exp', function (req, res) {  
   readFile(__dirname + "/jrnl/DailyRules.txt", res);

   createTrackerFile(__dirname);
   res.writeHead(200, {'Content-Type': 'text/html'});
  res.end('Hello World!');
 })  

app.get('/index.html', function (req, res) {  
  res.render('index');  
})  

app.get('/createjson', function (req, res) {  
  var a =(createjson(__dirname + "/jrnl/DailyRules.txt", res));
  a.then(function(result) {
    res.send(result);
 })
})  














async function writeFileCore(filePath, data) {
  fs.writeFile(filePath, data, (err) => {
    if (err)
      console.log(err);
    else 
      console.log("File written successfully\n");
  });
}

async function appendFileCore(filePath, message) {
    fs.appendFile(filePath, message, function (err) {
      if (err) throw err;
      console.log('Saved!');
   });
}

async function readFileCore(filePath) {
  try {
      const data = await fs.readFile(filePath);
      return data;
  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function readFile(filePath, res) {
  try {
    const data = await readFileCore(filePath);
    var array = data.toString().replaceAll("\n","<br>");
    res.send(array);
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}













// Hello World

app.get('/hello', function(req, res){
   res.send("You just called th <br> e post method at '/hello'!\n");
});

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
