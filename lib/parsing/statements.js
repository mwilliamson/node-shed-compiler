var lop = require("lop");
var rules = lop.rules;
var sequence = rules.sequence;
var keyword = rules.keyword;
var symbol = rules.symbol;
var optional = rules.optional;
var identifier = rules.identifier;
var firstOf = rules.firstOf;
var zeroOrMore = rules.zeroOrMore;
var then = rules.then;
var expressions = require("./expressions");

var nodes = require("../nodes");

var lazyRule = require("./util").lazyRule;
var applySequenceValuesToNode = require("./util").applySequenceValuesToNode;

var returnRule = function(input) {
    var returnValue = sequence.capture(expressions.expression, "returnValue");
    return then(
        singleLineStatement(sequence(
            keyword("return"),
            returnValue
        )),
        applySequenceValuesToNode(nodes.return, returnValue)
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
        applySequenceValuesToNode(nodeConstructor, name, type, value)
    );
};

var functionDeclarationRule = lazyRule(function() {
    var identifier = sequence.capture(rules.identifier(), "identifier");
    var formalArguments = sequence.capture(expressions.formalArguments, "formalArguments");
    var returnType = sequence.capture(expressions.typeSpecifier, "returnType");
    var body = sequence.capture(exports.block, "body");
    return then(
        sequence(
            keyword("fun"),
            sequence.cut(),
            identifier,
            formalArguments,
            returnType,
            body
        ),
        applySequenceValuesToNode(nodes.func, identifier, formalArguments, returnType, body)
    );
});

var declarationRule = firstOf(
    "declaration",
    valRule,
    varRule,
    functionDeclarationRule
);

var publicDeclarationRule = lazyRule(function() {
    var declaration = sequence.capture(declarationRule, "declaration");
    return then(
        sequence(
            keyword("public"),
            sequence.cut(),
            declaration
        ),
        applySequenceValuesToNode(nodes.public, declaration)
    );
});

var singleLineStatement = exports.singleLineStatement = function(rule) {
    var capturedRule = sequence.capture(rule, "rule");
    return then(
        sequence(capturedRule, symbol(";")),
        sequence.extract(capturedRule)
    );
};

var ifStatementRule = lazyRule(function() {
    var condition = sequence.capture(expressions.expression, "condition");
    var ifTrue = sequence.capture(exports.block, "ifTrue");
    return then(
        sequence(keyword("if"), sequence.cut(), condition, ifTrue),
        applySequenceValuesToNode(nodes.if, condition, ifTrue)
    );
});

var statementRule = exports.statement = lazyRule(function() {
    return firstOf(
        "statement",
        returnRule,
        publicDeclarationRule,
        declarationRule,
        ifStatementRule,
        expressionStatementRule
    );
});

exports.block = function(input) {
    var statements = sequence.capture(zeroOrMore(statementRule), "statements");
    return then(
        sequence(
            symbol("{"),
            statements,
            symbol("}")
        ),
        applySequenceValuesToNode(nodes.block, statements)
    )(input);
};
