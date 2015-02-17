/**
 * Created by Joakim Quach on 16-02-2015.
 */
var crypto = require("crypto");

exports.getHash = function(port){
    var hashCode = crypto.createHash('sha1');
    hashCode.update(port);
    return parseInt(hashCode.digest('hex'),16);
}



