var ChordNodeClass = require("./ChordNode");

var arguments = process.argv;



if(arguments[3] == 1) {
    var chordNode = new ChordNodeClass(arguments[2]);
}
else{
    var chordNode = new ChordNodeClass(arguments[2], arguments[2]-1);
}