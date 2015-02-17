/**
 * Created by Joakim Quach on 16-02-2015.
 */
var http = require('http');

var id;
var successor;
var predecessor;

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
            /* FIXME
            Notify nodes!!
             */
            break;
        }
    }
}

function getRequest(port, path) {
    var options = {
        host: '127.0.0.1',
        path: path,
        port: port,
        method: 'GET'
    };

    callback = function (response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            return str;
        });
    };
    return http.request(options, callback);
}
