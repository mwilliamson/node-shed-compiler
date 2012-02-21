var lop = require("lop");

exports.Parser = function() {
    var keywords = ["true", "false", "return"];
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
        parse: parser.parseString.bind(parser)
    };
};

exports.expression = require("./expressions").expression;
exports.statement = require("./statements").statement;
