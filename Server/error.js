function error(status, message, details) {
    this.status = status;
    this.message = message;
    this.details = details;
}

error.prototype.api = true;

exports.dbError = function (details) {
    return new error(500, "Database error", details);
};

exports.error = function (status, message, details) {
    return new error(status, message, details);
};