const fs = require('fs').promises;
const fileio = require('./fileio.js');
const datetime = require('./datetime.js');

var tracker_path = "/jrnl/Trackers.txt";


async function startTask(req, filepath,res) { 
  var currentdate = new Date();
 // var dir = filepath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
  var data;
  try {
    data = await fileio.readFileCore(datetime.getTodaysDir(filepath) + "/trackers.txt");
    var dataString = data.toString()
    var trackers = JSON.parse(dataString);
    var inProgress  = trackers["inProgress"];

    var node = {};
   
    if (req.query.start_time!=null)
      node["start_time"] = req.query.start_time ;
    else
      node["start_time"] = currentdate.getHours()*100 + currentdate.getMinutes() ;

   
    node["task"] = req.query.task;
    node["cat"] = req.query.cat;
    inProgress.push(node);
    await fileio.writeFileCore(datetime.getTodaysDir(filepath) + "/trackers.txt", JSON.stringify(trackers)); 
    await fileio.appendFileCore(datetime.getTodaysDir(filepath)+ "/logs.txt", req.query.start_time + " : " + req.query.task + " started" +"\n");
    res.render('trackers' , {now:datetime.datetime() , arr:[], set:[], time:datetime.timeint(), trackerSet:trackers});  
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
      node["start_time"] = currentdate.getHours()*100 + currentdate.getMinutes() ;
      node["task"] = req.query.task;
      node["cat"] = req.query.cat;
      inProgress.push(node);
      trackers["tracks"] = tracks;
      trackers["inProgress"] = inProgress ;
      trackers["table"] = table;
      trackers["completed"] = completed;
      var currentdate = new Date();
     
      var dir = filepath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
      
      await fileio.writeFileCore(datetime.getTodaysDir(filepath) + "/trackers.txt", JSON.stringify(trackers));
      res.render('trackers' , {now:datetime.datetime() , arr:[], set:[], time:datetime.timeint(), trackerSet:trackers});  
      
     } catch (error) {
       console.error(`Got an error trying to read the file: ${error.message}`);
     }
  
}

}



async function stopTask(req, filePath,res) { 
  var currentdate = new Date();
  var dir = datetime.getTodaysDir(filePath) ;
  try {
    const data = await fileio.readFileCore(dir + "/trackers.txt");
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
  await fileio.writeFileCore(dir + "/trackers.txt", JSON.stringify(trackers)); 
  await fileio.appendFileCore(datetime.getTodaysDir(filepath)+ "/logs.txt", req.query.stop_time + " : " + req.query.task + " started" +"\n");
  res.render('trackers' , {now:datetime.datetime() , arr:[], set:[], time:datetime.timeint(), trackerSet:trackers});  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
}


async function renderTrackers(req , dirpath, res){
  var act = req.query.act;

  if (act!=null && act=="Start")
    startTask(req, dirpath,res);

  else if (act!=null && act=="Stop")
    stopTask(req, dirpath,res) ;
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

      try { 
      var currentdate = new Date();
       var dir = dirpath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
      const trackerdata = await fileio.readFileCore(dir + "/trackers.txt");
      var trackerString = trackerdata.toString()
      var trackers = JSON.parse(trackerString);
    
      //console.log(JSON.stringify(tasks));
  
      res.render('trackers' , {now:datetime.datetime() , arr:tasks, set:cats, time:datetime.timeint(), trackerSet:trackers});  
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
          var currentdate = new Date();
          var dir = dirpath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
          await fileio.writeFileCore(datetime.getTodaysDir() + "/trackers.txt", JSON.stringify(trackers));
          res.render('trackers' , {now:datetime.datetime() , arr:tasks, set:cats, time:datetime.timeint(), trackerSet:trackers});  
          
         } catch (error) {
           console.error(`Error`);
         }
      }
    } catch (error) {
      console.error(`Error`);
    }
  }
  
}
  

module.exports = { renderTrackers}