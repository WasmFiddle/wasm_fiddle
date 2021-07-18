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

app.use(
  fileUpload({
    createParentPath: true,
  })
);

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/data', async (req, res) => {
  //   console.log(req.body.filetype);
  //   console.log(req.files);
  Promise.resolve(convertFile(req)).then(()=>{

  });
});

async function convertFile(req) {
  const workingFolder = uuidv4();

  const fileName = req.files.file.name;
  const fileData = req.files.file.data;


  // Create a folder in the tempData folder
  fs.mkdir(path.join(__dirname + '/tempData', workingFolder), (err) => {
    if (err) {
      return console.error(err);
    }

    console.log('Directory created successfully!');
    console.log(workingFolder);

    // Set file path to the new folder and then write the file
    const filePath = path.join(__dirname, `/tempData/${workingFolder}/`);
    fsPromises
      .writeFile(filePath + fileName, fileData, (err) => {
        if (err) return console.log(err);
        console.log('Created File');
      })
      .then(() => {
        const cmdLine = `emcc ${fileName} -s STANDALONE_WASM -o output.wasm`;

        // Run the command line in the folder that was created
        exec(
          cmdLine,
          {
            cwd: path.join(__dirname, `/tempData/${workingFolder}/`),
          },
          (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
          }
        );
      });
  });
}

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
