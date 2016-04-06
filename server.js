var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clienthandler = require('./src/clienthandler');
var util = require('./src/util');

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const gen = util.idGenerator();
io.on('connection', (socket) => {
  const chat = clienthandler.init(socket, gen.next().value);
  chat.newClient();

  socket.on('disconnect', () => {
    chat.clientLeft();
  });

  socket.on('chat', (msg) => {
    chat.newMessage(msg);
  });
});

http.listen(1337, () => {
  console.log('listening on *:1337');
});
