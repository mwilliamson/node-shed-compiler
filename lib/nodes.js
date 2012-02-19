exports.boolean = function(value) {
    return {
        nodeType: "boolean",
        value: value
    };
};

exports.unit = function() {
    return {
        nodeType: "unit"
    };
};

exports.shortLambda = function(formalArguments, returnType, body) {
    if (Array.isArray(formalArguments)) {
        formalArguments = exports.formalArguments(formalArguments);
    }
    return {
        nodeType: "shortLambda",
        formalArguments: formalArguments,
        returnType: returnType,
        body: body
    };
};

exports.variableReference = exports.ref = function(identifier) {
    return {
        nodeType: "variableReference",
        identifier: identifier
    };
};

exports.formalArguments = function(formalArguments) {
    if (!Array.isArray(formalArguments)) {
        formalArguments = Array.prototype.slice.call(arguments, 0);
    }
    return {
        nodeType: "formalArgumentList",
        formalArguments: formalArguments
    };
};

exports.formalArgument = function(name, type) {
    return {
        nodeType: "formalArgument",
        name: name,
        type: type
    };
};
