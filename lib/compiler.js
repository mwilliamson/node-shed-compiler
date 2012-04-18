var runtime = require("./runtime");
var ModuleCompiler = require("./module-compilation").ModuleCompiler;

var Compiler = exports.Compiler = function() {
};

Compiler.prototype.compileToString = function(options, callback) {
    var then = ifSuccess(callback);
    
    var moduleCompiler = new ModuleCompiler();
    moduleCompiler.compileToString(options, then(function(javaScript) {
        if (options.main) {
            javaScript += "\n\n$shed.import($shed.string(\"" + options.main + "\"))" +
                "($shed.lists.createFromArray(String)(process.argv.slice(2).map($shed.string)));";
        }
        runtime.loadNodeJsPrelude(function(err, prelude) {
            callback(null, prelude + javaScript);
        });
    }));
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
