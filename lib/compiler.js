var parsing = require("./parsing");
var modulesParsing = require("./parsing/modules");
var shedToSlab = require("./shed-to-slab");
var slabToJavaScript = require("./code-generation/micro-javascript");
var javaScriptWriter = require("./javascript/writer");

var parser = new parsing.Parser();

var Compiler = exports.Compiler = function() {
};

var init =
    "var print = function(value) { process.stdout.write(value); };\n" +
    "var $number = function(value) {\n" +
    "    return {\n" +
    "        $value: value,\n" +
    "        equals: function(other) { return value === other.value; }\n" +
    "    };\n" +
    "}\n;";

var describeError = function(error) {
    return error.describe();
};

Compiler.prototype.compileToString = function(source) {
    var parseResult = parser.parse(modulesParsing.module, source.string);
    if (!parseResult.isSuccess()) {
        throw new Error(parseResult.errors().map(describeError).join("\n"));
    }
    var shedModuleNode = parseResult.value();
    var slabModuleNode = shedToSlab.translate(shedModuleNode);
    var javaScriptNode = slabToJavaScript.translate(slabModuleNode);
    return init + javaScriptWriter.write(javaScriptNode);
};
