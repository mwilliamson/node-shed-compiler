exports.constant = function(value) {
    return function() {
        return value;
    };
};
