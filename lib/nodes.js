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

exports.list = function(values, source) {
    return node({
        nodeType: "list",
        values: values
    }, source);
};

exports.variableReference = exports.ref = function(identifier, source) {
    return node({
        nodeType: "variableReference",
        identifier: identifier
    }, source);
};

exports.lambda = function(formalTypeParameters, formalArguments, returnType, body, source) {
    return node({
        nodeType: "lambda",
        formalTypeParameters: formalTypeParameters,
        formalArguments: formalArguments,
        returnType: returnType,
        body: body
    }, source);
};

exports.class = function(formalArguments, body, source) {
    return node({
        nodeType: "class",
        formalArguments: formalArguments,
        body: body
    }, source);
};

exports.object = function(body, source) {
    return node({
        nodeType: "object",
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

exports.formalTypeParameters = function(formalTypeParameters, source) {
    return node({
        nodeType: "formalTypeParameters",
        formalTypeParameters: formalTypeParameters
    }, source);
};

exports.formalTypeParameter = function(name, source) {
    return node({
        nodeType: "formalTypeParameter",
        name: name
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

exports.typeApplication = function(func, parameters, source) {
    return node({
        nodeType: "typeApplication",
        func: func,
        parameters: parameters
    }, source);
};

exports.functionType = function(argumentTypes, returnType, source) {
    return node({
        nodeType: "functionType",
        argumentTypes: argumentTypes,
        returnType: returnType
    }, source);
};

exports.memberAccess = function(left, memberName, source) {
    return node({
        nodeType: "memberAccess",
        left: left,
        memberName: memberName
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

exports.packageDeclaration = function(identifiers, source) {
    return node({
        nodeType: "packageDeclaration",
        identifiers: identifiers
    }, source);
};

exports.import = function(identifiers, source) {
    return node({
        nodeType: "import",
        identifiers: identifiers
    }, source);
};

exports.module = function(packageDeclaration, imports, body, source) {
    return node({
        nodeType: "module",
        packageDeclaration: packageDeclaration,
        imports: imports,
        body: body
    }, source);
};


exports.isShedNode = function(value) {
    return value && value.language === "shed" && value.nodeType;
};

var node = function(node, source) {
    node.language = "shed";
    if (source) {
        node.source = source;
    }
    return node;
};
