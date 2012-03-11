var util = require("util");

var _ = require("underscore");

var write = exports.write = function(javaScriptNode, indentationLevel) {
    indentationLevel = indentationLevel || 0;
    var nodeType = javaScriptNode.nodeType;
    if (nodeType in statementWriters) {
        return indentStatement(statementWriters[nodeType](javaScriptNode), indentationLevel);
    }
    if (nodeType in expressionWriters) {
        return indentExpression(expressionWriters[nodeType](javaScriptNode), indentationLevel);
    }
    throw new Error("No writer for nodeType: " + nodeType);
};

var statementWriters = {
    return: function(jsReturn) {
        return util.format("return %s;", write(jsReturn.value));
    },
    expressionStatement: function(jsExpressionStatement) {
        return write(jsExpressionStatement.expression) + ";";
    },
    var: function(jsVar) {
        return util.format("var %s = %s;", jsVar.identifier, write(jsVar.value));
    },
    ifStatement: function(jsIf) {
        var hasCondition = function(jsCase) {
            return jsCase.condition;
        };
        var isElseCase = function(jsCase) {
            return !jsCase.condition;
        };
        
        var jsCases = jsIf.cases;
        var firstCase = _.head(jsCases);
        var firstCaseString = util.format("if (%s) {\n%s\n}", write(firstCase.condition), writeBlock(firstCase.body));
        var elseIfCases = _.tail(jsCases).filter(hasCondition);
        var elseIfString = elseIfCases.map(function(elseIf) {
            return util.format(" else if (%s) {\n%s\n}", write(elseIf.condition), writeBlock(elseIf.body));
        }).join("");
        var elseCase = _.head(jsCases.filter(isElseCase));
        var elseString;
        if (elseCase) {
            elseString = util.format(" else {\n%s\n}", writeBlock(elseCase.body));
        } else {
            elseString = "";
        }
        return util.format("%s%s%s", firstCaseString, elseIfString, elseString);
    }
};

var expressionWriters = {
    boolean: function(jsBoolean) {
        return JSON.stringify(jsBoolean.value);
    },
    string: function(jsString) {
        return JSON.stringify(jsString.value);
    },
    number: function(jsNumber) {
        return jsNumber.value;
    },
    variableReference: function(jsReference) {
        return jsReference.identifier;
    },
    functionCall: function(jsCall) {
        var funcString = write(jsCall.func);
        var argsString = jsCall.args.map(write).join(", ");
        return util.format("(%s)(%s)", funcString, argsString);
    },
    func: function(jsFunc) {
        var formalArgsString = jsFunc.args.join(", ");
        var bodyString = writeBlock(jsFunc.body);
        return util.format("function(%s) {\n%s\n}", formalArgsString, bodyString);
    }
};

var writeBlock = function(statements) {
    return statements.map(function(statement) {
            return write(statement, 1);
    }).join("\n")
};

var indentStatement = function(statementString, indentationLevel) {
    var indentation = indentationAtLevel(indentationLevel);
    return indentation + statementString.replace(/\n/g, "\n" + indentation);
};

var indentExpression = function(expressionString, indentationLevel) {
    var indentation = indentationAtLevel(indentationLevel);
    return expressionString.replace(/\n/g, "\n" + indentation);
};

var indentationAtLevel = function(level) {
    return new Array((level * 4) + 1).join(" ");
};
