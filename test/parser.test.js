var Parser = require("../lib/parser").Parser;
var errors = require("lop").errors;
var options = require("options");
var some = options.some;
var nodes = require("../lib/nodes");
var parsingTesting = require("lop").testing;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsFailure = parsingTesting.assertIsFailure;
var assertIsError = parsingTesting.assertIsError;

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

exports.canParseShortLambdaExpressionWithExplicitReturnType = function(test) {
    var result = parser.parseExpression("() : Boolean => true");
    var expected = nodes.shortLambda([], some(nodes.ref("Boolean")), nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.canParseShortLambdaExpressionWithFormalArguments = function(test) {
    var result = parser.parseExpression("(name: String, age: Age) => true");
    var expected = nodes.shortLambda([
        nodes.formalArgument("name", nodes.ref("String")),
        nodes.formalArgument("age", nodes.ref("Age"))
    ], options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.missingShortLambdaBodyIsReportedRatherThanGenericFailureToParseAnExpression = function(test) {
    var result = parser.parseExpression("() => ");
    assertIsError(test, result, {
        errors: [errors.error({
            expected: "expression",
            actual: "end"
        })]
    });
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
