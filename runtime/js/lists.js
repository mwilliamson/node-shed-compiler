$shed.exportModule("lists", function() {
    var options = $shed.js.import("options");
    var sequences = $shed.js.import("sequences");
    var sequenceToList = function(T) {
        return function(sequence) {
            var result = [];
            sequences.forEach(T)(function(value) {
                result.push(value);
            }, sequence);
            return $shed.lists.createFromArray(T)(result);
        };
    };

    // Assumes all inputs are the same length
    var zip = function() {
        var lists = Array.prototype.map.call(arguments, function(list) {
            return list.$toJsArray();
        });
        var result = [];
        for (var listsIndex = 0; listsIndex < lists[0].length; listsIndex += 1) {
            result[listsIndex] = tuple(lists.map(function(list) {
                return list[listsIndex];
            }));
        };
        return $shed.lists.createFromArray()(result);
    };
    
    return {
        sequenceToList: sequenceToList,
        zip: zip
    };
});