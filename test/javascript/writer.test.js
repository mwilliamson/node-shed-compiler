var js = require("../../lib/javascript/nodes");
var writer = require("../../lib/javascript/writer");

exports.writesString = function(test) {
    assertJavaScriptWriter(test, js.string("Blah"), '"Blah"');
};

exports.writesNumber = function(test) {
    assertJavaScriptWriter(test, js.number("42"), "42");
};

exports.writesVariableReference = function(test) {
    assertJavaScriptWriter(test, js.ref("print"), 'print');
};

exports.writesFunctionCallWithArguments = function(test) {
    assertJavaScriptWriter(
        test,
        js.call(js.ref("print"), [js.ref("a"), js.ref("b")]),
        '(print)(a, b)'
    );
};

exports.writesExpressionStatements = function(test) {
    assertJavaScriptWriter(
        test,
        js.expressionStatement(js.ref("print")),
        'print;'
    );
};

exports.writesExpressionStatementsWithIndentationLevel = function(test) {
    assertJavaScriptWriter(
        test,
        js.expressionStatement(js.func(["a", "b"], [js.expressionStatement(js.ref("print"))])),
        '        function(a, b) {\n' +
        '            print;\n' +
        '        };',
        2
    );
};

exports.writesVars = function(test) {
    assertJavaScriptWriter(
        test,
        js.var("go", js.ref("next")),
        'var go = next;'
    );
};

exports.writesAnonymousFunctions = function(test) {
    assertJavaScriptWriter(
        test,
        js.func(["a", "b"], [js.expressionStatement(js.ref("print"))]),
        'function(a, b) {\n' +
        '    print;\n' +
        '}'
    );
};

exports.writesAnonymousFunctionsWithIndentationLevel = function(test) {
    assertJavaScriptWriter(
        test,
        js.func(["a", "b"], [js.expressionStatement(js.ref("print"))]),
        'function(a, b) {\n' +
        '            print;\n' +
        '        }',
        2
    );
};

var assertJavaScriptWriter = function(test, javaScriptNode, expectedString, indentationLevel) {
    test.deepEqual(writer.write(javaScriptNode, indentationLevel), expectedString);
    test.done();
};
