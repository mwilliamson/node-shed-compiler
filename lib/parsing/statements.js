var lop = require("lop");
var rules = lop.rules;
var sequence = rules.sequence;
var keyword = rules.keyword;
var symbol = rules.symbol;
var optional = rules.optional;
var identifier = rules.identifier;
var firstOf = rules.firstOf;
var zeroOrMore = rules.zeroOrMore;
var expressions = require("./expressions");

var nodes = require("../nodes");

var then = require("./util").thenAddSource;
var lazyRule = require("./util").lazyRule;

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

var valRule = lazyRule(function() {
    return variableDeclarationRule("val", nodes.val);
});

var varRule = lazyRule(function() {
    return variableDeclarationRule("var", nodes.var);
});

var variableDeclarationRule = function(variableKeyword, nodeConstructor) {
    var name = sequence.capture(identifier(), "identifier");
    var type  = sequence.capture(optional(expressions.typeSpecifier), "type");
    var value = sequence.capture(expressions.expression, "value");
    return then(
        singleLineStatement(
            sequence(
                keyword(variableKeyword),
                sequence.cut(),
                name,
                type,
                symbol("="),
                value
            )
        ),
        sequence.applyValues(nodeConstructor, name, type, value)
    );
};

var declarationRule = firstOf(
    "declaration",
    valRule,
    varRule
);

var publicDeclarationRule = lazyRule(function() {
    var declaration = sequence.capture(declarationRule, "declaration");
    return then(
        sequence(
            keyword("public"),
            sequence.cut(),
            declaration
        ),
        sequence.applyValues(nodes.public, declaration)
    );
});

var singleLineStatement = exports.singleLineStatement = function(rule) {
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
        publicDeclarationRule,
        declarationRule,
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
