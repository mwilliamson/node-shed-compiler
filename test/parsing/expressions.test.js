var options = require("options");
var some = options.some;

var errors = require("lop").errors;
var parsingTesting = require("lop").testing;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsFailure = parsingTesting.assertIsFailure;
var assertIsError = parsingTesting.assertIsError;

var nodes = require("../../lib/nodes");
var parsing = require("../../lib/parsing");

var parser = new parsing.Parser();

exports.canParseBooleanLiteralTrue = function(test) {
    var result = parser.parse(parsing.expression, "true");
    assertIsSuccessWithValue(test, result, nodes.boolean(true));
    test.done();
};

exports.canParseBooleanLiteralFalse = function(test) {
    var result = parser.parse(parsing.expression, "false");
    assertIsSuccessWithValue(test, result, nodes.boolean(false));
    test.done();
};

exports.canParseUnitLiteral = function(test) {
    var result = parser.parse(parsing.expression, "()");
    assertIsSuccessWithValue(test, result, nodes.unit());
    test.done();
};

exports.canParseVariableReference = function(test) {
    var result = parser.parse(parsing.expression, "blah");
    assertIsSuccessWithValue(test, result, nodes.variableReference("blah"));
    test.done();
};

exports.canParseShortLambdaExpressionWithNoArguments = function(test) {
    var result = parser.parse(parsing.expression, "()=>true");
    var expected = nodes.shortLambda([], options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.canParseShortLambdaExpressionWithExplicitReturnType = function(test) {
    var result = parser.parse(parsing.expression, "() : Boolean => true");
    var expected = nodes.shortLambda([], some(nodes.ref("Boolean")), nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.canParseShortLambdaExpressionWithFormalArguments = function(test) {
    var result = parser.parse(parsing.expression, "(name: String, age: Age) => true");
    var expected = nodes.shortLambda([
        nodes.formalArgument("name", nodes.ref("String")),
        nodes.formalArgument("age", nodes.ref("Age"))
    ], options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.missingShortLambdaBodyIsReportedRatherThanGenericFailureToParseAnExpression = function(test) {
    var result = parser.parse(parsing.expression, "() => ");
    assertIsError(test, result, {
        errors: [errors.error({
            expected: "expression",
            actual: "end"
        })]
    });
    test.done();
};

exports.lambdaIsRightAssociative = function(test) {
    var result = parser.parse(parsing.expression, "()=>()=>true");
    var expected = nodes.shortLambda([], options.none,
        nodes.shortLambda([], options.none,
            nodes.boolean(true)
        )
    );
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};

exports.whitespaceIsIgnored = function(test) {
    var result = parser.parse(parsing.expression, "() =>\n\ttrue");
    var expected = nodes.shortLambda([], options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};
