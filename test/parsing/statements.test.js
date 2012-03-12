var options = require("options");
var some = options.some;

var errors = require("lop").errors;
var parsingTesting = require("lop").testing;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsSuccess = parsingTesting.assertIsSuccess;
var assertIsFailure = parsingTesting.assertIsFailure;
var assertIsError = parsingTesting.assertIsError;

var nodes = require("../../lib/nodes");
var parsing = require("../../lib/parsing");
var statements = require("../../lib/parsing/statements");

var parser = new parsing.Parser();

var ignoringSources = require("./util").ignoringSources;

exports.canParseReturnStatement = function(test) {
    var result = parser.parse(parsing.statement, "return true;");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.return(nodes.boolean(true))));
    test.done();
};

exports.canParseExpressionStatement = function(test) {
    var result = parser.parse(statements.statement, "blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.expressionStatement(nodes.assign(nodes.ref("blah"), nodes.boolean(true))))
    );
    test.done();
};

exports.canParseBlockOfStatements = function(test) {
    var result = parser.parse(statements.block, "{blah = true; return blah;}");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.block([
            nodes.expressionStatement(nodes.assign(nodes.ref("blah"), nodes.boolean(true))),
            nodes.return(nodes.ref("blah"))
        ]))
    );
    test.done();
};

exports.canParseValStatement = function(test) {
    var result = parser.parse(statements.statement, "val blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.val("blah", options.none, nodes.boolean(true)))
    );
    test.done();
};

exports.canParseValStatementWithExplicitType = function(test) {
    var result = parser.parse(statements.statement, "val blah : Boolean = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.val("blah", some(nodes.ref("Boolean")), nodes.boolean(true)))
    );
    test.done();
};

exports.canParseVarStatement = function(test) {
    var result = parser.parse(statements.statement, "var blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.var("blah", options.none, nodes.boolean(true)))
    );
    test.done();
};

exports.canParseDefinition = function(test) {
    var result = parser.parse(statements.statement, "def nop() : Unit => { }");
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.def(
            "nop",
            nodes.lambda(
                nodes.formalArguments([]),
                some(nodes.ref("Unit")),
                nodes.block([])
            )
        ))
    });
    test.done();
};

exports.canParsePublicDeclarations = function(test) {
    var result = parser.parse(statements.statement, "public val blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.public(nodes.val("blah", options.none, nodes.boolean(true))))
    );
    test.done();
};
