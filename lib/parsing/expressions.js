var lop = require("lop");
var rules = lop.rules;
var firstOf = rules.firstOf;
var keyword = rules.keyword;
var symbol = rules.symbol;
var identifier = rules.identifier;
var sequence = rules.sequence;
var capture = sequence.capture;
var optional = rules.optional;
var then = rules.then;
var zeroOrMore = rules.zeroOrMore;
var zeroOrMoreWithSeparator = rules.zeroOrMoreWithSeparator;
var oneOrMoreWithSeparator = rules.oneOrMoreWithSeparator;
var leftAssociative = rules.leftAssociative;

var functionUtils = require("../function-utils");
var nodes = require("../nodes");
var options = require("options");

var statements = require("./statements");
var statementRules = statements;

var lazyRule = require("./util").lazyRule;
var applySequenceValuesToNode = require("./util").applySequenceValuesToNode;

var trueLiteralRule = then(
    keyword("true"),
    function(value, source) {
        return nodes.boolean(true, source);
    }
);

var falseLiteralRule = then(
    keyword("false"),
    function(value, source) {
        return nodes.boolean(false, source);
    }
);

var booleanRule = firstOf(
    "Boolean",
    trueLiteralRule,
    falseLiteralRule
);

var unitRule = then(
    sequence(
        symbol("("),
        symbol(")")
    ),
    function(value, source) {
        return nodes.unit(source);
    }
);

var stringRule = then(
    rules.string(),
    nodes.string
);

var numberRule = then(
    rules.number(),
    nodes.number
);

var listRule = lazyRule(function() {
    var values = sequence.capture(zeroOrMoreWithSeparator(expressionRule, symbol(",")), "values");
    return then(
        sequence(symbol("["), sequence.cut(), values, symbol("]")),
        applySequenceValuesToNode(nodes.list, values)
    );
});

var literalRule = firstOf(
    "literal",
    booleanRule,
    unitRule,
    stringRule,
    numberRule
    //~ listRule
);

var variableReferenceRule = then(
    rules.identifier(),
    nodes.variableReference
);

var typeApplicationRule = lazyRule(function() {
    var func = sequence.capture(variableReferenceRule, "func");
    var args = sequence.capture(oneOrMoreWithSeparator(typeExpressionRule, symbol(",")), "args");
    return then(
        sequence(func, symbol("["), sequence.cut(), args, symbol("]")),
        applySequenceValuesToNode(nodes.typeApplication, func, args)
    );
});

var functionTypeRule = lazyRule(function() {
    var argumentTypes = sequence.capture(zeroOrMoreWithSeparator(typeExpressionRule, symbol(",")), "argumentTypes");
    var returnType = sequence.capture(typeExpressionRule, "returnType");
    return then(
        sequence(symbol("("), argumentTypes, symbol(")"), symbol("->"), sequence.cut(), returnType),
        applySequenceValuesToNode(nodes.functionType, argumentTypes, returnType)
    );
});

var typeExpressionRule = exports.typeExpression = firstOf(
    "type expression",
    typeApplicationRule,
    functionTypeRule,
    variableReferenceRule
);

var typeSpecifierRule = exports.typeSpecifier = lazyRule(function() {
    var type = capture(typeExpressionRule, "type");
    return then(
        sequence(
            symbol(":"),
            type
        ),
        sequence.extract(type)
    );
});

var formalArgumentRule = lazyRule(function() {
    var name = capture(identifier(), "name");
    var type = capture(typeSpecifierRule, "type");
    return then(
        sequence(
            name,
            type
        ),
        applySequenceValuesToNode(nodes.formalArgument, name, type)
    );
});

var formalArgumentsRule = exports.formalArguments = lazyRule(function() {
    var formalArguments = capture(zeroOrMoreWithSeparator(formalArgumentRule, symbol(",")), "formalArguments");
    return then(
        sequence(
            symbol("("),
            formalArguments,
            symbol(")")
        ),
        applySequenceValuesToNode(nodes.formalArguments, formalArguments)
    );
});

var formalTypeParameterRule = lazyRule(function() {
    return then(
        identifier(),
        nodes.formalTypeParameter
    );
});

var formalTypeParametersRule = exports.formalTypeParameters = lazyRule(function() {
    var formalTypeParameters = capture(oneOrMoreWithSeparator(formalTypeParameterRule, symbol(",")), "formalTypeParameter");
    return then(
        sequence(symbol("["), formalTypeParameters, symbol("]"), symbol("=>")),
        applySequenceValuesToNode(nodes.formalTypeParameters, formalTypeParameters)
    );
});

var lambdaRule = lazyRule(function() {
    var formalTypeParameters = capture(optional(formalTypeParametersRule), "formalTypeParameters");
    var formalArguments = capture(formalArgumentsRule, "formalArguments");
    var returnType = capture(optional(typeSpecifierRule), "returnType");
    var body = capture(expressionRule, "body");
    return then(
        sequence(
            keyword("fun"),
            sequence.cut(),
            formalTypeParameters,
            formalArguments,
            returnType,
            symbol("=>"),
            body
        ),
        applySequenceValuesToNode(nodes.lambda, formalTypeParameters, formalArguments, returnType, body)
    );
});

var classRule = lazyRule(function() {
    var formalArguments = capture(formalArgumentsRule, "formalArguments");
    var body = capture(zeroOrMore(statements.statement), "body");
    return then(
        sequence(
            keyword("class"),
            sequence.cut(),
            formalArguments,
            symbol("=>"),
            symbol("{"),
            body,
            symbol("}")
        ),
        applySequenceValuesToNode(nodes.class, formalArguments, body)
    );
});

var objectRule = lazyRule(function() {
    var body = capture(zeroOrMore(statements.statement), "body");
    return then(
        sequence(
            keyword("object"),
            sequence.cut(),
            symbol("{"),
            body,
            symbol("}")
        ),
        applySequenceValuesToNode(nodes.object, body)   
    );
});

var definitionRule = exports.definition = firstOf(
    "definition",
    lambdaRule,
    classRule
);

var parenthesisedExpressionRule = lazyRule(function() {
    var expression = sequence.capture(expressionRule, "expression");
    return then(
        sequence(
            symbol("("),
            expression,
            symbol(")")
        ),
        sequence.extract(expression)
    );
});

var primaryExpressionRule = firstOf(
    "primary expression",
    definitionRule,
    objectRule,
    variableReferenceRule,
    literalRule,
    parenthesisedExpressionRule
);

var argumentListRule = lazyRule(function() {
    var arguments = sequence.capture(zeroOrMoreWithSeparator(expressionRule, symbol(",")), "arguments");
    return then(
        sequence(
            symbol("("),
            sequence.cut(),
            arguments,
            symbol(")")
        ),
        sequence.extract(arguments)
    );
});

var partialMemberAccess = lazyRule(function() {
    var memberName = sequence.capture(rules.identifier(), "memberName");
    return then(
        sequence(symbol("."), sequence.cut(), memberName),
        sequence.extract(memberName)
    );
});

var typeParameterListRule = lazyRule(function() {
    var parameters = sequence.capture(oneOrMoreWithSeparator(expressionRule, symbol(",")), "parameters");
    return then(
        sequence(symbol("["), sequence.cut(), parameters, symbol("]")),
        sequence.extract(parameters)
    );
});

var callExpressionRule = lazyRule(function() {
    return leftAssociative(
        primaryExpressionRule,
        leftAssociative.firstOf(
            {func: nodes.call, rule: argumentListRule},
            {func: nodes.memberAccess, rule: partialMemberAccess},
            {func: nodes.typeApplication, rule: typeParameterListRule}
        )
    );
});

var assignableExpressionRule = variableReferenceRule;

var assignmentRule = lazyRule(function() {
    var assignTo = sequence.capture(assignableExpressionRule, "assignTo");
    var assignedValue = sequence.capture(expressionRule, "assignedValue");
    return then(
        sequence(
            assignTo,
            symbol("="),
            assignedValue
        ),
        applySequenceValuesToNode(nodes.assign, assignTo, assignedValue)
    );
});

var ifExpressionRule = lazyRule(function() {
    var elseBody = sequence.capture(expressionRule, "elseBody");
    var elseClause = optional(then(
        sequence(keyword("else"), sequence.cut(), elseBody),
        sequence.extract(elseBody)
    ));
    
    var elseIfCondition = sequence.capture(expressionRule, "condition");
    var elseIfBody = sequence.capture(expressionRule, "elseIfBody");
    var elseIfClause = then(
        sequence(keyword("else"), keyword("if"), sequence.cut(), elseIfCondition, elseIfBody),
        applySequenceValuesToNode(function(condition, body, source) {
            return {condition: condition, body: body};
        }, elseIfCondition, elseIfBody)
    );
    
    var condition = sequence.capture(expressionRule, "condition");
    var ifTrue = sequence.capture(expressionRule, "ifTrue");
    var elseIfs = sequence.capture(zeroOrMore(elseIfClause), "elseIf");
    var ifFalse = sequence.capture(elseClause, "ifFalse");
    return then(
        sequence(keyword("if"), sequence.cut(), condition, ifTrue, elseIfs, ifFalse),
        applySequenceValuesToNode(function(condition, ifTrue, elseIfs, ifFalse, source) {
            var ifTrueCases = [{condition: condition, body: ifTrue}];
            var ifFalseCases = ifFalse.map(function(body) {
                return {body: body};
            }).toArray();
            return nodes.if(ifTrueCases.concat(elseIfs).concat(ifFalseCases), source);
        }, condition, ifTrue, elseIfs, ifFalse)
    );
});

var blockExpressionRule = lazyRule(function() {
    var statements = sequence.capture(zeroOrMore(statementRules.statement), "statements");
    return then(
        sequence(
            symbol("{"),
            sequence.cut(),
            statements,
            symbol("}")
        ),
        applySequenceValuesToNode(nodes.block, statements)
    );
});

var expressionRule = exports.expression = firstOf(
    "expression",
    blockExpressionRule,
    ifExpressionRule,
    assignmentRule,
    callExpressionRule,
    primaryExpressionRule
);
