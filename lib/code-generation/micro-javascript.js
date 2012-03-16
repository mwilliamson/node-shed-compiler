var _ = require("underscore");

var js = require("../javascript/nodes");

var translate = exports.translate = function(slabNode) {
    return translators[slabNode.nodeType](slabNode);
};

var translators = {
    boolean: function(slabBoolean) {
        return js.boolean(slabBoolean.value, slabBoolean);
    },
    string: function(slabString) {
        return js.call(
            js.ref("$shed.string", slabString),
            [js.string(slabString.value, slabString)],
            slabString
        );
    },
    number: function(slabNumber) {
        return js.call(
            js.ref("$shed.number", slabNumber),
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
            [js.return(translate(slabLambda.body), slabLambda)],
            slabLambda
        );
    },
    class: function(slabClass) {
        var isPublic = function(slabNode) {
            return slabNode.nodeType === "public";
        };
        var slabPublics = slabClass.body.filter(isPublic);
        var jsPublicObject = {};
        slabPublics.forEach(function(slabPublic) {
            var declaration = slabPublic.declaration;
            jsPublicObject[declaration.identifier] = js.ref(declaration.identifier, slabPublic);
        });
        var jsReturnObject = js.return(js.object(jsPublicObject, slabClass), slabClass);
        return js.func(
            translate(slabClass.formalArguments),
            slabClass.body.map(translate).concat([jsReturnObject]),
            slabClass
        );
    },
    public: function(slabPublicDeclaration) {
        return translate(slabPublicDeclaration.declaration);
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
    ifExpression: function(slabIf) {
        var translateCases = function(cases) {
            var firstCase = _.head(cases);
            if (cases.length === 1) {
                return js.conditionalOperator(
                    translate(firstCase.condition),
                    js.call(js.ref("$some", slabIf), [translate(firstCase.body)], slabIf),
                    js.ref("$none", slabIf),
                    slabIf
                );
            } else {
                return js.conditionalOperator(
                    translate(firstCase.condition),
                    translate(firstCase.body),
                    cases.length <= 2 ? translate(cases[1].body) : translateCases(_.tail(cases)),
                    slabIf
                );
            }
        };
        return translateCases(slabIf.cases);
    },
    block: function(slabBlock) {
        return js.call(
            js.func([], slabBlock.statements.map(translate), slabBlock),
            [],
            slabBlock
        );
    },
    module: function(slabModule) {
        var slabPublic = slabModule.body.filter(hasProperty("nodeType", "public"))[0];
        var exports;
        if (slabPublic) {
            var identifier = slabPublic.declaration.identifier;
            var moduleName = (slabModule.package.concat([identifier])).join(".");
            var jsExportArgs = [
                js.string(moduleName, slabPublic),
                js.ref(identifier, slabPublic)
            ];
            exports = [js.expressionStatement(js.call(js.ref("$shed.exportModule", slabPublic), jsExportArgs, slabPublic), slabPublic)];
        } else {
            exports = [];
        }
        var jsBody = slabModule.body.map(translate).concat(exports);
        var jsFunc = js.func([], jsBody, slabModule);
        return js.call(jsFunc, [], slabModule);
    }
};

var hasProperty = function(key, value) {
    return function(obj) {
        return obj[key] === value;
    };
};
