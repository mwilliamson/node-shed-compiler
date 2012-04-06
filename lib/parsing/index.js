var lop = require("lop");
var Tokeniser = require("shed-tokeniser").Tokeniser;

exports.Parser = function() {
    var keywords = [
        "true", "false", "return", "package", "import", "val", "var", "public",
        "object", "class", "interface", "if", "else", "while", "fun", "for",
        "def", "then", "do"
    ];
    
    var symbols = [
        "=>", "->", "<:", "`", "¬", "!", "£", "$", "%", "^", "&", "*", "(", ")", "-",
        "=", "+", "[", "]", "{", "}", ";", ":", "'", "@", "#", "~", "<",
        ">", ",", ".", "/", "?", "\\", "|"
    ];
    var tokeniser = new Tokeniser({keywords: keywords, symbols: symbols});
    var parser = new lop.Parser();
    var parse = function(rule, source) {
        var tokens = tokeniser.tokenise(source).tokens.filter(isSemanticallySignificant);
        return parser.parseTokens(rule, tokens);
    };
    return {
        parse: parse,
        parseString: function(parser, string) {
            return parse(parser, new StringSource(string));
        }
    };
};

exports.expression = require("./expressions").expression;
exports.statement = require("./statements").statement;

var isSemanticallySignificant = function(token) {
    return token.name !== "whitespace" && token.name !== "comment";
};

function trackSignificantWhitespace(input, justIndented) {
    var tokenOfType = function(token, name) {
        return token && token.name === name;
    };
    if (tokenOfType(input.head(), "newline") && tokenOfType(input.tail().head(), "indent")) {
        return trackSignificantWhitespace(input.tail().tail(), true);
    } else if (tokenOfType(input.head(), "dedent")) {
    } else {
        return {
            head: input.head.bind(input),
            tail: function() {
                return trackSignificantWhitespace(input.tail(), false);
            },
            to: input.to.bind(input),
            end: input.end.bind(input),
            toArray: input.toArray.bind(input),
            justIndented: justIndented
        };
    }
}
