var express = require('express');
var exphbs  = require('express-handlebars');
var BinaryServer = require('binaryjs').BinaryServer;
var fs = require('fs');
var wav = require('wav');

var port = 3700;
var outFile = 'demo.wav';
var app = express();
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
 
app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res){
  res.render('index');
});
app.get('/client', function(req, res){
  res.render('client');
});
app.listen(port);

console.log('server open on port ' + port);

binaryServer = BinaryServer({port: 9001});

binaryServer.on('connection', function(client) {
  console.log('new connection');

  var fileWriter = new wav.FileWriter(outFile, {
    channels: 1,
    sampleRate: 48000,
    bitDepth: 16
  });

  client.on('stream', function(stream, meta) {

    for(var id in binaryServer.clients){
      if(binaryServer.clients.hasOwnProperty(id)){
        var otherClient = binaryServer.clients[id];
        if(otherClient != client){
          var send = otherClient.createStream(meta);
          stream.pipe(send);
        } // if (otherClient...
      } // if (binaryserver...
    } 
    console.log('new stream');
    stream.pipe(fileWriter);

    stream.on('end', function() {
      fileWriter.end();
      console.log('wrote to file ' + outFile);
    });
  });
});
