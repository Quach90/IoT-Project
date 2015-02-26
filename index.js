/**
 * Created by Simon on 23-02-2015.
 */
$(function() {

});

function lookup() {
    var lookupValue = $('#lookupValue').val();
    if(isNaN(lookupValue)) {
        console.log("Not a number")
    } else {
        window.location.href = "http://localhost:8080/IoT%20Project/hi.html?port=" + lookupValue;
    }

}

function getTables() {
    var startValue = $('#startValue').val();
    var stopValue = $('#stopValue').val();
    if(isNaN(startValue)) {
        console.log("Not a number")
    } else if(isNaN(stopValue)) {
        console.log("Not a number")
    } else {
        window.location.href = "http://localhost:8080/IoT%20Project/fingertables.html?startport=" + startValue + "&stopport=" + stopValue;
    }
}
