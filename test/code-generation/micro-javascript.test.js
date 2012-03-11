var options = require("options");

var slab = require("../../lib/slab-nodes");
var js = require("../../lib/javascript/nodes");

var codeGenerator = require("../../lib/code-generation/micro-javascript");

var slabString = slab.string("Blah");
var jsString = js.string("Blah", slabString);

var slabNumber = slab.number("42");
var jsNumber = js.number("42", slabNumber);

var slabReference = slab.ref("print");
var jsReference = js.ref("print", slabReference);

var slabFunctionCall = slab.call(slabReference, [slabString]);
var jsFunctionCall = js.call(jsReference, [jsString], slabFunctionCall);

var slabExpressionStatement = slab.expressionStatement(slabFunctionCall);
var jsExpressionStatement = js.expressionStatement(jsFunctionCall, slabExpressionStatement);

exports.slabStringLiteralIsConvertedToJavaScriptStringLiteral = function(test) {
    assertTranslation(test, slabString, jsString);
};

exports.slabNumberLiteralIsConvertedToJavaScriptNumberLiteral = function(test) {
    assertTranslation(test, slabNumber, jsNumber);
};

exports.slabReferenceIsConvertedToJavaScriptReference = function(test) {
    assertTranslation(test, slabReference, jsReference);
};

exports.slabFunctionCallIsConvertedToJavaScriptFunctionCall = function(test) {
    assertTranslation(test, slabFunctionCall, jsFunctionCall);
};

exports.slabExpressionStatementIsConvertedToJavaScriptExpressionStatement = function(test) {
    assertTranslation(test, slabExpressionStatement, jsExpressionStatement);
};

exports.slabValIsConvertedToJavaScriptVar = function(test) {
    var slabVal = slab.val("coins", options.none, slabNumber);
    assertTranslation(test, slabVal, js.var("coins", jsNumber, slabVal));
};

exports.slabModuleIsConvertedToJavaScriptFunctionThatsImmediatelyCalled = function(test) {
    var slabModule = slab.module([slabExpressionStatement]);
    assertTranslation(test, slabModule, js.call(js.func([], [jsExpressionStatement], slabModule), [], slabModule));
};

var assertTranslation = function(test, slab, expectedJavaScript) {
    var generatedJavaScript = codeGenerator.translate(slab);
    test.deepEqual(generatedJavaScript, expectedJavaScript);
    test.done();
};
