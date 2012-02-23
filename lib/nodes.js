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

exports.val = function(identifier, type, value) {
    return node({
        nodeType: "val",
        identifier: identifier,
        type: type,
        value: value
    });
};

exports.var = function(identifier, type, value) {
    return node({
        nodeType: "var",
        identifier: identifier,
        type: type,
        value: value
    });
};

exports.public = function(declaration) {
    return node({
        nodeType: "public",
        declaration: declaration
    });
};

exports.block = function(statements) {
    return node({
        nodeType: "block",
        statements: statements
    });
};

exports.packageDeclaration = function(identifiers) {
    return node({
        nodeType: "packageDeclaration",
        identifiers: identifiers
    });
};

exports.import = function(identifiers) {
    return node({
        nodeType: "import",
        identifiers: identifiers
    });
};

exports.module = function(packageDeclaration, imports, body) {
    return node({
        nodeType: "module",
        packageDeclaration: packageDeclaration,
        imports: imports,
        body: body
    });
};


exports.isShedNode = function(value) {
    return value && value.language === "shed" && value.nodeType;
};

var node = function(node) {
    node.language = "shed";
    return node;
};
