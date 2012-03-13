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
var jsBlock = js.call(js.func([], [jsReturn], slabBlock), [], slabBlock);

var slabLambda = slab.lambda(
    slab.formalArguments([slab.formalArgument("name", slab.ref("String"))]),
    slab.ref("Boolean"),
    slabBoolean
);
var jsFunction = js.func(
    ["name"],
    [js.return(jsBoolean, slabLambda)],
    slabLambda);
    
    
var slabVal = slab.val("coins", options.none, slabNumber);
var jsVal = js.var("coins", jsNumber, slabVal);

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

exports.slabClassWithNoPublicMembersIsConvertedToJavaScriptFunctionReturningEmptyObject = function(test) {
    var slabFormalArguments = slab.formalArguments([
        slab.formalArgument("name", slab.ref("String"))
    ]);
    var slabClass = slab.class(slabFormalArguments, [slabExpressionStatement]); 
    var jsClass = js.func(["name"], [
        jsExpressionStatement,
        js.return(js.object({}, slabClass), slabClass)
    ], slabClass);
    assertTranslation(test, slabClass, jsClass);
};

exports.slabClassIsConvertedToJavaScriptFunctionReturningObjectOfPublicMembers = function(test) {
    var slabPublicVal = slab.public(slabVal);
    var slabFormalArguments = slab.formalArguments([]);
    var slabClass = slab.class(slabFormalArguments, [slabPublicVal]); 
    
    var expectedJsObject = {}
    expectedJsObject[jsVal.identifier] = js.ref(jsVal.identifier, slabPublicVal);
    
    var jsClass = js.func([], [
        jsVal,
        js.return(js.object(expectedJsObject, slabClass), slabClass)
    ], slabClass);
    assertTranslation(test, slabClass, jsClass);
};

exports.slabFunctionCallIsConvertedToJavaScriptFunctionCall = function(test) {
    assertTranslation(test, slabFunctionCall, jsFunctionCall);
};

exports.slabMemberAccessIsConvertedToJavaScriptMemberAccess = function(test) {
    assertTranslation(test, slabMemberAccess, jsMemberAccess);
};

exports.slabBlockIsConvertedToImmediatelyCalledJavaScriptAnonymousFunction = function(test) {
    assertTranslation(test, slabBlock, jsBlock);
};

exports.slabReturnIsConvertedToJavaScriptReturn = function(test) {
    assertTranslation(test, slabReturn, jsReturn);
};

exports.slabExpressionStatementIsConvertedToJavaScriptExpressionStatement = function(test) {
    assertTranslation(test, slabExpressionStatement, jsExpressionStatement);
};

exports.slabValIsConvertedToJavaScriptVar = function(test) {
    assertTranslation(test, slabVal, jsVal);
};

exports.slabDefinitionDeclarationIsConvertedToJavaScriptVariable = function(test) {
    var slabDef = slab.def("go", slabLambda);
    var expectedJs = js.var("go", jsFunction, slabDef)
    assertTranslation(test, slabDef, expectedJs);
};

exports.slabIfExpressionIsConvertedToJavaScriptConditionOperatorWithOption = function(test) {
    var slabIf = slab.if([
        {condition: slabBoolean, body: slabString}
    ]);
    var expectedJavaScript = js.conditionalOperator(
        jsBoolean,
        js.call(js.ref("$some", slabIf), [jsString], slabIf),
        js.ref("$none", slabIf),
        slabIf
    );
    assertTranslation(test, slabIf, expectedJavaScript);
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
