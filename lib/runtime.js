var fs = require("fs");
var path = require("path");

var _ = require("underscore");
var async = require("async");
var findit = require("findit");

var ModuleCompiler = require("./module-compilation").ModuleCompiler;

// TODO: error handling

exports.loadNodeJsPrelude = function(callback) {
    var runtimePath = path.join(__dirname, "../runtime/");
    
    findFiles(path.join(runtimePath, "js"), {extension: "js"}, function(err, jsFiles) {
        // prelude.js must be loaded first
        jsFiles = [path.join(runtimePath, "prelude.js")].concat(jsFiles);
        findFiles(path.join(runtimePath, "stdlib"), {extension: "shed"}, function(err, shedFiles) {
            async.map(jsFiles, readUtf8File, function(err, fileContents) {
                var compiler = new ModuleCompiler();
                compiler.compileToString({files: shedFiles}, function(err, compiledShed) {
                    fileContents.push(compiledShed);
                    var result = _.compact(fileContents).join(";\n\n");
                    callback(null, result);
                });
            });
        });
    });
};

var findFiles = function(directory, options, callback) {
    var paths = [];
    var finder = findit.find(directory);
    
    finder.on("file", function(file, stat) {
        if (options.extension && hasExtension(options.extension)(file)) {
            paths.push(file);
        }
    });
    
    finder.on("end", function() {
        callback(null, paths);
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
