var options = require("option");

var slab = require("./slab-nodes");

var translate = exports.translate = function(shedNode) {
    if (Object.prototype.hasOwnProperty.call(translators, shedNode.nodeType)) {
        return translators[shedNode.nodeType](shedNode);
    } else {
        throw new Error("Could not find translator for nodeType: " + shedNode.nodeType);
    }
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
    list: function(shedList) {
        return slab.call(
            slab.ref("$lists.create", shedList),
            shedList.values.map(translate),
            shedList
        );
    },
    variableReference: function(ref) {
        return slab.ref(ref.identifier, ref);
    },
    functionCall: function(shedCall) {
        var slabFunction = translate(shedCall.func);
        var slabArgs = shedCall.args.map(translate);
        return slab.call(slabFunction, slabArgs, shedCall);
    },
    typeApplication: function(shedTypeApplication) {
        return translate(shedTypeApplication.func);
    },
    functionType: function(shedFunctionType) {
        return slab.ref("$Function", shedFunctionType);
    },
    memberAccess: function(shedMemberAccess) {
        return slab.memberAccess(
            translate(shedMemberAccess.left),
            shedMemberAccess.memberName,
            shedMemberAccess
        );
    },
    lambda: function(shedLambda) {
        return slab.lambda(
            translate(shedLambda.formalArguments),
            shedLambda.returnType.map(translate),
            translate(shedLambda.body),
            shedLambda
        );
    },
    class: function(shedClass) {
        return slab.class(
            translate(shedClass.formalArguments),
            translateMembers(shedClass),
            shedClass.body.map(translate),
            shedClass
        );
    },
    object: function(shedObject) {
        var classIdentifier = "$classForObject";
        var slabBody = shedObject.body.map(translate);
        var slabClass = slab.class(slab.formalArguments([], shedObject), translateMembers(shedObject), slabBody, shedObject);
        var slabClassDeclaration = slab.val(classIdentifier, options.none, slabClass, shedObject);
        var slabReturn = slab.return(slab.call(slab.ref(classIdentifier, shedObject), [], shedObject), shedObject);
        return slab.block([slabClassDeclaration, slabReturn], shedObject);
    },
    formalArgument: function(formalArgument) {
        return slab.formalArgument(formalArgument.name, translate(formalArgument.type), formalArgument);
    },
    formalArgumentList: function(formalArguments) {
        return slab.formalArguments(formalArguments.formalArguments.map(translate), formalArguments);
    },
    formalTypeParameter: function(shedFormalTypeParameter) {
        return slab.formalArgument(shedFormalTypeParameter.name, slab.ref("$Type", shedFormalTypeParameter), shedFormalTypeParameter);
    },
    formalTypeParameters: function(shedFormalTypeParameters) {
        return slab.formalArguments(shedFormalTypeParameters.formalTypeParameters.map(translate), shedFormalTypeParameters);
    },
    memberDeclaration: function(shedMemberDeclaration) {
        return slab.memberDeclaration(shedMemberDeclaration.name, translate(shedMemberDeclaration.value), shedMemberDeclaration);
    },
    assignment: function(assignment) {
        return slab.assign(translate(assignment.variable), translate(assignment.value), assignment);
    },
    and: function(andOperator) {
        return slab.operatorAnd(
            translate(andOperator.left),
            translate(andOperator.right),
            andOperator
        );
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
    letIn: function(letIn) {
        var statements = letIn.declarations.map(translate);
        statements.push(slab.return(translate(letIn.expression), letIn));
        return slab.block(statements, letIn);
    },
    import: function(statement) {
        return slab.val(
            statement.identifiers[statement.identifiers.length - 1],
            options.none,
            slab.call(
                slab.ref("$import", statement),
                [slab.string(statement.identifiers.join("."), statement)],
                statement
            ),
            statement
        );
    },
    module: function(shedModule) {
        var shedStatements = shedModule.imports.concat(shedModule.body);
        var slabStatements = shedStatements.map(translate);
        var slabMembers = shedModule.members.map(translate);
        return slab.module(
            shedModule.moduleName.valueOrElse([]),
            slabMembers,
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

var translateMembers = function(node) {
    var isPublic = function(node) {
        return node.nodeType === "public";
    };
    var publicDeclarationToMember = function(public) {
        var name = public.declaration.identifier;
        return slab.memberDeclaration(name, slab.ref(name, public), public);
    };
    
    var publicDeclarations = node.body.filter(isPublic);
    var membersFromPublic = publicDeclarations.map(publicDeclarationToMember);
    
    return node.members.map(translate).concat(membersFromPublic);
};
