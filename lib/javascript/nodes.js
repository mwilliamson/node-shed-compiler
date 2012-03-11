exports.boolean = function(value, source) {
    return node({
        nodeType: "boolean",
        value: value
    }, source);
};

exports.string = function(value, source) {
    return node({
        nodeType: "string",
        value: value
    }, source);
};

exports.number = function(value, source) {
    return node({
        nodeType: "number",
        value: value
    }, source);
};

exports.func = function(args, body, source) {
    return node({
        nodeType: "func",
        args: args,
        body: body
    }, source);
};

exports.ref = function(identifier, source) {
    return node({
        nodeType: "variableReference",
        identifier: identifier
    }, source);
};

exports.call = function(func, args, source) {
    return node({
        nodeType: "functionCall",
        func: func,
        args: args
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

exports.var = function(identifier, value, source) {
    return node({
        nodeType: "var",
        identifier: identifier,
        value: value,
    }, source);
};

exports.if = function(cases, source) {
    return node({
        nodeType: "ifStatement",
        cases: cases
    }, source);
};

var node = function(node, source) {
    node.language = "javascript";
    if (source) {
        node.source = source;
    }
    return node;
};
