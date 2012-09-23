var rules = require("lop").rules;
var tokenRules = require("./tokens");

exports.lazyRule = require("lop").rule;

exports.curlyBlock = {
    open: rules.sequence(
        tokenRules.symbol("{"),
        rules.zeroOrMore(tokenRules.significantNewLine())
    ),
    close: tokenRules.symbol("}")
};
