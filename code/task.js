const fs = require('fs').promises;
const fileio = require('./fileio.js');
const datetime = require('./datetime.js');

var daily_task_path = "/jrnl/DailyRules.txt";

function createDraftNode(time, id) {
  var node = {};
  node["sched_time"]=time;
  node["id"]=id;
  node["status"]="Draft";
  node["end_time"]="";
  node["done_by"]="";
  return node;
}


 async function createTodaysJson(filePath) {
  var dir = datetime.getTodaysDir(filePath) ;
  await fs.mkdir(dir, { recursive: true });
  const data = await fileio.readFileCore(filePath + daily_task_path );
    var array = data.toString().split("\n");
    var arr = [];
    for(i in array) {
      var node = {};
      if(array[i].indexOf(":")!=-1){
        var arr2 = array[i].split(":");
        var node = createDraftNode(arr2[1].trim(), arr2[0].trim());
        arr.push(node);
      }
   }  
  await fileio.writeFileCore(dir + "/tasks.txt", JSON.stringify(arr));
  await fileio.writeFileCore(dir + "/logs.txt", "");
  await fileio.writeFileCore(dir + "/activitylogs.txt", "");
  return arr; 
}


function renderCreateTaskSheet(req ,dirpath , res){
  var a =(createTaskSheet(dirpath));
  a.then(function(result) {
   // res.render('daysTasks' , { now:datetime.datetime() ,arr:result});  
    res.render('taskSheet' , {now:datetime.datetime() , result, time:datetime.timeint()});  
  })
}

function renderTaskSheet(req , dirpath, res){
  getTaskSheet(req, dirpath, res);
}

async function createTaskSheet(filePath){
  var dir = datetime.getTodaysDir(filePath) ;
  await fs.mkdir(dir, { recursive: true });
  return createTodaysJson(filePath);
}


async function getTaskSheet(req , dirpath, res){
  var name = req.query.name;  
  if (name==null) 
    return (getTodaysSheet(req, dirpath,  res));
  else {
    if(req.query.action==null) {
      var status = req.query.status; 
      if(status=="Rescheduled")
        changeSheetTasks(dirpath, "Resched", req, res);  
      else 
        editTodaysSheet(dirpath, name, status, req, res);
    } else 
      changeSheetTasks(dirpath, req.query.action, req,res);   
  } 
}

async function changeSheetTasks(filePath, action, req, res) {
  var dir = datetime.getTodaysDir(filePath) ;
  try {
    const data = await fileio.readFileCore(dir + "/tasks.txt");
    var dataString = data.toString()
    var array = JSON.parse(dataString);

    var count = 0;

    if (action == "Cancel" || action == "Resched") {
      for(i in array) {
        var node = array[i];
        //console.log("Iterating Array " + i);
        if ( node["id"]==req.query.name)  
         count = i;
      }
      array.splice(count,1);
    }
    
    count = 0;

    if (action == "Add" || action == "Resched") {
     
      for(i in array) {
        var node = array[i];
        if ( parseInt(node["sched_time"]) < parseInt(req.query.time)) {
         count ++;
        }
      }
      console.error("count:"+count);
      array.splice(count,0, createDraftNode(req.query.time, req.query.name));
    }

  await fileio.writeFileCore(dir + "/tasks.txt", JSON.stringify(array)); 
  await fileio.appendFileCore(activitydir + "/activitylogs.txt", req.query.time + " : " + req.query.name + " " +  action +"\n");
  res.render('taskSheet' , {now:datetime.datetime() , arr:filter(req, JSON.stringify(array)), time:datetime.timeint()});  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function editTodaysSheet(filePath, name, status, req, res) {
  var dir = datetime.getTodaysDir(filePath) ;
  try {
    const data = await fileio.readFileCore(dir + "/tasks.txt");
    var dataString = data.toString()
    var array = JSON.parse(dataString);
    for(i in array) {
      var node = array[i];
      //console.log("Iterating Array " + i);
      if ( node["id"]==name) {
        node["status"]=status;
        node["end_time"]=req.query.time ;
        node["done_by"]=req.query.doneby;
      } 
   }
  await fileio.writeFileCore(dir + "/tasks.txt", JSON.stringify(array)); 
  if (status=="Done")
    await fileio.appendFileCore(dir + "/logs.txt", req.query.time + " : " + name.replace("_"," ") + " completed"+"\n" );
    await fileio.appendFileCore(dir + "/activitylogs.txt", req.query.time + " : " + name + " " +  status+"\n" );
  res.render('taskSheet' , {now:datetime.datetime() , arr:filter(req,JSON.stringify(array)), time:datetime.timeint()});  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function getTodaysSheet(req, filePath, res) {
  var dir = datetime.getTodaysDir(filePath) ;
  await fs.mkdir(dir, { recursive: true });
  const data = await fileio.readFileCore(dir + "/tasks.txt");
  if(data==null) {
      res.render('createTaskSheet' , { now:datetime.datetime() ,arr:[]});  
  
  } else {

    var array = filter(req, data);//JSON.parse(data.toString());
    res.render('taskSheet' , {now:datetime.datetime() , arr:array, time:datetime.timeint()});  
  }
}

function filter(req, data) {
  var array = JSON.parse(data.toString());
  var resultarray = [];
  if (req.query.type != null && req.query.type == 'remaining'){
    for(i in array) {
      var node = array[i];
      if ( node["status"]=="Draft")  
        resultarray.push(node);
    }
    array = resultarray;
    resultarray = [];
  } 
  
  if (req.query.type != null && req.query.type == 'executed'){
    for(i in array) {
      var node = array[i];
      if ( node["status"]!="Draft")  
        resultarray.push(node);
    }
    array = resultarray;
    resultarray = [];
    return array;
  }

  var limit = 2400;
  if (req.query.limit != null){
    limit = parseInt(req.query.limit) * 100;
    var currenttime = datetime.timeint();

    for(i in array) {
      var node = array[i];
      if ( parseInt(node["sched_time"]) <= parseInt(currenttime + limit))  {
        resultarray.push(node);
      }
    }
    array = resultarray;
    resultarray = [];
  }
return array;
}


module.exports = { renderTaskSheet, renderCreateTaskSheet}