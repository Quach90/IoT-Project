/**
 * Created by Joakim Quach on 23-02-2015.
 */
/**
 * Created by Joakim Quach on 19-02-2015.
 */
var express = require('express');
var requestify = require('requestify');
var app = express();
var util = require("./Utils");
var bodyParser = require('body-parser');
var cors = require('cors');
var multer = require('multer');

var ChordNode = function(ownPort, knownPort){

    //Server

    app.listen(ownPort);
    app.use(bodyParser.json());
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(multer());

    app.get('/getNode', function (req, res) {
        res.send(JSON.stringify(node));
    });

    app.get('/getFingerTable', function (req, res) {
        res.send(JSON.stringify(finger));
    });

    app.put('/putPredecessor', function (req, res) {
        var request = req.body;
        node.predecessor = request.id;
        node.predecessorPort = request.port;
        res.end();
    });

    app.put('/putFingerTable', function (req, res) {
        var request = req.body;
        update_finger_table(request.node, request.i);
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
        if((node.id + Math.pow(2, i-1)) > 256){
            finger[i].start = (node.id + Math.pow(2, i - 1))-256;
        }
        else {
            finger[i].start = node.id + Math.pow(2, i - 1);
        }
    }

    function find_successor(id, node, callback){
        var newNode = find_predecessor(id, node, callback);
        //return callback(newNode.successorPort);
    }

    function find_predecessor(id, node, callback){
        var newNode = node;
        if(id > newNode.id && id < newNode.successor){
            closest_preceding_finger(id, newNode, find_predecessor, callback);
        }
        else{
            callback(newNode);
        }
    }

    function closest_preceding_finger(id, node, callback, oldCallback){
        var fingerTable = undefined;
        requestify.get("http://127.0.0.1:" + node.port + "/getFingerTable").then(function(response) {
            // Get the response body
            fingerTable = JSON.parse(response.getBody());
            for(var i = 8; i >= 1; i--){
                if(util.inRange(fingerTable[i].node.id, node.id, id)){
                    console.log("JA TAK " + fingerTable[i].node)
                    return callback(id, fingerTable[i].node, oldCallback);
                }
            }
            console.log("MÅ ALDRIG SKE")
            return callback(id, node, oldCallback);
        });




    }

    function closest_callback(fingerTable){

    }


    function join(knownPort){
        if(knownPort){
            console.log("IN IF");
            requestify.get("http://127.0.0.1:" + knownPort + "/getNode").then(function(response) {
                // Get the response body
                var knownNode = JSON.parse(response.getBody());
                init_finger_table(knownNode);
                find_successor(finger[1].start, knownNode, init_finger_table)
            });
        }
        else {
            console.log("IN ELSE");
            for(var i = 1; i <= 8; i++){
                finger[i].node = node;
            }
            node.successor = node.id;
            node.successorPort = node.port;
            node.predecessor = node.id;
            node.predecessorPort = node.port;
        }
    };

    function init_finger_table(knownNode){
        var fingerPort = knownNode.successorPort;
        requestify.get("http://127.0.0.1:" + fingerPort + "/getNode").then(function(response) {
            // Get the response body
            finger[1].node = JSON.parse(response.getBody());
            node.successor = finger[1].node.id;
            node.successorPort = finger[1].node.port;
            node.predecessor = finger[1].node.predecessor;
            node.predecessorPort = finger[1].node.predecessorPort;
            requestify.put("http://127.0.0.1:" + fingerPort + "/putPredecessor", node).then(function(response) {
                loopStyle(1, knownNode);
            });
        });
        console.log("FINGER FØR BODYSHIT");

    }

    function loopStyle(i, knownNode){
        if(i < 8) {
            console.log("" + finger[i].node.id);

            if (finger[i + 1].start > node.id && finger[i + 1].start < finger[i].node.id) {
                finger[i + 1].node = finger[i].node;
                loopStyle(i+1, knownNode);
            }
            else {
                iSaved = i;
                find_successor(finger[i + 1].start, knownNode, elseLoopStyle);
            }
            console.log("FINGER FORLOKKE STOP" + 1);

        }
        else {
            console.log("UPDATE");
            find_predecessor(node.id - Math.pow(2, i-1), node, update_others);
        }
    }

    var iSaved = 0;

    function elseLoopStyle(preNode){
        var i = iSaved;
        var fingerI = preNode.successorPort;
        requestify.get("http://127.0.0.1:" + fingerI + "/getNode").then(function (response) {
            finger[i + 1].node = JSON.parse(response.getBody());
            loopStyle(i+1, knownNode)
        });
    }

    function update_others(p){
        update_others_loop(1, p);
    }

    function update_others_loop(i, p){
        if(i <= 8) {
            requestify.put("http://127.0.0.1:" + p.port + "/putFingerTable", {i: i, node: node}).then(function(response) {
                update_others_loop(i++, p)
            });
        }
    }

    function update_finger_table(s, i){
        if(s.id >= node.id && s.id < finger[i].node.id){
            finger[i].node = s;
            requestify.put("http://127.0.0.1:" + node.predecessorPort + "/putFingerTable", {i: i, node: s}).then(function(response) {
                //No response
            });
        }
    }

    function stabilize(){
        x = node.successor.predecessor;
        if(x.id > node.id && x.id < node.successor){
            node.successor = x;
        }
    }

    join(knownPort);

};

module.exports = ChordNode;