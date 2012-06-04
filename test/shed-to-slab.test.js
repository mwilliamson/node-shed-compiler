var options = require("options");

var shed = require("../lib/nodes");
var slab = require("../lib/slab-nodes");
var shedToSlab = require("../lib/shed-to-slab");

var shedBooleanValue = shed.boolean(true);
var slabBooleanValue = slab.boolean(true, shedBooleanValue);

var shedNumber = shed.number("42");
var slabNumber = slab.number("42", shedNumber);

var shedString = shed.string("invisible light");
var slabString = slab.string("invisible light", shedString);

var shedValue = shedBooleanValue;
var slabValue = slabBooleanValue;

var shedReference = shed.ref("blah");
var slabReference = slab.ref("blah", shedReference);

var shedStringTypeReference = shed.ref("String");
var slabStringTypeReference = slab.ref("String", shedStringTypeReference);

var shedBooleanTypeReference = shed.ref("Boolean");
var slabBooleanTypeReference = slab.ref("Boolean", shedBooleanTypeReference);

var shedUnitTypeReference = shed.ref("Unit");
var slabUnitTypeReference = slab.ref("Unit", shedUnitTypeReference);

var shedTypeReference = shedStringTypeReference;
var slabTypeReference = slabStringTypeReference;

var shedFormalArgument = shed.formalArgument("name", shedTypeReference);
var slabFormalArgument = slab.formalArgument(
    "name",
    slabTypeReference,
    shedFormalArgument
);

var shedFormalArguments = shed.formalArguments([shedFormalArgument]);
var slabFormalArguments = slab.formalArguments([slabFormalArgument], shedFormalArguments);

var shedFormalTypeParameter = shed.formalTypeParameter("T");
var slabFormalTypeParameter = slab.formalArgument(
    "T",
    slab.ref("$Type", shedFormalTypeParameter),
    shedFormalTypeParameter
);

var shedFormalTypeParameters = shed.formalTypeParameters([
    shedFormalTypeParameter
]);
var slabFormalTypeParameters = slab.formalArguments([
    slabFormalTypeParameter
], shedFormalTypeParameters);

var shedReturn = shed.return(shedReference);
var slabReturn = slab.return(slabReference, shedReturn);

var shedExpressionStatement = shed.expressionStatement(shedReference);
var slabExpressionStatement =
    slab.expressionStatement(slabReference, shedExpressionStatement);

var shedReturnNumber = shed.return(shedNumber);
var slabReturnNumber = slab.return(slabNumber, shedReturnNumber);

var shedReturnBoolean = shed.return(shedBooleanValue);
var slabReturnBoolean = slab.return(slabBooleanValue, shedReturnBoolean);

var shedImport = shed.import(["shed", "example"]);
var slabImport = slab.val(
    "example",
    options.none,
    slab.call(slab.ref("$import", shedImport), [slab.string("shed.example", shedImport)], shedImport),
    shedImport
);

var shedBlock = shed.block([shedReturn]);
var slabBlock = slab.block([slabReturn], shedBlock);

var shedLambda = shed.lambda(options.none, shedFormalArguments, options.some(shedBooleanTypeReference), shedBooleanValue);
var slabLambda = slab.lambda(
    slabFormalArguments,
    options.some(slabBooleanTypeReference),
    slabBooleanValue,
    shedLambda
);

exports.shedBooleansAreConvertedToSlabBooleans = function(test) {
    test.deepEqual(slabValue, shedToSlab.translate(shedValue));
    test.done();
};

exports.shedUnitIsConvertedToSlabUnit = function(test) {
    var original = shed.unit();
    test.deepEqual(slab.unit(original), shedToSlab.translate(original));
    test.done();
};

exports.shedStringIsConvertedToSlabString = function(test) {
    test.deepEqual(slabString, shedToSlab.translate(shedString));
    test.done();
};

exports.shedNumberIsConvertedToSlabNumber = function(test) {
    test.deepEqual(slabNumber, shedToSlab.translate(shedNumber));
    test.done();
};

exports.shedListLiteralIsConvertedToSlabCallToListBuilder = function(test) {
    var shedList = shed.list([shedString, shedNumber]);
    test.deepEqual(
        slab.call(
            slab.ref("$lists.create", shedList),
            [slabString, slabNumber],
            shedList
        ),
        shedToSlab.translate(shedList)
    );
    test.done();
};

exports.shedVariableReferenceIsConvertedToSlabVariableReference = function(test) {
    var original = shed.ref("blah");
    test.deepEqual(slab.ref("blah", original), shedToSlab.translate(original));
    test.done();
};

exports.shedFunctionCallIsConvertedToSlabFunctionCall = function(test) {
    var original = shed.call(
        shedReference,
        [shedValue]
    );
    test.deepEqual(slab.call(slabReference, [slabValue], original), shedToSlab.translate(original));
    test.done();
};

exports.shedTypeApplicationIsConvertedToSlabTypeApplication = function(test) {
    var original = shed.typeApplication(
        shedStringTypeReference,
        [shedBooleanTypeReference]
    );
    test.deepEqual(
        slab.typeApplication(
            slabStringTypeReference,
            [slabBooleanTypeReference],
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedFunctionTypeIsConvertedToTypeApplication = function(test) {
    var original = shed.functionType(
        [shedStringTypeReference, shedBooleanTypeReference],
        shedUnitTypeReference
    );
    test.deepEqual(
        slab.typeApplication(
            slab.ref("$Function", original),
            [slabStringTypeReference, slabBooleanTypeReference, slabUnitTypeReference],
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedMemberAccessIsConvertedToSlabMemberAccess = function(test) {
    var original = shed.memberAccess(shedReference, "title");
    test.deepEqual(slab.memberAccess(slabReference, "title", original), shedToSlab.translate(original));
    test.done();
};

exports.shedFormalArgumentIsConvertedToSlabFormalArgument = function(test) {
    test.deepEqual(
        slabFormalArgument,
        shedToSlab.translate(shedFormalArgument)
    );
    test.done();
};

exports.shedFormalArgumentsIsConvertedToSlabFormalArguments = function(test) {
    test.deepEqual(
        slabFormalArguments,
        shedToSlab.translate(shedFormalArguments)
    );
    test.done();
};

exports.shedReturnIsConvertedToSlabReturn = function(test) {
    var reference = shed.ref("blah");
    var original = shed.return(reference);
    test.deepEqual(
        slab.return(slab.ref("blah", reference), original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedBlockIsConvertedToSlabBlock = function(test) {
    var shedReference = shed.ref("blah");
    var shedReturn = shed.return(shedReference);
    var original = shed.block([shedReturn]);
    test.deepEqual(
        slab.block([
            slab.return(slab.ref("blah", shedReference), shedReturn)
        ], original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedLambdaIsConvertedToSlabLambda = function(test) {
    test.deepEqual(slabLambda, shedToSlab.translate(shedLambda));
    test.done();
};

exports.shedLambdaWithFormalTypeParametersIsConvertedToTwoNestedSlabLambdas = function(test) {
    var shedLambda = shed.lambda(
        options.some(shedFormalTypeParameters),
        shedFormalArguments,
        options.some(shedBooleanTypeReference),
        shedBooleanValue
    );
    var slabInnerLambda = slab.lambda(
        slabFormalArguments,
        options.some(slabBooleanTypeReference),
        slabBooleanValue,
        shedLambda
    );
    var slabOuterLambda = slab.lambda(
        slabFormalTypeParameters,
        options.none,
        slabInnerLambda,
        shedLambda
    );
    test.deepEqual(slabOuterLambda, shedToSlab.translate(shedLambda));
    test.done();
};

exports.shedClassIsConvertedToSlabClass = function(test) {
    var shedClass = shed.class(options.none, shedFormalArguments, [], [shedExpressionStatement]);
    var slabClass = slab.class(slabFormalArguments, [], [slabExpressionStatement], shedClass); 
    test.deepEqual(slabClass, shedToSlab.translate(shedClass));
    test.done();
};

exports.shedClassWithFormalTypeParametersIsConvertedToSlabClassWithinLambda = function(test) {
    var shedClass = shed.class(
        options.some(shedFormalTypeParameters),
        shedFormalArguments,
        [],
        [shedExpressionStatement]
    );
    var slabClass = slab.class(slabFormalArguments, [], [slabExpressionStatement], shedClass); 
    var slabLambda = slab.lambda(
        slabFormalTypeParameters,
        options.none,
        slabClass,
        shedClass
    );
    test.deepEqual(slabLambda, shedToSlab.translate(shedClass));
    test.done();
};

exports.shedObjectIsConvertedToSlabClassWithImmediateInstance = function(test) {
    var shedObject = shed.object([], [shedExpressionStatement]);
    var slabObject = slab.block([
        slab.val(
            "$classForObject",
            options.none,
            slab.class(slab.formalArguments([], shedObject), [], [slabExpressionStatement], shedObject),
            shedObject
        ),
        slab.return(slab.call(slab.ref("$classForObject", shedObject), [], shedObject), shedObject)
    ], shedObject);
    test.deepEqual(slabObject, shedToSlab.translate(shedObject));
    test.done();
};

exports.shedDefinitionDeclarationIsConvertedToSlabDefinitionDeclaration = function(test) {
    var shedDef = shed.def("go", shedLambda);
    var slabDef = slab.def("go", slabLambda, shedDef);
    test.deepEqual(
        slabDef,
        shedToSlab.translate(shedDef)
    );
    test.done();
};

exports.shedAssignmentIsConvertedToSlabAssignment = function(test) {
    var value = shed.boolean(true);
    var reference = shed.ref("blah");
    var original = shed.assign(reference, value);
    test.deepEqual(
        slab.assign(slab.ref("blah", reference), slab.boolean(true, value), original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedIfExpressionIsConvertedToSlabIfExpression = function(test) {
    var original = shed.if([
        {condition: shedBooleanValue, body: shedString},
        {body: shedNumber}
    ]);
    test.deepEqual(
        slab.if([
            {condition: slabBooleanValue, body: slabString},
            {body: slabNumber}
        ], original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedExpressionStatementIsConvertedToSlabExpressionStatement = function(test) {
    var reference = shed.ref("blah");
    var original = shed.expressionStatement(reference);
    test.deepEqual(
        slab.expressionStatement(slab.ref("blah", reference), original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedValIsConvertedToSlabVal = function(test) {
    var original = shed.val("blah", options.some(shedTypeReference), shedValue);
    test.deepEqual(
        slab.val("blah", options.some(slabTypeReference), slabValue, original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedVarIsConvertedToSlabVar = function(test) {
    var original = shed.var("blah", options.some(shedTypeReference), shedValue);
    test.deepEqual(
        slab.var("blah", options.some(slabTypeReference), slabValue, original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedPublicDeclarationIsConvertedToSlabPublicDeclaration = function(test) {
    var declaration = shed.val("blah", options.none, shedValue);
    var original = shed.public(declaration);
    test.deepEqual(
        slab.public(slab.val("blah", options.none, slabValue, declaration), original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedImportIsConvertedToSlabValDeclarationAndFunctionCall = function(test) {
    test.deepEqual(
        slabImport,
        shedToSlab.translate(shedImport)
    );
    test.done();
};

exports.shedModuleIsConvertedToSlabModule = function(test) {
    var original = shed.module(
            options.some(shed.packageDeclaration(["shed", "example"])),
            [shedImport],
            [shedReturn]
        )
    test.deepEqual(
        slab.module(
            ["shed", "example"],
            [slabImport, slabReturn],
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.slabPackageIsEmptyArrayIfPackageDeclarationIsMissingFromShedModule = function(test) {
    var original = shed.module(
            options.none,
            [shedImport],
            [shedReturn]
        )
    test.deepEqual(
        slab.module(
            [],
            [slabImport, slabReturn],
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};
