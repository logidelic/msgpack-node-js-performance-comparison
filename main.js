var fs = require('fs');


//
// Setup test mods
//
var msgpackMods = [];




// notepack
addTest({
    mod:    'notepack.io',
    encode: function(mod, d) {return mod.encode(d)},
    decode: function(mod, d) {return mod.decode(d)},
});

/*
// messagepack - disqualified, too slow to test
addTest({
    mod:    'messagepack',
    encode: function(mod, d) {return mod.encode(d)},
    decode: function(mod, d) {return mod.decode(d)},
});
*/

// msgpack-lite
addTest({
    mod:    'msgpack-lite',
    encode: function(mod, d) {return mod.encode(d)},
    decode: function(mod, d) {return mod.decode(d)},
});

// msgpack-node
addTest({
    mod:    'msgpack',
    encode: function(mod, d) {return mod.pack(d)},
    decode: function(mod, d) {return mod.unpack(d)},
});

// msgpack5
addTest({
    mod:    'msgpack5',
    inst:   true,
    encode: function(mod, d) {return mod.encode(d)},
    decode: function(mod, d) {return mod.decode(d)},
});

// msgpack-js
addTest({
    mod:    'msgpack-js',
    encode: function(mod, d) {return mod.encode(d)},
    decode: function(mod, d) {return mod.decode(d)},
});

// stringify/parse
addTest({
    mod:    'JSON/stringify/parse',
    encode: function(mod, d) {return JSON.stringify(d)},
    decode: function(mod, d) {return JSON.parse(d)},
});




// Load up the random data
fs.readFile('./random_data.json', function (err, data) {
    if(err) return console.log(err);
    var arr = JSON.parse(data);

    for(var iMod=0; iMod < msgpackMods.length; ++iMod) {
        var mod = msgpackMods[iMod];
        console.log('-------');
        console.log('Testing '+mod.name+' '+mod.ver);
        console.log('-------');

        mod.encMsSmall=0; mod.encMsBig=0;
        mod.decMsSmall=0; mod.decMsBig=0;

        var encs = [];

        //
        // Check small perofrmance
        //
        var t1 = Date.now();
        for(var iRep=0; iRep<100; ++iRep) {
            for(var i=0; i < arr.length; ++i) {
                var enc = mod.encode(arr[i]);
                if(!iRep) encs.push(enc);
            }
        }
        var t2 = Date.now();
        mod.encMsSmall += (t2-t1);

        var decs = [];
        for(var iRep=0; iRep<100; ++iRep) {
            for(var i=0; i < encs.length; ++i) {
                var dec = mod.decode(encs[i]);
                if(!iRep) decs.push(dec);
            }
        }
        var t3 = Date.now();
        mod.decMsSmall += (t3-t2);

        for(var i=0; i < arr.length; ++i) {
            if(JSON.stringify(decs[i]) != JSON.stringify(arr[i])) console.log('Roundtrip error '+i);
        }

        //
        // Check big performance
        //
        for(var i = 0; i < 100; ++i) {
            var t1 = Date.now();
            var enc = mod.encode(arr);
            var t2 = Date.now();
            mod.encMsBig += (t2-t1);

            var dec = mod.decode(enc);
            var t3 = Date.now();
            mod.decMsBig += (t3-t2);

            // Check that it is correct
            if(JSON.stringify(dec) != JSON.stringify(arr)) console.log('Roundtrip error '+i);
        }

        mod.encAll = mod.encMsSmall+mod.encMsBig;
        mod.decAll = mod.decMsSmall+mod.decMsBig;
        mod.all    = mod.encMsSmall+mod.encMsBig+mod.decMsSmall+mod.decMsBig

        // Output
        console.log('Encode small: '+fmtThousands(mod.encMsSmall));
        console.log('Encode big:   '+fmtThousands(mod.encMsBig));
        console.log('Encode all:   '+fmtThousands(mod.encAll));
        console.log('Decode small: '+fmtThousands(mod.decMsSmall));
        console.log('Decode big:   '+fmtThousands(mod.decMsBig));
        console.log('Decode all:   '+fmtThousands(mod.decAll));
        console.log('All:          '+fmtThousands(mod.all));
        console.log('');
        console.log('');
        console.log('');
    }

    //
    // Summary
    //
    console.log('-------');
    console.log('Winners');
    console.log('-------');
    
    showWinners('Encode small', 'encMsSmall');
    showWinners('Encode big  ', 'encMsBig');
    showWinners('Encode all  ', 'encAll');
    showWinners('Decode small', 'decMsSmall');
    showWinners('Decode big  ', 'decMsBig');
    showWinners('Decode all  ', 'decAll');
    showWinners('All         ', 'all');

    function showWinners(lbl, k) {
        // Sort by winners
        msgpackMods.sort(function(l,r) { return (l[k]<r[k]?-1:(l[k]>r[k]?1:0)); });

        // Show top 3
        var str = lbl+' : ';
        for(var i = 0; i < 4; ++i) {
            var winnertxt = msgpackMods[i].name + '('+fmtThousands(msgpackMods[i][k])+')';
            str += padwhite(winnertxt,40);
        }
        console.log(str);
    }
    function padwhite(str, len) {
        for(var i = str.length; i < len; ++i)
            str = str+' ';
        return str;
    }
});


function addTest(d) {
    var isJson  = (d.mod.indexOf('JSON') == 0);
    var mod     = isJson ? null : require(d.mod);
    var ver     = isJson ? ''   : require(d.mod+'/package.json').version;

    if(d.inst) mod = mod();
    
    msgpackMods.push({name:d.mod, mod:mod, ver:ver, encode:encode, decode:decode});

    function encode(dd) {
        return d.encode(mod, dd);
    }
    function decode(dd) {
        return d.decode(mod, dd);
    }
}
function fmtThousands(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
