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
var modulesParsing = require("../../lib/parsing/modules");
var ignoringSources = require("./util").ignoringSources;

var parser = new parsing.Parser();

exports.packageDeclarationIsPackageKeywordFollowedByListOfIdentifiers = function(test) {
    var result = parser.parse(modulesParsing.packageDeclaration, "package shed.example;");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.packageDeclaration(["shed", "example"])));
    test.done();
};
