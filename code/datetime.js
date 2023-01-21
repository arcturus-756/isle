const fs = require('fs').promises;


function getTodaysDir(filePath) {
  var currentdate = new Date();
  return filePath + "/" + currentdate.getFullYear() + "/" + (currentdate.getMonth() + 1 )+ "/" + currentdate.getDate() ;
}

function getYesterdaysDir(filePath) {
  var yesterdaydate = new Date();
  yesterdaydate.setDate(yesterdaydate.getDate() - 1);

  return filePath + "/" + yesterdaydate.getFullYear() + "/" + (yesterdaydate.getMonth() + 1 )+ "/" + yesterdaydate.getDate() ;
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

module.exports = { getTodaysDir, getYesterdaysDir, timeint, datetime}