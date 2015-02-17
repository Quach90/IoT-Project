/**
 * Created by Joakim Quach on 16-02-2015.
 */
var ChordNodeClass = require("./ChordNode");

var chordNode = new ChordNodeClass(1337, 1337);
//var chordNode1 = new ChordNodeClass(1338, 1339);
//var chordNode2 = new ChordNodeClass(1339, 1337);

var chordRing = [];

chordRing.push(chordNode);


for(i = 1340; i < 1345; i++){

    chordRing.push(new ChordNodeClass(i, 1337));

}

function sleep(miliseconds) {
    var currentTime = new Date().getTime();

    while (currentTime + miliseconds >= new Date().getTime()) {
    }
}

