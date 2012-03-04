var slab = require("../../lib/slab-nodes");
var js = require("../../lib/code-generation/javascript-nodes");

var codeGenerator = require("../../lib/code-generation/micro-javascript");

var slabString = slab.string("Blah");
var jsString = js.string("Blah", slabString);

var slabReference = slab.ref("print");
var jsReference = js.ref("print", slabReference);

var slabFunctionCall = slab.call(slabReference, [slabString]);
var jsFunctionCall = js.call(jsReference, [jsString], slabFunctionCall);

exports.slabStringLiteralIsConvertedToJavaScriptStringLiteral = function(test) {
    assertTranslation(test, slabString, jsString);
};

exports.slabReferenceIsConvertedToJavaScriptReference = function(test) {
    assertTranslation(test, slabReference, jsReference);
};

exports.slabFunctionCallIsConvertedToJavaScriptFunctionCall = function(test) {
    assertTranslation(test, slabFunctionCall, jsFunctionCall);
};

var assertTranslation = function(test, slab, expectedJavaScript) {
    var generatedJavaScript = codeGenerator.generate(slab);
    test.deepEqual(generatedJavaScript, expectedJavaScript);
    test.done();
};
