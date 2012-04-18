exports.ifSuccess = function(callback, func) {
    var then = function(func) {
        return function(err) {
            if (err) {
                callback(err);
            } else {
                func.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        };
    };
    if (func) {
        return then(func);
    } else {
        return then;
    }
};
