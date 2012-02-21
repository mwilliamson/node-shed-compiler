var lop = require("lop");
var rules = lop.rules;
var sequence = rules.sequence;
var then = rules.then;
var keyword = rules.keyword;
var symbol = rules.symbol;
var firstOf = rules.firstOf;
var expressions = require("./expressions");

var nodes = require("../nodes");

var returnRule = function(input) {
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

var expressionStatementRule = function(input) {
    var expression = sequence.capture(expressions.expression, "expression");
    return then(
        sequence(
            expression,
            symbol(";")
        ),
        sequence.applyValues(nodes.expressionStatement, expression)
    )(input);
};

exports.statement = function(input) {
    return firstOf(
        "statement",
        returnRule,
        expressionStatementRule
    )(input);
};
