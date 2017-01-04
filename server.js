var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var bodyParser = require('body-parser');
var twitterConnector = require('./twitterConnector');


// --------------------------------------------------------
// Configuración servidor
// --------------------------------------------------------

const PORT = 8080;

// Necesario para la recuperación de parámetros de un post
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Acceso a estáticos
app.use(express.static('public'));


// --------------------------------------------------------
// Routing
// --------------------------------------------------------

// Página principal
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

// Responder tweet
app.post('/mention/reply', function(req, res) {

    twitterConnector.postReply(req.body.id, req.body.repliedUserScreenName, req.body.replyText).then(function(data) {
      console.log(data);
    });
});


// --------------------------------------------------------
// Arrancamos
// --------------------------------------------------------

// Arranco el servidor
server.listen(process.env.PORT || PORT);
console.log("Servidor arrancado en puerto " + PORT);

// Conexión bidireccional con el front
io.on('connection', function (socket) {
  twitterConnector.setSocket(socket);
});

// Nos ponemos a escuchar twitter. Las menciones se van a meter en el socket
twitterConnector.listenTwitter();
