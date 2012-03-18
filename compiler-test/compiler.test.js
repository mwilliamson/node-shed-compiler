var util = require("util");
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");

var temp = require("temp");

var Compiler = require("../lib/compiler").Compiler;

var compiler = new Compiler();

var testRoot = path.join(__dirname, "../test-programs");

fs.readdirSync(testRoot).forEach(function(testPath) {
    var testDirectory = path.join(testRoot, testPath);
    exports[testPath] = function(test) {
        fs.readFile(path.join(testDirectory, "test.json"), function(err, testJson) {
            test.ifError(err);
            var testDescription = JSON.parse(testJson);
            executeMain(testDirectory, testDescription, function(err, result) {
                test.ifError(err);
                if (!err) {
                    test.equal("", result.stderr);
                    test.equal(testDescription.expected.stdout, result.stdout);
                }
                test.done(); 
            });
        });
    };
});

var executeMain = function(testDirectory, testDescription, callback) {
    var then = ifSuccess.bind(null, callback);
    if (testDescription.file) {
        var mainTestFilePath = path.join(testDirectory, testDescription.file);
        executeShedFile(mainTestFilePath, callback);
    } else if (testDescription.main) {
        compileDirectory(testDirectory, testDescription.main, then(function(compiledJavaScript) {
            executeJsString(compiledJavaScript, callback);
        }));
    } else {
        callback(new Error("Cannot execute test: " + testDescription));
    }
};

var executeShedFile = function(filePath, callback) {
    fs.readFile(filePath, "utf8", ifSuccess(callback, function(mainShedString) {
        compile(mainShedString, ifSuccess(callback, function(compiledJavaScript) {
            executeJsString(compiledJavaScript, callback);
        }));
    }));
};

var executeJsString = function(jsString, callback) {
    temp.open(null, ifSuccess(callback, function(tempFile) {
        fs.writeFile(tempFile.path, jsString, ifSuccess(callback, function() {
            var command = util.format("node %s", path.resolve(tempFile.path));
            child_process.exec(command, function(err, stdout, stderr) {
                callback(err, {
                    stderr: stderr,
                    stdout: stdout
                });
            });
        }));
    }));
};

var compile = function(string, callback) {
    compiler.compileToString({string: string}, callback);
};

var compileDirectory = function(directoryPath, main, callback) {
    compiler.compileToString({files: [directoryPath], main: main}, callback);
};

var ifSuccess = function(callback, func) {
    return function(err) {
        if (err) {
            callback(err);
        } else {
            func.apply(this, Array.prototype.slice.call(arguments, 1));
        }
    };
};
