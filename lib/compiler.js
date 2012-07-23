var runtime = require("./runtime");
var ModuleCompiler = require("./module-compilation").ModuleCompiler;
var ifSuccess = require("./util").ifSuccess;

var Compiler = exports.Compiler = function() {
};

Compiler.prototype.compileToString = function(options, callback) {
    var then = ifSuccess(callback);
    
    var moduleCompiler = new ModuleCompiler();
    moduleCompiler.compileToString(options, then(function(javaScript) {
        if (options.main) {
            javaScript += "\n\n$shed.import_($shed.string(\"" + options.main + "\"))" +
                "($shed.lists.createFromArray(process.argv.slice(2).map($shed.string)));";
        }
        runtime.loadNodeJsPrelude(function(err, prelude) {
            callback(null, prelude + javaScript);
        });
    }));
};
