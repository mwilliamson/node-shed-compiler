var Parser = require("../lib/parser").Parser;
var options = require("../lib/options");
var nodes = require("../lib/nodes");
var parsingTesting = require("lop").testing;
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

exports.canParseVariableReference = function(test) {
    var result = parser.parseExpression("blah");
    assertIsSuccessWithValue(test, result, nodes.variableReference("blah"));
    test.done();
};

exports.canParseShortLambdaExpressionWithNoArguments = function(test) {
    var result = parser.parseExpression("()=>true");
    var expected = nodes.shortLambda([], options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.lambdaIsRightAssociative = function(test) {
    var result = parser.parseExpression("()=>()=>true");
    var expected = nodes.shortLambda([], options.none,
        nodes.shortLambda([], options.none,
            nodes.boolean(true)
        )
    );
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.whitespaceIsIgnored = function(test) {
    var result = parser.parseExpression("() =>\n\ttrue");
    var expected = nodes.shortLambda([], options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};
