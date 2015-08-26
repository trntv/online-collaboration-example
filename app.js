var http = require('http');
var express = require('express');
var path = require('path');
var WebsocketsServer = require('socket.io');
var diff_match_patch = require('googlediff');

var app = express();
var httpServer = new http.Server(app);
var io = new WebsocketsServer(httpServer, {
  transports: ['websocket']
});
var diff = new diff_match_patch;

// just an example. it can be any type of storage
var inMemoryStorage = new Map;

app.use(express.static(path.join(__dirname, 'public')));

// send index.html
app.use('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', function (socket) {
  socket.on('error', function(err) {
    console.error(err);
  });
  socket.on('join', function(room) {
    socket.join(room);
    if (!inMemoryStorage.has(room)) {
      inMemoryStorage.set(room, '')
    }
    io.to(socket.id).emit('welcome', inMemoryStorage.get(room));
    console.log('User joined ' + room);
  });
  socket.on('diff', function(room, patches){
    var results = diff.patch_apply(diff.patch_fromText(patches), inMemoryStorage.get(room));
    inMemoryStorage.set(room, results[0]);
    socket.broadcast.to(room).emit('diff', patches);
  });
  console.log('User connected')
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// show error
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.error(err.message);
  res.send('<h1>' + err.message + '</h1>');
});

// Run server
httpServer.on('error', function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }b

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});

app.set('port', 3000);
httpServer.listen(3000, function(){
  console.log('Hi! Visit me - http://127.0.0.1:3000');
});
