var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var identifier = rules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var optional = rules.optional;
var zeroOrMore = rules.zeroOrMore;
var oneOrMoreWithSeparator = rules.oneOrMoreWithSeparator;

var functionUtils = require("../function-utils");
var nodes = require("../nodes");
var options = require("options");

var statements = require("./statements");

var then = require("./util").thenAddSource;
var lazyRule = require("./util").lazyRule;

exports.module = lazyRule(function() {
    var package = sequence.capture(exports.packageDeclaration, "package");
    var body = sequence.capture(zeroOrMore(statements.statement), "body");
    
    return then(
        sequence(
            package,
            body
        ),
        sequence.applyValues(nodes.module, package, body)
    );
});

exports.packageDeclaration = lazyRule(function() {
    var identifiers = sequence.capture(
        oneOrMoreWithSeparator(identifier(), symbol(".")), "identifiers");
    return then(
        statements.singleLineStatement(
            sequence(
                keyword("package"),
                sequence.cut(),
                identifiers
            )
        ),
        sequence.applyValues(nodes.packageDeclaration, identifiers)
    );
});
