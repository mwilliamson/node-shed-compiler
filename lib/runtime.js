var fs = require("fs");
var path = require("path");

var _ = require("underscore");
var async = require("async");
var findit = require("findit");

var ModuleCompiler = require("./module-compilation").ModuleCompiler;
var ifSuccess = require("./util").ifSuccess;

exports.loadNodeJsPrelude = function(callback) {
    var then = ifSuccess(callback);
    var runtimePath = path.join(__dirname, "../runtime/");
    
    findFiles(path.join(runtimePath, "js"), {extension: "js"}, then(function(jsFiles) {
        // bootstrap.js must be loaded first
        jsFiles = [path.join(runtimePath, "bootstrap.js")]
            .concat(jsFiles);
        findFiles(path.join(runtimePath, "stdlib"), {extension: "shed"}, then(function(shedFiles) {
            async.map(jsFiles, readUtf8File, then(function(fileContents) {
                var compiler = new ModuleCompiler();
                compiler.compileToString({files: shedFiles}, then(function(compiledShed) {
                    fileContents.push(compiledShed);
                    readUtf8File(path.join(runtimePath, "prelude.js"), then(function(preludeContents) {
                        fileContents.push(preludeContents);
                        var result = _.compact(fileContents).join(";\n\n");
                        callback(null, result);
                    }));
                }));
            }));
        }));
    }));
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
