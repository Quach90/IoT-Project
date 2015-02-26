/**
 * Created by Simon on 23-02-2015.
 */
$(function() {
    var startPort = getUrlParameter("startport") ? getUrlParameter("startport") : "1337";
    var stopPort = getUrlParameter("stopport") ? getUrlParameter("stopport") : "1337";

    getFingerTables(startPort, stopPort);
});

function getFingerTables(startPort, stopPort) {
    console.log(startPort + " - " + stopPort);
    for(var i = startPort; i <= stopPort; i++){
        $.get("http://127.0.0.1:" + i + "/getNode", function (data) {
            console.log("hej");
            var result = JSON.parse(data);
            var row = $("<tr />");
            $("#table").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
            row.append($("<td style='background: #fff;'></td>"));
            row.append($("<td style='background: #fff'><h2>" + result.id + "</h2></td>"));
        });
        $.get("http://127.0.0.1:" + i + "/getFingerTable", function (data) {
            console.log("hej");
            var results = JSON.parse(data);
            var array = [];
            for (var o = 1; o < results.length; o++) {
                array[o] = results[o].node.port;
            }
            drawTable(results, array);


        });

    }

}

function drawTable(data, array) {
    console.log("hej");
    console.log(JSON.stringify(data));
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
    var row = $("<tr />");
    $("#table").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
    row.append($("<td>" + rowData.start + "</td>"));
    row.append($("<td>" + interval + "</td>"));
    row.append($("<td><a href='javascript:void(0)' onclick='getNode(" + thisPort + ")'>" + rowData.node.id + "</a></td>"));
}

function lookup() {
    lookupValue = $('#lookupValue').val();
    if(isNaN(lookupValue)) {
        console.log("Not a number")
    } else {
        $.get("http://127.0.0.1:" + $('#lookupValue').val() + "/getFingerTable", function (data) {
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

function handleError(jqXHR, textStatus, errorThrown) {
    var row = $("<tr />");
    $("#table").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
    row.append($("<td style='background: #fff;'></td>"));
    row.append($("<td style='background: #fff'><h2> No more peers </h2></td>"));
}
