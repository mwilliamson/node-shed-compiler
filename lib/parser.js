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
        sequence.extract(type)
    )(input);
};

var formalArgument = (function() {
    var name = capture(identifier(), "name");
    var type = capture(typeSpecifier, "type");
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

var formalArgumentList = (function() {
    var formalArguments = capture(zeroOrMoreWithSeparator(formalArgument, symbol(",")), "formalArguments");
    return then(
        sequence(
            symbol("("),
            formalArguments,
            symbol(")")
        ),
        sequence.extract(formalArguments)
    );
})();

var shortLambda = function(input) {
    var formalArguments = capture(formalArgumentList, "formalArguments");
    var returnType = capture(optional(typeSpecifier), "returnType");
    var body = capture(expression, "body");
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

var expression = function(input) {
    return firstOf(
        "expression",
        shortLambda,
        variableReference,
        literal
    )(input);
};
