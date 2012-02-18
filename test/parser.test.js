var Parser = require("../lib/parser").Parser;
var nodes = require("../lib/nodes");
var parsingTesting = require("./parsing-testing");
var tokeniser = require("../lib/tokeniser");
var tokens = tokeniser.tokens;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsFailureWithRemaining = parsingTesting.assertIsFailureWithRemaining;

var parser = new Parser();

exports.canParseBooleanLiteralTrue = function(test) {
    var result = parser.parseExpression("true");
    assertIsSuccessWithValue(test, result, nodes.boolean(true));
    test.done();
};

exports.canParseBooleanLiteralFalse = function(test) {
    var result = parser.parseExpression("false");
    assertIsSuccessWithValue(test, result, nodes.boolean(false));
    test.done();
};

exports.canParseUnitLiteral = function(test) {
    var result = parser.parseExpression("()");
    assertIsSuccessWithValue(test, result, nodes.unit());
    test.done();
};
