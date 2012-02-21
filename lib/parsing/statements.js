var lop = require("lop");
var rules = lop.rules;
var sequence = rules.sequence;
var then = rules.then;
var keyword = rules.keyword;
var symbol = rules.symbol;
var expressions = require("./expressions");

var nodes = require("../nodes");

exports.statement = function(input) {
    var returnValue = sequence.capture(expressions.expression, "returnValue");
    return then(
        sequence(
            keyword("return"),
            returnValue,
            symbol(";")
        ),
        sequence.applyValues(nodes.return, returnValue)
    )(input);
};
