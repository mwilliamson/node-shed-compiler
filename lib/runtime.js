var fs = require("fs");
var path = require("path");

// TODO: error handling

exports.loadNodeJsPrelude = function(callback) {
    var runtimePath = path.join(__dirname, "../runtime/");
    
    fs.readFile(path.join(runtimePath, "prelude.js"), "utf8", function(err, prelude) {
        callback(null, prelude);
    });
};
