var fs = require("fs");
var path = require("path");

var _ = require("underscore");
var async = require("async");
var findit = require("findit");

// TODO: this introduces an ugly circular dependency
var compilation = require("./compiler");

// TODO: error handling

exports.loadNodeJsPrelude = function(callback) {
    var runtimePath = path.join(__dirname, "../runtime/");
    var runtimePaths = [path.join(runtimePath, "prelude.js")];
    var finder = findit.find(path.join(runtimePath, "js"));
    
    finder.on("file", function(file, stat) {
        runtimePaths.push(file);
    });
    
    finder.on("end", function() {
        var jsFiles = runtimePaths.filter(hasExtension("js"));
        var shedFiles = runtimePaths.filter(hasExtension("shed"));
        async.map(jsFiles, readUtf8File, function(err, fileContents) {
            var compiler = new compilation.Compiler();
            compiler.compileToString({files: shedFiles, excludeRuntime: true}, function(err, compiledShed) {
                fileContents.push(compiledShed);
                var result = _.compact(fileContents).join(";\n\n");
                callback(null, result);
            });
        });
    });
};

var readUtf8File = function(filePath, callback) {
    fs.readFile(filePath, "utf8", callback);
};

var hasExtension = function(extension) {
    var regex = new RegExp("\\." + extension + "$");
    return function(file) {
        return regex.test(file);
    };
};
