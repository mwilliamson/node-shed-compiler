var fs = require("fs");
var path = require("path");

exports.prelude = fs.readFileSync(path.join(__dirname, "../runtime/prelude.js"), "utf8");
