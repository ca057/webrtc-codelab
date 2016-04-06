const clienthandler = (socket, chatId) => {
  var id = chatId === undefined ? Date.now() : chatId;
  if (!socket) {
    console.warn('No socket was passed, chat could not be set up.');
    return false;
  }

  return {
    'newClient': () => {
      console.log(`${id} a user connected`);
      socket.broadcast.emit('info', 'Es gibt jemanden Neuen im Chat...');
      return id;
    },
    'clientLeft': () => {
      console.log(`${id} user disconnected`);
      socket.broadcast.emit('info', 'Es gibt eine Person weniger im Chat...');
      return id;
    },
    'newMessage': (msg) => {
      console.log(`${id} message: ${msg}`);
      socket.broadcast.emit('chat', {id, msg});
      return {id, msg};
    }
  };
};

exports.init = clienthandler;
