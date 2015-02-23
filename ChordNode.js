var http = require("http");
var util = require("./Utils");

var ChordNode = function(ownPort, knownPort){

    var server = http.createServer();
    server.listen(ownPort);

    server.on('request', function(req, res){
        var request = require('querystring').parse(require("url").parse(req.url).query);

        if(req.method == "GET") {
            if (request.get == "index") {
                res.writeHeader(200, {"Content-Type": "text/html"});
                res.write('<!DOCTYPE html>');
                res.write('<html>');
                res.write('<head lang="en">');
                res.write('<meta charset="UTF-8">');
                res.write('<title>Chord Ring</title>');
                res.write('</head>');
                res.write('<body>');
                res.write('<h1 id="nodeId">' + me.id + '</h1>');
                res.write('<table>');
                res.write('<tr>');
                res.write('<td><a href="http://127.0.0.1:' + me.predecessorPort + '/?get=index">Predecessor</a></td>');
                res.write('<td><a href="http://127.0.0.1:' + me.successorPort + '/?get=index">Successor</a></td>');
                res.write('</tr>');
                res.write('<tr>');
                res.write('<td><form action="http://127.0.0.1:' + me.port + '" method="GET">');
                res.write('<input type="text" name="query">');
                res.write('<input type="submit">');
                res.write('</form>');
                res.write('</td>');
                res.write('<td><a href="http://127.0.0.1:' + me.port + '/?ready=1">Redirect</a></td>');
                res.write('</tr>');
                res.write('<tr>');
                res.write('<td><a href="http://127.0.0.1:1330/?get=server&port=' + me.port + '" >Add Server</a></td>');
                res.write('<td><a href="http://127.0.0.1:' + me.port + '/?leave=1">Leave</a></td>');
                res.write('</tr>');
                res.write('</table>');
                res.write('</body>');
                res.write('</html>');
            } else if (request.query) {
                lookup(request.query, me.port)
                res.writeHead(302, {
                    'Location': 'http://127.0.0.1:' + me.port + '/?get=index'
                })
            } else if (request.ready) {
                res.writeHead(302, {
                    'Location': 'http://127.0.0.1:' + lookupRes + '/?get=index'
                })
            } else if (request.leave) {
                leave();
                res.writeHead(302, {
                    'Location': 'http://127.0.0.1:' + me.successorPort + '/?get=index'
                })
            }
            else {
                var response = JSON.stringify(me);
                res.writeHead(200);
                res.write(response);
        }
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
                    setPredecessor(newNode);
                } else if(request.put == "leaveSuccessor") {
                    setSuccessorLeave(newNode);
                } else if(request.put == "leavePredecessor") {
                    setPredecessorLeave(newNode);
                }
            });
        }
        res.end();
    });

    var lookupRes = "";

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
                if(currentNode.id < currentNode.successor){
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

    function setSuccessorLeave(node){
        me.successorPort = node.successorPort;
    };

    function setPredecessorLeave(node){
        me.predecessorPort = node.predecessorPort;
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

    function leave(){
        notify(me.successorPort, "/?put=leavePredecessor");
        notify(me.predecessorPort, "/?put=leaveSuccessor");
    }

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
                if(currentNode.id < currentNode.successor){
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
        lookupRes = port;
    };



    join(knownPort);
};

module.exports = ChordNode;