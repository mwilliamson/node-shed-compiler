var slab = require("../../lib/slab-nodes");
var js = require("../../lib/code-generation/javascript-nodes");

var codeGenerator = require("../../lib/code-generation/micro-javascript");

exports.slabStringLiteralIsConvertedToJavaScriptStringLiteral = function(test) {
    var slabString = slab.string("Blah");
    var jsString = js.string("Blah", slabString);
    
    assertTranslation(test, slabString, jsString);
};

var assertTranslation = function(test, slab, expectedJavaScript) {
    var generatedJavaScript = codeGenerator.generate(slab);
    test.deepEqual(generatedJavaScript, expectedJavaScript);
    test.done();
};
