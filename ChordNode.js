/**
 * Created by Joakim Quach on 16-02-2015.
 */
var http = require("http");

var server = http.createServer();
server.listen(1337);

server.on('request', function(req, res){
    var request = require('querystring').parse(require("url").parse(req.url).query);
    if(request.get == "join"){
        res.writeHead(200);
        join(1338);
        res.write("HI");
    }
    else {
        var response = JSON.stringify(node);
        res.writeHead(200);
        res.write(response)
    }
    res.end();
});

var node = {
    id: 8,
    successor: 10,
    predecessor: 5
};


function join(port){
    var currentNode = {
        port: this.port,
        id: getRequest(port, '/id'),
        successorId: getRequest(port, '/successorid')
    };
    while(true){
        if(this.id > currentNode.id && this.id < currentNode.succId) {
            predecessor = currentNode.id;
            successor = currentNode.succId;

            break;
        }
        break;
    }
}

function getRequest(port) {
    var options = {
        host: '127.0.0.1',
        path: "/",
        port: port
    };

    callback = function (response) {
        var str = '';
        response.on('data', function (data) {
            str = data;
        });

        response.on('end', function () {
            return JSON.parse(str);
        });
    };
    return http.get(options, callback);
}
