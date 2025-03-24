require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;
const urlDataBase = {};
let num = 0;

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
  //const parsedUrl = url.parse(inputUrl);
  try{
    const website = new URL(inputUrl);
    const hostname = website.hostname;
    dns.lookup(hostname, (err,address) => {
      if(err){
        res.json({error: 'invalid url'});
      }
      else{
        if(urlDataBase[inputUrl]){
          res.json({original_url: req.body.url, shorturl: urlDataBase[inputUrl]});
        }
        else{
          num++;
          urlDataBase[inputUrl] = num;
          res.json({original_url: req.body.url, shorturl: num});
        }
      }
    });

  } catch (error){
    if(error instanceof TypeError){
      res.json({error: 'invalid url'});
    }
  }
});



app.get('/api/shorturl/:num', (req,res) => {
  const shortValue = parseInt(req.params.num);
  let originalUrl = null;
  for(const url in urlDataBase){
    if(urlDataBase[url] === shortValue){
      originalUrl = url;
      break;
    }
  }
  if(originalUrl){
    console.log(originalUrl);
    res.redirect(originalUrl);
  }
  else{
    res.json({err: "Not found"});
  }

});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
