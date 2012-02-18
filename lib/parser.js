var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var sequence = rules.sequence;
var then = rules.then;

var functionUtils = require("./function-utils");
var nodes = require("./nodes");

exports.Parser = function() {
    var keywords = ["true", "false"];
    var symbols = [
        "=>", "<:", "`", "¬", "!", "£", "$", "%", "^", "&", "*", "(", ")", "-",
        "=", "+", "[", "]", "{", "}", ";", ":", "'", "@", "#", "~", "<",
        ">", ",", ".", "/", "?", "\\", "|"
    ];
    var parser = new lop.Parser({
        keywords: keywords,
        symbols: symbols
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

var expression = firstOf(
    "expression",
    boolean,
    unit
);
