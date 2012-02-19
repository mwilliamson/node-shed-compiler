exports.boolean = function(value) {
    return {
        type: "boolean",
        value: value
    };
};

exports.unit = function() {
    return {
        type: "unit"
    };
};

exports.shortLambda = function(formalArguments, returnType, body) {
    return {
        type: "shortLambda",
        formalArguments: formalArguments,
        returnType: returnType,
        body: body
    };
};

exports.variableReference = function(identifier) {
    return {
        type: "variableReference",
        identifier: identifier
    };
};
