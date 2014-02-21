Elm.Native.Json = {};
Elm.Native.Json.make = function(elm) {

    elm.Native = elm.Native || {};
    elm.Native.Json = elm.Native.Json || {};
    if (elm.Native.Json.values) return elm.Native.Json.values;

    var Maybe = Elm.Maybe.make(elm);
    var Dict = Elm.Dict.make(elm);
    var List = Elm.List.make(elm);
    var JS = Elm.JavaScript.make(elm);
    var Utils = Elm.Native.Utils.make(elm);

    function fromValue(v) {
        switch (v.ctor) {
        case 'Null'   : return null;
        case 'String' : return JS.fromString(v._0);
        case 'Number' : return v._0;
        case 'Boolean': return v._0;
        case 'Object' :
            var obj = {};
            var array = JS.fromList(Dict.toList(v._0));
            for (var i = array.length; i--; ) {
                var entry = array[i];
                obj[JS.fromString(entry._0)] = fromValue(entry._1);
            }
            return obj;
        case 'Array'  :
            var array = JS.fromList(v._0);
            for (var i = array.length; i--; ) {
	        array[i] = fromValue(array[i]);
            }
            return array;
        }
    }

    function toString(sep, value) {
        return JSON.stringify(fromValue(value), null, JS.fromString(sep));
    }

    function toValue(v) {
        switch (typeof v) {
        case 'string' : return { ctor:"String" , _0: JS.toString(v) };
        case 'number' : return { ctor:"Number" , _0: JS.toFloat(v)  };
        case 'boolean': return { ctor:"Boolean", _0: JS.toBool(v)   };
        case 'object' :
            if (v === null) return { ctor:"Null" };
            if (v instanceof Array) {
                for (var i = v.length; i--; ) { v[i] = toValue(v[i]); }
	        return { ctor:"Array", _0: JS.toList(v) };
            }
            var array = [];
            for (var k in v) array.push(Utils.Tuple2(JS.toString(k), toValue(v[k])));
            return { ctor:"Object", _0: Dict.fromList(JS.toList(array)) };
        }
    }

    function fromString(str) {
        try {
	    return Maybe.Just(toValue(JSON.parse(JS.fromString(str))));
        } catch (e) {
	    return Maybe.Nothing;
        }
    }

    return elm.Native.Json.values = {
        toString : F2(toString),
        fromString : fromString,
    };

};
