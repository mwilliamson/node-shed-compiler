var lop = require("lop");
var rules = lop.rules;
var sequence = rules.sequence;
var then = rules.then;
var keyword = rules.keyword;
var symbol = rules.symbol;
var firstOf = rules.firstOf;
var zeroOrMore = rules.zeroOrMore;
var expressions = require("./expressions");

var nodes = require("../nodes");

var returnRule = function(input) {
    var returnValue = sequence.capture(expressions.expression, "returnValue");
    return then(
        singleLineStatement(sequence(
            keyword("return"),
            returnValue
        )),
        sequence.applyValues(nodes.return, returnValue)
    )(input);
};

var expressionStatementRule = function(input) {
    var expression = sequence.capture(expressions.expression, "expression");
    return then(
        singleLineStatement(expression),
        nodes.expressionStatement
    )(input);
};

var singleLineStatement = function(rule) {
    var capturedRule = sequence.capture(rule, "rule");
    return then(
        sequence(capturedRule, symbol(";")),
        sequence.extract(capturedRule)
    );
};

var statementRule = exports.statement = function(input) {
    return firstOf(
        "statement",
        returnRule,
        expressionStatementRule
    )(input);
};

exports.block = function(input) {
    var statements = sequence.capture(zeroOrMore(statementRule), "statements");
    return then(
        sequence(
            symbol("{"),
            statements,
            symbol("}")
        ),
        sequence.applyValues(nodes.block, statements)
    )(input);
};
