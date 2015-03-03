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
    return ((node < id) && (node < finger) && (finger < id)) ||
        ((id < node) && ((node < finger) || (finger < id))) ||
        ((node == id) && !(finger == node));
}

exports.inHalfRange = function(finger, node, id) {
    if(typeof finger == 'string') {
        finger = parseInt(finger);
    }
    if(typeof node == 'string') {
        node = parseInt(node);
    }
    if(typeof id == 'string') {
        id = parseInt(id);
    }
    return ((node < id) && (node < finger) && (finger <= id)) ||
        ((id < node) && ((node < finger) || (finger <= id))) ||
        (node == id);
}

exports.inHalfRangeStart = function(finger, node, id) {
    if(typeof finger == 'string') {
        finger = parseInt(finger);
    }
    if(typeof node == 'string') {
        node = parseInt(node);
    }
    if(typeof id == 'string') {
        id = parseInt(id);
    }
    return ((node < id) && (node <= finger) && (finger < id)) ||
        ((id < node) && ((node <= finger) || (finger < id))) ||
        (node == id);
}

exports.isIn = function(value, left, right, includeLeft, includeRight) {
    if(typeof value == 'string') {
        value = parseInt(value);
    }
    if(typeof left == 'string') {
        left = parseInt(left);
    }
    if(typeof right == 'string') {
        right = parseInt(right);
    }
    if (right == left) {
        /*
        if(includeLeft || includeRight){
            return true;
        }
        */
        return !(value == right);
    }
    if (right > left) {
        return (includeLeft ? value >= left : value > left) && (includeRight ? value <= right : value < right);
    } else {
        return (includeLeft ? value >= left : value > left) || (includeRight ? value <= right : value < right);
    }
}


