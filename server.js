var express = require('express');
var path = require('path');
var Twitter = require('twitter');
var constants = require('./constants.js');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');

// Necesario para la recuperación de parámetros de un post
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Conexión bidireccional con el front
var socket;

const PORT = 8080;

// Inicialización objeto twitter
var twitter = new Twitter({
    consumer_key: constants.auth.CONSUMER_KEY,
    consumer_secret: constants.auth.CONSUMER_SECRET,
    access_token_key: constants.auth.ACCESS_TOKEN_KEY,
    access_token_secret: constants.auth.ACCESS_TOKEN_SECRET,
});

server.listen(process.env.PORT || PORT);

// Estáticos
app.use(express.static('public'));

// Routing
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Arrancar randombot
app.post('/mention/reply', function(req, res) {
  
    twitter.post('statuses/update', {
      status: "@" + req.body.repliedUserScreenName + " " + req.body.replyText,
      in_reply_to_status_id: req.body.id
    }, 
    
    function(error, tweet, response){
      if (error) {
        console.log(error);
      }
    });
});

// -------------------------------------------------------
// Arranco el servidor
// -------------------------------------------------------

//app.listen(process.env.PORT || PORT);
console.log("Servidor arrancado en puerto " + PORT);


io.on('connection', function (_socket) {
  socket = _socket;
});

// Nos ponemos a escuchar twitter
twitter.stream('statuses/filter', {track: '@zetalistener'}, function(stream) {
  stream.on('data', function(data) {
    socket.emit('mention', parseTwitterMention(data));
  });

  stream.on('error', function(error) {
    throw error;
  });
});

// Convierte una mención de twitter en una mención de mosix
var parseTwitterMention = function(twitterMention) {
  var mention = {
    origin: 'Twitter',
    id: twitterMention.id_str,
    date: twitterMention.created_at,
    text: twitterMention.text,
    userName: twitterMention.user.name,
    userScreenName: twitterMention.user.screen_name,
    userAvatar: twitterMention.user.profile_image_url
  }

  return mention;
}