var rules = require("lop").rules;
var nodes = require("../nodes");

exports.lazyRule = function(ruleBuilder) {
    var rule;
    return function(input) {
        if (!rule) {
            rule = ruleBuilder();
        }
        return rule(input);
    };
};

exports.applySequenceValuesToNode = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    args.push(rules.sequence.source);
    return rules.sequence.applyValues.apply(this, args);
};
