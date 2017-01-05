var Twitter = require('twitter');
var constants = require('./constants.js');
var bodyParser = require('body-parser');

var socket;

// Inicialización objeto twitter con los datos de autenticación
var twitter = new Twitter({
    consumer_key: constants.twitterTokens.CONSUMER_KEY,
    consumer_secret: constants.twitterTokens.CONSUMER_SECRET,
    access_token_key: constants.twitterTokens.ACCESS_TOKEN_KEY,
    access_token_secret: constants.twitterTokens.ACCESS_TOKEN_SECRET,
});

// Enviar respuesta a un tweet
var postReply = function(id, userScreenName, text) {

    return new Promise(function(resolve, reject) {
        twitter.post('statuses/update', 
                    {   status: "@" + userScreenName + " " + text,
                        in_reply_to_status_id: id
                    },            
                    function(error, tweet, response){
                        if (error) {
                            console.log(error);
                        } else {
                            resolve(tweet);
                        }
                    }
        );
    });
};

// Escucha menciones y las emite por el socket
var listenTwitter = function() {

    twitter.stream('statuses/filter', {track: '@zetalistener'}, function(stream) {
        stream.on('data', function(data) {
            socket.emit('mention', parseTwitterMention(data));
        });

        stream.on('error', function(error) {
            throw error;
        });
    });
}

// Setea el socket de comunicación entre módulos
var setSocket = function(_socket) {
    socket = _socket;
}


// --------------------------------------------------------
// Funciones privadas
// --------------------------------------------------------

// Convierte una mención de twitter en una mención de mosix
var parseTwitterMention = function(twitterMention) {
  var mention = {
    origin: 'Twitter',
    id: twitterMention.id_str,
    date: twitterMention.created_at,
    text: twitterMention.text,
    userName: twitterMention.user.name,
    userScreenName: twitterMention.user.screen_name,
    userAvatar: twitterMention.user.profile_image_url,
    userUrl: "http://www.twitter.com/" + twitterMention.user.screen_name
  }

  return mention;
}


// --------------------------------------------------------
// Funciones expuestas
// --------------------------------------------------------

// Se exportan las funciones de los bots
exports.postReply = postReply;
exports.listenTwitter = listenTwitter;
exports.setSocket = setSocket;