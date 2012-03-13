var util = require("util");

var _ = require("underscore");

var write = exports.write = function(javaScriptNode, indentationLevel) {
    indentationLevel = indentationLevel || 0;
    var nodeType = javaScriptNode.nodeType;
    if (nodeType in statementWriters) {
        return indentStatement(statementWriters[nodeType](javaScriptNode), indentationLevel);
    }
    if (nodeType in literals) {
        return indentExpression(literals[nodeType].write(javaScriptNode), indentationLevel);
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
    boolean: {
        precendence: 0,
        write: function(jsBoolean) {
            return JSON.stringify(jsBoolean.value);
        }
    },
    string: {
        precendence: 0,
        write: function(jsString) {
            return JSON.stringify(jsString.value);
        }
    },
    number: {
        precendence: 0,
        write: function(jsNumber) {
            return jsNumber.value;
        }
    },
    variableReference: {
        precendence: 0,
        write: function(jsReference) {
            return jsReference.identifier;
        }
    },
    object: {
        precendence: 3,
        write: function(jsObject) {
            var indentation = indentationAtLevel(1);
            var body = _.map(jsObject.properties, function(value, key) {
                return util.format('"%s": %s', key, write(value));
            }).join(",\n" + indentation);
            return util.format(
                "{\n%s%s\n}",
                indentation,
                body
            );
        }
    },
    func: {
        precendence: 3,
        write: function(jsFunc) {
            var formalArgsString = jsFunc.args.join(", ");
            var bodyString = writeBlock(jsFunc.body);
            return util.format("function(%s) {\n%s\n}", formalArgsString, bodyString);
        }
    }
};

var operators = {
    memberAccess: {
        precendence: 1,
        format: "%s.%s",
        extract: function(node) {
            return [node.left, node.memberName];
        }
    },
    functionCall: {
        precendence: 2,
        format: "%s(%s)",
        extract: function(jsCall) {
            var argsString = jsCall.args.map(write).join(", ");
            return [jsCall.func, argsString];
        }
    },
    conditionalOperator: {
        precendence: 15,
        format: "%s ? %s : %s",
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
    var subExpressions = operator.extract(node).map(writeSubExpression.bind(null, node));
    var formatArgs = [operator.format].concat(subExpressions);
    return util.format.apply(null, formatArgs);
};

var writeSubExpression = function(expression, subExpression) {
    if (_.isString(subExpression)) {
        return subExpression;
    } else {
        return writeSubExpressionNode(expression, subExpression);
    }
};

var writeSubExpressionNode = function(expression, subExpression) {
    var subExpressionString = write(subExpression);
    if (precendenceOf(subExpression) > precendenceOf(expression)) {
        return util.format("(%s)", subExpressionString);
    } else {
        return subExpressionString;
    }
};

var precendenceOf = function(node) {
    var nodeType = node.nodeType;
    if (nodeType in literals) {
        return literals[nodeType].precendence;
    } else if (nodeType in operators) {
        return operators[nodeType].precendence;
    } else {
        throw new Error("Could not precendence for nodeType: " + nodeType);
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
