
var nbPhone;
var nbTablet;
var username;



// Function to post requests
function post(path, params, method) {
    $.ajax({
        url: path,
        type: method,
        data: params
    });
}

// Function to post actions
function postAction(path,params,method,id,action) {

    post(path,params,method);
    console.log('envoie la requete ' + path);
    device = getDeviceById(id);

    $.notify({
        // options
        icon: 'glyphicon glyphicon-ok',
        message: 'Action '+action+" has been sent to "+device.name
    },{
        // settings
        type: 'success',
        placement: {
            from: 'bottom',
            align: 'left'
        },
        delay: 10000,
        mouse_over: 'pause'
    });
}


// Function that refreshes the data
function refresh() {
    /*
    $("#nbPhones > span").remove();
    $("#nbTablets > span").remove();
    $("#items >").remove();

    nbPhone = 0;
    nbTablet = 0;

    $.get( "/api/user/"+username+"/devices", function( data ) {
        console.log('data : ',data);
    });

    device1.data.battery = Math.floor((Math.random() * 100) + 1);
    //device2.battery = Math.floor((Math.random() * 100) + 1);

    if(devices.length > 0){
        devices.forEach(loadDeviceInfo);
    } else {
        $("#items").append("<h2 style='color: black;'>No devices yet... Click on the plus to add one</h2>");
    }*/
}

// Function that generate a device panel in html using its data
function loadDeviceInfo(device) {
	
	var myurl =  "/api/users/" + username + "/devices"
	
	function ajax(url) {
		return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.onload = function() {
		  resolve(this.responseText);
		};
		xhr.onerror = reject;
		xhr.open('GET', url);
		xhr.send();
		});
	}
	
	ajax(myurl).then(function(result) {
		data = JSON.parse(result);
		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				id = data[key].uuid;
			}
		}

	
    id = device.uuid;
    name = device.name;
    manufacturer = device.manufacturer;
    model = device.model;
    type = device.platform;
    version = device.version;
    battery = device.data.battery;
    inCharge = device.data.inCharge;
    connection = device.data.connection;

    description = manufacturer + " " + model;

    if(type=='mobile-phone'){nbPhone++;};
    $("#nbPhones > span").remove();
    $("#nbPhones").append(
        "<span><i class='fa fa-mobile-phone'></i> "+nbPhone+"</span>"
    );

    if(type=='tablet'){nbTablet++;};
    $("#nbTablets > span").remove();
    $("#nbTablets").append(
        "<span><i class='fa fa-tablet'></i> "+nbTablet+"</span>"
    );



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
        '<div class="row">' +
            '<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">' +
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
                    getDevicePanelFooterTemplate(username,id) +
                '</div>' +
            '</div>' +
            '<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12" id="angular_module">' +
                '<div class="panel panel-primary">' +
                    '<div class="panel-heading">' +
                        '<div class="row">' +
                            '<div class="col-lg-offset-2 col-lg-8 col-md-offset-2 col-md-8 col-sm-offset-2 col-sm-8 col-xs-offset-2 col-xs-8 text-center">' +
                                '<div class="panel-title">Events of '+name +'</div>' +
                            '</div>' +
                            '<div class="col-lg-2 col-md-2 col-sm-2 col-xs-2 pull-right">' +
                                "<button class='btn btn-xs btn-info' data-toggle='modal' data-target='#chooseEventModal' onclick='changeChooseEventModal("+id+")'><i class='glyphicon glyphicon-plus'></i></button>" +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="panel-body" style="color:black"><b>No events yet</b></div>' +
                '</div>' +
            '</div>' +
            '<span class="clearfix"></span>' +
        '</div>' +
        '<hr>');

        /*
        var $scope = angular.element('#angular_module').scope();
        $scope.addNewButton('#'+id);

		}).catch(function() {
		// An error occurred*/
	});

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
        if(devices[i].uuid == id){
            devices.splice(i,1);
            break;
        }
    };

    refresh();
    $.notify({
        // options
        icon: 'glyphicon glyphicon-ok',
        message: "The device "+name+" has been deleted"
    },{
        // settings
        type: 'success',
        placement: {
            from: 'bottom',
            align: 'left'
        },
        delay: 10000,
        mouse_over: 'pause'
    });
}

// Function that returns the device identified by id
function getDeviceById(id) {
	
    for(var i = devices.length-1; i >= 0; i--){
        if(devices[i].uuid == id){
            return devices[i];
        }
    };
}

// Function that completes the more modal
/*
function changeMoreModal(id) {

    device = getDeviceById(id);

    var currentTime = new Date();

    $("#moreModalHeader > h5").remove();
    $("#moreModalBody >").remove();

    $("#moreModalHeader").append("<h5 class='modal-title'><b>More about "+device.name+"</b></h5>");
    $("#moreModalBody").append(
        "<div class='panel-group' id='accordion'>" +
        getMoreModalElementTemplate('wifi','Network',"<p><b>State : </b>"+device.data.connection+"</p>") +
        getMoreModalElementTemplate('bluetooth','Bluetooth',"<p><b>State : </b>disabled</p>") +
        getMoreModalElementTemplate('location','Position',
            "<p><b>Latitude : </b>"+Math.floor((Math.random() * 100000) + 1)/100+"</p>" +
            "<p><b>Longitude : </b>"+Math.floor((Math.random() * 100000) + 1)/100+"</p>" +
            "<p><b>Accuracy : </b>"+Math.floor((Math.random() * 10) + 1)+" meters</p>" +
            "<p><b>Timestamp : </b>"+currentTime.getDate()+" "+currentTime.getTime()+"</p>") +
        getMoreModalElementTemplate('battery-full','Battery',
            "<p><b>Percentage : </b>"+device.data.battery+"%</p>" +
            "<p><b>In charge : </b>"+device.data.inCharge+"</p>") +
        "</div>"
    );

}
*/

// Function that completes the action modal
function changeActionModal(username,id,action) {

    device = getDeviceById(id);

    path = "/api/users/" + username + "/devices/" + device.uuid + "/actions";
	
	//moche a changer
	var params = { 
		name : action,
		status : "pending",
		creation_date : "now",
		data : { time : 2000 },
		parameters : { time : 2000 }
	};
	
	var stringParams = JSON.stringify(params);
	console.log(stringParams);
    $("#actionModalBody > p").remove();
    $("#actionModalFooter > ").remove();

    $("#actionModalBody").append("<p><b>Send \""+action+"\" to the device "+device.name+" ?</b></p>");
    $("#actionModalFooter").append(
        "<button class='btn btn-secondary' data-dismiss='modal'>Cancel</button>"+
        "<button class='btn btn-primary' data-dismiss='modal' onclick='postAction(\""+path+"\","+ stringParams +",\"post\",\""+id+"\",\""+action+"\");'>Confirm</button>"
    )

}

function changeChooseEventModal(id) {

    device = getDeviceById(id);

    $("#chooseEventModalBody > ").remove();
    $("#chooseEventModalFooter > ").remove();

    $("#chooseEventModalBody").append(
        "<div class='list-group' id='listActivable'>" +
            "<a class='list-group-item'>Evenement 1</a>" +
            "<a class='list-group-item'>Evenement 2</a>" +
            "<a class='list-group-item'>Evenement 3</a>" +
        "</div>"
    );
    $("#chooseEventModalFooter").append(
        "<button id='chooseEventButton' class='btn btn-primary disabled' data-dismiss='modal'>Choose event</button>" +
        "<button class='btn' data-dismiss='modal'>Cancel</button>"
    )

}

// Enable tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

// Function that refreshes the data at load of the page
$(document).ready(function() {
    refresh();
    $("#refreshBtn").click(refresh);
});

// Function to change appearance of list when active
$(document).on('click', '#listActivable > a', function() {
    $("#listActivable > a").removeClass("active");
    $(this).addClass("active");
    $("#chooseEventButton").removeClass("disabled");
});
