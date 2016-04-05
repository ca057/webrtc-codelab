var express = require('express');
var app = express();
var http = require('http').Server(app);
// new instance of socket.io, passing the http/server object
var io = require('socket.io')(http);

const simpleChat = (socket) => {
  if (!socket) {
    console.warn('No socket was passed, chat could not be set up.');
    return false;
  }
  return {
    'newClient': () => {
      console.log('a user connected');
      socket.broadcast.emit('info', 'Es gibt jemanden Neuen im Chat...');
    },
    'clientLeft': () => {
      console.log('user disconnected');
      socket.broadcast.emit('info', 'Es gibt eine Person weniger im Chat...');
    },
    'newMessage': (msg) => {
      console.log(`message: ${msg}`);
      socket.broadcast.emit('chat', msg);
    }
  };
};

app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  const chat = simpleChat(socket);
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
