exports.boolean = function(value, source) {
    return node({
        nodeType: "boolean",
        value: value
    }, source);
};

exports.unit = function(source) {
    return node({
        nodeType: "unit"
    }, source);
};

exports.variableReference = exports.ref = function(identifier, source) {
    return node({
        nodeType: "variableReference",
        identifier: identifier
    }, source);
};

exports.lambda = function(formalArguments, returnType, body, source) {
    return node({
        nodeType: "lambda",
        formalArguments: formalArguments,
        returnType: returnType,
        body: body
    }, source);
};

exports.formalArguments = function(formalArguments, source) {
    return node({
        nodeType: "formalArgumentList",
        formalArguments: formalArguments
    }, source);
};

exports.formalArgument = function(name, type, source) {
    return node({
        nodeType: "formalArgument",
        name: name,
        type: type
    }, source);
};

exports.assign = function(variable, value, source) {
    return node({
        nodeType: "assignment",
        variable: variable,
        value: value
    }, source);
};

exports.return = function(value, source) {
    return node({
        nodeType: "return",
        value: value
    }, source);
};

exports.expressionStatement = function(expression, source) {
    return node({
        nodeType: "expressionStatement",
        expression: expression
    }, source);
};

exports.block = function(statements, source) {
    return node({
        nodeType: "block",
        statements: statements
    }, source);
};

var node = function(node, source) {
    node.language = "slab";
    if (source) {
        node.source = source;
    }
    return node;
};
