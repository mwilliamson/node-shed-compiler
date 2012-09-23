var rules = require("lop").rules;

exports.keyword = rules.token.bind(null, "keyword");
exports.symbol = rules.token.bind(null, "symbol");
exports.identifier = rules.token.bind(null, "identifier");
exports.string = rules.token.bind(null, "string");
exports.number = rules.token.bind(null, "number");
exports.significantNewLine = rules.token.bind(null, "significantNewLine");
exports.end = rules.token.bind(null, "end");
