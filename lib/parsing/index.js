var lop = require("lop");
var Tokeniser = require("shed-tokeniser").Tokeniser;

exports.Parser = function() {
    var keywords = [
        "true", "false", "return", "package", "import", "val", "var", "public",
        "object", "class", "interface", "if", "else", "while", "fun", "for",
        "def", "then"
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
