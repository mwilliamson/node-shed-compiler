var shed = require("../lib/nodes");
var slab = require("../lib/slab-nodes");
var shedToSlab = require("../lib/shed-to-slab");

exports.shedBooleansAreConvertedToSlabBooleans = function(test) {
    var original = shed.boolean(true);
    test.deepEqual(
        slab.boolean(true, original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedUnitIsConvertedToSlabUnit = function(test) {
    var original = shed.unit();
    test.deepEqual(slab.unit(original), shedToSlab.translate(original));
    test.done();
};

exports.shedVariableReferenceIsConvertedToSlabVariableReference = function(test) {
    var original = shed.ref("blah");
    test.deepEqual(slab.ref("blah", original), shedToSlab.translate(original));
    test.done();
};

exports.shedFormalArgumentIsConvertedToSlabFormalArgument = function(test) {
    var reference = shed.ref("String");
    var original = shed.formalArgument("name", reference);
    test.deepEqual(
        slab.formalArgument("name", slab.ref("String", reference), original),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedFormalArgumentsIsConvertedToSlabFormalArguments = function(test) {
    var reference = shed.ref("String");
    var formalArgument = shed.formalArgument("name", reference);
    var original = shed.formalArguments([formalArgument]);
    test.deepEqual(
        slab.formalArguments(
            [
                slab.formalArgument(
                    "name",
                    slab.ref("String", reference),
                    formalArgument
                )
            ],
            original
        ),
        shedToSlab.translate(original)
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
    var stringReference = shed.ref("String");
    var formalArgument = shed.formalArgument("name", stringReference);
    var formalArguments = shed.formalArguments([formalArgument]);
    var booleanReference = shed.ref("Boolean");
    var reference = shed.ref("blah");
    var returnStatement = shed.return(reference);
    var block = shed.block([returnStatement]);
    var original = shed.lambda(formalArguments, booleanReference, block);
    
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
                slab.return(slab.ref("blah", reference), returnStatement)
            ], block),
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
