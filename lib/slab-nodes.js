exports.boolean = function(value) {
    return node({
        nodeType: "boolean",
        value: value
    });
};

exports.unit = function() {
    return node({
        nodeType: "unit"
    });
};

exports.variableReference = exports.ref = function(identifier) {
    return node({
        nodeType: "variableReference",
        identifier: identifier
    });
};

exports.lambda = function(formalArguments, returnType, body) {
    return node({
        nodeType: "lambda",
        formalArguments: formalArguments,
        returnType: returnType,
        body: body
    });
};

exports.formalArguments = function(formalArguments) {
    return node({
        nodeType: "formalArgumentList",
        formalArguments: formalArguments
    });
};

exports.formalArgument = function(name, type) {
    return node({
        nodeType: "formalArgument",
        name: name,
        type: type
    });
};

exports.assign = function(variable, value) {
    return node({
        nodeType: "assignment",
        variable: variable,
        value: value
    });
};

exports.return = function(value) {
    return node({
        nodeType: "return",
        value: value
    });
};

exports.expressionStatement = function(expression) {
    return node({
        nodeType: "expressionStatement",
        expression: expression
    });
};

exports.block = function(statements) {
    return node({
        nodeType: "block",
        statements: statements
    });
};

var node = function(node) {
    node.language = "slab";
    return node;
};
