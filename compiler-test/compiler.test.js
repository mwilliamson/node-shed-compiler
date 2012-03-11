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
            fs.readFile(mainTestFilePath, "utf8", function(err, mainShedString) {
                test.ifError(err);
                var compiledJavaScript = compiler.compileToString({
                    string: mainShedString
                });
                
                temp.open(null, function(err, tempFile) {
                    test.ifError(err);
                    fs.writeFile(tempFile.path, compiledJavaScript, function(err) {
                        test.ifError(err);
                        
                        var command = util.format("node %s", path.resolve(tempFile.path));
                        child_process.exec(command, function(err, stdout, stderr) {
                            test.ifError(err);
                            test.equal("", stderr);
                            test.equal(testDescription.expected.stdout, stdout);
                            test.done(); 
                        });
                    });
                });
            });
        });
    };
});


