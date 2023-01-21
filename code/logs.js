const fs = require('fs').promises;
const fileio = require('./fileio.js');
const datetime = require('./datetime.js');



async function renderLogs(req , dirpath, res){
  var act = req.query.act;

  if (act!=null && act=="add"){
    try {
      var currentdate = new Date();
      var dir = dirpath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
      const data = await fileio.readFileCore(dir + "/logs.txt");
      var array = data.toString().split("\n");
      array.push(req.query.time + " : "+ req.query.log )
      
     
      await fileio.appendFileCore(datetime.getTodaysDir(dirpath) + "/logs.txt",req.query.time + " : "+ req.query.log  +"\n");

     

      
      res.render('logs' , {now:datetime.datetime() ,time:datetime.timeint(), trackerSet:array});  
    } catch (error) {
      console.error(`Got an error trying to read the file: ${error.message}`);
    }
    
  } else {
  
  try {
    var currentdate = new Date();
    var dir = dirpath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
    const data = await fileio.readFileCore(dir + "/logs.txt");
    var array = data.toString().split("\n");
    res.render('logs' , {now:datetime.datetime() , time:datetime.timeint(), trackerSet:array});  
  } catch (error) {
    console.error(`Got an error trying to read the file: ${error.message}`);
  }
  

     
  }
  
}
  

module.exports = {renderLogs}