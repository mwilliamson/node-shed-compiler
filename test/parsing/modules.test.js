var _ = require("underscore");
var options = require("option");
var some = options.some;
var duck = require("duck");
var hasProperties = duck.hasProperties;

var errors = require("lop").errors;
var parsingTesting = require("lop").testing;
var assertIsSuccess = parsingTesting.assertIsSuccess;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var assertIsFailure = parsingTesting.assertIsFailure;
var assertIsError = parsingTesting.assertIsError;

var nodes = require("../../lib/nodes");
var parsing = require("../../lib/parsing");
var modulesParsing = require("../../lib/parsing/modules");
var ignoringSources = require("./util").ignoringSources;

var StringSource = require("lop").StringSource;

exports.moduleDeclarationIsOptional = function(test) {
    var result = parse(modulesParsing.module, "true;false;");
    assertIsSuccess(test, result, {
        value: ignoringSources(
            nodes.module(
                options.none,
                [],
                [],
                [nodes.expressionStatement(nodes.boolean(true)), nodes.expressionStatement(nodes.boolean(false))]
            )
        ),
        remaining: []
    });
    test.done();
};

exports.moduleContainsNameThenMembersThenBody = function(test) {
    var result = parse(modulesParsing.module, "module shed.example; members { one 1 } true;false;");
    assertIsSuccess(test, result, {
        value: ignoringSources(
            nodes.module(
                options.some(["shed", "example"]),
                [nodes.memberDeclaration("one", nodes.number("1"))],
                [],
                [nodes.expressionStatement(nodes.boolean(true)), nodes.expressionStatement(nodes.boolean(false))]
            )
        ),
        remaining: []
    });
    test.done();
};

exports.moduleContainsNameThenMembersThenImportsThenBody = function(test) {
    var result = parse(modulesParsing.module, "module shed.example; members { one 1 } import shed.options; import shed.time; true;");
    assertIsSuccess(test, result, {
        value: ignoringSources(
            nodes.module(
                options.some(["shed", "example"]),
                [nodes.memberDeclaration("one", nodes.number("1"))],
                [nodes.import(["shed", "options"]), nodes.import(["shed", "time"])],
                [nodes.expressionStatement(nodes.boolean(true))]
            )
        ),
        remaining: []
    });
    test.done();
};

exports.moduleNameIsModuleKeywordFollowedByListOfIdentifiers = function(test) {
    var result = parse(modulesParsing.moduleName, "module shed.example;");
    assertIsSuccessWithValue(test, result, ignoringSources(["shed", "example"]));
    test.done();
};

exports.importIsImportKeywordFollowedByListOfIdentifiers = function(test) {
    var result = parse(modulesParsing.import, "import shed.example;");
    assertIsSuccessWithValue(test, result, ignoringSources(nodes.import(["shed", "example"])));
    test.done();
};

var parse = function(rule, string) {
    var parser = new parsing.Parser();
    return parser.parse(rule, new StringSource(string));
};
