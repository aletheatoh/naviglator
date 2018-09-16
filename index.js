'use strict';

const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
// const db = require('./db');
const fs = require ('fs');
const https = require("https");
const http = require("http");

var request = require('request');

var name = 'name';

/**
 * ===================================
 * Configurations and set up
 * ===================================
 */

 // **********************************************
// *** Update or verify the following values. ***
// **********************************************

// Replace the subscriptionKey string value with your valid subscription key.
let subscriptionKey = 'f658d22abcd147b5975b2677502e5ffb';

let host = 'api.cognitive.microsofttranslator.com';

// Init express app
const app = express();

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());

// Set handlebars to be the default view engine
const handlebarsConfigs = {
  extname: '.handlebars',
  layoutsDir: 'views'
  // defaultLayout: 'layout'
};

app.engine('.handlebars', handlebars(handlebarsConfigs));
app.set('view engine', 'handlebars');

/**
 * ===================================
 * Routes
 * ===================================
 */

// Import routes to match incoming requests
// require('./routes')(app, db);

// tell Express to look into the public/ folder for assets that should be publicly available (eg. CSS files, JavaScript files, images, etc.)
app.use(express.static('public'));

// Root GET request (it doesn't belong in any controller file)
app.get('/', (request, response) => {

  response.render('welcome')
});

app.get('/translate-controls', (request, response) => {

  let lang = request.query.lang;

  var json = {
    start_translated: '',
    end_translated: '',
    send_translated: '',
    directions_translated: '',
    streetview_translated: '',
    chat_translated: '',
    sendmsg_translated: ''
  }

  http.get('http://localhost:3000/translate?input=ask&lang=' + lang, (res1) => { // ROUND 1
    let data = '';
    // A chunk of data has been recieved.
    res1.on('data', (chunk) => {
      data += chunk;
    });
    // The whole response has been received. Print out the result.
    res1.on('end', () => {
      json.ask_translated = JSON.parse(`"${data}"`);

      // Start location
      http.get('http://localhost:3000/translate?input=start location&lang=' + lang, (res2) => { // ROUND 2
        let data = '';
        // A chunk of data has been recieved.
        res2.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        res2.on('end', () => {

          json.start_translated = JSON.parse(`"${data}"`);

          // End location
          http.get('http://localhost:3000/translate?input=end location&lang=' + lang, (res3) => { // ROUND 3
            let data = '';
            // A chunk of data has been recieved.
            res3.on('data', (chunk) => {
              data += chunk;
            });
            // The whole response has been received. Print out the result.
            res3.on('end', () => {

              json.end_translated = JSON.parse(`"${data}"`);

              // Send
              http.get('http://localhost:3000/translate?input=send&lang=' + lang, (res4) => { // ROUND 4
                let data = '';
                // A chunk of data has been recieved.
                res4.on('data', (chunk) => {
                  data += chunk;
                });
                // The whole response has been received. Print out the result.
                res4.on('end', () => {

                  json.send_translated = JSON.parse(`"${data}"`);

                  // Directions
                  http.get('http://localhost:3000/translate?input=directions&lang=' + lang, (res5) => { // ROUND 5
                    let data = '';
                    // A chunk of data has been recieved.
                    res5.on('data', (chunk) => {
                      data += chunk;
                    });
                    // The whole response has been received. Print out the result.
                    res5.on('end', () => {

                      json.directions_translated = JSON.parse(`"${data}"`);

                      // Street View
                      http.get('http://localhost:3000/translate?input=street view&lang=' + lang, (res6) => { // ROUND 6
                        let data = '';
                        // A chunk of data has been recieved.
                        res6.on('data', (chunk) => {
                          data += chunk;
                        });
                        // The whole response has been received. Print out the result.
                        res6.on('end', () => {

                          json.streetview_translated = JSON.parse(`"${data}"`);

                          // Chat
                          http.get('http://localhost:3000/translate?input=chat&lang=' + lang, (res7) => { // ROUND 7
                            let data = '';
                            // A chunk of data has been recieved.
                            res7.on('data', (chunk) => {
                              data += chunk;
                            });
                            // The whole response has been received. Print out the result.
                            res7.on('end', () => {

                              json.chat_translated = JSON.parse(`"${data}"`);

                              // Send message
                              http.get('http://localhost:3000/translate?input=send a message&lang=' + lang, (res8) => { // ROUND 8
                                let data = '';
                                // A chunk of data has been recieved.
                                res8.on('data', (chunk) => {
                                  data += chunk;
                                });
                                // The whole response has been received. Print out the result.
                                res8.on('end', () => {

                                  json.sendmsg_translated = JSON.parse(`"${data}"`);

                                  response.send(json)
                                });

                              }).on("error", (err) => {
                                console.log("Error: " + err.message);
                              });
                            });
                          }).on("error", (err) => {
                            console.log("Error: " + err.message);
                          });
                        });
                      }).on("error", (err) => {
                        console.log("Error: " + err.message);
                      });
                    });
                  }).on("error", (err) => {
                    console.log("Error: " + err.message);
                  });
                });
              }).on("error", (err) => {
                console.log("Error: " + err.message);
              });
            });
          }).on("error", (err) => {
            console.log("Error: " + err.message);
          });
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
    });
  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});

app.get('/translate', (request, res) => {

  let path = '/translate?api-version=3.0';

  let lang = request.query.lang;
  let text = request.query.input;

  // Translate to German
  let params = '&to=' + lang;

  let response_handler = function (response) {
      let body = '';
      response.on ('data', function (d) {
          body += d;
      });
      response.on ('end', function () {
          let json = JSON.stringify(JSON.parse(body), null, 4);
          console.log(json);
          let result = JSON.parse(body);
          res.send(result[0]['translations'][0]['text'])
      });
      response.on ('error', function (e) {
          console.log ('Error: ' + e.message);
      });
  };

  let get_guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  let Translate = function (content) {
      let request_params = {
          method : 'POST',
          hostname : host,
          path : path + params,
          headers : {
              'Content-Type' : 'application/json',
              'Ocp-Apim-Subscription-Key' : subscriptionKey,
              'X-ClientTraceId' : get_guid (),
          }
      };

      let req = https.request (request_params, response_handler);
      req.write (content);
      req.end ();
  }

  let content = JSON.stringify ([{'Text' : text}]);

  Translate (content);
});

app.get('/getlang', (request, res) => {

  let path = '/detect?api-version=3.0';

  let params = '';
  let text = '加油!';

  let response_handler = function (response) {
      let body = '';
      response.on ('data', function (d) {
          body += d;
      });
      response.on ('end', function () {
          let json = JSON.stringify(JSON.parse(body), null, 4);
          let result = JSON.parse(body);
          console.log(json);
          res.send(result[0])
      });
      response.on ('error', function (e) {
          console.log ('Error: ' + e.message);
      });
  };

  let get_guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  let Detect = function (content) {

      let request_params = {
          method : 'POST',
          hostname : host,
          path : path + params,
          headers : {
              'Content-Type' : 'application/json',
              'Ocp-Apim-Subscription-Key' : subscriptionKey,
              'X-ClientTraceId' : get_guid (),
          }
      };

      let req = https.request (request_params, response_handler);
      req.write (content);
      req.end (content['language']);
  }

  let content = JSON.stringify ([{'Text' : text}]);

  Detect (content);
});

// Catch all unmatched requests and return 404 not found page
app.get('*', (request, response) => {
  response.render('404');
});

/**
 * ===================================
 * Listen to requests on port 3000
 * ===================================
 */

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log('~~~ Tuning in to the waves of port '+PORT+' ~~~'));

// Run clean up actions when server shuts down
server.on('close', () => {
  console.log('Closed express server');

  db.pool.end(() => {
    console.log('Shut down db connection pool');
  });
});
