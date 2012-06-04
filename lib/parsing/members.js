var lop = require("lop");
var rules = lop.rules;
var tokenRules = require("./tokens");
var keyword = tokenRules.keyword;
var symbol = tokenRules.symbol;
var identifier = tokenRules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var optional = rules.optional;
var then = rules.then;
var zeroOrMoreWithSeparator = rules.zeroOrMoreWithSeparator;

var nodes = require("../nodes");

var lazyRule = require("./util").lazyRule;
var applySequenceValuesToNode = require("./util").applySequenceValuesToNode;

var memberRule = lazyRule(function() {
    return then(
        identifier(),
        nodes.memberDeclarationByReference
    );
});

var membersRule = lazyRule(function() {
    var members = capture(zeroOrMoreWithSeparator(memberRule, symbol(",")), "members");
    return then(
        sequence(
            keyword("members"),
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
