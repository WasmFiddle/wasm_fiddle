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
  console.log(req.files);

  const workingFolder = uuidv4();
 console.log(path.join(__dirname + '/tempData', workingFolder));
  fs.mkdir(
      path.join(__dirname + '/tempData', workingFolder),
      (err) => {
        if (err) {
          return console.error(err);
        }
        console.log('Directory created successfully!');

        console.log(workingFolder);
        const filePath = path.join(__dirname, `/tempData/${workingFolder}/`);
        fs.writeFile(filePath+req.files.file.name, req.files.file.data, function (err) {
          if (err) return console.log(err);
          console.log('Created File');
        });
      }
    )


  /*   fs.mkdir(((__dirname + '/testDir'), workingFolder), (err) => {
    if (err) {
      return console.error(err);
    }
    const fileloc = `__dirname/testDir/${workingFolder}/${req.files.file.name}`;

    fs.writeFile(fileloc, req.files.file.data, function (err) {
      if (err) return console.log(err);
      console.log('Created File');
    });
    console.log('Directory created successfully!');
  }); */

  /* tmp.dir(function _tempDirCreated(err, __dirname, cleanupCallback) {
    if (err) throw err;
   
    console.log('Dir: ', __dirname);
    
    // Manual cleanup
    cleanupCallback();
}); */

  /* temp.track();
temp.mkdir(path.join(__dirname , 'testDir'), (err) => {
    if (err) {
        return console.error(err);
    }
    console.log('Directory created successfully!');
}); */

  /* fs.mkdir(path.join(__dirname + '/tempData', 'test'), (err) => {
    if (err) {
        return console.error(err);
    }
    console.log('Directory created successfully!');
});
 */
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
