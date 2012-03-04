exports.string = function(value, source) {
    return node({
        nodeType: "string",
        value: value
    }, source);
};

exports.ref = function(identifier, source) {
    return node({
        nodeType: "variableReference",
        identifier: identifier
    }, source);
};

var node = function(node, source) {
    node.language = "javascript";
    if (source) {
        node.source = source;
    }
    return node;
};
