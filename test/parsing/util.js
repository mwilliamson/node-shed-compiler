var _ = require("underscore");
var duck = require("duck");
var options = require("options");

var nodes = require("../../lib/nodes");

var ignoringSources = exports.ignoringSources = function(node) {
    if (_.isString(node) || _.isNumber(node) || _.isBoolean(node)) {
        return node;
    }
    var matchingNode = _.clone(node);
    if (nodes.isShedNode(matchingNode)) {
        matchingNode.source = duck.any;
    }
    for (key in matchingNode) {
        if (nodes.isShedNode(matchingNode[key])) {
            matchingNode[key] = ignoringSources(matchingNode[key]);
        } else if (Array.isArray(matchingNode[key])) {
            matchingNode[key] = duck.isArray(matchingNode[key].map(function(value) {
                return ignoringSources(value);
            }));
        } else if (options.isOption(matchingNode[key])) {
            matchingNode[key] = duck.isObject(matchingNode[key].map(ignoringSources));
        }
    }
    return duck.isObject(matchingNode);
};
