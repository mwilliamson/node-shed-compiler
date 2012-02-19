var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var identifier = rules.identifier;
var sequence = rules.sequence;
var then = rules.then;
var capture = rules.capture;
var optional = rules.optional;
var zeroOrMoreWithSeparator = rules.zeroOrMoreWithSeparator;

var functionUtils = require("./function-utils");
var nodes = require("./nodes");
var options = require("./options");

exports.Parser = function() {
    var keywords = ["true", "false"];
    var symbols = [
        "=>", "<:", "`", "¬", "!", "£", "$", "%", "^", "&", "*", "(", ")", "-",
        "=", "+", "[", "]", "{", "}", ";", ":", "'", "@", "#", "~", "<",
        ">", ",", ".", "/", "?", "\\", "|"
    ];
    var parser = new lop.Parser({
        keywords: keywords,
        symbols: symbols,
        ignoreWhitespace: true
    });
    return {
        parseExpression: function(string) {
            return parser.parseString(expressionRule, string);
        }
    };
};

var trueLiteralRule = then(
    keyword("true"),
    functionUtils.constant(nodes.boolean(true))
);

var falseLiteralRule = then(
    keyword("false"),
    functionUtils.constant(nodes.boolean(false))
);

var booleanRule = firstOf(
    "Boolean",
    trueLiteralRule,
    falseLiteralRule
);

var unitRule = then(
    sequence(
        symbol("("),
        symbol(")")
    ),
    functionUtils.constant(nodes.unit())
);

var literalRule = firstOf(
    "literal",
    booleanRule,
    unitRule
);

var variableReferenceRule = then(
    rules.identifier(),
    function(identifier) {
        return nodes.variableReference(identifier);
    }
);

var typeExpressionRule = variableReferenceRule;

var typeSpecifierRule = function(input) {
    var type = capture(typeExpressionRule, "type");
    return then(
        sequence(
            symbol(":"),
            type
        ),
        sequence.extract(type)
    )(input);
};

var formalArgumentRule = (function() {
    var name = capture(identifier(), "name");
    var type = capture(typeSpecifierRule, "type");
    return then(
        sequence(
            name,
            type
        ),
        function(result) {
            return nodes.formalArgument(result.get(name), result.get(type));
        }
    );
})();

var formalArgumentsRule = (function() {
    var formalArguments = capture(zeroOrMoreWithSeparator(formalArgumentRule, symbol(",")), "formalArguments");
    return then(
        sequence(
            symbol("("),
            formalArguments,
            symbol(")")
        ),
        sequence.extract(formalArguments)
    );
})();

var shortLambdaRule = function(input) {
    var formalArguments = capture(formalArgumentsRule, "formalArguments");
    var returnType = capture(optional(typeSpecifierRule), "returnType");
    var body = capture(expressionRule, "body");
    return then(
        sequence(
            formalArguments,
            returnType,
            symbol("=>"),
            body
        ),
        function(result) {
            return nodes.shortLambda(
                result.get(formalArguments),
                result.get(returnType),
                result.get(body)
            );
        }
    )(input);
};

var expressionRule = function(input) {
    return firstOf(
        "expression",
        shortLambdaRule,
        variableReferenceRule,
        literalRule
    )(input);
};
