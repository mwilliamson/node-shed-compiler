var util = require("util");

var _ = require("underscore");

var write = exports.write = function(javaScriptNode) {
    var nodeType = javaScriptNode.nodeType;
    if (nodeType in statementWriters) {
        return statementWriters[nodeType](javaScriptNode);
    }
    if (nodeType in literals) {
        return literals[nodeType].write(javaScriptNode);
    }
    if (nodeType in operators) {
        return writeOperation(javaScriptNode);
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
        precedence: 0,
        write: function(jsBoolean) {
            return JSON.stringify(jsBoolean.value);
        }
    },
    string: {
        precedence: 0,
        write: function(jsString) {
            return JSON.stringify(jsString.value);
        }
    },
    number: {
        precedence: 0,
        write: function(jsNumber) {
            return jsNumber.value;
        }
    },
    variableReference: {
        precedence: 0,
        write: function(jsReference) {
            return jsReference.identifier;
        }
    },
    object: {
        precedence: 3,
        write: function(jsObject) {
            var indentation = indentationAtLevel(1);
            var body = _.map(jsObject.properties, function(value, key) {
                return indentBy(util.format('"%s": %s', key, write(value)), 1);
            }).join(",\n" + indentation);
            return util.format(
                "{\n%s%s\n}",
                indentation,
                body
            );
        }
    },
    func: {
        precedence: 3,
        write: function(jsFunc) {
            var formalArgsString = jsFunc.args.join(", ");
            var bodyString = writeBlock(jsFunc.body);
            return util.format("function(%s) {\n%s\n}", formalArgsString, bodyString);
        }
    }
};

var operators = {
    memberAccess: {
        precedence: 1,
        format: "%s.%s",
        extract: function(node) {
            return {left: node.left, right: node.memberName};
        },
        associativity: "left"
    },
    functionCall: callOperator(""),
    callNew: callOperator("new "),
    and: {
        precedence: 13,
        format: "%s && %s",
        extract: function(operator) {
            return {
                left: operator.left,
                right: operator.right
            };
        },
        associativity: "left"
    },
    conditionalOperator: {
        precedence: 15,
        format: "%s ? %s : %s",
        extract: function(jsConditional) {
            return {
                left: jsConditional.condition,
                middle: jsConditional.ifTrue,
                right: jsConditional.ifFalse
            };
        },
        associativity: "right"
    },
    assign: {
        precedence: 16,
        format: "%s = %s",
        extract: function(jsAssign) {
            return {
                left: jsAssign.variable,
                right: jsAssign.value
            };
        }
    }
};

function callOperator(prefix) {
    return {
        precedence: 1,
        format: prefix + "%s(%s)",
        extract: function(jsCall) {
            var argsString = jsCall.args.map(write).join(", ");
            return {left: jsCall.func, right: argsString};
        },
        associativity: "left"
    };
}

var writeOperation = function(node) {
    var operator = operators[node.nodeType];
    var subExpressions = operator.extract(node);
    var subExpressionStrings = ["left", "middle", "right"].map(function(position) {
        if (subExpressions[position] !== undefined) {
            return writeSubExpression(node, subExpressions[position], position);
        } else {
            return null;
        }
    }).filter(function(value) { return value !== null; });
    var formatArgs = [operator.format].concat(subExpressionStrings);
    return util.format.apply(null, formatArgs);
};

var writeSubExpression = function(expression, subExpression, position) {
    if (_.isString(subExpression)) {
        return subExpression;
    } else {
        return writeSubExpressionNode(expression, subExpression, position);
    }
};

var writeSubExpressionNode = function(expression, subExpression, position) {
    var unparenthesised = write(subExpression);
    var parenthesised = util.format("(%s)", unparenthesised);
    
    if (precedenceOf(subExpression) > precedenceOf(expression)) {
        return parenthesised;
    } else if (precedenceOf(subExpression) === precedenceOf(expression)) {
        // TODO: should check associativity agrees for expr and sub-expr
        // if not, default to parenthised
        if (operators[expression.nodeType].associativity === position) {
            return unparenthesised;
        } else {
            return parenthesised;
        }
    } else {
        return unparenthesised;
    }
};

var precedenceOf = function(node) {
    var nodeType = node.nodeType;
    if (nodeType in literals) {
        return literals[nodeType].precedence;
    } else if (nodeType in operators) {
        return operators[nodeType].precedence;
    } else {
        throw new Error("Could not precedence for nodeType: " + nodeType);
    }
};

var writeBlock = function(statements) {
    return statements.map(function(statement) {
        return indentStatement(write(statement), 1);
    }).join("\n")
};

var indentStatement = function(statementString, indentationLevel) {
    var indentation = indentationAtLevel(indentationLevel);
    return indentation + indentBy(statementString, indentationLevel);
};

var indentBy = function(str, indentationLevel) {
    var indentation = indentationAtLevel(indentationLevel);
    return str.replace(/\n/g, "\n" + indentation);
};

var indentationAtLevel = function(level) {
    return new Array((level * 4) + 1).join(" ");
};
