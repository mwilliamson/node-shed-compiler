var js = require("../javascript/nodes");

var translate = exports.translate = function(slabNode) {
    return translators[slabNode.nodeType](slabNode);
};

var translators = {
    string: function(slabString) {
        return js.string(slabString.value, slabString);
    },
    number: function(slabNumber) {
        return js.number(slabNumber.value, slabNumber);
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
    block: function(slabBlock) {
        return slabBlock.statements.map(translate);
    },
    module: function(slabModule) {
        var jsFunc = js.func([], slabModule.body.map(translate), slabModule);
        return js.call(jsFunc, [], slabModule);
    }
};
