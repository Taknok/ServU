
// Function that returns the html for the device panel title
function getDevicePanelTitleTemplate(id,type,name,warning) {

    if(warning){type="warning"}

    return(
    "<div class='panel-heading'>" +
        "<div class='row'>" +
            "<div class='col-md-2'>" +
                "<h3 class='panel-title' id='deviceLogo'><i class='fa fa-"+type+" fa-lg'></i></h3>" +
            "</div>" +
            "<div class='col-md-8'>" +
                "<div id='deviceTitle' class='panel-title text-center'>"+name+"</div>" +
            "</div>" +
            "<div class='col-md-2'>" +
                "<span data-toggle='tooltip' title='Delete' data-placement='top'>" +
                    "<button class='btn btn-danger btn-xs' data-toggle='modal' data-target='#deleteModal' onclick='changeDeleteModal("+id+",\""+name+"\");'> "+
                        "<i class='glyphicon glyphicon-minus'></i>" +
                    "</button>" +
                "</span>" +
            "</div>" +
        "</div>" +
    "</div>");
}

// Function that returns the html for the device panel footer
function getDevicePanelFooterTemplate(id){
    return(
    "<div class='panel-footer'>" +
        "<div class='row'>" +
            "<div class='btn-group-in-footer btn-group btn-group-justified'>" +
                "<div class='btn-group'>" +
                    "<button class='btn btn-warning' data-toggle='modal' data-target='#moreModal' onclick='changeMoreModal("+id+");'>" +
                        "<i class='glyphicon glyphicon-plus-sign'></i>" +
                        "<span class='text-center'>  Show more  </span>" +
                        "<span class='clearfix'></span>" +
                    "</button>" +
                "</div>" +
                "<div class='btn-group dropdown'>" +
                    "<button type='button' class='btn btn-warning dropdown-toggle'" +
                        "data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" +
                        "<i class='glyphicon glyphicon-th-large'></i>" +
                        "<span class='text-center'>  Quick actions  </span>" +
                        "<span class='caret'></span>" +
                        "<span class='clearfix'></span>" +
                    "</button>" +
                    "<ul class='dropdown-menu' id='actionList#"+id+"'>" +
                        "<li><a onclick='deviceAction(\"ring\","+id+")'>" +
                            "<div class='pull-left'>Ring</div>" +
                            "<i class='icon ion-ios-bell pull-right'></i>" +
                            "<span class='clearfix'></span>" +
                            "</a>" +
                        "</li>" +
                        "<li><a onclick='deviceAction(\"vibrate\","+id+")'>" +
                            "<div class='pull-left'>Vibrate</div>" +
                            "<i class='icon ion-radio-waves pull-right'></i>" +
                            "<span class='clearfix'></span>" +
                            "</a>" +
                        "</li>" +
                        "<li><a onclick='deviceAction(\"flash\","+id+")'>" +
                            "<div class='pull-left'>Flash</div>" +
                            "<i class='glyphicon glyphicon-flash pull-right'></i>" +
                            "<span class='clearfix'></span>" +
                            "</a>" +
                        "</li>" +
                    "</ul>" +
                "</div>" +
            "</div>" +
        "</div>" +
    "</div>");
}

// Device variable structure
var device1 = {
    id: 1,
    name: 'Phone of Sophie',
    description: "Apple iPhone 6 16Gb",
    type: "mobile-phone",
    battery: Math.floor((Math.random() * 100) + 1),
    inCharge: true,
    connection: "4G",
    availableProbes: {
        gps: true,
        flash: true,
        wifiConn: true,
        bluetoothConn: true
    }
};

var device2 = {
    id: 2,
    name: "Tablet of Alex",
    description: "Samsung Galaxy Tab S 32Gb",
    type: "tablet",
    battery: Math.floor((Math.random() * 100) + 1),
    inCharge: false,
    connection: "Wifi",
    availableProbes: {
        gps: true,
        flash: true,
        wifiConn: true,
        bluetoothConn: true
    }
};

var device3 = {
    id: 3,
    name: "Phone of Quentin",
    description: "Samsung",
    type: "mobile-phone",
    battery: Math.floor((Math.random() * 100) + 1),
    inCharge: false,
    connection: "4G",
    availableProbes: {
        gps: true,
        flash: true,
        wifiConn: true,
        bluetoothConn: true
    }
};

var devices = [device1,device2,device3];