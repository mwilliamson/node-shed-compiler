var util = require("util");

var write = exports.write = function(javaScriptNode) {
    return writers[javaScriptNode.nodeType](javaScriptNode);
};

var writers = {
    string: function(jsString) {
        return JSON.stringify(jsString.value);
    },
    variableReference: function(jsReference) {
        return jsReference.identifier;
    },
    call: function(jsCall) {
        var funcString = write(jsCall.func);
        var argsString = jsCall.args.map(write).join(", ");
        return util.format("%s(%s)", funcString, argsString);
    },
    expressionStatement: function(jsExpressionStatement) {
        return write(jsExpressionStatement.expression) + ";";
    }
};
