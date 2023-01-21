const fs = require('fs').promises;




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


module.exports = { writeFileCore, appendFileCore, readFileCore}