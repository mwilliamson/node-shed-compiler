var lop = require("lop");
var rules = lop.rules;
var tokenRules = require("./tokens");
var sequence = rules.sequence;
var keyword = tokenRules.keyword;
var symbol = tokenRules.symbol;
var identifier = tokenRules.identifier;
var optional = rules.optional;
var firstOf = rules.firstOf;
var zeroOrMore = rules.zeroOrMore;
var then = rules.then;
var expressions = require("./expressions");

var nodes = require("../nodes");

var lazyRule = require("./util").lazyRule;

var returnRule = lazyRule(function() {
    return sequence(
        keyword("return"),
        sequence.cut(),
        sequence.capture(expressions.expression)
    ).map(nodes.return);
});

var expressionStatementRule = lazyRule(function() {
    return then(
        expressions.expression,
        nodes.expressionStatement
    );
});

var valRule = lazyRule(function() {
    return variableDeclarationRule("val", nodes.val);
});

var varRule = lazyRule(function() {
    return variableDeclarationRule("var", nodes.var);
});

var variableDeclarationRule = function(variableKeyword, nodeConstructor) {
    var name = sequence.capture(identifier());
    var type  = sequence.capture(optional(expressions.typeSpecifier));
    var value = sequence.capture(expressions.expression);
    return sequence(
        keyword(variableKeyword),
        sequence.cut(),
        name,
        type,
        symbol("="),
        value
    ).map(nodeConstructor);
};

var definitionDeclarationRule = lazyRule(function() {
    var identifier = sequence.capture(tokenRules.identifier());
    var value = sequence.capture(expressions.definition);
    return sequence(
        keyword("def"),
        sequence.cut(),
        identifier,
        value
    ).map(nodes.def);
});

var declarationRule = firstOf(
    "declaration",
    valRule,
    varRule,
    definitionDeclarationRule
);

var publicDeclarationRule = lazyRule(function() {
    var declaration = sequence.capture(declarationRule);
    return sequence(
        keyword("public"),
        sequence.cut(),
        declaration
    ).map(nodes.public);
});

var statementSeparator = exports.statementSeparator = firstOf(
    "statement separator",
    sequence(
        rules.zeroOrMore(tokenRules.significantNewLine()),
        symbol(";"),
        rules.zeroOrMore(tokenRules.significantNewLine())
    ),
    rules.oneOrMore(tokenRules.significantNewLine())
);

var statementRule = exports.statement = lazyRule(function() {
    return firstOf(
        "statement",
        returnRule,
        publicDeclarationRule,
        declarationRule,
        expressionStatementRule
    );
});

exports.statements = rules.sequence(
    rules.sequence.capture(rules.zeroOrMoreWithSeparator(
        statementRule,
        statementSeparator
    )),
    rules.optional(statementSeparator)
).head();
