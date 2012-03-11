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
            var mainTestFilePath = path.join(testDirectory, testDescription.file);
            executeFile(mainTestFilePath, function(err, result) {
                test.ifError(err);
                test.equal("", result.stderr);
                test.equal(testDescription.expected.stdout, result.stdout);
                test.done(); 
            });
        });
    };
});

var executeFile = function(filePath, callback) {
    fs.readFile(filePath, "utf8", ifSuccess(callback, function(mainShedString) {
        var compiledJavaScript = compiler.compileToString({
            string: mainShedString
        });
        
        temp.open(null, ifSuccess(callback, function(tempFile) {
            fs.writeFile(tempFile.path, compiledJavaScript, ifSuccess(callback, function() {
                var command = util.format("node %s", path.resolve(tempFile.path));
                child_process.exec(command, function(err, stdout, stderr) {
                    callback(err, {
                        stderr: stderr,
                        stdout: stdout
                    });
                });
            }));
        }));
    }));
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


