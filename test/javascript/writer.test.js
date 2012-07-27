var js = require("../../lib/javascript/nodes");
var writer = require("../../lib/javascript/writer");

exports.writesBoolean = function(test) {
    assertJavaScriptWriter(test, js.boolean(true), 'true');
};

exports.writesString = function(test) {
    assertJavaScriptWriter(test, js.string("Blah"), '"Blah"');
};

exports.writesNumber = function(test) {
    assertJavaScriptWriter(test, js.number("42"), "42");
};

exports.writesVariableReference = function(test) {
    assertJavaScriptWriter(test, js.ref("print"), 'print');
};

exports.writesAssignment = function(test) {
    assertJavaScriptWriter(
        test,
        js.assign(js.ref("a"), js.ref("b")),
        'a = b'
    );
};

exports.writesFunctionCallWithArguments = function(test) {
    assertJavaScriptWriter(
        test,
        js.call(js.ref("print"), [js.ref("a"), js.ref("b")]),
        'print(a, b)'
    );
};

exports.functionInFunctionCallIsWrappedInParenthesesIfOfHigherPrecendence = function(test) {
    var conditional = js.conditionalOperator(js.ref("a"), js.ref("b"), js.ref("c"));
    assertJavaScriptWriter(
        test,
        js.call(conditional, []),
        '(a ? b : c)()'
    );
};

exports.repeatedFunctionCallsArentWrappedInParentheses = function(test) {
    var conditional = js.conditionalOperator(js.ref("a"), js.ref("b"), js.ref("c"));
    assertJavaScriptWriter(
        test,
        js.call(js.call(js.ref("a"), []), []),
        'a()()'
    );
};

exports.writesMemberAccess = function(test) {
    assertJavaScriptWriter(
        test,
        js.memberAccess(js.ref("user"), "name"),
        'user.name'
    );
};

exports.writesConditionalOperator = function(test) {
    assertJavaScriptWriter(
        test,
        js.conditionalOperator(js.ref("a"), js.ref("b"), js.ref("c")),
        'a ? b : c'
    );
};

exports.writesConditionalOperator = function(test) {
    assertJavaScriptWriter(
        test,
        js.conditionalOperator(js.ref("a"), js.ref("b"), js.ref("c")),
        'a ? b : c'
    );
};

exports.writesConditionalOperatorWithCorrectParenthesesForSubConditionalOperatorExpressions = function(test) {
    assertJavaScriptWriter(
        test,
        js.conditionalOperator(
            js.conditionalOperator(js.ref("a1"), js.ref("a2"), js.ref("a3")),
            js.conditionalOperator(js.ref("b1"), js.ref("b2"), js.ref("b3")),
            js.conditionalOperator(js.ref("c1"), js.ref("c2"), js.ref("c3"))
        ),
        '(a1 ? a2 : a3) ? (b1 ? b2 : b3) : c1 ? c2 : c3'
    );
};

exports.writesObject = function(test) {
    assertJavaScriptWriter(
        test,
        js.object({
            first: js.number("1"),
            second: js.number("2")
        }),
        '{\n    "first": 1,\n    "second": 2\n}'
    );
};

exports.valuesOfPropertiesInObjectsAreIndentedCorrectly = function(test) {
    assertJavaScriptWriter(
        test,
        js.object({
            value: js.object({
                first: js.number("1")
            })
        }),
        '{\n    "value": {\n        "first": 1\n    }\n}'
    );
};

exports.writeReturns = function(test) {
    assertJavaScriptWriter(
        test,
        js.return(js.ref("print")),
        'return print;'
    );
};

exports.writesExpressionStatements = function(test) {
    assertJavaScriptWriter(
        test,
        js.expressionStatement(js.ref("print")),
        'print;'
    );
};

exports.writesVars = function(test) {
    assertJavaScriptWriter(
        test,
        js.var("go", js.ref("next")),
        'var go = next;'
    );
};

exports.writesIfStatements = function(test) {
    assertJavaScriptWriter(
        test,
        js.if([
            {condition: js.boolean(true), body: [js.return(js.number("1"))]},
            {condition: js.boolean(false), body: [js.return(js.number("2"))]},
            {body: [js.return(js.number("3"))]}
        ]),
        'if (true) {\n' +
        '    return 1;\n' +
        '} else if (false) {\n' +
        '    return 2;\n' +
        '} else {\n' +
        '    return 3;\n' +
        '}'
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

var assertJavaScriptWriter = function(test, javaScriptNode, expectedString, indentationLevel) {
    test.deepEqual(writer.write(javaScriptNode, indentationLevel), expectedString);
    test.done();
};
