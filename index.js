require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const res = require('express/lib/response');

// Basic Configuration
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;


mongoose.connect(mongoUri);

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true },
});

const Url = mongoose.model('Url', urlSchema);

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

  try{
    const website = new URL(inputUrl);
    const hostname = website.hostname;
    dns.lookup(hostname, async (err,address) => {
      if(err){
        res.json({error: 'invalid url'});
      }
      else{
        const existUrl = await Url.findOne({ original_url: inputUrl });
        if(existUrl){
          res.json({original_url: existUrl.original_url, shorturl: existUrl.short_url});
        }
        else{
          const count = await Url.countDocuments();
          const shortUrl = count + 1;
          const newUrl = new Url({ original_url: inputUrl, short_url: shortUrl });
          await newUrl.save();
          res.json({ original_url: inputUrl, short_url: shortUrl });
        }
      }
    });

  } catch (error){
    if(error instanceof TypeError){
      res.json({error: 'invalid url'});
    }
  }
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortNum = parseInt(req.params.short_url);

  try {
    const urlData = await Url.findOne({ short_url: shortNum });

    if (urlData) {
      res.redirect(urlData.original_url);
    } else {
      res.json({ error: 'Short URL not found' });
    }
  } catch (err) {
    res.json({ error: 'Failed' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
