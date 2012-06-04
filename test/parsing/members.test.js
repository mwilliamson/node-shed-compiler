var errors = require("lop").errors;
var parsingTesting = require("lop").testing;
var assertIsSuccessWithValue = parsingTesting.assertIsSuccessWithValue;
var StringSource = require("lop").StringSource;

var nodes = require("../../lib/nodes");
var parsing = require("../../lib/parsing");
var memberRules = require("../../lib/parsing/members");
var ignoringSources = require("./util").ignoringSources;

exports.membersCanBeEmpty = function(test) {
    var result = parseMembers("members { }");
    var expected = [];
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.membersCanContainMultipleMembers = function(test) {
    var result = parseMembers("members { one, two }");
    var expected = [nodes.memberDeclaration("one", nodes.ref("one")), nodes.memberDeclaration("two", nodes.ref("two"))];
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.memberCanBeReferenceToVariable = function(test) {
    var result = parseMember("one");
    var expected = nodes.memberDeclaration("one", nodes.ref("one"));
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

exports.canDeclareMemberValueInline = function(test) {
    var result = parseMember("one 1");
    var expected = nodes.memberDeclaration("one", nodes.number("1"));
    assertIsSuccessWithValue(test, result, ignoringSources(expected));
    test.done();
};

var parseMembers = function(string) {
    return parse(memberRules.membersRule, string);
};

var parseMember = function(string) {
    return parse(memberRules.memberRule, string);
};

var parse = function(rule, string) {
    var parser = new parsing.Parser();
    return parser.parse(rule, new StringSource(string));
};
