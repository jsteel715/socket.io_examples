var http = require('http').createServer(handler); //require http server, and create server with function handler()
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var sensorLib = require("node-dht-sensor");
var fs = require('fs');

http.listen(8080); //listen to port 8080
function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) {
   console.log("socket connected");
	var app = {
 	   sensors: [
    	      {
              name: "dht22",
              type: 22,
              pin: 4
              }
           ],

  read: function() {
    for (var sensor in this.sensors) {
      var readout = sensorLib.read(
        this.sensors[sensor].type,
        this.sensors[sensor].pin
      );
	var humid= readout.humidity.toFixed(1);
	var temp_c= readout.temperature.toFixed(1);
	// convert Celsius to Fahrenheit
	var temp_f= (temp_c*1.8)+32
	// round result to one decimal place
	var temp_f= temp_f.toFixed(1); 

	var results = JSON.stringify({tempf: temp_f, tempc: temp_c, humidity: humid});
	socket.emit('results', results);
	// console.log(results);
      }
    setTimeout(function() {
      app.read();
    }, 10000);
  }
};

app.read();
});

process.on('SIGINT', function () { //on ctrl+c
  process.exit(); //exit completely
});
