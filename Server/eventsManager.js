const events = require("./database/events");
const actions = require("./database/actions");
const probes = require("./database/probes");
const COMPARATOR = require("./contentVerification/content").COMPARATOR;
const LOGIC = require("./contentVerification/content").LOGIC;
const validator = require("./contentVerification/validator");
const socket = require("./socket");

function refreshEvent(event) {
    let conditionFulfilled = undefined;
    let booleanResults = new Array(event.if.length);
    let promises = [];
    event.if.forEach((condition, index) => {
        let probeName = condition.probe.split(".")[0];
        let attribute = condition.probe.split(".")[1];
        promises.push(
            probes.getOneProbe(event.device, probeName)
                .then(probe => {
                    return new Promise((resolve, reject) => {
                        if (probe === undefined) {
                            reject(`The probe '${probeName}' does not exist on exist on this device`);
                        } else if (!probe.active) {
                            reject(`The probe '${probeName}' is disabled on the device`);
                        } else {
                            resolve(probe.data[attribute])
                        }
                    });
                })
                .then(value => {
                    booleanResults[index] = {
                        value: performComparison(value, condition.value, condition.comparator),
                        logic: condition.logicOperator
                    };
                })
        );
    });
    Promise.all(promises)
        .then(() => {
            booleanResults.forEach(res => {
                conditionFulfilled = performLogic(conditionFulfilled, res.value, res.logic);
            });
            return events.updateEventStatusByObjectId(event.id, conditionFulfilled);
        })
        .then(() => {
            if (conditionFulfilled && !event.status) {
                event.action.label = "Triggered by event : " + event.label;
                event.action.description = event.description;
                return validator.validateAction(event.action.type, event.device, event.action.parameters);
            } else {
                return false;
            }
        })
        .then(res => {
            if (res === true) {
                return actions.addAction(event.action, event.owner, event.device);
            }
        })
        .then(action => {
            if (action !== undefined) {
                socket.sendActionToDo(action, action.device_uuid);
            }
        })
        .catch(err => {
            if (err.api) {
                console.error(`Refresh event ${event.id} failed : ` + err.message)
            } else {
                console.error(`Refresh event ${event.id} failed : ` + err);
            }
        });
}

function performComparison(probeValue, value, comparator) {
    switch (comparator) {
        case COMPARATOR.EQUALS:
            return probeValue === value;
        case COMPARATOR.SUPERIOR_TO:
            return probeValue > value;
        case COMPARATOR.INFERIOR_TO:
            return probeValue < value;
        default:
            return false;
    }
}

function performLogic(boolean1, boolean2, logic) {
    switch (logic) {
        case LOGIC.AND:
            return boolean1 && boolean2;
        case LOGIC.NONE:
            return boolean2;
        default:
            return false;
    }
}

exports.onProbeUpdate = function (probeName, uuid) {
    events.getEventsByUuidAndProbeRequired(uuid, probeName)
        .then(events => {
            events.forEach(event => {
                refreshEvent(event);
            })
        })
        .catch(err => console.error("onProbeUpdate : " + err))
};