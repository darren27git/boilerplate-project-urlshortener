require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
const urlDataBase = {};
let num = 1;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/shorturl', (req, res) => {
  const inputUrl = req.body.url;
  dns.lookup(inputUrl, (err,address) => {
    if(err){
      res.json({error: 'invalid url'});
    }
    else{
      res.send({original_url: req.body.url, shorturl: "test"});
    }
  });

  //res.send({original_url: req.body.url, shorturl: "test"});
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
