angular.module('mosix', []);

function mainController($scope) {
    
    // Lista de menciones
    $scope.mentions = [];

    // Establecemos conexión bidireccional con el servidor
    var socket = io.connect();

    // Escucho recepción de menciones
    socket.on('mention', function (data) {
        $scope.mentions.push(data);
        $scope.$apply();
    });

    $scope.openUser = function(userScreenName) {
        window.open("http://www.twitter.com/" + userScreenName);
    }

    $scope.deployAnswerArea = function(mention) {
        mention.answerAreaDeployed = true;
    }

    $scope.sendReply = function(mention) {

        var params = JSON.stringify({ 
            id: mention.id, 
            replyText: mention.reply,
            repliedUserScreenName: mention.userScreenName
        });

        var xmlHttp = new XMLHttpRequest();

		xmlHttp.onreadystatechange = function() {
				if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    
                }
		};
		xmlHttp.open("POST", "/mention/reply", true); // true for asynchronous
        xmlHttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
		xmlHttp.send(params);

        mention.answerAreaDeployed = false;
    }
}
