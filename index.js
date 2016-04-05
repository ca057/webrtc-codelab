var express = require('express');
var app = express();
var http = require('http').Server(app);
// new instance of socket.io, passing the http/server object
var io = require('socket.io')(http);

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat', (msg) => {
    console.log(`message: ${msg}`);
    io.emit('chat', msg);
  });
});

http.listen(1337, () => {
  console.log('listening on *:1337');
});
