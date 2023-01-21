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

async function createjson(filePath) {
  try {
    const data = await fileio.readFileCore(filePath);
    var array = data.toString().split("\n");
    var arr = [];   
    for(i in array) {
      if(array[i].indexOf(":")!=-1){
        var arr2 = array[i].split(":");
        var node = createDraftNode(arr2[1].trim(), arr2[0].trim());
        arr.push(node);
      }
    }
  return arr;
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

async function getTodaysJson(filePath) {
  var dir = datetime.getTodaysDir(filePath) ;
  await fs.mkdir(dir, { recursive: true });
  try {
    const data = await fileio.readFileCore(dir + "/tasks.txt");
    var array = JSON.parse(data.toString());
    return array;
  } catch (error) {
    try {
    return createTodaysJson(filePath);
    
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
  }
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
  return arr; 
}

async function editTodaysJson(filePath, name, status, doneby, time) {
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
        node["end_time"]=time ;
        node["done_by"]=doneby;
      } 
   }
  await fileio.writeFileCore(dir + "/tasks.txt", JSON.stringify(array)); 
  await fileio.appendFileCore(dir + "/logs.txt", time + " : " + name + " " +  status+"\n" );
  return array; 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

function renderDailyTasks(req ,dirpath , res){
  var a =(createjson(__dirname + daily_task_path));
  a.then(function(result) {
    res.render('dailyTasks' , { now:datetime.datetime() ,arr:result});  
  })
}

function renderTaskList(req , page, dirpath, res){
  var a = getTaskList(req, dirpath);
  a.then(function(result) {
    res.render(page , {now:datetime.datetime() , arr:result, time:datetime.timeint()});  
    })
}

async function getTaskList(req , dirpath){
  var name = req.query.name;  
  if (name==null) 
    return (getTodaysJson(dirpath));
  else {
    if(req.query.action==null) {
      var status = req.query.status; 
      if(status=="Rescheduled")
      return  editTodaysSchedule(dirpath, "Resched", name, req.query.time);
      else 
      return editTodaysJson(dirpath, name, status, req.query.doneby, req.query.time);
    } else 
    return editTodaysSchedule(dirpath, req.query.action, req.query.name, req.query.time);     
  } 
}

async function editTodaysSchedule(filePath, action, name, time) {
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
        if ( node["id"]==name)  
         count = i;
      }
      array.splice(count,1);
    }
    
    count = 0;

    if (action == "Add" || action == "Resched") {
     
      for(i in array) {
        var node = array[i];
        if ( parseInt(node["sched_time"]) < parseInt(time)) {
         count ++;
        }
      }
      console.error("count:"+count);
      array.splice(count,0, createDraftNode(time, name));
    }

  await fileio.writeFileCore(dir + "/tasks.txt", JSON.stringify(array)); 
  await fileio.appendFileCore(dir + "/logs.txt", time + " : " + name + " " +  action +"\n");
  return array; 
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}

module.exports = { renderDailyTasks, editTodaysSchedule, renderTaskList}