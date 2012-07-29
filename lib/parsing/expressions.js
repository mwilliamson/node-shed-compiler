var lop = require("lop");
var rules = lop.rules;
var tokenRules = require("./tokens");
var firstOf = rules.firstOf;
var keyword = tokenRules.keyword;
var symbol = tokenRules.symbol;
var identifier = tokenRules.identifier;
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
var optionalMembersRule = require("./members").optionalMembersRule;

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

var unitRule = sequence(
        symbol("("),
        symbol(")")
    ).map(nodes.unit);

var stringRule = then(
    tokenRules.string(),
    nodes.string
);

var numberRule = then(
    tokenRules.number(),
    nodes.number
);

var listRule = lazyRule(function() {
    return sequence(
        symbol("["),
        sequence.cut(),
        zeroOrMoreWithSeparator(expressionRule, symbol(",")),
        symbol("]")
    ).map(nodes.list);
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
    identifier(),
    nodes.variableReference
);

var typeApplicationRule = lazyRule(function() {
    var func = sequence.capture(variableReferenceRule);
    var args = sequence.capture(oneOrMoreWithSeparator(typeExpressionRule, symbol(",")));
    return sequence(func, symbol("["), sequence.cut(), args, symbol("]"))
        .map(nodes.typeApplication);
});

var functionTypeRule = lazyRule(function() {
    var argumentTypes = sequence.capture(zeroOrMoreWithSeparator(typeExpressionRule, symbol(",")), "argumentTypes");
    var returnType = sequence.capture(typeExpressionRule, "returnType");
    return sequence(symbol("("), argumentTypes, symbol(")"), symbol("->"), sequence.cut(), returnType)
        .map(nodes.functionType);
});

var typeExpressionRule = exports.typeExpression = firstOf(
    "type expression",
    typeApplicationRule,
    functionTypeRule,
    variableReferenceRule
);

var typeSpecifierRule = exports.typeSpecifier = lazyRule(function() {
    return sequence(
            symbol(":"),
            capture(typeExpressionRule)
        ).head();
});

var formalArgumentRule = lazyRule(function() {
    return sequence(
            capture(identifier()),
            capture(typeSpecifierRule)
        ).map(nodes.formalArgument);
});

var formalArgumentsRule = exports.formalArguments = lazyRule(function() {
    var formalArguments = capture(zeroOrMoreWithSeparator(formalArgumentRule, symbol(",")));
    return sequence(
            symbol("("),
            sequence.cut(),
            formalArguments,
            symbol(")")
        ).map(nodes.formalArguments);
});

var formalTypeParameterRule = lazyRule(function() {
    return then(
        identifier(),
        nodes.formalTypeParameter
    );
});

var formalTypeParametersRule = exports.formalTypeParameters = lazyRule(function() {
    var formalTypeParameters = capture(oneOrMoreWithSeparator(formalTypeParameterRule, symbol(",")));
    return sequence(symbol("["), sequence.cut(), formalTypeParameters, symbol("]"), symbol("=>"))
        .map(nodes.formalTypeParameters);
});

var lambdaRule = lazyRule(function() {
    var formalTypeParameters = capture(optional(formalTypeParametersRule));
    var formalArguments = capture(formalArgumentsRule);
    var returnType = capture(optional(typeSpecifierRule));
    var body = capture(expressionRule);
    return sequence(
            keyword("fun"),
            sequence.cut(),
            formalTypeParameters,
            formalArguments,
            returnType,
            symbol("=>"),
            body
        ).map(nodes.lambda);
});

var classRule = lazyRule(function() {
    var formalTypeParameters = capture(optional(formalTypeParametersRule));
    var formalArguments = capture(formalArgumentsRule);
    var members = capture(optionalMembersRule);
    var body = capture(zeroOrMore(statements.statement));
    return sequence(
            keyword("class"),
            sequence.cut(),
            formalTypeParameters,
            formalArguments,
            symbol("=>"),
            symbol("{"),
            members,
            body,
            symbol("}")
        ).map(nodes.class);
});

var objectRule = lazyRule(function() {
    var members = capture(optionalMembersRule);
    var body = capture(zeroOrMore(statements.statement));
    return sequence(
            keyword("object"),
            sequence.cut(),
            symbol("{"),
            members,
            body,
            symbol("}")
        ).map(nodes.object);
});

var definitionRule = exports.definition = firstOf(
    "definition",
    lambdaRule,
    classRule
);

var parenthesisedExpressionRule = lazyRule(function() {
    var expression = sequence.capture(expressionRule);
    return sequence(
            symbol("("),
            expression,
            symbol(")")
        ).head();
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
    var arguments = sequence.capture(zeroOrMoreWithSeparator(expressionRule, symbol(",")));
    return sequence(
            symbol("("),
            sequence.cut(),
            arguments,
            symbol(")")
        ).head();
});

var partialMemberAccess = lazyRule(function() {
    var memberName = sequence.capture(identifier());
    return sequence(symbol("."), sequence.cut(), memberName)
        .head();
});

var typeParameterListRule = lazyRule(function() {
    var parameters = sequence.capture(oneOrMoreWithSeparator(expressionRule, symbol(",")));
    return sequence(symbol("["), sequence.cut(), parameters, symbol("]"))
        .head();
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
    var assignTo = sequence.capture(assignableExpressionRule);
    var assignedValue = sequence.capture(expressionRule);
    return sequence(
            assignTo,
            symbol("="),
            assignedValue
        ).map(nodes.assign);
});

var ifExpressionRule = lazyRule(function() {
    var elseBody = sequence.capture(expressionRule);
    var elseClause = optional(
        sequence(keyword("else"), sequence.cut(), elseBody).head()
    );
    
    var elseIfCondition = sequence.capture(expressionRule);
    var elseIfBody = sequence.capture(expressionRule);
    var elseIfClause = 
        sequence(keyword("else"), keyword("if"), sequence.cut(), elseIfCondition, keyword("then"), elseIfBody)
            .map(function(condition, body, source) {
                return {condition: condition, body: body};
            });
    
    var condition = sequence.capture(expressionRule);
    var ifTrue = sequence.capture(expressionRule);
    var elseIfs = sequence.capture(zeroOrMore(elseIfClause));
    var ifFalse = sequence.capture(elseClause);
    return sequence(keyword("if"), sequence.cut(), condition, keyword("then"), ifTrue, elseIfs, ifFalse)
        .map(function(condition, ifTrue, elseIfs, ifFalse, source) {
            var ifTrueCases = [{condition: condition, body: ifTrue}];
            var ifFalseCases = ifFalse.map(function(body) {
                return {body: body};
            }).toArray();
            return nodes.if(ifTrueCases.concat(elseIfs).concat(ifFalseCases), source);
        });
});

var blockExpressionRule = lazyRule(function() {
    var statements = sequence.capture(zeroOrMore(statementRules.statement));
    return sequence(
            keyword("do"),
            symbol("{"),
            sequence.cut(),
            statements,
            symbol("}")
        ).map(nodes.block);
});

var expressionRule = exports.expression = firstOf(
    "expression",
    blockExpressionRule,
    ifExpressionRule,
    assignmentRule,
    callExpressionRule,
    primaryExpressionRule
);
