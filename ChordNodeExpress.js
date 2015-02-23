/**
 * Created by Joakim Quach on 19-02-2015.
 */
var express = require('express');
var app = express();
var util = require("./Utils");

var ChordNode = function(ownPort, knownPort){

    app.listen(ownPort);

    app.get('/', function (req, res) {
        res.send("" + node.id))
    })

    var node = {
        id: util.getHash("" + ownPort),
        port: ownPort,
        successor: util.getHash("" + ownPort),
        successorPort: ownPort,
        predecessor: util.getHash("" + ownPort),
        predecessorPort: ownPort,

        finger: [

        ],

        find_successor: function(id){
            node = this.find_predecessor(id);
            return node.successor;
        },

        find_predecessor: function(id){
            node = this;
            while(id > node.id && id < node.successor){
                node = node.closest_preceding_finger(id);
            }
            return node;
        },

        closest_preceding_finger: function(id){
            for(var i = 8; i >= 1; i--){
                if(util.inRange(this.finger[i].successor, this.id, id)){
                    return finger[i].successor;
                }
            }
            return this.id;
        }


    }







};

module.exports = ChordNode;