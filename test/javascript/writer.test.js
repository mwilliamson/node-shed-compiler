var js = require("../../lib/javascript/nodes");
var writer = require("../../lib/javascript/writer");

exports.writesString = function(test) {
    assertJavaScriptWriter(test, js.string("Blah"), '"Blah"');
};

exports.writesVariableReference = function(test) {
    assertJavaScriptWriter(test, js.ref("print"), 'print');
};

exports.writesFunctionCallWithArguments = function(test) {
    assertJavaScriptWriter(
        test,
        js.call(js.ref("print"), [js.ref("a"), js.ref("b")]),
        'print(a, b)'
    );
};

exports.writesExpressionStatements = function(test) {
    assertJavaScriptWriter(
        test,
        js.expressionStatement(js.ref("print")),
        'print;'
    );
};

var assertJavaScriptWriter = function(test, javaScriptNode, expectedString) {
    test.deepEqual(writer.write(javaScriptNode), expectedString);
    test.done();
};
