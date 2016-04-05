$(() => {
  var socket = io();
  $('form').submit(() => {
    socket.emit('chat', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat', (msg) => {
    $('#messages').append($('<li>').text(msg));
  });
});
