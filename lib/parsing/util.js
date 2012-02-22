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

exports.thenAddSource = function() {
    var originalThen = rules.then.apply(null, arguments);
    return function(input) {
        var result = originalThen(input);
        if (nodes.isShedNode(result.value())) {
            result.value().source = result.source();
        }
        return result;
    };
};
