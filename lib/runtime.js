var fs = require("fs");
var path = require("path");

var _ = require("underscore");
var async = require("async");
var findit = require("findit");

// TODO: error handling

exports.loadNodeJsPrelude = function(callback) {
    var runtimePath = path.join(__dirname, "../runtime/");
    var runtimePaths = [path.join(runtimePath, "prelude.js")];
    var finder = findit.find(path.join(runtimePath, "js"));
    
    finder.on("file", function(file, stat) {
        runtimePaths.push(file);
    });
    
    finder.on("end", function() {
        async.map(runtimePaths, readUtf8File, function(err, fileContents) {
            callback(err, _.compact(fileContents).join("\n\n"));
        });
    });
};

var readUtf8File = function(filePath, callback) {
    if (/\.js$/.test(filePath)) {
        fs.readFile(filePath, "utf8", callback);
    } else {
        callback(null, null);
    }
};
