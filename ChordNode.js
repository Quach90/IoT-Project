var http = require("http");
var util = require("./Utils");

var ChordNode = function(ownPort, knownPort){

    var server = http.createServer();
    server.listen(ownPort);

    server.on('request', function(req, res){
        var request = require('querystring').parse(require("url").parse(req.url).query);

        if(req.method == "GET") {
            var response = JSON.stringify(me);
            res.writeHead(200);
            res.write(response);
        } else if(req.method == "PUT") {
            var newNode = "";
            req.on("data", function(data){
                newNode += data;
            });
            req.on("end", function(data){
                newNode = JSON.parse(newNode);
                if(request.put == "successor"){
                    setSuccessor(newNode);
                } else if(request.put == "predecessor") {
                    console.log(me.port + " Before " + me.predecessor)
                    setPredecessor(newNode);
                    console.log(me.port + " After " + me.predecessor)
                }
            });
        }
        res.end();
    });

    var me = {
        id: util.getHash("" + ownPort),
        port: ownPort,
        successor: util.getHash("" + ownPort),
        successorPort: ownPort,
        predecessor: util.getHash("" + ownPort),
        predecessorPort: ownPort
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
                console.log(currentNode.successor);
                if(currentNode.id < currentNode.successor){
                    console.log(me.id);
                    if(me.id > currentNode.id && me.id < currentNode.successor){
                        joined(currentNode);
                        notify(currentNode.port, "/?put=successor");
                        notify(currentNode.successorPort, "/?put=predecessor");
                    } else {
                        join(currentNode.successorPort);
                    }
                } else if(currentNode.id > currentNode.successor){
                    if(me.id > currentNode.id || me.id < currentNode.successor){
                        joined(currentNode);
                        notify(currentNode.port, "/?put=successor");
                        notify(currentNode.successorPort, "/?put=predecessor");
                    } else {
                        join(currentNode.successorPort);
                    }
                } else {
                    joined(currentNode);
                    notify(currentNode.port, "/?put=successor");
                    notify(currentNode.port, "/?put=predecessor");
                }
            })
        };
        http.get(options, callback);
    };

    function joined(node){
        me.successor = node.successor;
        me.successorPort = node.successorPort;
        me.predecessor = node.id;
        me.predecessorPort = node.port;
    };

    function setSuccessor(node){
        me.successor = node.id;
        me.successorPort = node.port;
    };

    function setPredecessor(node){
        me.predecessor = node.id;
        me.predecessorPort = node.port;
    };

    function notify(port, path){
        var options = {
            host: '127.0.0.1',
            path: path,
            port: port,
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(me).length
            }
        };

        callback = function (response) {
            var res = "";
            response.on("data", function(chunk){
                res += chunk;
            });
            response.on("end", function(){
                //console.log(res);
            })
        };
        var req = http.request(options, callback);
        req.write(JSON.stringify(me));
        req.end();

    };

    function lookup(key, port){
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
                console.log(currentNode.successor);
                if(currentNode.id < currentNode.successor){
                    console.log(me.id);
                    if(key > currentNode.id && key < currentNode.successor){
                        showLookupResponse(currentNode.successorPort);
                    } else {
                        lookup(key, currentNode.successorPort);
                    }
                } else if(currentNode.id > currentNode.successor){
                    if(key > currentNode.id || key < currentNode.successor){
                        showLookupResponse(currentNode.successorPort);
                    } else {
                        lookup(key, currentNode.successorPort);
                    }
                } else {
                    showLookupResponse(currentNode.successorPort);
                }
            })
        };
        http.get(options, callback);
    };

    function showLookupResponse(port){

    };

    join(knownPort);
};

module.exports = ChordNode;