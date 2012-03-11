var js = require("../javascript/nodes");

var translate = exports.translate = function(slabNode) {
    return translators[slabNode.nodeType](slabNode);
};

var translators = {
    boolean: function(slabBoolean) {
        return js.boolean(slabBoolean.value, slabBoolean);
    },
    string: function(slabString) {
        return js.string(slabString.value, slabString);
    },
    number: function(slabNumber) {
        return js.call(
            js.ref("$number", slabNumber),
            [js.number(slabNumber.value, slabNumber)],
            slabNumber
        );
    },
    variableReference: function(slabReference) {
        return js.ref(slabReference.identifier, slabReference);
    },
    lambda: function(slabLambda) {
        return js.func(
            translate(slabLambda.formalArguments),
            translate(slabLambda.body),
            slabLambda
        );
    },
    formalArgumentList: function(slabFormalArguments) {
        return slabFormalArguments.formalArguments.map(translate);
    },
    formalArgument: function(formalArgument) {
        return formalArgument.name;
    },
    functionCall: function(slabCall) {
        var jsFunc = translate(slabCall.func);
        var jsArgs = slabCall.args.map(translate);
        return js.call(jsFunc, jsArgs, slabCall);
    },
    memberAccess: function(slabMemberAccess) {
        return js.memberAccess(
            translate(slabMemberAccess.left),
            slabMemberAccess.memberName,
            slabMemberAccess
        );
    },
    return: function(slabReturn) {
        return js.return(translate(slabReturn.value), slabReturn);
    },
    expressionStatement: function(slabExpressionStatement) {
        var jsExpression = translate(slabExpressionStatement.expression);
        return js.expressionStatement(jsExpression, slabExpressionStatement);
    },
    val: function(slabVal) {
        return js.var(slabVal.identifier, translate(slabVal.value), slabVal);
    },
    def: function(slabDef) {
        return js.var(slabDef.identifier, translate(slabDef.value), slabDef);
    },
    ifStatement: function(slabIf) {
        var translateCase = function(slabCase) {
            var jsBody = translate(slabCase.body);
            if (slabCase.hasOwnProperty("condition")) {
                return {condition: translate(slabCase.condition), body: jsBody};
            } else {
                return {body: jsBody};
            }
        };
        return js.if(slabIf.cases.map(translateCase), slabIf);
    },
    block: function(slabBlock) {
        return slabBlock.statements.map(translate);
    },
    module: function(slabModule) {
        var jsFunc = js.func([], slabModule.body.map(translate), slabModule);
        return js.call(jsFunc, [], slabModule);
    }
};
