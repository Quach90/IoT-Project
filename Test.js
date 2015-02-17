/**
 * Created by Joakim Quach on 16-02-2015.
 */
var http = require("http");

var server = http.createServer();
server.listen(1338);

server.on('request', function(req, res){
    var request = require('querystring').parse(require("url").parse(req.url).query);
    if(request.get == "join"){
        res.writeHead(200);
        join(1337);
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
    successorPort: 1339,
    predecessor: 5
};

function join(port){
    var options = {
        host: '127.0.0.1',
        path: "/",
        port: port
    };

    callback = function (response) {
        var res = "";
        response.on("data", function(chunk){
            res += chunk;
        });
        response.on("end", function(){
            var currentNode = JSON.parse(res);
            if(node.id > currentNode.id && node.id < currentNode.successor){
                return currentNode;
            } else {
                join(currentNode.successorPort);
            }
        })
    };
    http.get(options, callback);
}

