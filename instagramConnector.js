var request = require('request');
var constants = require('./constants.js');

var socket;
const baseUrl = "https://api.instagram.com/v1";
const accessTokenUrlParameter = "?access_token=" + constants.instagramTokens.ACCESS_TOKEN;

var addedComments = {};

// Escucha nuevos comentarios sobre mis post y los manda al front por el socket
var listenInstagram = function() {

    setInterval(function() {

        // Recupera mis últimas fotos
        getMyRecentMedia().then(function(medias) {
            for (media of medias) {

                // Coge las que tienen comentarios
                if (media.comments.count > 0) {
                    
                    // Coge los comentarios
                    getCommentsForMedia(media.id).then(function(comments) {
                        for (comment of comments) {
                            
                            // Es un comentario nuevo
                            if (!addedComments[comment.id]) {
                                
                                // Lo mandamos a través del socket
                                if (socket) {
                                    socket.emit('mention', parseInstagramMention(comment));

                                    // Lo marcamos como guardado
                                    addedComments[comment.id] = true;
                                }
                            }
                        }
                    });
                }
            }
        });

    }, 120000);
}

// Setea el socket de comunicación entre módulos
var setSocket = function(_socket) {
    socket = _socket;
}


// --------------------------------------------------------
// Funciones privadas
// --------------------------------------------------------

// Obtiene mis últimas publicaciones
var getMyRecentMedia = function() {

    var url = baseUrl + "/users/self/media/recent/" + accessTokenUrlParameter;

    return new Promise(function(resolve, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body).data);
            } else {
                console.log(response.statusCode + " " + error);
            }
        });
    });
}

// Obtiene los comentarios realizados sobre una publicación
var getCommentsForMedia = function(mediaId) {

    var url = baseUrl + "/media/" + mediaId + "/comments" + accessTokenUrlParameter;

    return new Promise(function(resolve, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body).data);
            } else {
                console.log(response.statusCode + " " + error);
            }
        });
    });
}

// Convierte una mención de twitter en una mención de mosix
var parseInstagramMention = function(instagramMention) {
  var mention = {
    origin: 'Instagram',
    id: instagramMention.id,
    date: instagramMention.created_time,
    text: instagramMention.text,
    userName: instagramMention.from.username,
    userScreenName: "-",
    userAvatar: instagramMention.from.profile_picture,
    userUrl: "http://www.instagram.com/" + instagramMention.from.username
  }

  return mention;
}



// --------------------------------------------------------
// Funciones expuestas
// --------------------------------------------------------

exports.listenInstagram = listenInstagram;
exports.setSocket = setSocket;