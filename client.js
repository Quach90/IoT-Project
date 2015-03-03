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
    $("#pred").empty();
    $("#succ").empty();
    $.get("http://127.0.0.1:" + port + "/getNode", function (data) {
        node = JSON.parse(data);
        $('#headline').text("Id: " + node.id);
        $('#pred').append("<a href='javascript:void(0)' onclick='getNode(" + node.predecessorPort + ")'>" + node.predecessor + "</a>");
        $('#succ').append("<a href='javascript:void(0)' onclick='getNode(" + node.successorPort + ")'>" + node.successor + "</a>");
    });

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
    if(isNaN(lookupValue)) {
        console.log("Not a number")
    } else {
        $.get("http://127.0.0.1:" + node.port + "/lookup?key=" + lookupValue, function (data) {
            var results = JSON.parse(data);
            console.log(results);
        });
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
