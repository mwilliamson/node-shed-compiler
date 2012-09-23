var lop = require("lop");
var rules = lop.rules;
var tokenRules = require("./tokens");
var keyword = tokenRules.keyword;
var symbol = tokenRules.symbol;
var identifier = tokenRules.identifier;
var firstOf = rules.firstOf;
var sequence = rules.sequence;
var capture = sequence.capture;
var optional = rules.optional;
var then = rules.then;
var zeroOrMoreWithSeparator = rules.zeroOrMoreWithSeparator;

var nodes = require("../nodes");

var lazyRule = require("./util").lazyRule;

var expressions = require("./expressions");
var curlyBlock = require("./util").curlyBlock;

var memberByReference = then(
    identifier(),
    function(name, source) {
        return nodes.memberDeclaration(name, nodes.ref(name, source), source);
    }
);

var memberWithValue = lazyRule(function() {
    var name = capture(identifier());
    var value = capture(expressions.expression);
    return sequence(name, value).map(nodes.memberDeclaration);
});

var memberRule = exports.memberRule = lazyRule(function() {
    return firstOf("member declaration",
        memberWithValue,
        memberByReference
    );
});

var membersRule = exports.membersRule = lazyRule(function() {
    var members = capture(zeroOrMoreWithSeparator(memberRule, memberTerminator));
    return sequence(
        keyword("members"),
        sequence.cut(),
        curlyBlock.open,
        members,
        rules.zeroOrMore(memberTerminator),
        curlyBlock.close,
        rules.zeroOrMore(tokenRules.significantNewLine())
    ).head();
});

exports.optionalMembersRule = then(
    optional(membersRule),
    function(members) {
        return members.valueOrElse([]);
    }
);

// TODO: remote duplication with statementTerminator
var memberTerminator = firstOf(
    "member terminator",
    sequence(
        rules.zeroOrMore(tokenRules.significantNewLine()),
        symbol(","),
        rules.zeroOrMore(tokenRules.significantNewLine())
    ),
    rules.oneOrMore(tokenRules.significantNewLine())
);
