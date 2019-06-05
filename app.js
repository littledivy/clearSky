const express = require('express');
const app = express();
var getIP = require('ipware')().get_ip;
const PORT = process.env.PORT || 5000;
const path = require('path');
var request = require('request');
var Mustache = require('mustache');
var fs = require('fs');


function renderHbs(name, opt) {
  var file = fs.readFileSync(path.join(__dirname, `./views/${name}.hbs`), 'utf-8');
  return Mustache.render(file, opt);
}
app.use(express.static(path.join(__dirname, './static')))

app.use(function(req, res, next) {
    var ipInfo = getIP(req);
    console.log(ipInfo);
    req.ipInfo = ipInfo; // { clientIp: '127.0.0.1', clientIpRoutable: false }
    next();
});


app.set("PORT", PORT);

app.get('/', function (req, res) {
    const ipInfo = req.ipInfo;
    console.log(ipInfo);
    
    request(`http://ip-api.com/json/${ipInfo.clientIp}`, function (error, response, body) {
      response = JSON.parse(response["body"]);
      console.log(response);
      
        request(`https://api.darksky.net/forecast/4a18327bc4615236fa7726b3d3e3e1b0/${response["lat"]},${response["lon"]}`, function(weather_error, weather_response, weather_body) {
        if(weather_error) throw weather_error;
        weather_response = JSON.parse(weather_response["body"]);   
        console.log(weather_response);
           
            res.send(renderHbs('index', {
              title:'ClearSky',
              info:weather_response,
              location:response,
              parseInt:function () {
                return function(text, render) {
                  return parseInt(text);
                }
              }
            }));
        })
  });
  
});

app.listen(app.get('PORT'), function () {
    console.log('Express started on http://localhost:' +
        app.get('PORT') + '; press Ctrl-C to terminate.');
});
