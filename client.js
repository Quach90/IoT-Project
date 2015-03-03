/**
 * Created by Simon on 23-02-2015.
 */
$(function() {
    var port = getUrlParameter("port") ? getUrlParameter("port") : "1337";
    console.log(port);
    getNode(port);
});

var node;

function getNode(port) {
    document.title = 'Node ' + port;
    $("#fingerTable tr:gt(0)").remove();
    //$("#fingerTable > tbody").empty();
    $("#lookupValue").val("");
    $("#resourceUrl").val("");
    $("#lookupResult").empty();
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
