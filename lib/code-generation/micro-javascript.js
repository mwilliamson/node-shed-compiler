var js = require("./javascript-nodes");

var translate = exports.generate = function(slabNode) {
    return translators[slabNode.nodeType](slabNode);
};

var translators = {
    string: function(slabString) {
        return js.string(slabString.value, slabString);
    },
    variableReference: function(slabReference) {
        return js.ref(slabReference.identifier, slabReference);
    },
    call: function(slabCall) {
        var jsFunc = translate(slabCall.func);
        var jsArgs = slabCall.args.map(translate);
        return js.call(jsFunc, jsArgs, slabCall);
    }
};