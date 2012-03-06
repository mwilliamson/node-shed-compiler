var util = require("util");

var write = exports.write = function(javaScriptNode, indentationLevel) {
    indentationLevel = indentationLevel || 0;
    var nodeType = javaScriptNode.nodeType;
    if (nodeType in statementWriters) {
        return indentStatement(statementWriters[nodeType](javaScriptNode), indentationLevel);
    }
    if (nodeType in expressionWriters) {
        return indentExpression(expressionWriters[nodeType](javaScriptNode), indentationLevel);
    }
    
};

var statementWriters = {
    expressionStatement: function(jsExpressionStatement) {
        return write(jsExpressionStatement.expression) + ";";
    }
};

var expressionWriters = {
    string: function(jsString) {
        return JSON.stringify(jsString.value);
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
        var bodyString = jsFunc.body.map(function(statement) {
            return write(statement, 1);
        }).join("\n");
        return util.format("function(%s) {\n%s\n}", formalArgsString, bodyString);
    }
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
