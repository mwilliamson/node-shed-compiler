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
    },
    func: function(jsFunc) {
        var formalArgsString = jsFunc.args.join(", ");
        var bodyString = jsFunc.body.map(write).join("\n    ");
        return util.format("function(%s) {\n    %s\n}", formalArgsString, bodyString);
    }
};
