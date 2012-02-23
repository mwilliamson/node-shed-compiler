var slab = require("./slab-nodes");

var translate = exports.translate = function(shedNode) {
    return translators[shedNode.nodeType](shedNode);
};

var translators = {
    boolean: function(boolean) {
        return slab.boolean(boolean.value, boolean);
    },
    unit: function(shedUnit) {
        return slab.unit(shedUnit);
    },
    variableReference: function(ref) {
        return slab.ref(ref.identifier, ref);
    },
    lambda: function(lambda) {
        var body = lambda.body.nodeType === "block"
            ? translate(lambda.body)
            : slab.block([slab.return(translate(lambda.body), lambda.body)], lambda.body);
            
        return slab.lambda(
            translate(lambda.formalArguments),
            translate(lambda.returnType),
            body,
            lambda
        );
    },
    formalArgument: function(formalArgument) {
        return slab.formalArgument(formalArgument.name, translate(formalArgument.type), formalArgument);
    },
    formalArgumentList: function(formalArguments) {
        return slab.formalArguments(formalArguments.formalArguments.map(translate), formalArguments);
    },
    assignment: function(assignment) {
        return slab.assign(translate(assignment.variable), translate(assignment.value), assignment);
    },
    return: function(node) {
        return slab.return(translate(node.value), node);
    },
    expressionStatement: function(statement) {
        return slab.expressionStatement(translate(statement.expression), statement);
    },
    block: function(block) {
        return slab.block(block.statements.map(translate), block);
    }
};
