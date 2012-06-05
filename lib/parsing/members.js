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
var applySequenceValuesToNode = require("./util").applySequenceValuesToNode;

var expressions = require("./expressions");

var memberByReference = then(
    identifier(),
    function(name, source) {
        return nodes.memberDeclaration(name, nodes.ref(name, source), source);
    }
);

var memberWithValue = lazyRule(function() {
    var name = capture(identifier(), "name");
    var value = capture(expressions.expression, "value");
    return then(
        sequence(name, value),
        applySequenceValuesToNode(nodes.memberDeclaration, name, value)
    );
});

var memberRule = exports.memberRule = lazyRule(function() {
    return firstOf("member declaration",
        memberWithValue,
        memberByReference
    );
});

var membersRule = exports.membersRule = lazyRule(function() {
    var members = capture(zeroOrMoreWithSeparator(memberRule, symbol(",")), "members");
    return then(
        sequence(
            keyword("members"),
            sequence.cut(),
            symbol("{"),
            members,
            symbol("}")
        ),
        sequence.extract(members)
    );
});

exports.optionalMembersRule = then(
    optional(membersRule),
    function(members) {
        return members.orElse([]);
    }
);
