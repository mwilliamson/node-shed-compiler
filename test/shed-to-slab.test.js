var options = require("options");

var shed = require("../lib/nodes");
var slab = require("../lib/slab-nodes");
var shedToSlab = require("../lib/shed-to-slab");

var shedBooleanValue = shed.boolean(true);
var slabBooleanValue = slab.boolean(true, shedBooleanValue);

var shedNumber = shed.number("42");
var slabNumber = slab.number("42", shedNumber);

var shedValue = shedBooleanValue;
var slabValue = slabBooleanValue;

var shedReference = shed.ref("blah");
var slabReference = slab.ref("blah", shedReference);

var shedStringTypeReference = shed.ref("String");
var slabStringTypeReference = slab.ref("String", shedStringTypeReference);

var shedBooleanTypeReference = shed.ref("Boolean");
var slabBooleanTypeReference = slab.ref("Boolean", shedBooleanTypeReference);

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

var shedReturn = shed.return(shedReference);
var slabReturn = slab.return(slabReference, shedReturn);

var shedReturnNumber = shed.return(shedNumber);
var slabReturnNumber = slab.return(slabNumber, shedReturnNumber);

var shedReturnBoolean = shed.return(shedBooleanValue);
var slabReturnBoolean = slab.return(slabBooleanValue, shedReturnBoolean);

var shedImport = shed.import(["shed", "example"]);
var slabImport = slab.call(slab.ref("$import", shedImport), [slab.string("shed.example", shedImport)], shedImport);

var shedFirstCondition = shed.boolean(true);
var shedSecondCondition = shed.boolean(false);

var slabFirstCondition = slab.boolean(true, shedFirstCondition);
var slabSecondCondition = slab.boolean(false, shedSecondCondition);

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
    var original = shed.string("blah");
    test.deepEqual(slab.string("blah", original), shedToSlab.translate(original));
    test.done();
};

exports.shedNumberIsConvertedToSlabNumber = function(test) {
    test.deepEqual(slabNumber, shedToSlab.translate(shedNumber));
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

exports.shedLongLambdaIsConvertedToSlabLambda = function(test) {
    var block = shed.block([shedReturn]);
    var original = shed.lambda(shedFormalArguments, shedBooleanTypeReference, block);
    
    test.deepEqual(
        slab.lambda(
            slabFormalArguments,
            slabBooleanTypeReference,
            slab.block([slabReturn], block),
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedShortLambdaIsConvertedToSlabLambda = function(test) {
    var stringReference = shed.ref("String");
    var formalArgument = shed.formalArgument("name", stringReference);
    var formalArguments = shed.formalArguments([formalArgument]);
    var booleanReference = shed.ref("Boolean");
    var reference = shed.ref("blah");
    var original = shed.lambda(formalArguments, booleanReference, reference);
    test.deepEqual(
        slab.lambda(
            slab.formalArguments([
                slab.formalArgument(
                    "name",
                    slab.ref("String", stringReference),
                    formalArgument
                )
            ], formalArguments),
            slab.ref("Boolean", booleanReference),
            slab.block([
                slab.return(slab.ref("blah", reference), reference)
            ], reference),
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedFunctionDeclarationIsConvertedToSlabLambda = function(test) {
    var block = shed.block([shedReturn]);
    var original = shed.func("go", shedFormalArguments, shedBooleanTypeReference, block);
    
    test.deepEqual(
        slab.val("go", 
            slab.lambda(
                slabFormalArguments,
                slabBooleanTypeReference,
                slab.block([slabReturn], block),
                original
            ),
            original
        ),
        shedToSlab.translate(original)
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

exports.shedIfStatementIsConvertedToSlabIfStatement = function(test) {
    var shedFirstBlock = shed.block([shedReturn]);
    var shedSecondBlock = shed.block([shedReturnNumber]);
    var shedThirdBlock = shed.block([shedReturnBoolean]);
    
    var slabFirstBlock = slab.block([slabReturn], shedFirstBlock);
    var slabSecondBlock = slab.block([slabReturnNumber], shedSecondBlock);
    var slabThirdBlock = slab.block([slabReturnBoolean], shedThirdBlock);
    
    var original = shed.if([
        {condition: shedFirstCondition, body: shedFirstBlock},
        {condition: shedSecondCondition, body: shedSecondBlock},
        {body: shedThirdBlock}
    ]);
    test.deepEqual(
        slab.if([
            {condition: slabFirstCondition, body: slabFirstBlock},
            {condition: slabSecondCondition, body: slabSecondBlock},
            {body: slabThirdBlock}
        ], original),
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
            shed.packageDeclaration(["shed", "example"]),
            [shedImport],
            [shedReturn]
        )
    test.deepEqual(
        slab.module(
            [slabImport, slabReturn],
            original
        ),
        shedToSlab.translate(original)
    );
    test.done();
};
