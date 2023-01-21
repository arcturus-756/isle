const fs = require('fs').promises;
const fileio = require('./fileio.js');
const datetime = require('./datetime.js');

var tracker_path = "/jrnl/Goals.txt";


async function startGoal(req, filepath,res) { 
  var currentdate = new Date();
 
  var data;
  try {
    data = await fileio.readFileCore(filepath + tracker_path);
    var dataString = data.toString()
    var trackers = JSON.parse(dataString);
    var inProgress  = trackers["inProgress"];

    var node = {};
   
    if (req.query.start_time!=null)
      node["start_time"] = req.query.start_time ;
    else
      node["start_time"] = currentdate.getHours()*100 + currentdate.getMinutes() ;
      node["sched_time"] = req.query.sched_time ;
   
    node["task"] = req.query.task;
    node["cat"] = req.query.cat;
    inProgress.push(node);
    await fileio.writeFileCore(filepath + tracker_path, JSON.stringify(trackers)); 
    res.render('goals' , {now:datetime.datetime() , arr:[], set:[], time:datetime.timeint(), trackerSet:trackers});  
  } catch (error) {
    try {
      var trackers = {};
      var tracks = [];
      var inProgress =[];
      var table=[];
      var completed=[]
      //var cupboard=[];
      //var icebox=[];
      //var warehouse=[];
      var node = {};
      node["start_time"] = req.query.start_time ;
      node["sched_time"] = req.query.sched_time ;
      node["task"] = req.query.task;
      node["cat"] = req.query.cat;
      inProgress.push(node);
      trackers["tracks"] = tracks;
      trackers["inProgress"] = inProgress ;
      trackers["table"] = table;
      trackers["completed"] = completed;
      var currentdate = new Date();
     
      await fileio.writeFileCore(filepath + tracker_path, JSON.stringify(trackers));
      res.render('goals' , {now:datetime.datetime() , arr:[], set:[], time:datetime.timeint(), trackerSet:trackers});  
      
     } catch (error) {
       console.error(`Got an error trying to read the file: ${error.message}`);
     }
  
}

}



async function stopGoal(req, filepath,res) { 
  var currentdate = new Date();
  var dir =filepath + tracker_path ;
  try {
    const data = await fileio.readFileCore(dir );
    var dataString = data.toString()
    var trackers = JSON.parse(dataString);
    var inProgress  = trackers["inProgress"];
    var tracks = trackers["tracks"];
    
    for(i in inProgress) {
      var node = inProgress[i];
      if(node["task"]==req.query.task) {
        inProgress.splice(i,1);
        if (req.query.stop_time!=null)
          node["stop_time"] = req.query.stop_time ;
        else
          node["stop_time"] = currentdate.getHours()*100 + currentdate.getMinutes() ;
        tracks.push(node);
      }
    }
  await fileio.writeFileCore(dir , JSON.stringify(trackers)); 
  res.render('goals' , {now:datetime.datetime() , arr:[], set:[], time:datetime.timeint(), trackerSet:trackers});  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}


async function renderGoals(req , dirpath, res){
  var act = req.query.act;

  if (act!=null && act=="Start")
    startGoal(req, dirpath,res);

  else if (act!=null && act=="Stop")
    stopGoal(req, dirpath,res) ;
else{
  
    try { 
      const data = await fileio.readFileCore(dirpath + tracker_path);
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

  

      const trackerdata = await fileio.readFileCore(dirpath + tracker_path);
      var trackerString = trackerdata.toString()
      var trackers = JSON.parse(trackerString);
  
      res.render('goals' , {now:datetime.datetime() , arr:tasks, set:cats, time:datetime.timeint(), trackerSet:trackers});  
      }catch (error) {
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
         
         
          await fileio.writeFileCore(dirpath + tracker_path , JSON.stringify(trackers));
          res.render('goals' , {now:datetime.datetime() , arr:tasks, set:cats, time:datetime.timeint(), trackerSet:trackers});  
          
         } catch (error) {
           console.error(`Got an error trying tgvhgvhvhvhvhgvo read the file: ${error.message}`);
         }
      }
    } 
  }
  

  

module.exports = { renderGoals}