var _ = require("underscore");
var options = require("options");
var some = options.some;
var duck = require("duck");
var hasProperties = duck.hasProperties;

var errors = require("lop").errors;
var parsingTesting = require("lop").testing;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsSuccess = parsingTesting.assertIsSuccess;
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

exports.canParseStringLiteral = function(test) {
    var result = parser.parse(parsing.expression, "\"blah\"");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.string("blah")));
    test.done();
};

exports.canParseNumberLiteral = function(test) {
    var result = parser.parse(parsing.expression, "42");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.number("42")));
    test.done();
};

exports.canParseVariableReference = function(test) {
    var result = parser.parse(parsing.expression, "blah");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.variableReference("blah")));
    test.done();
};

exports.canParseExpressionInParentheses = function(test) {
    var result = parser.parse(parsing.expression, "(blah)");
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

exports.canParseEmptyClassDefinition = function(test) {
    var result = parser.parse(parsing.expression, "class() { }");
    var expected = nodes.class(
        nodes.formalArguments([]),
        []
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canParseClassDefinitionWithFormalArguments = function(test) {
    var result = parser.parse(parsing.expression, "class(a: A) { }");
    var expected = nodes.class(
        nodes.formalArguments([nodes.formalArgument("a", nodes.ref("A"))]),
        []
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canParseClassDefinitionWithBody = function(test) {
    var result = parser.parse(parsing.expression, "class() { val x = 1; }");
    var expected = nodes.class(
        nodes.formalArguments([]),
        [nodes.val("x", options.none, nodes.number("1"))]
    );
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

exports.canCallFunctionWithMultipleArguments = function(test) {
    var result = parser.parse(parsing.expression, "max(a, b)");
    var expected = nodes.call(
        nodes.ref("max"),
        [nodes.ref("a"), nodes.ref("b")]
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.functionCallsAreLeftAssociative = function(test) {
    var result = parser.parse(parsing.expression, "go()()()");
    var expected = nodes.call(
        nodes.call(
            nodes.call(
                nodes.ref("go"),
                []
            ),
            []
        ),
        []
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canAccessMemberOfValue = function(test) {
    var result = parser.parse(parsing.expression, "song.title");
    var expected = nodes.memberAccess(
        nodes.ref("song"),
        "title"
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.memberAccessAndFunctionCallHaveSamePrecendence = function(test) {
    var result = parser.parse(parsing.expression, "songs.head().title");
    var expected = nodes.memberAccess(
        nodes.call(
            nodes.memberAccess(
                nodes.ref("songs"),
                "head"
            ),
            []
        ),
        "title"
    );
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canParseEmptyIfExpression = function(test) {
    var result = parser.parse(parsing.expression, "if (true) { }");
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.if(
            [{condition: nodes.boolean(true), body: nodes.block([])}]
        ))
    });
    test.done();
};

exports.canParseIfExpression = function(test) {
    var result = parser.parse(parsing.expression, "if (true) 1");
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.if([
            {
                condition: nodes.boolean(true),
                body: nodes.number("1")
            }
        ]))
    });
    test.done();
};

exports.canParseIfElseExpression = function(test) {
    var result = parser.parse(parsing.expression, "if (true) 1 else 2");
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.if([
            {
                condition: nodes.boolean(true),
                body: nodes.number("1")
            },
            {
                body: nodes.number("2")
            }
        ]))
    });
    test.done();
};

exports.canParseIfElseIfElseExpression = function(test) {
    var source = "if (true) 1 else if (false) 2 else 3";
    var result = parser.parse(parsing.expression, source);
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.if([
            {
                condition: nodes.boolean(true),
                body: nodes.number("1")
            },
            {
                condition: nodes.boolean(false),
                body: nodes.number("2")
            },
            {
                body: nodes.number("3")
            }
        ]))
    });
    test.done();
};

exports.canParseBlockExpression = function(test) {
    var source = "{ go(); return 1;}";
    var result = parser.parse(parsing.expression, source);
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.block([
            nodes.expressionStatement(nodes.call(nodes.ref("go"), [])),
            nodes.return(nodes.number("1"))
        ]))
    });
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
