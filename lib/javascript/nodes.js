var js = exports;

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

exports.assign = function(variable, value, source) {
    return node({
        nodeType: "assign",
        variable: variable,
        value: value
    }, source);
};

exports.call = function(func, args, source) {
    return node({
        nodeType: "functionCall",
        func: func,
        args: args
    }, source);
};

exports.callNew = function(func, args) {
    return node({
        nodeType: "callNew",
        func: func,
        args: args
    });
};

exports.memberAccess = function(left, memberName, source) {
    return node({
        nodeType: "memberAccess",
        left: left,
        memberName: memberName
    }, source);
};

exports.conditionalOperator = function(condition, ifTrue, ifFalse, source) {
    return node({
        nodeType: "conditionalOperator",
        condition: condition,
        ifTrue: ifTrue,
        ifFalse: ifFalse
    }, source);
};

exports.object = function(properties, source) {
    return node({
        nodeType: "object",
        properties: properties
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

exports.block = function(statements, source) {
    return js.call(js.func([], statements, source), [], source);
};

var node = function(node) {
    node.language = "javascript";
    return node;
};
