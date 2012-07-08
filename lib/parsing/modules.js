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
var applySequenceValuesToNode = require("./util").applySequenceValuesToNode;

exports.module = lazyRule(function() {
    var moduleName = sequence.capture(optional(exports.moduleName), "package");
    var members = sequence.capture(memberRules.optionalMembersRule, "members");
    var imports = sequence.capture(zeroOrMore(exports.import), "imports");
    var body = sequence.capture(zeroOrMore(statements.statement), "body");
    
    return then(
        sequence(
            moduleName,
            members,
            imports,
            body,
            tokenRules.end()
        ),
        applySequenceValuesToNode(nodes.module, moduleName, members, imports, body)
    );
});

exports.import = lazyRule(function() {
    var identifiers = sequence.capture(dotSeparatorIdentifiers, "identifiers");
    return then(
        statements.singleLineStatement(
            sequence(
                keyword("import"),
                sequence.cut(),
                identifiers
            )
        ),
        applySequenceValuesToNode(nodes.import, identifiers)
    );
});

exports.moduleName = lazyRule(function() {
    var identifiers = sequence.capture(dotSeparatorIdentifiers, "identifiers");
    return then(
        statements.singleLineStatement(
            sequence(
                keyword("module"),
                sequence.cut(),
                identifiers
            )
        ),
        sequence.extract(identifiers)
    );
});

var dotSeparatorIdentifiers = oneOrMoreWithSeparator(identifier(), symbol("."));
