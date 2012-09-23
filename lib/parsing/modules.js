var lop = require("lop");
var rules = lop.rules;
var tokenRules = require("./tokens");
var keyword = tokenRules.keyword;
var symbol = tokenRules.symbol;
var identifier = tokenRules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var zeroOrMore = rules.zeroOrMore;
var oneOrMoreWithSeparator = rules.oneOrMoreWithSeparator;
var optional = rules.optional;
var then = rules.then;

var nodes = require("../nodes");

var statements = require("./statements");
var memberRules = require("./members");

var lazyRule = require("./util").lazyRule;

exports.module = lazyRule(function() {
    var moduleName = sequence.capture(optional(exports.moduleName));
    var members = sequence.capture(memberRules.optionalMembersRule);
    var imports = sequence.capture(zeroOrMore(exports.import));
    var body = sequence.capture(statements.statements);
    
    return sequence(
        moduleName,
        members,
        imports,
        body,
        tokenRules.end()
    ).map(nodes.module);
});

exports.import = lazyRule(function() {
    var identifiers = sequence.capture(dotSeparatorIdentifiers);
    return sequence(
        keyword("import"),
        sequence.cut(),
        identifiers,
        statements.statementSeparator
    ).map(nodes.import);
});

exports.moduleName = lazyRule(function() {
    var identifiers = sequence.capture(dotSeparatorIdentifiers);
    return sequence(
        keyword("module"),
        sequence.cut(),
        identifiers,
        statements.statementSeparator
    ).head();
});

var dotSeparatorIdentifiers = oneOrMoreWithSeparator(identifier(), symbol("."));
