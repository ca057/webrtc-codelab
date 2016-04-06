$(() => {
  var socket = io();

  var newMessage = () => {
    $('html, body').animate({scrollTop: $(document).height()}, 500);
  };

  $('form').submit(() => {
    const msg = $('#m').val();
    socket.emit('chat', msg);
    $('#messages').append($('<li class="own">').text(msg));
    newMessage();
    $('#m').val('');
    return false;
  });

  socket.on('chat', (data) => {
    $('#messages').append($('<li class="partner">').text(`${data.id}: ${data.msg}`));
    newMessage();
  });

  socket.on('info', (info) => {
    $('#messages').append($('<li class="info">').text(info));
    newMessage();
  });
});
