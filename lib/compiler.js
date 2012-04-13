var util = require("util");
var fs = require("fs");
var path = require("path");

var async = require("async");
var StringSource = require("lop").StringSource;

var parsing = require("./parsing");
var modulesParsing = require("./parsing/modules");
var shedToSlab = require("./shed-to-slab");
var slabToJavaScript = require("./code-generation/micro-javascript");
var javaScriptWriter = require("./javascript/writer");
var runtime = require("./runtime");

var parser = new parsing.Parser();

var Compiler = exports.Compiler = function() {
};

var describeError = function(error) {
    return error.describe();
};

Compiler.prototype.compileToString = function(options, callback) {
    var then = ifSuccess(callback);
    fetchSources(options, then(function(sources) {
        var javaScriptStrings = sources.map(function(source) {
            var parseResult = parser.parse(modulesParsing.module, source);
            if (!parseResult.isSuccess()) {
                throw new Error(parseResult.errors().map(describeError).join("\n"));
            }
            var shedModuleNode = parseResult.value();
            var slabModuleNode = shedToSlab.translate(shedModuleNode);
            var javaScriptNode = slabToJavaScript.translate(slabModuleNode);
            return javaScriptWriter.write(javaScriptNode);
        });
        var javaScript = javaScriptStrings.join("\n\n");
        if (options.main) {
            javaScript += "\n\n$shed.import($shed.string(\"" + options.main + "\"))" +
                "($shed.lists.createFromArray(String)(process.argv.slice(2).map($shed.string)));";
        }
        if (options.excludeRuntime) {
            callback(null, javaScript);
        } else {
            runtime.loadNodeJsPrelude(function(err, prelude) {
                callback(null, prelude + javaScript);
            });
        }
    }));
};

var fetchSources = function(options, callback) {
    var then = ifSuccess(callback);
    if (options.string) {
        callback(null, [new StringSource(options.string, "Raw string")]);
    } else if (options.files) {
        readFiles(options.files, callback);
    } else {
        callback(new Error("Could not fetch source for: " + util.inspect(options)));
    }
};

var readFiles = function(filePaths, callback) {
    var then = ifSuccess(callback);
    async.map(filePaths, expandFile, then(function(files) {
        files = files.reduce(concat, []);
        async.map(files, function(file, callback) {
            var then = ifSuccess(callback);
            fs.readFile(file, "utf8", then(function(fileContents) {
                callback(null, new StringSource(fileContents, "File: " + file));
            }));
        }, callback);
    }));
};

var expandFile = function(filePath, callback) {
    var then = ifSuccess(callback);
    fs.stat(filePath, then(function(stat) {
        if (stat.isDirectory()) {
            findFiles(filePath, /\.shed$/, callback);
        } else {
            callback(null, [filePath]);
        }
    }));
};

var findFiles = function(directoryPath, regex, callback) {
    var then = ifSuccess(callback);
    var filePaths = fs.readdir(directoryPath, then(function(files) {
        async.map(files, function(filePath, callback) {
            var fullPath = path.join(directoryPath, filePath);
            fs.stat(fullPath, then(function(stat) {
                if (stat.isDirectory()) {
                    findFiles(fullPath, regex, callback);
                } else if (regex.test(filePath)) {
                    callback(null, [fullPath]);
                } else {
                    callback(null, []);
                }
            }));
        }, then(function(files) {
            callback(null, files.reduce(concat, []));
        }));
    }));
};

var concat = function(first, second) {
    return first.concat(second);
};

var ifSuccess = function(callback) {
    return function(func) {
        return function(err) {
            if (err) {
                callback(err);
            } else {
                func.apply(this, Array.prototype.slice.call(arguments, 1));
            }
        };
    };
};
