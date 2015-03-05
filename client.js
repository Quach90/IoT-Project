/**
 * Created by Simon on 23-02-2015.
 */
$(function() {
    var port = getUrlParameter("port") ? getUrlParameter("port") : "1337";
    console.log(port);
    getNode(port);
});

var node;
var hasResource = false;

function getNode(port) {
    document.title = 'Node ' + port;
    $("#fingerTable tr:gt(0)").remove();
    //$("#fingerTable > tbody").empty();
    $("#lookupValue").val("");
    $("#resourceUrl").val("");
    $("#lookupResult").empty();
    $("#graph").empty();
    $("#pred").empty();
    $("#succ").empty();
    $("#delete").empty();
    $("#resourceInfo").empty();
    $.get("http://127.0.0.1:" + port + "/getNode", function (data) {
        node = JSON.parse(data);
        $('#headline').text("Id: " + node.id);
        $('#pred').append("<a href='javascript:void(0)' onclick='getNode(" + node.predecessorPort + ")'>" + node.predecessor + "</a>");
        $('#succ').append("<a href='javascript:void(0)' onclick='getNode(" + node.successorPort + ")'>" + node.successor + "</a>");
    });

    $.get("http://127.0.0.1:" + port + "/getHasResource", function (data) {
        var result = JSON.parse(data);
        if(result.hasResource){
            drawGraph();
            $('#resourceInfo').append("<button onclick='getResource()'>Get Spark State</button>");
            $('#resourceInfo').append("<table id='resourceTable'><tr><th>Time</th><th>Name</th><th>Data</th></tr></table>");
        }
    });

    $('#delete').append("<a href='javascript:void(0)' onclick='deleteNode()'>Delete</a>");

    $.get("http://127.0.0.1:" + port + "/getFingerTable", function (data) {
        console.log(data);
        var results = JSON.parse(data);
        var array = [];
        for (var i = 1; i < results.length; i++) {
            array[i] = results[i].node.port;
        }
        drawTable(results, array);

    });
}

function getResource(){
    $.get("http://127.0.0.1:" + node.port + "/getSparkInfo", function (data) {
        var results = JSON.parse(data);
        var row = $("<tr />")
        $("#resourceTable").append(row);
        row.append($("<td>" + results.timestamp + "</td>"));
        row.append($("<td>" + results.name + "</td>"));
        row.append($("<td>" + results.data + "</td>"));
    })
}

function drawTable(data, array) {
    for (var i = 1; i < data.length; i++) {
        if(i == data.length-1) {
            var interval = "(" + data[i].start + " +";
        } else {
            var interval = "(" + data[i].start + " - " + data[i+1].start + "]";
        }
        drawRow(data[i], interval, array[i]);
    }
}

function drawRow(rowData, interval, port) {
    var thisPort = port;
    var row = $("<tr />")
    $("#fingerTable").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
    row.append($("<td>" + rowData.start + "</td>"));
    row.append($("<td>" + interval + "</td>"));
    row.append($("<td><a href='javascript:void(0)' onclick='getNode(" + thisPort + ")'>" + rowData.node.id + "</a></td>"));
}

function lookup() {
    var lookupValue = $('#lookupValue').val();
    $("#lookupValue").val("");
    $("#lookupResult").empty();
    if(isNaN(lookupValue)) {
        console.log("Not a number")
    } else {
        $.get("http://127.0.0.1:" + node.port + "/lookup?key=" + lookupValue, function (data) {
            setTimeout(function (){
                $.get("http://127.0.0.1:" + node.port + "/getLookup", function (data) {
                    var result = JSON.parse(data);
                    $('#lookupResult').append("<a id='lookupResult' href='javascript:void(0)' onclick='getNode(" + result.port + ")'>" + result.id + "</a>");
                })
            }, 10);
        });

    }

}

function deleteNode(){
    $.ajax({
        url: "http://127.0.0.1:" + node.port + "/",
        type: 'DELETE',
        success: function(result) {
            setTimeout(function (){
                window.location.href = "http://localhost:8080/IoT%20Project/hi.html?port=" + node.successorPort;
            }, 200);

        }
    });
}

function addResource(){
    var resUrl = {url: $('#resourceUrl').val()};
    $.post("http://127.0.0.1:" + node.port + "/postResource", resUrl, function(data){
        window.location.href = "http://localhost:8080/IoT%20Project/hi.html?port=" + node.port;
    })
}

function drawGraph(){

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%b-%y").parse;

    var x = d3.time.scale()
        .range([0, width]);


    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function (d) {
            return x(d.timestamp);
        })
        .y(function (d) {
            return y(d.data);
        });

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("http://127.0.0.1:" + node.port + "/getGraphData", function (error, data) {
        data.forEach(function (d) {
            delete d.name;
            delete d._id;
            d.timestamp = d.timestamp;//new Date(d.timestamp);
            d.data = +d.data;
        });
        console.log(JSON.stringify(data))
        x.domain(d3.extent(data, function (d) {
            return d.timestamp;
        }));
        y.domain(d3.extent(data, function (d) {
            return d.data;
        }));


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Temperature - Celsius");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    });
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}
