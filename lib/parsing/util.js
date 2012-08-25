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
