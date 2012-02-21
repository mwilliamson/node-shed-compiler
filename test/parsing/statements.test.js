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

exports.canParseReturnStatement = function(test) {
    var result = parser.parse(parsing.statement, "return true;");
    assertIsSuccessWithValue(test, result, nodes.return(nodes.boolean(true)));
    test.done();
};

exports.canParseExpressionStatement = function(test) {
    var result = parser.parse(parsing.statement, "blah = true;");
    assertIsSuccessWithValue(
        test, result,
        nodes.expressionStatement(nodes.assign(nodes.ref("blah"), nodes.boolean(true)))
    );
    test.done();
};
