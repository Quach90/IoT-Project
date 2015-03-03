/**
 * Created by Joakim Quach on 19-02-2015.
 */
var express = require('express');
var requestify = require('requestify');
var app = express();
var util = require("./Utils");
var bodyParser = require('body-parser');
var cors = require('cors');

var ChordNode = function(ownPort, knownPort){

    console.log("Kørt med: " + ownPort + " og " + knownPort);

    //Server

    app.listen(ownPort);
    app.use(bodyParser.json());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/getNode', function (req, res) {
        res.send(JSON.stringify(node));
    });

    app.get('/getFingerTable', function (req, res) {
        res.send(JSON.stringify(finger));
    });

    app.get('/lookup', function (req, res) {
        lookup(req.param("key"));
        res.end();
    });

    app.get('/getLookup', function (req, res) {
        res.send(JSON.stringify(finger));
    });

    app.put('/putPredecessor', function (req, res) {
        var request = req.body;
        node.predecessor = request.id;
        node.predecessorPort = request.port;
        res.end();
    });

    app.put('/putSuccessor', function (req, res) {
        var request = req.body;
        node.successor = request.id;
        node.successorPort = request.port;
        res.end();
    });

    app.put('/putFingerTable', function (req, res) {
        var request = req.body;
        var s = request.node;
        var tal = request.i;
        console.log("UTIL med " + s.id + " " + node.id + " " + finger[tal].node.id);
        //if(s.id >= node.id && s.id < finger[tal].node.id){
        if ((util.isIn(s.id, finger[tal].start, finger[tal].node.id, true, false))) {
            if(finger[tal].start == finger[tal].node.id){

            } else {
                console.log("Finger start " + finger[tal].start + " sat til " + s.id + " fra " + finger[tal].node.id);
                finger[tal].node = s;
                requestify.put("http://127.0.0.1:" + node.predecessorPort + "/putFingerTable", {
                    i: tal,
                    node: s
                }).then(function (response) {
                    res.end();
                });
            }
        }
        res.end();
    });

    //Node

    var node = {
        id: util.getHash("" + ownPort),
        port: ownPort,
        successor: "",
        successorPort: "",
        predecessor: "",
        predecessorPort: ""
    };

    var finger = [

    ];

    //Set start values in FingerTable
    for(var i = 1; i <= 8; i++){
        finger[i] = {};
        finger[i].node = {};
        if((node.id + Math.pow(2, i-1)) > 256){
            finger[i].start = (node.id + Math.pow(2, i - 1))-256;
        }
        else {
            finger[i].start = node.id + Math.pow(2, i - 1);
        }
    }

    function join(knownPort){
        node.successor = node.id;
        node.successorPort = node.port;
        node.predecessor = node.id;
        node.predecessorPort = node.port;

        if(knownPort){
            requestify.get("http://127.0.0.1:" + knownPort + "/getNode").then(function(response) {
                // Get the response body
                var knownNode = JSON.parse(response.getBody());
                init_finger_table(knownNode);

            });
        }
        else {
            finger[1].node = JSON.parse(JSON.stringify(node));
            finger[2].node = JSON.parse(JSON.stringify(node));
            finger[3].node = JSON.parse(JSON.stringify(node));
            finger[4].node = JSON.parse(JSON.stringify(node));
            finger[5].node = JSON.parse(JSON.stringify(node));
            finger[6].node = JSON.parse(JSON.stringify(node));
            finger[7].node = JSON.parse(JSON.stringify(node));
            finger[8].node = JSON.parse(JSON.stringify(node));
            //finger[1].node.id = 240;
        }
    };

    function init_finger_table(knownNode){
        find_predecessor(finger[1].start, knownNode);
    }

    function find_predecessor(id, node){
        //if(!((id > node.id && id < node.successor) || (node.id == node.successor))){
        if(!util.isIn(id, node.id, node.successor, false, true)){
            console.log("IF FP " + id +  "" + node.id + " " + node.successor);
            closest_preceding_finger(id, node);
        }
        else {
            console.log("ELSE FP" + node.successorPort);
            init_finger_table_part2(node);
        }
    }

    function closest_preceding_finger(id, node){
        requestify.get("http://127.0.0.1:" + node.port + "/getFingerTable").then(function(response) {
            // Get the response body
            var fingerTable = JSON.parse(response.getBody());
            closest_preceding_finger_loop(id, node, fingerTable, 8);
        });
    }

    function closest_preceding_finger_loop(id, node, fingerTable, i){
        if(i >= 1){
            requestify.get("http://127.0.0.1:" + fingerTable[i].node.port + "/getNode").then(function(response) {
                var fingerI = JSON.parse(response.getBody());
                if(util.isIn(fingerI.id, node.id, id, false, false)){
                    console.log("UTIL FANGET");
                    find_predecessor(id, fingerI);
                }
                else {
                    closest_preceding_finger_loop(id, node, fingerTable, i-1)
                }
            })
        }
    }

    function init_finger_table_part2(knownNode){
        var fingerPort = knownNode.successorPort;
        console.log("FingerPort " + fingerPort + "EGEN " + knownNode.id);
        requestify.get("http://127.0.0.1:" + fingerPort + "/getNode").then(function(response) {
            // Get the response body
            finger[1].node = JSON.parse(response.getBody());
            node.successor = finger[1].node.id;
            node.successorPort = finger[1].node.port;
            node.predecessor = finger[1].node.predecessor;
            node.predecessorPort = finger[1].node.predecessorPort;
            requestify.put("http://127.0.0.1:" + knownNode.port + "/putSuccessor", node).then(function(response) {
                requestify.put("http://127.0.0.1:" + fingerPort + "/putPredecessor", node).then(function(response) {
                    init_finger_table_part3(1, knownNode)
                });
            });
        });
    }

    function init_finger_table_part3(i, knownNode){
        if(i < 8){
            //if(finger[i+1].start > node.id && finger[i+1].start < finger[i].node.id){
            if(util.isIn(finger[i+1].start, node.id, finger[i].node.id, true, false)){
                console.log("UTIL med " + finger[i+1].start + " " + node.id + " " + finger[i].node.id);
                console.log("Finger " + (i+1) + " sat til " + finger[i].node.id);
                finger[i+1].node = finger[i].node;
                init_finger_table_part3(i+1, knownNode);
            }
            else {
                find_predecessor_toPart3(finger[i+1].start,knownNode, i, knownNode);
            }

        }
        else{
            update_others(1);
        }
    }

    function find_predecessor_toPart3(id, knownNode, i, knownNodeReal){
        //if(!((id > knownNode.id && id < knownNode.successor) || (knownNode.id = knownNode.successor))){
        console.log("UTIL med " + id + " " + knownNode.id + " " + knownNode.successor);
        if(!util.isIn(id, knownNode.id, knownNode.successor, false, true)){
            closest_preceding_finger_toPart3(id, knownNode, i, knownNodeReal);
        }
        else {
            var fingerI = knownNode.successorPort;
            console.log("KnownNode " + knownNode.id + " Successor " + knownNode.successorPort);
            requestify.get("http://127.0.0.1:" + fingerI + "/getNode").then(function(response) {
                console.log("Finger " + (i+1) + " sat til " + JSON.parse(response.getBody()).id)
                finger[i+1].node = JSON.parse(response.getBody());
                init_finger_table_part3(i+1, knownNodeReal);
            });
        }
    }

    function closest_preceding_finger_toPart3(id, node, tal, knownNodeReal){
        requestify.get("http://127.0.0.1:" + node.port + "/getFingerTable").then(function(response) {
            // Get the response body
            var fingerTable = JSON.parse(response.getBody());
            closest_preceding_finger_loop_toPart3(id, node, fingerTable, 8, tal, knownNodeReal);
        });
    }

    function closest_preceding_finger_loop_toPart3(id, node, fingerTable, i, tal, knownNodeReal){
        if(i >= 1){
            requestify.get("http://127.0.0.1:" + fingerTable[i].node.port + "/getNode").then(function(response) {
                var fingerI = JSON.parse(response.getBody());
                if(util.isIn(fingerI.id, node.id, id, false, false)){
                    console.log("UTIL FANGET");
                    find_predecessor_toPart3(id, fingerI, tal, knownNodeReal);
                }
                else {
                    closest_preceding_finger_loop_toPart3(id, node, fingerTable, i-1, tal, knownNodeReal)
                }
            })
        }
    }

    function update_others(i){
        if(i <= 8){
            console.log("Update Others - " + i);
            find_predecessor_update_others((node.id - Math.pow(2, i-1)), node, i);
        }
    }

    function find_predecessor_update_others(id, knownNode, i){
        //if(!(id > knownNode.id && id < knownNode.successor)){
        if(!util.isIn(id, knownNode.id, knownNode.successor, true, false)){
            console.log("Update Others - " + i + " kom ind i util " +  id + " "+ knownNode.id + " " + knownNode.successor);
            closest_preceding_finger_update_others(id, knownNode, i);
        }
        else {
            requestify.put("http://127.0.0.1:" + knownNode.port + "/putFingerTable",  {i: i, node: node}).then(function(response) {
                update_others(i+1);
            });
        }
    }

    function closest_preceding_finger_update_others(id, node, tal){
        requestify.get("http://127.0.0.1:" + node.port + "/getFingerTable").then(function(response) {
            // Get the response body
            var fingerTable = JSON.parse(response.getBody());
            closest_preceding_finger_loop_update_others(id, node, fingerTable, 8, tal);
        });
    }

    function closest_preceding_finger_loop_update_others(id, node, fingerTable, i, tal){
        if(i >= 1){
            requestify.get("http://127.0.0.1:" + fingerTable[i].node.port + "/getNode").then(function(response) {
                var fingerI = JSON.parse(response.getBody());
                if(util.isIn(fingerI.id, node.id, id, false, true)){
                    console.log("UTIL FANGET " + fingerI.id + " " + node.id + " " + id + i);
                    find_predecessor_update_others(id, fingerI, tal);
                }
                else {
                    closest_preceding_finger_loop_update_others(id, node, fingerTable, i-1, tal)
                }
            })
        }
    }

    function lookup(key){
        find_predecessor_lookup(key, node);
    }

    function find_predecessor_lookup(id, node){
        //if(!((id > node.id && id < node.successor) || (node.id == node.successor))){
        if(!util.isIn(id, node.id, node.successor, false, true)){
            closest_preceding_finger_lookup(id, node);
        }
        else {
            var result = node.successorPort;
            // Gør noget med resultat
        }
    }

    function closest_preceding_finger_lookup(id, node){
        requestify.get("http://127.0.0.1:" + node.port + "/getFingerTable").then(function(response) {
            // Get the response body
            var fingerTable = JSON.parse(response.getBody());
            closest_preceding_finger_loop_lookup(id, node, fingerTable, 8);
        });
    }

    function closest_preceding_finger_loop_lookup(id, node, fingerTable, i){
        if(i >= 1){
            requestify.get("http://127.0.0.1:" + fingerTable[i].node.port + "/getNode").then(function(response) {
                var fingerI = JSON.parse(response.getBody());
                if(util.isIn(fingerI.id, node.id, id, false, false)){
                    console.log("UTIL FANGET");
                    find_predecessor_lookup(id, fingerI);
                }
                else {
                    closest_preceding_finger_loop_lookup(id, node, fingerTable, i-1)
                }
            })
        }
    }

    function stabilize(){
        requestify.get("http://127.0.0.1:" + node.successorPort + "/getNode").then(function(response) {
            var successor = JSON.parse(response.getBody());
            if(util.isIn(successor.predecessor, node.id, node.successor, false, false)){
                node.successor = successor.predecessor;
                node.successorPort = successor.predecessorPort;
            }
            requestify.put("http://127.0.0.1:" + node.successorPort + "/notify",  node).then(function(response) {
                //
            });
        })
    }



    join(knownPort);

};

module.exports = ChordNode;