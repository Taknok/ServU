const socketIO = require('socket.io');
const devicesDB = require("./database/devices");
const decodeToken = require("./routes/authentication").decodeToken;
const cm = require("./database/common");

let io = undefined;
let devices = devicesManager();
const socketPort = 8000;

function devicesManager() {
    let devicesConnected = [];

    function Device(socketID, uuid) {
        this.socketID = socketID;
        this.uuid = uuid;
    }

    function addDevice(socketID, uuid) {
        devicesConnected.push(new Device(socketID, uuid));
    }

    function removeDevice(socketID) {
        let pos = devicesConnected.find(device => device.socketID === socketID);
        devicesConnected.splice(pos, 1);
    }

    function getSocketIdByUuid(uuid) {
        let device = devicesConnected.find(device => device.uuid === uuid);
        if (device !== undefined) {
            return device.socketID;
        }
    }

    function getUuidBySocketId(socketID) {
        let device = devicesConnected.find(device => device.socketID === socketID);
        if (device !== undefined) {
            return device.uuid;
        }
    }

    return {
        addDevice,
        removeDevice,
        getSocketIdByUuid,
        getUuidBySocketId
    }
}

function socketLog(log, error) {
    const prefix = "[SOCKET] ";
    if (error) {
        console.error(prefix + log);
    } else {
        console.log(prefix + log);
    }

}

const whoProperties = [
    new cm.Property("uuid", "string"),
    new cm.Property("token", "string")
];

exports.startSocketIO = function () {
    io = socketIO(socketPort);
	
	var appSock = require('express')();
	var serverSock = require('http').Server(appSock);
	io = socketIO(serverSock);

	serverSock.listen(socketPort, "0.0.0.0");
	serverSock.setTimeout = 10000000000;

	io.on('connection', function (socket) {
		socket.emit('news', { hello: 'world' });
		socket.on('my other event', function (data) {
			console.log(data);
		});
	});

    io.on('connection', socket => {
        //Handle authentication of devices
        socket.on('who', _who => {
            try {
                let who = cm.propertiesVerificationForCreation(_who, whoProperties);
                decodeToken(who.token)
                    .then(user => devicesDB.getDeviceByUuid(who.uuid, user))
                    .then(device => {
                        if (device !== undefined) {
                            let previousSocket = devices.getSocketIdByUuid(device.uuid);
                            if(previousSocket !== undefined){
                                devices.removeDevice(previousSocket);
                                socketLog(`Close previous socket to device ${device.uuid}`);
                            }
                            devices.addDevice(socket.id, who.uuid);
                            socketLog(`Device '${device.uuid}' authenticated`);
                        } else {
                            socketLog("Authentication failed : device not found");
                        }
                    })
                    .catch(err => socketLog("Authentication failed : " + err))
            } catch (err) {
                socketLog(`Authentication failed : ${err.message}`);
            }
        });

        socket.on('disconnect', () => {
            let uuid = devices.getUuidBySocketId(socket.id);
            if (uuid !== undefined) {
                devices.removeDevice(socket.id);
                socketLog(`Device ${uuid} disconnected`);
            }
        })
    });
    socketLog("Socket listening to connections on port " + socketPort);
};

exports.sendActionToDo = function (action, uuid) {
    if (io === undefined) {
        socketLog("Socket IO not initialized", true);
    } else {
        let socketID = devices.getSocketIdByUuid(uuid);
        if (socketID !== undefined) {
            io.to(socketID).emit('action', action);
            socketLog(`Action '${action.id}' has been sent to device ${uuid}`);
        } else {
            socketLog(`Device ${uuid} not connected : action '${action.id}' not sent`);
        }
    }
};