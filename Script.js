/**
 * Created by Joakim Quach on 16-02-2015.
 */
var http = require("http");
var ChordNodeClass = require("./ChordNode");

var counter = 1338;

var server = http.createServer();
server.listen(1330);

server.on('request', function(req, res){
    var request = require('querystring').parse(require("url").parse(req.url).query);
    if(request.get == "server") {
        addServer();
        res.writeHead(302, {
            'Location': 'http://127.0.0.1:' + request.port + '/?get=index'
        })
    }
    res.end();
});

//var chordRing = [];

function addServer(){
    new ChordNodeClass(counter, 1337);
    counter++;
}

new ChordNodeClass(1337, 1337);
//var chordNode1 = new ChordNodeClass(1338, 1339);
//var chordNode2 = new ChordNodeClass(1339, 1337);





