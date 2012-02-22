var shed = require("../lib/nodes");
var slab = require("../lib/slab-nodes");
var shedToSlab = require("../lib/shed-to-slab");

exports.shedBooleansAreConvertedToSlabBooleans = function(test) {
    var original = shed.boolean(true);
    test.deepEqual(slab.boolean(true), shedToSlab.translate(original));
    test.done();
};

exports.shedUnitIsConvertedToSlabUnit = function(test) {
    var original = shed.unit();
    test.deepEqual(slab.unit(), shedToSlab.translate(original));
    test.done();
};

exports.shedVariableReferenceIsConvertedToSlabVariableReference = function(test) {
    var original = shed.ref("blah");
    test.deepEqual(slab.ref("blah"), shedToSlab.translate(original));
    test.done();
};

exports.shedFormalArgumentIsConvertedToSlabFormalArgument = function(test) {
    var original = shed.formalArgument("name", shed.ref("String"));
    test.deepEqual(slab.formalArgument("name", slab.ref("String")), shedToSlab.translate(original));
    test.done();
};

exports.shedFormalArgumentsIsConvertedToSlabFormalArguments = function(test) {
    var original = shed.formalArguments([shed.formalArgument("name", shed.ref("String"))]);
    test.deepEqual(
        slab.formalArguments([slab.formalArgument("name", slab.ref("String"))]),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedReturnIsConvertedToSlabReturn = function(test) {
    var original = shed.return(shed.ref("blah"));
    test.deepEqual(slab.return(slab.ref("blah")), shedToSlab.translate(original));
    test.done();
};

exports.shedBlockIsConvertedToSlabBlock = function(test) {
    var original = shed.block([
        shed.return(shed.ref("blah"))
    ]);
    test.deepEqual(
        slab.block([
            slab.return(slab.ref("blah"))
        ]),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedLongLambdaIsConvertedToSlabLambda = function(test) {
    var original = shed.lambda(
        shed.formalArguments([shed.formalArgument("name", shed.ref("String"))]),
        shed.ref("Boolean"),
        shed.block([
            shed.return(shed.ref("blah"))
        ])
    );
    test.deepEqual(
        slab.lambda(
            slab.formalArguments([slab.formalArgument("name", slab.ref("String"))]),
            slab.ref("Boolean"),
            slab.block([
                slab.return(slab.ref("blah"))
            ])
        ),
        shedToSlab.translate(original)
    );
    test.done();
};

exports.shedShortLambdaIsConvertedToSlabLambda = function(test) {
    var original = shed.lambda(
        shed.formalArguments([shed.formalArgument("name", shed.ref("String"))]),
        shed.ref("Boolean"),
        shed.ref("blah")
    );
    test.deepEqual(
        slab.lambda(
            slab.formalArguments([slab.formalArgument("name", slab.ref("String"))]),
            slab.ref("Boolean"),
            slab.block([
                slab.return(slab.ref("blah"))
            ])
        ),
        shedToSlab.translate(original)
    );
    test.done();
};
