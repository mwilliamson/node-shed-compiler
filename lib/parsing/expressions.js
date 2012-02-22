var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var identifier = rules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var optional = rules.optional;
var zeroOrMoreWithSeparator = rules.zeroOrMoreWithSeparator;

var functionUtils = require("../function-utils");
var nodes = require("../nodes");
var options = require("options");

var statements = require("./statements");

var then = require("./util").thenAddSource;
var lazyRule = require("./util").lazyRule;

var trueLiteralRule = then(
    keyword("true"),
    functionUtils.constant(nodes.boolean(true))
);

var falseLiteralRule = then(
    keyword("false"),
    functionUtils.constant(nodes.boolean(false))
);

var booleanRule = firstOf(
    "Boolean",
    trueLiteralRule,
    falseLiteralRule
);

var unitRule = then(
    sequence(
        symbol("("),
        symbol(")")
    ),
    functionUtils.constant(nodes.unit())
);

var literalRule = firstOf(
    "literal",
    booleanRule,
    unitRule
);

var variableReferenceRule = then(
    rules.identifier(),
    nodes.variableReference
);

var typeExpressionRule = variableReferenceRule;

var typeSpecifierRule = lazyRule(function() {
    var type = capture(typeExpressionRule, "type");
    return then(
        sequence(
            symbol(":"),
            type
        ),
        sequence.extract(type)
    );
});

var formalArgumentRule = lazyRule(function() {
    var name = capture(identifier(), "name");
    var type = capture(typeSpecifierRule, "type");
    return then(
        sequence(
            name,
            type
        ),
        sequence.applyValues(nodes.formalArgument, name, type)
    );
});

var formalArgumentsRule = lazyRule(function() {
    var formalArguments = capture(zeroOrMoreWithSeparator(formalArgumentRule, symbol(",")), "formalArguments");
    return then(
        sequence(
            symbol("("),
            formalArguments,
            symbol(")")
        ),
        sequence.applyValues(nodes.formalArguments, formalArguments)
    );
});

var lambdaBodyRule = lazyRule(function() {
    return firstOf(
        "lambda body",
        expressionRule,
        statements.block
    );
});

var lambdaRule = lazyRule(function() {
    var formalArguments = capture(formalArgumentsRule, "formalArguments");
    var returnType = capture(optional(typeSpecifierRule), "returnType");
    var body = capture(lambdaBodyRule, "body");
    return then(
        sequence(
            formalArguments,
            returnType,
            symbol("=>"),
            sequence.cut(),
            body
        ),
        sequence.applyValues(nodes.lambda, formalArguments, returnType, body)
    );
});

var primaryExpressionRule = firstOf(
    "primary expression",
    lambdaRule,
    variableReferenceRule,
    literalRule
);

var assignableExpressionRule = variableReferenceRule;

var assignmentRule = lazyRule(function() {
    var assignTo = sequence.capture(assignableExpressionRule, "assignTo");
    var assignedValue = sequence.capture(expressionRule, "assignedValue");
    return then(
        sequence(
            assignTo,
            symbol("="),
            assignedValue
        ),
        sequence.applyValues(nodes.assign, assignTo, assignedValue)
    );
});

var expressionRule = exports.expression = firstOf(
    "expression",
    assignmentRule,
    primaryExpressionRule
);
