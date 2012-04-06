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

var StringSource = require("lop").StringSource;

var ignoringSources = require("./util").ignoringSources;

exports.canParseReturnStatement = function(test) {
    var result = parse(parsing.statement, "return true;");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.return(nodes.boolean(true))));
    test.done();
};

exports.canParseExpressionStatement = function(test) {
    var result = parse(statements.statement, "blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.expressionStatement(nodes.assign(nodes.ref("blah"), nodes.boolean(true))))
    );
    test.done();
};

exports.canParseValStatement = function(test) {
    var result = parse(statements.statement, "val blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.val("blah", options.none, nodes.boolean(true)))
    );
    test.done();
};

exports.canParseValStatementWithExplicitType = function(test) {
    var result = parse(statements.statement, "val blah : Boolean = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.val("blah", some(nodes.ref("Boolean")), nodes.boolean(true)))
    );
    test.done();
};

exports.canParseVarStatement = function(test) {
    var result = parse(statements.statement, "var blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.var("blah", options.none, nodes.boolean(true)))
    );
    test.done();
};

exports.canParseDefinition = function(test) {
    var result = parse(statements.statement, "def nop fun() : Unit => ()");
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.def(
            "nop",
            nodes.lambda(
                options.none,
                nodes.formalArguments([]),
                some(nodes.ref("Unit")),
                nodes.unit()
            )
        ))
    });
    test.done();
};

exports.definitionCanHaveTrailingSemiColon = function(test) {
    var result = parse(statements.statement, "def nop fun() : Unit => ();");
    assertIsSuccess(test, result, {
        value: ignoringSources(nodes.def(
            "nop",
            nodes.lambda(
                options.none,
                nodes.formalArguments([]),
                some(nodes.ref("Unit")),
                nodes.unit()
            )
        ))
    });
    test.done();
};

exports.canParsePublicDeclarations = function(test) {
    var result = parse(statements.statement, "public val blah = true;");
    assertIsSuccessWithValue(
        test, result,
        ignoringSources(nodes.public(nodes.val("blah", options.none, nodes.boolean(true))))
    );
    test.done();
};

var parse = function(rule, string) {
    var parser = new parsing.Parser();
    return parser.parse(rule, new StringSource(string));
};
