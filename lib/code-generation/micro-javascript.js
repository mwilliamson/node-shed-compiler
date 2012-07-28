var _ = require("underscore");
var options = require("options");

var js = require("../javascript/nodes");

exports.translate = function(slabNode) {
    var translator = new Translator(translate);
    
    function translate(slabNode, nameMap) {
        return translator.translate(slabNode, nameMap);
    }
    
    return translate(slabNode, {});
};

// TODO: remove name from nameMap when it's shadowed

var Translator = exports.Translator = function(translateSubNode) {
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
        unit: function(slabUnit) {
            return js.ref("$shed.unit", slabUnit);
        },
        variableReference: translateVariableReference,
        lambda: translateLambda,
        class: translateClass,
        public: translatePublic,
        formalArgumentList: translateFormalArgumentList,
        formalArgument: translateFormalArgument,
        functionCall: translateFunctionCall,
        memberAccess: translateMemberAccess,
        return: translateReturn,
        expressionStatement: translateExpressionStatement,
        val: translateVal,
        def: translateDef,
        ifExpression: translateIfExpression,
        block: translateBlock,
        module: translateModule
    };
    function translate(slabNode, nameMap) {
        return translators[slabNode.nodeType](slabNode, function(slabNode, nameMapExtensions) {
            var extendedMap = _.clone(nameMap);
            _.extend(extendedMap, nameMapExtensions || {});
            return translateSubNode(slabNode, extendedMap);
        }, nameMap);
    }
    return {
        translate: function(slabNode, nameMap) {
            return translate(slabNode, nameMap || {});
        }
    };
};

function translateVariableReference(slabReference, translateSubNode, nameMap) {
    if (slabReference.identifier in nameMap) {
        return nameMap[slabReference.identifier];
    } else {
        return js.ref(slabReference.identifier, slabReference);
    }
}

function translateLambda(slabLambda, translateSubNode) {
    return js.call(
        js.ref("$shed.function", slabLambda),
        [
            js.func(
                translateSubNode(slabLambda.formalArguments),
                [js.return(translateSubNode(slabLambda.body), slabLambda)],
                slabLambda
            )
        ],
        slabLambda
    );
}

function translateClass(slabClass, translate) {
    function memberIsLambda(member) {
        return member.value.nodeType === "lambda";
    }
    
    if (slabClass.body.length === 0 && slabClass.members.every(memberIsLambda)) {
        return translateClassPrototypeStyle(slabClass, translate);
    } else {
        return translateClassClosureStyle(slabClass, translate);
    }
}

function translateClassPrototypeStyle(slabClass, translate) {
    // TODO: fix "this" binding when this is rebound in method bodies
    // TODO: set $usesThis
    var formalArgs = slabClass.formalArguments.formalArguments.map(function(arg) {
        return arg.name;
    });
    
    var thisMember = function(arg) {
        return js.memberAccess(js.ref("this"), "$member$" + arg);
    };
    
    var constructorAssignments = formalArgs.map(function(arg) {
        return js.expressionStatement(js.assign(thisMember(arg), js.ref(arg)));
    });
    
    var nameMap = {};
    formalArgs.forEach(function(arg) {
        nameMap[arg] = thisMember(arg);
    });
    
    var prototypeAssignments = slabClass.members.map(function(member) {
        var jsMemberRef = js.ref("$constructor.prototype." + member.name);
        return js.expressionStatement(js.assign(jsMemberRef, translate(member.value, nameMap)));
    });
    
    return js.block(_.flatten([
        [
            js.var("$constructor", js.func(
                formalArgs,
                constructorAssignments
            ))
        ],
        prototypeAssignments,
        [
            js.var("$class", js.call(
                js.ref("$shed.class"),
                [js.func(
                    formalArgs,
                    [js.return(js.callNew(js.ref("$constructor"), formalArgs.map(js.ref)))]
                )]
            )),
            js.expressionStatement(js.assign(js.ref("$constructor.prototype.$class"), js.ref("$class"))),
            js.return(js.ref("$class"))
        ]
    ]));
}

function translateClassClosureStyle(slabClass, translate) {
    var jsPublicObject = {};
    slabClass.members.forEach(function(member) {
        jsPublicObject[member.name] = translate(member.value);
    });
    jsPublicObject["$class"] = js.ref("$class");
    var jsReturnObject = js.return(js.object(jsPublicObject, slabClass), slabClass);
    return js.block([
        js.var("$class", js.call(
            js.ref("$shed.class"),
            [js.func(
                translate(slabClass.formalArguments),
                slabClass.body.map(translate).concat([jsReturnObject]),
                slabClass
            )],
            slabClass
        )),
        js.return(js.ref("$class"))
    ]);
}

function translatePublic(slabPublicDeclaration, translateSubNode) {
    return translateSubNode(slabPublicDeclaration.declaration);
}

function translateFormalArgumentList(slabFormalArguments, translateSubNode) {
    return slabFormalArguments.formalArguments.map(translateSubNode);
}

function translateFormalArgument(formalArgument) {
    return formalArgument.name;
}

function translateFunctionCall(slabCall, translateSubNode) {
    var jsFunc;
    if (slabCall.func.nodeType === "memberAccess") {
        jsFunc = js.memberAccess(
            translateSubNode(slabCall.func.left),
            slabCall.func.memberName
        );
    } else {
        jsFunc = translateSubNode(slabCall.func);
    }
    var jsArgs = slabCall.args.map(translateSubNode);
    return js.call(jsFunc, jsArgs, slabCall);
}

function translateMemberAccess(slabMemberAccess, translateSubNode) {
    return js.call(
        js.ref("$shed.memberAccess"),
        [
            translateSubNode(slabMemberAccess.left),
            js.memberAccess(
                translateSubNode(slabMemberAccess.left),
                slabMemberAccess.memberName
            )
        ]
    );
}

function translateReturn(slabReturn, translateSubNode) {
    return js.return(translateSubNode(slabReturn.value), slabReturn);
}

function translateExpressionStatement(slabExpressionStatement, translateSubNode) {
    var jsExpression = translateSubNode(slabExpressionStatement.expression);
    return js.expressionStatement(jsExpression, slabExpressionStatement);
}

function translateVal(slabVal, translateSubNode) {
    return js.var(slabVal.identifier, translateSubNode(slabVal.value), slabVal);
}

function translateDef(slabDef, translateSubNode) {
    return js.var(
        slabDef.identifier,
        js.call(
            js.memberAccess(
                translateSubNode(slabDef.value),
                "$define",
                slabDef
            ),
            [js.string(slabDef.identifier, slabDef)]
        ),
        slabDef
    );
}

function translateIfExpression(slabIf, translateSubNode) {
    var translateCases = function(cases) {
        var firstCase = _.head(cases);
        if (cases.length === 1) {
            return js.conditionalOperator(
                translateSubNode(firstCase.condition),
                js.call(js.ref("$some", slabIf), [translateSubNode(firstCase.body)], slabIf),
                js.ref("$none", slabIf),
                slabIf
            );
        } else {
            return js.conditionalOperator(
                translateSubNode(firstCase.condition),
                translateSubNode(firstCase.body),
                cases.length <= 2 ? translateSubNode(cases[1].body) : translateCases(_.tail(cases)),
                slabIf
            );
        }
    };
    return translateCases(slabIf.cases);
}

function translateBlock(slabBlock, translateSubNode) {
    return js.call(
        js.func([], slabBlock.statements.map(translateSubNode), slabBlock),
        [],
        slabBlock
    );
}

function translateModule(slabModule, translateSubNode) {
    var jsBody = slabModule.body.map(translateSubNode);
    
    var names = slabModule.names;
    if (names.length === 0) {
        var jsFunc = js.func([], jsBody, slabModule);
        return js.call(jsFunc, [], slabModule);
    } else {
        var name = names.join(".");
        var jsMembers = {};
        slabModule.members.forEach(function(member) {
            jsMembers[member.name] = translateSubNode(member.value);
        });
        var jsReturn = js.return(js.object(jsMembers, slabModule), slabModule);
        var jsExportArgs = [
            js.string(name, slabModule),
            js.func(
                [],
                jsBody.concat(jsReturn),
                slabModule
            )
        ];
        return js.expressionStatement(js.call(js.ref("$shed.exportModule", slabModule), jsExportArgs, slabModule), slabModule);
    }
}

var hasProperty = function(key, value) {
    return function(obj) {
        return obj[key] === value;
    };
};
