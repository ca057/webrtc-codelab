exports.idGenerator = function *idGenerator () {
  var id = 0;
  while (true) {
    yield id++;
  }
};
