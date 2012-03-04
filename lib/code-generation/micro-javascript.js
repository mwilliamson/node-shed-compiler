var js = require("./javascript-nodes");

exports.generate = function(slabNode) {
    return translators[slabNode.nodeType](slabNode);
};

var translators = {
    string: function(slabString) {
        return js.string(slabString.value, slabString);
    },
    variableReference: function(slabReference) {
        return js.ref(slabReference.identifier, slabReference);
    }
};
