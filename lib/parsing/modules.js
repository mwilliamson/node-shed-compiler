var lop = require("lop");
var rules = lop.rules;
var keyword = rules.keyword;
var symbol = rules.symbol;
var identifier = rules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var zeroOrMore = rules.zeroOrMore;
var oneOrMoreWithSeparator = rules.oneOrMoreWithSeparator;

var nodes = require("../nodes");

var statements = require("./statements");

var then = require("./util").thenAddSource;
var lazyRule = require("./util").lazyRule;

exports.module = lazyRule(function() {
    var package = sequence.capture(exports.packageDeclaration, "package");
    var imports = sequence.capture(zeroOrMore(exports.import), "imports");
    var body = sequence.capture(zeroOrMore(statements.statement), "body");
    
    return then(
        sequence(
            package,
            imports,
            body
        ),
        sequence.applyValues(nodes.module, package, imports, body)
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
        sequence.applyValues(nodes.import, identifiers)
    );
});

exports.packageDeclaration = lazyRule(function() {
    var identifiers = sequence.capture(dotSeparatorIdentifiers, "identifiers");
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

var dotSeparatorIdentifiers = oneOrMoreWithSeparator(identifier(), symbol("."));
