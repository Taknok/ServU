
var nbPhone;
var nbTablet;

// Function that refreshes the data
function refresh() {
    $("#nbPhones > span").remove();
    $("#nbTablets > span").remove();
    $("#items >").remove();

    nbPhone = 0;
    nbTablet = 0;

    device1.battery = Math.floor((Math.random() * 100) + 1);
    device2.battery = Math.floor((Math.random() * 100) + 1);

    if(devices.length > 0){
        devices.forEach(loadDeviceInfo);
    } else {
        $("#items").append("<h2 style='color: black;'>No devices yet... Click on the plus to add one</h2>");
    }

    $("#nbPhones").append(
        "<span><i class='fa fa-mobile-phone'></i> "+nbPhone+"</span>"
    );
    $("#nbTablets").append(
        "<span><i class='fa fa-tablet'></i> "+nbTablet+"</span>"
    );

}

// Function that generate a device panel in html using its data
function loadDeviceInfo(device) {

    id = device.id;
    name = device.name,
    description = device.description;
    type = device.type;
    battery = device.battery;
    inCharge = device.inCharge;
    connection = device.connection;

    if(type=="mobile-phone"){nbPhone++};
    if(type=="tablet"){nbTablet++};

    inCharge?animationToogle="progress-bar-striped active":animationToogle="";
    warning = false;

    if(battery > 95) {barType = 'primary';}
    else if(battery > 40) {barType = 'success';}
    else if(battery > 20) {barType = 'warning';}
    else {
        barType = 'danger';
        warning = true;
    };

    if(inCharge) {
        batteryType = "battery-charging";
        batteryDisplay = battery+"% (in charge)";
    } else {
        batteryType = "battery-full";
        batteryDisplay = battery+"%";
    }

    $("#items").append(
        '<div class="col-md-6" id="item">' +
            '<div class="panel panel-warning panel-warning-dark">' +
                getDevicePanelTitleTemplate(id,type,name,warning) +
                "<div class='panel-body'>" +
                    "<div class='row'>"+
                        "<div class='col-md-2'><i class='fa fa-info'></i></div>"+
                        "<div class='col-md-6'>"+description+"</div>"+
                        "<div class='col-md-1'><i class='glyphicon glyphicon-signal'></i></div>"+
                        "<div class='col-md-1'>"+connection+"</div>"+
                    "</div>"+
                    "<div class='row'>"+
                        "<div class='col-md-2' id='deviceCharge'><i class='ion-"+batteryType+"'></i></div>"+
                        "<div class='col-md-10'>"+
                            "<div class='progress'>"+
                                "<div class='progress-bar progress-bar-"+barType+" "+animationToogle+"' role='progressbar' aria-valuenow='"+battery+
                                    "' aria-valuemin='0' aria-valuemax='100' style='width: "+battery+"%'>"+
                                "<span id='deviceChargeBar'>"+batteryDisplay+"</span>"+
                            "</div>"+
                        "</div>"+
                    "</div>"+
                "</div>" +
            "</div>" +
            getDevicePanelFooterTemplate(id) +
        '</div>');

}

// Function that completes the delete confirmation modal
function changeDeleteModal(id,name) {
    $("#deleteModalText > div").remove();
    $("#deleteModalFooter > button").remove();

    $("#deleteModalText").append("<div><b>"+name+"</b></div>");
    $("#deleteModalFooter").append(
        "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cancel</button>"+
        "<button type='button' class='btn btn-danger' data-dismiss='modal' onclick='deleteById("+id+",\""+name+"\")'>Delete</button>"
    );
}

// Function that deletes a device using its id
function deleteById(id,name) {

    for(var i = devices.length-1; i >= 0; i--){
        if(devices[i].id == id){
            devices.splice(i,1);
            break;
        }
    };

    refresh();
    alert(name+" has been deleted");
}

// Function that returns the device identified by id
function getDeviceById(id) {
    for(var i = devices.length-1; i >= 0; i--){
        if(devices[i].id == id){
            return devices[i];
        }
    };
}

// Function that completes the more modal
function changeMoreModal(id) {

    device = getDeviceById(id);

    $("#moreModalHeader > h5").remove();
    $("#moreModalHeader").append("<h5 class='modal-title'><b>More about "+device.name+"</b></h5>");
}

// Enable tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

// Function that toggles direct actions on a device
function deviceAction(action,id) {

    device = getDeviceById(id);

    switch (action) {
        case "ring":
            alert("The device "+device.name+" will now ring");
            break;
        case "vibrate":
            alert("The device "+device.name+" will now vibrate");
            break;
        case "flash":
            alert("The device "+device.name+" will now flash");
            break;
        default:
    }
}

// Function that refreshes the data at load of the page
$(document).ready(function() {
    refresh();
    $("#refreshBtn").click(refresh);
});

// Fonctions de test pour ajax, vouées à disparaître
function getTestDisplay(json) {
    alert("data : "+json);
}

function getTest() {
    $.ajax({
        url: "http://odata.bordeaux.fr/v1/databordeaux/airejeux/?format=json",
        dataType: "jsonp",
        jsonpCallback: "getTestDisplay"
    });
}