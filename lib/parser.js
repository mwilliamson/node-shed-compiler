var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var sequence = rules.sequence;
var then = rules.then;
var capture = rules.capture;
var optional = rules.optional;

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
            return parser.parseString(expression, string);
        }
    };
};

var trueLiteral = then(
    keyword("true"),
    functionUtils.constant(nodes.boolean(true))
);

var falseLiteral = then(
    keyword("false"),
    functionUtils.constant(nodes.boolean(false))
);

var boolean = firstOf(
    "Boolean",
    trueLiteral,
    falseLiteral
);

var unit = then(
    sequence(
        symbol("("),
        symbol(")")
    ),
    functionUtils.constant(nodes.unit())
);

var literal = firstOf(
    "literal",
    boolean,
    unit
);

var variableReference = then(
    rules.identifier(),
    function(identifier) {
        return nodes.variableReference(identifier);
    }
);

var typeExpression = variableReference;

var typeSpecifier = function(input) {
    var type = capture(typeExpression, "type");
    return then(
        sequence(
            symbol(":"),
            type
        ),
        function(result) {
            return result.get(type);
        }
    )(input);
};

var shortLambda = function(input) {
    var body = capture(expression, "body");
    var returnType = capture(optional(typeSpecifier), "returnType");
    return then(
        sequence(
            symbol("("),
            symbol(")"),
            returnType,
            symbol("=>"),
            body
        ),
        function(result) {
            return nodes.shortLambda([], result.get(returnType), result.get(body));
        }
    )(input);
};

var expression = function(input) {
    return firstOf(
        "expression",
        shortLambda,
        variableReference,
        literal
    )(input);
};
