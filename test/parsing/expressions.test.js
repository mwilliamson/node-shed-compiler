var _ = require("underscore");
var options = require("options");
var some = options.some;
var duck = require("duck");
var hasProperties = duck.hasProperties;

var errors = require("lop").errors;
var parsingTesting = require("lop").testing;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsFailure = parsingTesting.assertIsFailure;
var assertIsError = parsingTesting.assertIsError;

var nodes = require("../../lib/nodes");
var parsing = require("../../lib/parsing");
var ignoringSources = require("./util").ignoringSources;

var parser = new parsing.Parser();

exports.canParseBooleanLiteralTrue = function(test) {
    var result = parser.parse(parsing.expression, "true");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.boolean(true)));
    test.done();
};

exports.canParseBooleanLiteralFalse = function(test) {
    var result = parser.parse(parsing.expression, "false");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.boolean(false)));
    test.done();
};

exports.canParseUnitLiteral = function(test) {
    var result = parser.parse(parsing.expression, "()");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.unit()));
    test.done();
};

exports.canParseVariableReference = function(test) {
    var result = parser.parse(parsing.expression, "blah");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.variableReference("blah")));
    test.done();
};

exports.canParseShortLambdaExpressionWithNoArguments = function(test) {
    var result = parser.parse(parsing.expression, "()=>true");
    var expected = nodes.lambda(
        nodes.formalArguments([]),
        options.none,
        nodes.boolean(true)
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canParseShortLambdaExpressionWithExplicitReturnType = function(test) {
    var result = parser.parse(parsing.expression, "() : Boolean => true");
    var expected = nodes.lambda(
        nodes.formalArguments([]),
        some(nodes.ref("Boolean")),
        nodes.boolean(true)
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canParseShortLambdaExpressionWithFormalArguments = function(test) {
    var result = parser.parse(parsing.expression, "(name: String, age: Age) => true");
    var expected = nodes.lambda(nodes.formalArguments([
        nodes.formalArgument("name", nodes.ref("String")),
        nodes.formalArgument("age", nodes.ref("Age"))
    ]), options.none, nodes.boolean(true));
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.missingShortLambdaBodyIsReportedRatherThanGenericFailureToParseAnExpression = function(test) {
    var result = parser.parse(parsing.expression, "() => ");
    assertIsError(test, result, {
        errors: [errors.error({
            expected: "lambda body",
            actual: "end",
            // TODO: we should trust the parsing library to get the location
            // correct, and use rich matching to ignore the value of location
            location: {string: '() => ', startIndex: 6, endIndex: 6}
        })]
    });
    test.done();
};

exports.lambdaIsRightAssociative = function(test) {
    var result = parser.parse(parsing.expression, "()=>()=>true");
    var expected = nodes.lambda(nodes.formalArguments([]), options.none,
        nodes.lambda(nodes.formalArguments([]), options.none,
            nodes.boolean(true)
        )
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canParseLongLambdaExpression = function(test) {
    var result = parser.parse(parsing.expression, "() => { return true; }");
    var expected = nodes.lambda(nodes.formalArguments([]), options.none, nodes.block([
        nodes.return(nodes.boolean(true))
    ]));
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canAssignToVariableReference = function(test) {
    var result = parser.parse(parsing.expression, "blah = true");
    var expected = nodes.assign(nodes.ref("blah"), nodes.boolean(true));
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.assignmentIsRightAssociative = function(test) {
    var result = parser.parse(parsing.expression, "blah = hooray = true");
    var expected = nodes.assign(
        nodes.ref("blah"),
        nodes.assign(nodes.ref("hooray"), nodes.boolean(true))
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canCallFunctionWithNoArguments = function(test) {
    var result = parser.parse(parsing.expression, "max()");
    var expected = nodes.call(
        nodes.ref("max"),
        []
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.whitespaceIsIgnored = function(test) {
    var result = parser.parse(parsing.expression, "() =>\n\ttrue");
    var expected = nodes.lambda(
        nodes.formalArguments([]),
        options.none,
        nodes.boolean(true)
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.sourceOfResultIsAssignedToNode = function(test) {
    var result = parser.parse(parsing.expression, "true");
    var expected = nodes.boolean(true);
    expected.source = {string: "true", startIndex: 0, endIndex: 4};
    assertIsSuccessWithValue(test, result, expected);
    test.done();
};
