var util = require("util");

var _ = require("underscore");

var write = exports.write = function(javaScriptNode, indentationLevel) {
    indentationLevel = indentationLevel || 0;
    var nodeType = javaScriptNode.nodeType;
    if (nodeType in statementWriters) {
        return indentStatement(statementWriters[nodeType](javaScriptNode), indentationLevel);
    }
    if (nodeType in literals) {
        return indentExpression(literals[nodeType](javaScriptNode), indentationLevel);
    }
    if (nodeType in operators) {
        return indentExpression(writeOperation(javaScriptNode), indentationLevel);
    }
    if (nodeType in expressionWriters) {
        return indentExpression(expressionWriters[javaScriptNode.nodeType](javaScriptNode), indentationLevel);
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
        
        var caseStrings = jsIf.cases.map(function(jsCase) {
            var strings = {body: writeBlock(jsCase.body)};
            if (jsCase.condition) {
                strings.condition = write(jsCase.condition);
            }
            return strings;
        });
        
        var firstCase = _.head(caseStrings);
        var firstCaseString = util.format("if (%s) {\n%s\n}", firstCase.condition, firstCase.body);
        var elseIfCases = _.tail(caseStrings).filter(hasCondition);
        var elseIfString = elseIfCases.map(function(elseIf) {
            return util.format(" else if (%s) {\n%s\n}", elseIf.condition, elseIf.body);
        }).join("");
        var elseCase = _.head(caseStrings.filter(isElseCase));
        var elseString;
        if (elseCase) {
            elseString = util.format(" else {\n%s\n}", elseCase.body);
        } else {
            elseString = "";
        }
        return util.format("%s%s%s", firstCaseString, elseIfString, elseString);
    }
};

var literals = {
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
    object: function(jsObject) {
        var indentation = indentationAtLevel(1);
        var body = _.map(jsObject.properties, function(value, key) {
            return util.format('"%s": %s', key, write(value));
        }).join(",\n" + indentation);
        return util.format(
            "{\n%s%s\n}",
            indentation,
            body
        );
    },
    func: function(jsFunc) {
        var formalArgsString = jsFunc.args.join(", ");
        var bodyString = writeBlock(jsFunc.body);
        return util.format("function(%s) {\n%s\n}", formalArgsString, bodyString);
    }
};

var operators = {
    memberAccess: {
        precendence: 1,
        format: "(%s).%s",
        extract: function(node) {
            return [node.left, node.memberName];
        }
    },
    functionCall: {
        precendence: 2,
        format: "(%s)(%s)",
        extract: function(jsCall) {
            var argsString = jsCall.args.map(write).join(", ");
            return [jsCall.func, argsString];
        }
    },
    conditionalOperator: {
        precendence: 15,
        format: "(%s) ? (%s) : (%s)",
        extract: function(jsConditional) {
            return [
                jsConditional.condition,
                jsConditional.ifTrue,
                jsConditional.ifFalse
            ];
        }
    }
};

var writeOperation = function(node) {
    var operator = operators[node.nodeType];
    var subExpressions = operator.extract(node).map(function(subExpression) {
        return subExpression.nodeType ? write(subExpression) : subExpression;
    });
    var formatArgs = [operator.format].concat(subExpressions);
    return util.format.apply(null, formatArgs);
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
