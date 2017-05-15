const actionsSchema = require("./content").actions;
const probesSchema = require("./content").probes;
const cm = require("../database/common");
const actionsAvailableDB = require("../database/actionsAvailable");
const probesDB = require("../database/probes");
const error = require("../error");
const COMPARATOR = require("./content").COMPARATOR;
const LOGIC = require("./content").LOGIC;
const ENUM_TYPE = "enum";

const eventConditionProperty = [
    new cm.Property("probe", "string", undefined),
    new cm.Property("comparator", "string", undefined),
    new cm.Property("value", undefined, undefined),
    new cm.Property("logicOperator", "string", undefined)
];

function validateValue(allowed, key, value) {
    let allowedParams = Object.getOwnPropertyNames(allowed);
    if (allowedParams.find(elt => elt === key) === undefined) {
        throw Error(`Element '${key}' is not recognized`);
    }
    let expectedType = allowed[key].type;
    let type = typeof value;
    if (Array.isArray(expectedType)) {
        if (expectedType.find(elt => elt === value) === undefined) {
            throw Error(`Element '${key}' equals to '${value}' is not valid`);
        }
        return ENUM_TYPE;
    } else {
        if (expectedType !== type) {
            throw Error(`Element '${key}' is a ${type} instead of a ${expectedType}`);
        }
        if (type === 'number') {
            let min = allowed[key].min;
            let max = allowed[key].max;
            if (min !== undefined && value < min) {
                throw Error(`Element '${key}' must be superior to ${min}`);
            }
            if (max !== undefined && value > max) {
                throw Error(`Element '${key}' must be inferior to ${max}`);
            }
        }
        return type;
    }
}

function validateActionContent(type, parametersObject) {
    let actionsTypes = Object.getOwnPropertyNames(actionsSchema);
    if (actionsTypes.find(actionType => type === actionType) === undefined) {
        throw Error(`Action type '${type}' is not valid`);
    }
    let parameters = Object.getOwnPropertyNames(parametersObject);
    parameters.forEach(parameter => {
        validateValue(actionsSchema[type].data, parameter, parametersObject[parameter]);
    });
    for (let paramExpected in actionsSchema[type].data) {
        if (parameters.find(elt => elt === paramExpected) === undefined) {
            throw Error(`Element ${paramExpected} is missing`);
        }
    }
    return true;
}

function validateAction(type, uuid, parameters) {
    return new Promise((resolve, reject) => {
        try {
            validateActionContent(type, parameters);
        }
        catch (err) {
            reject(new error.error(400, "This action is not valid", err.message));
        }
        actionsAvailableDB.getOneAction(uuid, type)
            .then((actionAvailable) => {
                if (actionAvailable === undefined) {
                    reject(new error.error(400, "This action is not available on this device"));
                } else if (actionAvailable.enabled === false) {
                    reject(new error.error(400, "This action is disabled on this device"));
                } else {
                    resolve(true);
                }
            })
    });
}

function validateEventCondition(condition) {
    if (!Array.isArray(condition)) {
        throw Error('The event condition must be an Array');
    }
    let nbConditions = 0;
    let probesTable = [];
    condition.forEach(_uniqueCondition => {
        nbConditions++;
        try {
            let uniqueCondition = cm.propertiesVerificationForCreation(_uniqueCondition, eventConditionProperty);
            let tmp = uniqueCondition.probe.split(".");
            if (tmp.length !== 2) {
                throw Error(`Probe '${uniqueCondition.probe}' is not valid`);
            }
            let probeName = tmp[0];
            let parameter = tmp[1];
            let value = uniqueCondition.value;
            let comparator = uniqueCondition.comparator;
            let probesTypes = Object.getOwnPropertyNames(probesSchema);
            if (probesTypes.find(elt => elt === probeName) === undefined) {
                throw Error(`The probe ${probeName} does not exist`);
            }

            //Construct a table with the different probes required by the whole condition
            if (probesTable.find(elt => elt === probeName) === undefined) {
                probesTable.push(probeName);
            }

            let type = validateValue(probesSchema[probeName].data, parameter, value);

            if (type === ENUM_TYPE && comparator !== COMPARATOR.EQUALS) {
                throw Error(`The comparator should be '${COMPARATOR.EQUALS}' instead of '${comparator}'`);
            }
            if (type === 'boolean' && comparator !== COMPARATOR.EQUALS) {
                throw Error(`The comparator should be '${COMPARATOR.EQUALS}' instead of '${comparator}'`);
            }
            if (type === 'number' && comparator !== COMPARATOR.INFERIOR_TO && comparator !== COMPARATOR.SUPERIOR_TO) {
                throw Error(`The comparator should not be '${comparator}'`);
            }

            let logic = uniqueCondition.logicOperator;
            if (logic !== LOGIC.AND && logic !== LOGIC.NONE) {
                throw Error(`The logic operator '${logic}' is not valid`);
            }
            if(nbConditions ===  1 && logic !== LOGIC.NONE){
                throw Error(`First condition must not have any logic operators`);
            }
            if (nbConditions>1 && logic !== LOGIC.AND) {
                throw Error(`There must be at least one condition or multiple ones with logic operators`);
            }

        } catch (err) {
            throw err;
        }
    });
    if(nbConditions === 0){
        throw Error(`There must be at least one condition or multiple ones with logic operators`);
    }
    return probesTable;
}

function validateEvent(uuid, condition, action) {
    return new Promise((resolve, reject) => {
        if (action.type === undefined || typeof action.type !== 'string') {
            reject(new error.error(400, "The action of the event is not valid", "'type' attribute is not valid"));
        }
        if (action.parameters === undefined || typeof action.parameters !== 'object') {
            reject(new error.error(400, "The action of the event is not valid", "'parameters' attribute is not valid"));
        }
        try {
            let probesTable = validateEventCondition(condition);
            let promises = [];
            probesTable.forEach(probe => {
                promises.push(
                    probesDB.getOneProbe(uuid, probe)
                        .then(_probe => {
                            return new Promise((resolve, reject) => {
                                if (_probe === undefined) {
                                    reject(new error.error(400, `The probe '${probe}' does not exist on this device`));
                                } else if (!_probe.active) {
                                    reject(new error.error(400, `The probe '${probe}' is disabled on this device`));
                                } else {
                                    resolve();
                                }
                            })
                        })
                );
            });
            Promise.all(promises)
                .then(() => validateAction(action.type, uuid, action.parameters))
                .then(() => {
                    resolve(probesTable);
                })
                .catch(err => {
                    reject(err);
                });
        } catch (err) {
            reject(new error.error(400, "The condition of the event is not valid", err.message));
        }
    });
}

module.exports = {
    validateAction,
    validateEvent
};
