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
    if (Array.isArray(formalArguments)) {
        formalArguments = exports.formalArguments(formalArguments);
    }
    return {
        type: "shortLambda",
        formalArguments: formalArguments,
        returnType: returnType,
        body: body
    };
};

exports.variableReference = exports.ref = function(identifier) {
    return {
        type: "variableReference",
        identifier: identifier
    };
};

exports.formalArguments = function(formalArguments) {
    if (!Array.isArray(formalArguments)) {
        formalArguments = Array.prototype.slice.call(arguments, 0);
    }
    return {
        type: "formalArgumentList",
        formalArguments: formalArguments
    };
};
