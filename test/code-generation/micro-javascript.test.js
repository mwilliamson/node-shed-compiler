var options = require("options");

var slab = require("../../lib/slab-nodes");
var js = require("../../lib/javascript/nodes");

var codeGenerator = require("../../lib/code-generation/micro-javascript");

var slabTrue = slab.boolean(true);
var jsTrue = js.boolean(true, slabTrue);

var slabFalse = slab.boolean(false);
var jsFalse = js.boolean(false, slabFalse);

var slabBoolean = slabTrue;
var jsBoolean = jsTrue;

var slabString = slab.string("Blah");
var jsString = js.string("Blah", slabString);

var slabNumber = slab.number("42");
var jsNumber = js.call(js.ref("$number", slabNumber), [js.number("42", slabNumber)], slabNumber);

var slabReference = slab.ref("print");
var jsReference = js.ref("print", slabReference);

var slabFunctionCall = slab.call(slabReference, [slabString]);
var jsFunctionCall = js.call(jsReference, [jsString], slabFunctionCall);

var slabMemberAccess = slab.memberAccess(slabReference, "title");
var jsMemberAccess = js.memberAccess(jsReference, "title", slabMemberAccess);

var slabExpressionStatement = slab.expressionStatement(slabFunctionCall);
var jsExpressionStatement = js.expressionStatement(jsFunctionCall, slabExpressionStatement);

var slabReturn = slab.return(slabNumber);
var jsReturn = js.return(jsNumber, slabReturn);

var slabBlock = slab.block([slabReturn]);
var jsBlock = [jsReturn];

var slabLambda = slab.lambda(
    slab.formalArguments([slab.formalArgument("name", slab.ref("String"))]),
    slab.ref("Boolean"),
    slabBlock
);
var jsFunction = js.func(["name"], jsBlock, slabLambda);

exports.slabBooleanLiteralIsConvertedToJavaScriptBooleanLiteral = function(test) {
    assertTranslation(test, slabBoolean, jsBoolean);
};

exports.slabStringLiteralIsConvertedToJavaScriptStringLiteral = function(test) {
    assertTranslation(test, slabString, jsString);
};

exports.slabNumberLiteralIsConvertedToBoxedJavaScriptNumberLiteral = function(test) {
    assertTranslation(test, slabNumber, jsNumber);
};

exports.slabReferenceIsConvertedToJavaScriptReference = function(test) {
    assertTranslation(test, slabReference, jsReference);
};

exports.slabLambdaIsConvertedToJavaScriptAnonymousFunction = function(test) {
    assertTranslation(test, slabLambda, jsFunction);
};

exports.slabFunctionCallIsConvertedToJavaScriptFunctionCall = function(test) {
    assertTranslation(test, slabFunctionCall, jsFunctionCall);
};

exports.slabMemberAccessIsConvertedToJavaScriptMemberAccess = function(test) {
    assertTranslation(test, slabMemberAccess, jsMemberAccess);
};

exports.slabReturnIsConvertedToJavaScriptReturn = function(test) {
    assertTranslation(test, slabReturn, jsReturn);
};

exports.slabExpressionStatementIsConvertedToJavaScriptExpressionStatement = function(test) {
    assertTranslation(test, slabExpressionStatement, jsExpressionStatement);
};

exports.slabValIsConvertedToJavaScriptVar = function(test) {
    var slabVal = slab.val("coins", options.none, slabNumber);
    assertTranslation(test, slabVal, js.var("coins", jsNumber, slabVal));
};

exports.slabDefinitionDeclarationIsConvertedToJavaScriptVariable = function(test) {
    var slabDef = slab.def("go", slabLambda);
    var expectedJs = js.var("go", jsFunction, slabDef)
    assertTranslation(test, slabDef, expectedJs);
};

exports.slabIfElseExpressionIsConvertedToJavaScriptConditionOperator = function(test) {
    var slabIf = slab.if([
        {condition: slabBoolean, body: slabString},
        {body: slabNumber}
    ]);
    var expectedJavaScript = js.conditionalOperator(
        jsBoolean, jsString, jsNumber, slabIf
    );
    assertTranslation(test, slabIf, expectedJavaScript);
};

exports.slabIfElseIfElseExpressionIsConvertedToJavaScriptConditionOperator = function(test) {
    var otherSlabString = slab.string("fire");
    var otherJsString = js.string("fire", otherSlabString);
    var slabIf = slab.if([
        {condition: slabTrue, body: slabString},
        {condition: slabFalse, body: otherSlabString},
        {body: slabNumber}
    ]);
    var expectedJavaScript = js.conditionalOperator(jsTrue,
        jsString,
        js.conditionalOperator(jsFalse,
            otherJsString,
            jsNumber,
            slabIf
        ),
        slabIf
    );
    assertTranslation(test, slabIf, expectedJavaScript);
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
