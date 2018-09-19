var fs = require('fs');


var arr = [];
for( i = 0; i < 10000; ++i) {
    var s = getRndStruct(1,5,3);
    arr.push(s);
}

fs.writeFile('./random_data.json', JSON.stringify(arr), function(err) {
    if(err) return console.log(err);

    console.log("Saved!");
    process.exit(0);
}); 




function getRndStruct(minAttrs, maxAttrs, maxDepth) {
    var stuff = {};
    for(var i = 0; i < getRndInt(minAttrs,maxAttrs); ++i) {
        stuff[getRndStr(getRndInt(1,25))] = getRndVal(maxDepth);
    }
    return stuff;
}
function getRndInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRndStr(len, useChars) {
    var text = "";
    var possible = useChars || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function getRndUint32() {
    return Math.floor(Math.random() * 4294967295);
  }
  function getRndVal(maxDepth) {
    var iType = getRndInt(0,4);
    if(!maxDepth && iType == 4) iType = 0;

    switch(iType) {
        case 0: return getRndUint32();
        case 1: return Math.random();
        case 2: return getRndStr(getRndInt(1,900));
        case 3: return new Date();
        case 4: return getRndStruct(1,5,maxDepth-1);
    }
}
