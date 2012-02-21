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

exports.lambda = function(formalArguments, returnType, body) {
    if (Array.isArray(formalArguments)) {
        formalArguments = exports.formalArguments(formalArguments);
    }
    return {
        nodeType: "lambda",
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

exports.assign = function(variable, value) {
    return {
        nodeType: "assignment",
        variable: variable,
        value: value
    };
};

exports.return = function(value) {
    return {
        nodeType: "return",
        value: value
    };
};

exports.expressionStatement = function(expression) {
    return {
        nodeType: "expressionStatement",
        expression: expression
    };
};

exports.block = function(statements) {
    return {
        nodeType: "block",
        statements: statements
    };
};
