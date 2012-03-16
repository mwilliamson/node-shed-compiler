#!/usr/bin/env node

var argv = require("optimist")
    .usage('Usage: $0 <source-directory> [--main=<main-function>]')
    .demand(1)
    .argv;;

var Compiler = require("../lib/compiler").Compiler;

var compiler = new Compiler();

compiler.compileToString({
    directory: argv._[0],
    main: argv.main
}, function(err, javaScript) {
    if (err) {
        throw err;
    } else {
        process.stdout.write(javaScript);
    }
});
