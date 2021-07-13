const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');
app.enable('trust proxy');

app.get('/', (req, res) => {
  res.render('index');
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
