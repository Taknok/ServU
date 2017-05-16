exports.COMPARATOR = {
    EQUALS: "=",
    INFERIOR_TO: "<",
    SUPERIOR_TO: ">"
};

exports.LOGIC = {
    AND: "AND",
    NONE: ""
};

exports.actions = {
    ring: {
        data: {
            time: {
                type: "number",
                min: 1,
                max: undefined
            }
        }
    },
    vibrate: {
        data: {
            time: {
                type: "number",
                min: 1,
                max: undefined
            }
        }
    },
    sms: {
        data: {
            dest: {
                type: "string"
            },
            msg: {
                type: "string"
            }
        }
    },
	flashlight: {
		data: {
			state: {
				type: ["on",
					"off",
					"toggle"
				]
			}
		}
	}
};

exports.probes = {
    network: {
        data: {
            state: {
                type: ['Unknown connection',
                    'Ethernet connection',
                    'WiFi connection',
                    'Cell 2G connection',
                    'Cell 3G connection',
                    'Cell 4G connection',
                    'Cell generic connection',
                    'No network connection'
                ]
            }
        }
    },

    bluetooth: {
        data: {
            isEnable: {
                type: "boolean"
            },
            isConnected: {
                type: "boolean"
            }
        }
    },

    localisation: {
        data: {
            lat: {
                type: "number",
                min: 0,
                max: 90
            },
            long: {
                type: "number",
                min: -180,
                max: 180
            }
        }
    },

    battery: {
        data: {
            level: {
                type: "number",
                min: 0,
                max: 100
            },
            isPlugged: {
                type: "boolean"
            }
        }
    },

    flashlight: {
        data: {
            isActivated: {
                type: "boolean"
            }
        }
    }
};