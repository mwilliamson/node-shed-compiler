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

exports.moduleContainsPackageDeclarationFollowedByBody = function(test) {
    var result = parser.parse(modulesParsing.module, "package shed.example; true;false;");
    assertIsSuccessWithValue(test, result, ignoringSources(
        nodes.module(
            nodes.packageDeclaration(["shed", "example"]),
            [],
            [nodes.expressionStatement(nodes.boolean(true)), nodes.expressionStatement(nodes.boolean(false))]
        )
    ));
    test.done();
};

exports.moduleContainsPackageDeclarationFollowedByImportsThenBody = function(test) {
    var result = parser.parse(modulesParsing.module, "package shed.example; import shed.options; import shed.time; true;");
    assertIsSuccessWithValue(test, result, ignoringSources(
        nodes.module(
            nodes.packageDeclaration(["shed", "example"]),
            [nodes.import(["shed", "options"]), nodes.import(["shed", "time"])],
            [nodes.expressionStatement(nodes.boolean(true))]
        )
    ));
    test.done();
};


exports.packageDeclarationIsPackageKeywordFollowedByListOfIdentifiers = function(test) {
    var result = parser.parse(modulesParsing.packageDeclaration, "package shed.example;");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.packageDeclaration(["shed", "example"])));
    test.done();
};

exports.importIsImportKeywordFollowedByListOfIdentifiers = function(test) {
    var result = parser.parse(modulesParsing.import, "import shed.example;");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.import(["shed", "example"])));
    test.done();
};