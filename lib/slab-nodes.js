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

exports.class = function(formalArguments, members, body, source) {
    return node({
        nodeType: "class",
        formalArguments: formalArguments,
        members: members,
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

exports.memberDeclaration = function(name, value, source) {
    return node({
        nodeType: "memberDeclaration",
        name: name,
        value: value
    }, source);
};

exports.assign = function(variable, value, source) {
    return node({
        nodeType: "assignment",
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

exports.memberAccess = function(left, memberName, source) {
    return node({
        nodeType: "memberAccess",
        left: left,
        memberName: memberName
    }, source);
};

exports.operatorAnd = function(left, right, source) {
    return node({
        nodeType: "and",
        left: left,
        right: right
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

exports.val = function(identifier, type, value, source) {
    return node({
        nodeType: "val",
        identifier: identifier,
        type: type,
        value: value
    }, source);
};

exports.var = function(identifier, type, value, source) {
    return node({
        nodeType: "var",
        identifier: identifier,
        type: type,
        value: value
    }, source);
};

exports.def = function(identifier, value, source) {
    return node({
        nodeType: "def",
        identifier: identifier,
        value: value
    }, source);
};

exports.if = function(cases, source) {
    return node({
        nodeType: "ifExpression",
        cases: cases
    }, source);
};

exports.public = function(declaration, source) {
    return node({
        nodeType: "public",
        declaration: declaration
    }, source);
};

exports.block = function(statements, source) {
    return node({
        nodeType: "block",
        statements: statements
    }, source);
};

exports.module = function(names, members, body, source) {
    return node({
        names: names,
        members: members,
        nodeType: "module",
        body: body
    }, source);
};

var node = function(node, source) {
    node.language = "slab";
    if (source) {
        node.source = source;
    }
    return node;
};

exports.node = function(options, source) {
    var slabNode = _.clone(options);
    return node(slabNode, source);
};
