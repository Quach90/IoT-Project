/**
 * Created by Simon on 23-02-2015.
 */
$(function() {

    var node = {};
    $.get("http://127.0.0.1:1338/getNode", function (data) {
        node = JSON.parse(data);
        $('#headline').text("Id: " + node.id);
        $('#pred').text(node.predecessor || "undefined");
        $('#succ').text(node.successor || "undefined");
    });

    $.get("http://127.0.0.1:1338/getFingerTable", function (data) {
        var results = JSON.parse(data);
        drawTable(results);

    });
});

function drawTable(data) {
    for (var i = 1; i < data.length; i++) {
        if(i == data.length-1) {
            var interval = "(" + data[i].start + " +";
        } else {
            var interval = "(" + data[i].start + " - " + data[i+1].start + "]";
        }
        drawRow(data[i], interval);
    }
}

function drawRow(rowData, interval) {
    var row = $("<tr />")
    $("#fingerTable").append(row); //this will append tr element to table... keep its reference for a while since we will add cels into it
    row.append($("<td>" + rowData.start + "</td>"));
    row.append($("<td>" + interval + "</td>"));
    //row.append($("<td>" + rowData.lastName + "</td>"));
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
