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

    //Server

    app.listen(ownPort);
    app.use(bodyParser.json());
    app.use(cors());

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
    });

    app.put('/putFingerTable', function (req, res) {
        var request = req.body;
        update_finger_table(request.node, request.i);
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

    function find_successor(id, node){
        var newNode = find_predecessor(id, node);
        return newNode.successorPort;
    }

    function find_predecessor(id, node){
        var newNode = node;
        while(id > newNode.id && id < newNode.successor){
            newNode = closest_preceding_finger(id, newNode);
        }
        return newNode;
    }

    function closest_preceding_finger(id, node){
        var fingerTable = undefined;
        requestify.get("http://127.0.0.1:" + node.port + "/getFingerTable").then(function(response) {
            // Get the response body
            fingerTable = JSON.parse(response.getBody());

        });
        while(fingerTable == undefined){
            //Wait for callback
        }
        for(var i = 8; i >= 1; i--){
            if(util.inRange(fingerTable[i].node.id, node.id, id)){
                return fingerTable[i].node;
            }
        }
        return node;
    }


    function join(knownPort){
        if(knownPort){
            requestify.get("http://127.0.0.1:" + knownPort + "/getNode").then(function(response) {
                // Get the response body
                var knownNode = JSON.parse(response.getBody());
                init_finger_table(knownNode);
            });
        }
        else {
            for(var i = 1; i <= 8; i++){
                finger[i].node = node;
            }
            node.successor = node;
            node.predecessor = node;
        }
    };

    function init_finger_table(knownNode){
        var fingerPort = find_successor(finger[1].start, knownNode);
        requestify.get("http://127.0.0.1:" + fingerPort + "/getNode").then(function(response) {
            // Get the response body
            finger[1].node = JSON.parse(response.getBody());
            node.successor = finger[1].node.id;
            node.successorPort = finger[1].node.port;
            node.predecessor = finger[1].node.predecessor;
            node.predecessorPort = finger[1].node.predecessorPort;
        });
        requestify.put("http://127.0.0.1:" + fingerPort + "/putPredecessor", JSON.stringify(node)).then(function(response) {
            //No response
        });
        for(var i = 1; i < 8; i++){
            if(finger[i+1].start > node.id && finger[i+1].start < finger[i].node.id){
                finger[i+1].node = finger[i].node;
            }
            else {
                var fingerI = find_successor(finger[i+1].start, knownNode);
                requestify.get("http://127.0.0.1:" + fingerI + "/getNode").then(function(response) {
                    finger[i+1].node = JSON.parse(response.getBody());
                });
                while(finger[i+1].node == "undefined"){
                    //Wait for callback
                }

            }
        }
        update_others();
    }

    function update_others(){
        for(var i = 1; i <= 8; i++){
            var p = find_predecessor(node.id - Math.pow(2, i-1), node);
            requestify.put("http://127.0.0.1:" + p.port + "/putFingerTable", {i: i, node: JSON.stringify(node)}).then(function(response) {
                //No response
            });
        }
    }

    function update_finger_table(s, i){
        if(s.id >= node.id && s.id < finger[i].node.id){
            finger[i].node = s;
            requestify.put("http://127.0.0.1:" + node.predecessorPort + "/putFingerTable", {i: i, node: JSON.stringify(s)}).then(function(response) {
                //No response
            });
        }
    }



};

module.exports = ChordNode;