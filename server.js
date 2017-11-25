'use strict';

const fs = require('fs');
const express = require('express');
const app = express();
const moment = require('moment');

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

// Take in date parameter 
app.get('/:dateParm', (req,res) => {
  //test for parameter to be a number
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];
  let naturalTime;
  const dateParm = req.params.dateParm;
  
  if (Number(dateParm)) { //test for unix time
    naturalTime = moment.unix(Number(dateParm));
    res.json({
      unix: dateParm,
      natural: naturalTime.format("MMMM D, YYYY")
    });    
      
  } else if (moment(dateParm).isValid()){ // test for natural date
    naturalTime = moment(dateParm);  
         
    res.json({
          unix: naturalTime.unix(),
          natural: dateParm
        });       
  } else { //neither unix or natural date param
      res.json({
        unix: null,
        natural: null
      }); 
  }
});

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

