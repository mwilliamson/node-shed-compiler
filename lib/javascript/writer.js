exports.write = function(javaScriptNode) {
    return writers[javaScriptNode.nodeType](javaScriptNode);
};

var writers = {
    string: function(jsString) {
        return JSON.stringify(jsString.value);
    }
};
