/**
 * Created by Joakim Quach on 16-02-2015.
 */
var crypto = require("crypto");

exports.getHash = function(port){
    var hashCode = crypto.createHash('sha1');
    hashCode.update(port);
    var fullHash = parseInt(hashCode.digest('hex'),16).toString(2);
    return parseInt(fullHash.substring(0,8), 2);
}

exports.inRange = function(finger, node, id){
    if(typeof finger == 'string') {
        finger = parseInt(finger);
    }
    if(typeof node == 'string') {
        node = parseInt(node);
    }
    if(typeof id == 'string') {
        id = parseInt(id);
    }
    return ((node < id) && (node < finger) && (key <= id)) || ((id < node) && (node < finger)) || (finger <= id) || (node == id)
}



