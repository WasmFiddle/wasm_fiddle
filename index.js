const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');
app.enable('trust proxy');

const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const util = require('util');
const path = require('path');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;

app.use(
  fileUpload({
    createParentPath: true,
  })
);

//Route for homepage
app.get('/', (req, res) => {
  res.render('index');
});

//Route for uploading wasm file
app.get('/file/:fID', (req,res) => {
    const { fID } = req.params;
    console.log("File Sent");
    res.sendFile(path.join(__dirname, `/tempData/${fID}/output.wasm`));
   
    //COMMENT THIS OUT IF YOU WANT TO KEEP THE FILE
    // https://www.geeksforgeeks.org/node-js-fs-rmdir-method/
    fsPromises.rmdir(path.join(__dirname, `/tempData/${fID}`), {
        recursive: true,
      }, (error) => {
        if (error) {
          console.log(error);
        }
        else {
          console.log(`Recursive: ${fID} Deleted!`);
        }
      });
})


app.post('/data', async (req, res) => {
     makeCreateReply(req, res);
});

async function makeCreateReply(req, res) {

  //Generates Random string for temp folder
  const workingFolder = uuidv4();

  //Set file data
  const fileName = req.files.file.name;
  const fileData = req.files.file.data;

  // Create a folder in the tempData folder
  fsPromises.mkdir(path.join(__dirname + '/tempData', workingFolder), (err) => {
      if (err) {
        return console.error(err);
      }
    })

    .then(() => {
      // Set file path to the new folder and then write the file
      const filePath = path.join(__dirname, `/tempData/${workingFolder}/`);

      fsPromises.writeFile(filePath + fileName, fileData, (err) => {
          if (err) return console.log(err);
          
        })
        .then(() => {
        
          const cmdLine = `emcc ${fileName} -s EXPORTED_FUNCTIONS="['_main']" -o output.js`;

          // Run the command line in the folder that was created
            execSync(
                cmdLine,
                {
                cwd: path.join(__dirname, `/tempData/${workingFolder}/`),
                })
            
        }).then(() => {
            
            res.status(200).json({ wrkdir: `${workingFolder}`});
        })
        .catch((e) => {
            let err = e.toString()
            let errLines = err.split('\n')
            errLines.splice(0,2)
            let finalErr = errLines.join('\n');
            err = finalErr.substring(0, finalErr.indexOf('emcc:'))
            //console.log("\n\n\n\n" + err);

            res.status(200).json({ error: `${err}`});

            fsPromises.rmdir(path.join(__dirname, `/tempData/${workingFolder}`), {
                recursive: true,
              }, (error) => {
                if (error) {
                  console.log(error);
                }
                else {
                  console.log(`Recursive: ${fID} Deleted!`);
                }
              });
        });
    })
    .catch((e) => console.log(e));
}

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
