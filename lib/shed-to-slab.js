var options = require("options");

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
    string: function(shedString) {
        return slab.string(shedString.value, shedString);
    },
    number: function(shedNumber) {
        return slab.number(shedNumber.value, shedNumber);
    },
    variableReference: function(ref) {
        return slab.ref(ref.identifier, ref);
    },
    functionCall: function(shedCall) {
        var slabFunction = translate(shedCall.func);
        var slabArgs = shedCall.args.map(translate);
        return slab.call(slabFunction, slabArgs, shedCall);
    },
    memberAccess: function(shedMemberAccess) {
        return slab.memberAccess(
            translate(shedMemberAccess.left),
            shedMemberAccess.memberName,
            shedMemberAccess
        );
    },
    lambda: function(lambda) {
        return slab.lambda(
            translate(lambda.formalArguments),
            lambda.returnType.map(translate),
            translate(lambda.body),
            lambda
        );
    },
    class: function(shedClass) {
        return slab.class(
            translate(shedClass.formalArguments),
            shedClass.body.map(translate),
            shedClass
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
    val: function(declaration) {
        return translateVariableDeclaration(declaration, slab.val);
    },
    var: function(declaration) {
        return translateVariableDeclaration(declaration, slab.var);
    },
    def: function(shedDef) {
        return slab.def(shedDef.identifier, translate(shedDef.value), shedDef);
    },
    ifExpression: function(shedIf) {
        var slabCases = shedIf.cases.map(function(shedCase) {
            var slabBody = translate(shedCase.body);
            if (shedCase.hasOwnProperty("condition")) {
                return {condition: translate(shedCase.condition), body: slabBody};
            } else {
                return {body: slabBody};
            }
        });
        return slab.if(slabCases, shedIf);
    },
    public: function(declaration) {
        return slab.public(translate(declaration.declaration), declaration);
    },
    block: function(block) {
        return slab.block(block.statements.map(translate), block);
    },
    import: function(statement) {
        return slab.call(
            slab.ref("$import", statement),
            [slab.string(statement.identifiers.join("."), statement)],
            statement
        );
    },
    module: function(shedModule) {
        var shedStatements = shedModule.imports.concat(shedModule.body);
        var slabStatements = shedStatements.map(translate);
        return slab.module(
            slabStatements,
            shedModule
        );
    }
};

var translateVariableDeclaration = function(declaration, constructor) {
    return constructor(
        declaration.identifier,
        declaration.type.map(translate),
        translate(declaration.value),
        declaration
    );
};
