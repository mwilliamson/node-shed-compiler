var options = require("options");

var slab = require("../../lib/slab-nodes");
var js = require("../../lib/javascript/nodes");

var codeGenerator = require("../../lib/code-generation/micro-javascript");
var microJavaScript = codeGenerator;

var slabTrue = slab.boolean(true);
var jsTrue = js.boolean(true, slabTrue);

var slabFalse = slab.boolean(false);
var jsFalse = js.boolean(false, slabFalse);

var slabBoolean = slabTrue;
var jsBoolean = jsTrue;

var slabString = slab.string("Blah");
var jsString = js.call(js.ref("$shed.string", slabString), [js.string("Blah", slabString)], slabString);

var slabNumber = slab.number("42");
var jsNumber = js.call(js.ref("$shed.number", slabNumber), [js.number("42", slabNumber)], slabNumber);

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
var jsFunction = js.call(
    js.ref("$shed.function", slabLambda),
    [
        js.func(
            ["name"],
            [js.return(jsBoolean, slabLambda)],
            slabLambda
        )
    ],
    slabLambda
);
    
var slabVal = slab.val("coins", options.none, slabNumber);
var jsVal = js.var("coins", jsNumber, slabVal);

exports.slabBooleanLiteralIsConvertedToJavaScriptBooleanLiteral = function(test) {
    var slabBoolean = slab.boolean(true);
    assertStubbedTranslation(test, slabBoolean, js.boolean(true, slabBoolean));
};

exports.slabStringLiteralIsConvertedToJavaScriptStringLiteral = function(test) {
    var slabString = slab.string("Blah");
    assertStubbedTranslation(test,
        slabString,
        js.call(js.ref("$shed.string"), [js.string("Blah")])
    );
};

exports.slabNumberLiteralIsConvertedToBoxedJavaScriptNumberLiteral = function(test) {
    var slabNumber = slab.number("42");
    assertStubbedTranslation(test,
        slabNumber,
        js.call(js.ref("$shed.number"), [js.number("42")])
    );
};

exports.slabUnitLiteralIsConvertedToReferenceToShedUnitConstant = function(test) {
    var slabUnit = slab.unit();
    assertTranslation(test, slabUnit, js.ref("$shed.unit"));
};

exports.slabReferenceIsConvertedToJavaScriptReference = function(test) {
    var slabReference = slab.ref("print");
    assertTranslation(test, slabReference, js.ref("print"));
};

exports.slabFormalArgumentsIsConvertedToNameOfFormalArgument = function(test) {
    var slabFormalArgument = slab.formalArgument("name", slab.ref("String"));
    assertStubbedTranslation(test, slabFormalArgument, "name");
};

exports.slabFormalArgumentsIsConvertedToListOfTranslatedFormalArguments = function(test) {
    var slabFormalArgument = slab.formalArgument("name", slab.ref("String"));
    var slabFormalArguments = slab.formalArguments([slabFormalArgument]);
    assertStubbedTranslation(test,
        slabFormalArguments,
        [stub(slabFormalArgument)]
    );
};

exports.slabLambdaIsConvertedToJavaScriptAnonymousFunction = function(test) {
    var slabFormalArguments = slab.formalArguments([]);
    var slabLambda = slab.lambda(
        slabFormalArguments,
        slab.ref("Boolean"),
        slab.boolean(true)
    );
    assertStubbedTranslation(
        test,
        slabLambda,
        js.call(
            js.ref("$shed.function"),
            [
                js.func(
                    stub(slabFormalArguments),
                    [js.return(stub(slab.boolean(true)))],
                    slabLambda
                )
            ],
            slabLambda
        )
    );
};

exports.slabClassWithNoPublicMembersIsConvertedToJavaScriptFunctionReturningEmptyObject = function(test) {
    var slabFormalArguments = slab.formalArguments([]);
    var slabStatement = slab.expressionStatement(slab.unit());
    var slabClass = slab.class(slabFormalArguments, [], [slabStatement]); 
    var jsClass = js.call(
        js.ref("$shed.class"),
        [js.func(
            stub(slabFormalArguments),
            [
                stub(slabStatement),
                js.return(js.object({}))
            ]
        )]
    );
    assertStubbedTranslation(test, slabClass, jsClass);
};

exports.slabClassIsConvertedToJavaScriptFunctionReturningObjectOfMembers = function(test) {
    var slabFormalArguments = slab.formalArguments([]);
    var slabMember = slab.memberDeclaration("value", slab.ref("blah"));
    var slabStatement = slab.val("blah", options.none, slab.unit());
    var slabClass = slab.class(slabFormalArguments, [slabMember], [slabStatement]); 
    
    var expectedJsObject = {"value": stub(slab.ref("blah"))};
    
    var jsClass = js.call(
        js.ref("$shed.class"),
        [js.func(
            stub(slabFormalArguments),
            [
                stub(slabStatement),
                js.return(js.object(expectedJsObject))
            ]
        )]
    );
    assertStubbedTranslation(test, slabClass, jsClass);
};

exports.slabFunctionCallIsConvertedToJavaScriptFunctionCall = function(test) {
    assertStubbedTranslation(test,
        slab.call(slab.ref("func"), [slab.unit()]),
        js.call(stub(slab.ref("func")), [stub(slab.unit())])
    );
};

exports.slabMemberAccessIsConvertedToJavaScriptMemberAccess = function(test) {
    assertStubbedTranslation(test,
        slab.memberAccess(slab.ref("book"), "title"),
        js.memberAccess(stub(slab.ref("book")), "title")
    );
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
    
    var expectedJs = js.var(
        "go",
        js.call(
            js.memberAccess(
                jsFunction,
                "$define",
                slabDef
            ),
            [js.string(slabDef.identifier, slabDef)]
        ),
        slabDef
    );
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
    var otherJsString = codeGenerator.translate(otherSlabString);
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

exports.anonymousSlabModuleIsConvertedToJavaScriptFunctionThatsImmediatelyCalled = function(test) {
    var slabModule = slab.module([], [], [slabExpressionStatement]);
    assertTranslation(test, slabModule, js.call(js.func([], [jsExpressionStatement], slabModule), [], slabModule));
};

exports.slabModuleIsConvertedToExportOfMembers = function(test) {
    var slabMember = slab.memberDeclaration("value", slabString);
    var slabModule = slab.module(
        ["shed", "example"],
        [slabMember],
        [slabExpressionStatement]
    );
    assertTranslation(
        test,
        slabModule,
        js.expressionStatement(js.call(js.ref("$shed.exportModule", slabModule), [
            js.string("shed.example", slabModule),
            js.func([], [
                jsExpressionStatement,
                js.return(js.object({value: jsString}, slabModule), slabModule)
            ], slabModule),
        ], slabModule), slabModule)
    );
};

var assertTranslation = function(test, slab, expectedJavaScript) {
    var generatedJavaScript = codeGenerator.translate(slab);
    test.deepEqual(generatedJavaScript, expectedJavaScript);
    test.done();
};

var assertStubbedTranslation = function(test, slab, expectedJavaScript) {
    var translator = new microJavaScript.Translator(stub);
    var generatedJavaScript = translator.translate(slab);
    test.deepEqual(generatedJavaScript, expectedJavaScript);
    test.done();
};

function stub(slabNode) {
    return {
        nodeType: "stubTranslation",
        slabNode: slabNode
    };
}
