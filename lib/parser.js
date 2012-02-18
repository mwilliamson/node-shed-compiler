var functionUtils = require("./function-utils");
var nodes = require("./nodes");
var parsing = require("./parsing");
var tokenisers = require("./tokeniser");
var firstOf = parsing.firstOf;
var keyword = parsing.keyword;
var symbol = parsing.symbol;
var sequence = parsing.sequence;
var then = parsing.then;
var TokenIterator = parsing.TokenIterator;

exports.Parser = function() {
    var keywords = ["true", "false"];
    var symbols = [
        "=>", "<:", "`", "¬", "!", "£", "$", "%", "^", "&", "*", "(", ")", "-",
        "=", "+", "[", "]", "{", "}", ";", ":", "'", "@", "#", "~", "<",
        ">", ",", ".", "/", "?", "\\", "|"
    ];
    var tokeniser = new tokenisers.Tokeniser({
        keywords: keywords,
        symbols: symbols
    });
    return {
        parseExpression: function(string) {
            var input = new TokenIterator(tokeniser.tokenise(string));
            return expression(input);
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
