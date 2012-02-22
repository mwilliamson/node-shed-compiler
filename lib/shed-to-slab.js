var slab = require("./slab-nodes");

var translate = exports.translate = function(shedNode) {
    return translators[shedNode.nodeType](shedNode);
};

var translators = {
    boolean: function(boolean) {
        return slab.boolean(boolean.value);
    },
    unit: function() {
        return slab.unit();
    },
    variableReference: function(ref) {
        return slab.ref(ref.identifier);
    },
    lambda: function(lambda) {
        var body = lambda.body.nodeType === "block"
            ? translate(lambda.body)
            : slab.block([slab.return(translate(lambda.body))]);
            
        return slab.lambda(
            translate(lambda.formalArguments),
            translate(lambda.returnType),
            body
        );
    },
    formalArgument: function(formalArgument) {
        return slab.formalArgument(formalArgument.name, translate(formalArgument.type));
    },
    formalArgumentList: function(formalArguments) {
        return slab.formalArguments(formalArguments.formalArguments.map(translate));
    },
    return: function(node) {
        return slab.return(translate(node.value));
    },
    block: function(block) {
        return slab.block(block.statements.map(translate));
    }
};
