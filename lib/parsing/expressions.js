var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var identifier = rules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var optional = rules.optional;
var then = rules.then;
var zeroOrMoreWithSeparator = rules.zeroOrMoreWithSeparator;

var functionUtils = require("../function-utils");
var nodes = require("../nodes");
var options = require("options");

var statements = require("./statements");

var lazyRule = require("./util").lazyRule;
var applySequenceValuesToNode = require("./util").applySequenceValuesToNode;

var trueLiteralRule = then(
    keyword("true"),
    function(value, source) {
        return nodes.boolean(true, source);
    }
);

var falseLiteralRule = then(
    keyword("false"),
    function(value, source) {
        return nodes.boolean(false, source);
    }
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
    function(value, source) {
        return nodes.unit(source);
    }
);

var stringRule = then(
    rules.string(),
    nodes.string
);

var numberRule = then(
    rules.number(),
    nodes.number
);

var literalRule = firstOf(
    "literal",
    booleanRule,
    unitRule,
    stringRule,
    numberRule
);

var variableReferenceRule = then(
    rules.identifier(),
    nodes.variableReference
);

var typeExpressionRule = variableReferenceRule;

var typeSpecifierRule = exports.typeSpecifier = lazyRule(function() {
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
        applySequenceValuesToNode(nodes.formalArgument, name, type)
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
        applySequenceValuesToNode(nodes.formalArguments, formalArguments)
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
        applySequenceValuesToNode(nodes.lambda, formalArguments, returnType, body)
    );
});

var primaryExpressionRule = firstOf(
    "primary expression",
    lambdaRule,
    variableReferenceRule,
    literalRule
);

var argumentListRule = lazyRule(function() {
    var arguments = sequence.capture(zeroOrMoreWithSeparator(expressionRule, symbol(",")), "arguments");
    return then(
        sequence(
            symbol("("),
            arguments,
            symbol(")")
        ),
        sequence.extract(arguments)
    );
});

var partialMemberAccess = lazyRule(function() {
    var memberName = sequence.capture(rules.identifier(), "memberName");
    return then(
        sequence(symbol("."), memberName),
        sequence.extract(memberName)
    );
});

var leftAssociative = function(leftRule, rightRule, func) {
    var rights;
    if (func) {
        rights = [{func: func, rule: rightRule}];
    } else {
        rights = rightRule;
    }
    rights = rights.map(function(right) {
        return then(right.rule, function(rightValue) {
            return function(leftValue, source) {
                return right.func(leftValue, rightValue, source);
            };
        });
    });
    var repeatedRule = firstOf.apply(null, ["rules"].concat(rights));
    
    return function(input) {
        var start = input;
        var leftResult = leftRule(input);
        if (!leftResult.isSuccess()) {
            return leftResult;
        }
        var repeatedResult = repeatedRule(leftResult.remaining());
        while (repeatedResult.isSuccess()) {
            var remaining = repeatedResult.remaining();
            var source = start.to(repeatedResult.remaining());
            var right = repeatedResult.value();
            leftResult = lop.results.success(
                right(leftResult.value(), source),
                remaining,
                source
            );
            repeatedResult = repeatedRule(leftResult.remaining());
        }
        return leftResult;
    };
};

leftAssociative.firstOf = function() {
    return Array.prototype.slice.call(arguments, 0);
};

var callExpressionRule = lazyRule(function() {
    return leftAssociative(
        primaryExpressionRule,
        leftAssociative.firstOf(
            {func: nodes.call, rule: argumentListRule},
            {func: nodes.memberAccess, rule: partialMemberAccess}
        )
    );
});

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
        applySequenceValuesToNode(nodes.assign, assignTo, assignedValue)
    );
});

var expressionRule = exports.expression = firstOf(
    "expression",
    assignmentRule,
    callExpressionRule,
    primaryExpressionRule
);
