(function () {

  function _defineProperty$2(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global$1 =
    /* global globalThis -- safe */
    check(typeof globalThis == 'object' && globalThis) ||
    check(typeof window == 'object' && window) ||
    check(typeof self == 'object' && self) ||
    check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
    // eslint-disable-next-line no-new-func -- fallback
    (function () { return this; })() || Function('return this')();

  var fails = function (exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Detect IE8's incomplete defineProperty implementation
  var descriptors = !fails(function () {
    return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
  });

  var nativePropertyIsEnumerable$1 = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

  // Nashorn ~ JDK8 bug
  var NASHORN_BUG = getOwnPropertyDescriptor$3 && !nativePropertyIsEnumerable$1.call({ 1: 2 }, 1);

  // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
  var f$7 = NASHORN_BUG ? function propertyIsEnumerable(V) {
    var descriptor = getOwnPropertyDescriptor$3(this, V);
    return !!descriptor && descriptor.enumerable;
  } : nativePropertyIsEnumerable$1;

  var objectPropertyIsEnumerable = {
  	f: f$7
  };

  var createPropertyDescriptor = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var toString$2 = {}.toString;

  var classofRaw = function (it) {
    return toString$2.call(it).slice(8, -1);
  };

  var split = ''.split;

  // fallback for non-array-like ES3 and non-enumerable old V8 strings
  var indexedObject = fails(function () {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins -- safe
    return !Object('z').propertyIsEnumerable(0);
  }) ? function (it) {
    return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
  } : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.es/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function (it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // toObject with fallback for non-array-like ES3 strings



  var toIndexedObject = function (it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject$1 = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  // `ToPrimitive` abstract operation
  // https://tc39.es/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var toPrimitive = function (input, PREFERRED_STRING) {
    if (!isObject$1(input)) return input;
    var fn, val;
    if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
    if (typeof (fn = input.valueOf) == 'function' && !isObject$1(val = fn.call(input))) return val;
    if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var hasOwnProperty = {}.hasOwnProperty;

  var has$2 = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var document$3 = global$1.document;
  // typeof document.createElement is 'object' in old IE
  var EXISTS = isObject$1(document$3) && isObject$1(document$3.createElement);

  var documentCreateElement = function (it) {
    return EXISTS ? document$3.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty
  var ie8DomDefine = !descriptors && !fails(function () {
    return Object.defineProperty(documentCreateElement('div'), 'a', {
      get: function () { return 7; }
    }).a != 7;
  });

  var nativeGetOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
  var f$6 = descriptors ? nativeGetOwnPropertyDescriptor$2 : function getOwnPropertyDescriptor(O, P) {
    O = toIndexedObject(O);
    P = toPrimitive(P, true);
    if (ie8DomDefine) try {
      return nativeGetOwnPropertyDescriptor$2(O, P);
    } catch (error) { /* empty */ }
    if (has$2(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
  };

  var objectGetOwnPropertyDescriptor = {
  	f: f$6
  };

  var anObject = function (it) {
    if (!isObject$1(it)) {
      throw TypeError(String(it) + ' is not an object');
    } return it;
  };

  var nativeDefineProperty$1 = Object.defineProperty;

  // `Object.defineProperty` method
  // https://tc39.es/ecma262/#sec-object.defineproperty
  var f$5 = descriptors ? nativeDefineProperty$1 : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (ie8DomDefine) try {
      return nativeDefineProperty$1(O, P, Attributes);
    } catch (error) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var objectDefineProperty = {
  	f: f$5
  };

  var createNonEnumerableProperty = descriptors ? function (object, key, value) {
    return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var setGlobal = function (key, value) {
    try {
      createNonEnumerableProperty(global$1, key, value);
    } catch (error) {
      global$1[key] = value;
    } return value;
  };

  var SHARED = '__core-js_shared__';
  var store$1 = global$1[SHARED] || setGlobal(SHARED, {});

  var sharedStore = store$1;

  var functionToString = Function.toString;

  // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
  if (typeof sharedStore.inspectSource != 'function') {
    sharedStore.inspectSource = function (it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap$1 = global$1.WeakMap;

  var nativeWeakMap = typeof WeakMap$1 === 'function' && /native code/.test(inspectSource(WeakMap$1));

  var shared = createCommonjsModule(function (module) {
  (module.exports = function (key, value) {
    return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: '3.9.1',
    mode: 'global',
    copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
  });
  });

  var id = 0;
  var postfix = Math.random();

  var uid = function (key) {
    return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
  };

  var keys$2 = shared('keys');

  var sharedKey = function (key) {
    return keys$2[key] || (keys$2[key] = uid(key));
  };

  var hiddenKeys$1 = {};

  var WeakMap = global$1.WeakMap;
  var set$3, get$1, has$1;

  var enforce = function (it) {
    return has$1(it) ? get$1(it) : set$3(it, {});
  };

  var getterFor = function (TYPE) {
    return function (it) {
      var state;
      if (!isObject$1(it) || (state = get$1(it)).type !== TYPE) {
        throw TypeError('Incompatible receiver, ' + TYPE + ' required');
      } return state;
    };
  };

  if (nativeWeakMap) {
    var store = sharedStore.state || (sharedStore.state = new WeakMap());
    var wmget = store.get;
    var wmhas = store.has;
    var wmset = store.set;
    set$3 = function (it, metadata) {
      metadata.facade = it;
      wmset.call(store, it, metadata);
      return metadata;
    };
    get$1 = function (it) {
      return wmget.call(store, it) || {};
    };
    has$1 = function (it) {
      return wmhas.call(store, it);
    };
  } else {
    var STATE = sharedKey('state');
    hiddenKeys$1[STATE] = true;
    set$3 = function (it, metadata) {
      metadata.facade = it;
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };
    get$1 = function (it) {
      return has$2(it, STATE) ? it[STATE] : {};
    };
    has$1 = function (it) {
      return has$2(it, STATE);
    };
  }

  var internalState = {
    set: set$3,
    get: get$1,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function (module) {
  var getInternalState = internalState.get;
  var enforceInternalState = internalState.enforce;
  var TEMPLATE = String(String).split('String');

  (module.exports = function (O, key, value, options) {
    var unsafe = options ? !!options.unsafe : false;
    var simple = options ? !!options.enumerable : false;
    var noTargetGet = options ? !!options.noTargetGet : false;
    var state;
    if (typeof value == 'function') {
      if (typeof key == 'string' && !has$2(value, 'name')) {
        createNonEnumerableProperty(value, 'name', key);
      }
      state = enforceInternalState(value);
      if (!state.source) {
        state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
      }
    }
    if (O === global$1) {
      if (simple) O[key] = value;
      else setGlobal(key, value);
      return;
    } else if (!unsafe) {
      delete O[key];
    } else if (!noTargetGet && O[key]) {
      simple = true;
    }
    if (simple) O[key] = value;
    else createNonEnumerableProperty(O, key, value);
  // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
  })(Function.prototype, 'toString', function toString() {
    return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
  });
  });

  var path$1 = global$1;

  var aFunction$1 = function (variable) {
    return typeof variable == 'function' ? variable : undefined;
  };

  var getBuiltIn = function (namespace, method) {
    return arguments.length < 2 ? aFunction$1(path$1[namespace]) || aFunction$1(global$1[namespace])
      : path$1[namespace] && path$1[namespace][method] || global$1[namespace] && global$1[namespace][method];
  };

  var ceil = Math.ceil;
  var floor$4 = Math.floor;

  // `ToInteger` abstract operation
  // https://tc39.es/ecma262/#sec-tointeger
  var toInteger = function (argument) {
    return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor$4 : ceil)(argument);
  };

  var min$7 = Math.min;

  // `ToLength` abstract operation
  // https://tc39.es/ecma262/#sec-tolength
  var toLength = function (argument) {
    return argument > 0 ? min$7(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max$3 = Math.max;
  var min$6 = Math.min;

  // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
  var toAbsoluteIndex = function (index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max$3(integer + length, 0) : min$6(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation
  var createMethod$4 = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare -- NaN check
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare -- NaN check
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) {
        if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.es/ecma262/#sec-array.prototype.includes
    includes: createMethod$4(true),
    // `Array.prototype.indexOf` method
    // https://tc39.es/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod$4(false)
  };

  var indexOf = arrayIncludes.indexOf;


  var objectKeysInternal = function (object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) !has$2(hiddenKeys$1, key) && has$2(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (has$2(O, key = names[i++])) {
      ~indexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = [
    'constructor',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'toLocaleString',
    'toString',
    'valueOf'
  ];

  var hiddenKeys = enumBugKeys.concat('length', 'prototype');

  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return objectKeysInternal(O, hiddenKeys);
  };

  var objectGetOwnPropertyNames = {
  	f: f$4
  };

  var f$3 = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols = {
  	f: f$3
  };

  // all object keys, includes non-enumerable and symbols
  var ownKeys$6 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
    var keys = objectGetOwnPropertyNames.f(anObject(it));
    var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
    return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
  };

  var copyConstructorProperties = function (target, source) {
    var keys = ownKeys$6(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has$2(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function (feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL ? true
      : value == NATIVE ? false
      : typeof detection == 'function' ? fails(detection)
      : !!detection;
  };

  var normalize = isForced.normalize = function (string) {
    return String(string).replace(replacement, '.').toLowerCase();
  };

  var data = isForced.data = {};
  var NATIVE = isForced.NATIVE = 'N';
  var POLYFILL = isForced.POLYFILL = 'P';

  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;






  /*
    options.target      - name of the target object
    options.global      - target is the global object
    options.stat        - export as static methods of target
    options.proto       - export as prototype methods of target
    options.real        - real prototype method for the `pure` version
    options.forced      - export even if the native feature is available
    options.bind        - bind methods to the target, required for the `pure` version
    options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
    options.unsafe      - use the simple assignment of property instead of delete + defineProperty
    options.sham        - add a flag to not completely full polyfills
    options.enumerable  - export as enumerable property
    options.noTargetGet - prevent calling a getter on target
  */
  var _export = function (options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;
    if (GLOBAL) {
      target = global$1;
    } else if (STATIC) {
      target = global$1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global$1[TARGET] || {}).prototype;
    }
    if (target) for (key in source) {
      sourceProperty = source[key];
      if (options.noTargetGet) {
        descriptor = getOwnPropertyDescriptor$2(target, key);
        targetProperty = descriptor && descriptor.value;
      } else targetProperty = target[key];
      FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
      // contained in target
      if (!FORCED && targetProperty !== undefined) {
        if (typeof sourceProperty === typeof targetProperty) continue;
        copyConstructorProperties(sourceProperty, targetProperty);
      }
      // add a flag to not completely full polyfills
      if (options.sham || (targetProperty && targetProperty.sham)) {
        createNonEnumerableProperty(sourceProperty, 'sham', true);
      }
      // extend global
      redefine(target, key, sourceProperty, options);
    }
  };

  var engineIsNode = classofRaw(global$1.process) == 'process';

  var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

  var process$3 = global$1.process;
  var versions = process$3 && process$3.versions;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split('.');
    version = match[0] + match[1];
  } else if (engineUserAgent) {
    match = engineUserAgent.match(/Edge\/(\d+)/);
    if (!match || match[1] >= 74) {
      match = engineUserAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    }
  }

  var engineV8Version = version && +version;

  var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
    /* global Symbol -- required for testing */
    return !Symbol.sham &&
      // Chrome 38 Symbol has incorrect toString conversion
      // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
      (engineIsNode ? engineV8Version === 38 : engineV8Version > 37 && engineV8Version < 41);
  });

  var useSymbolAsUid = nativeSymbol
    /* global Symbol -- safe */
    && !Symbol.sham
    && typeof Symbol.iterator == 'symbol';

  var WellKnownSymbolsStore$1 = shared('wks');
  var Symbol$1 = global$1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

  var wellKnownSymbol = function (name) {
    if (!has$2(WellKnownSymbolsStore$1, name) || !(nativeSymbol || typeof WellKnownSymbolsStore$1[name] == 'string')) {
      if (nativeSymbol && has$2(Symbol$1, name)) {
        WellKnownSymbolsStore$1[name] = Symbol$1[name];
      } else {
        WellKnownSymbolsStore$1[name] = createWellKnownSymbol('Symbol.' + name);
      }
    } return WellKnownSymbolsStore$1[name];
  };

  var MATCH$2 = wellKnownSymbol('match');

  // `IsRegExp` abstract operation
  // https://tc39.es/ecma262/#sec-isregexp
  var isRegexp = function (it) {
    var isRegExp;
    return isObject$1(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
  };

  var notARegexp = function (it) {
    if (isRegexp(it)) {
      throw TypeError("The method doesn't accept regular expressions");
    } return it;
  };

  var MATCH$1 = wellKnownSymbol('match');

  var correctIsRegexpLogic = function (METHOD_NAME) {
    var regexp = /./;
    try {
      '/./'[METHOD_NAME](regexp);
    } catch (error1) {
      try {
        regexp[MATCH$1] = false;
        return '/./'[METHOD_NAME](regexp);
      } catch (error2) { /* empty */ }
    } return false;
  };

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






  var nativeStartsWith = ''.startsWith;
  var min$5 = Math.min;

  var CORRECT_IS_REGEXP_LOGIC = correctIsRegexpLogic('startsWith');
  // https://github.com/zloirock/core-js/pull/702
  var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
    var descriptor = getOwnPropertyDescriptor$1(String.prototype, 'startsWith');
    return descriptor && !descriptor.writable;
  }();

  // `String.prototype.startsWith` method
  // https://tc39.es/ecma262/#sec-string.prototype.startswith
  _export({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
    startsWith: function startsWith(searchString /* , position = 0 */) {
      var that = String(requireObjectCoercible(this));
      notARegexp(searchString);
      var index = toLength(min$5(arguments.length > 1 ? arguments[1] : undefined, that.length));
      var search = String(searchString);
      return nativeStartsWith
        ? nativeStartsWith.call(that, search, index)
        : that.slice(index, index + search.length) === search;
    }
  });

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  var domIterables = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };

  var aFunction = function (it) {
    if (typeof it != 'function') {
      throw TypeError(String(it) + ' is not a function');
    } return it;
  };

  // optional / simple context binding
  var functionBindContext = function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 0: return function () {
        return fn.call(that);
      };
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  // `ToObject` abstract operation
  // https://tc39.es/ecma262/#sec-toobject
  var toObject = function (argument) {
    return Object(requireObjectCoercible(argument));
  };

  // `IsArray` abstract operation
  // https://tc39.es/ecma262/#sec-isarray
  var isArray = Array.isArray || function isArray(arg) {
    return classofRaw(arg) == 'Array';
  };

  var SPECIES$6 = wellKnownSymbol('species');

  // `ArraySpeciesCreate` abstract operation
  // https://tc39.es/ecma262/#sec-arrayspeciescreate
  var arraySpeciesCreate = function (originalArray, length) {
    var C;
    if (isArray(originalArray)) {
      C = originalArray.constructor;
      // cross-realm fallback
      if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
      else if (isObject$1(C)) {
        C = C[SPECIES$6];
        if (C === null) C = undefined;
      }
    } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var push = [].push;

  // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
  var createMethod$3 = function (TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var IS_FILTER_OUT = TYPE == 7;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function ($this, callbackfn, that, specificCreate) {
      var O = toObject($this);
      var self = indexedObject(O);
      var boundFunction = functionBindContext(callbackfn, that, 3);
      var length = toLength(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate;
      var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
      var value, result;
      for (;length > index; index++) if (NO_HOLES || index in self) {
        value = self[index];
        result = boundFunction(value, index, O);
        if (TYPE) {
          if (IS_MAP) target[index] = result; // map
          else if (result) switch (TYPE) {
            case 3: return true;              // some
            case 5: return value;             // find
            case 6: return index;             // findIndex
            case 2: push.call(target, value); // filter
          } else switch (TYPE) {
            case 4: return false;             // every
            case 7: push.call(target, value); // filterOut
          }
        }
      }
      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.es/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$3(0),
    // `Array.prototype.map` method
    // https://tc39.es/ecma262/#sec-array.prototype.map
    map: createMethod$3(1),
    // `Array.prototype.filter` method
    // https://tc39.es/ecma262/#sec-array.prototype.filter
    filter: createMethod$3(2),
    // `Array.prototype.some` method
    // https://tc39.es/ecma262/#sec-array.prototype.some
    some: createMethod$3(3),
    // `Array.prototype.every` method
    // https://tc39.es/ecma262/#sec-array.prototype.every
    every: createMethod$3(4),
    // `Array.prototype.find` method
    // https://tc39.es/ecma262/#sec-array.prototype.find
    find: createMethod$3(5),
    // `Array.prototype.findIndex` method
    // https://tc39.es/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$3(6),
    // `Array.prototype.filterOut` method
    // https://github.com/tc39/proposal-array-filtering
    filterOut: createMethod$3(7)
  };

  var arrayMethodIsStrict = function (METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return !!method && fails(function () {
      // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
      method.call(null, argument || function () { throw 1; }, 1);
    });
  };

  var $forEach$2 = arrayIteration.forEach;


  var STRICT_METHOD$3 = arrayMethodIsStrict('forEach');

  // `Array.prototype.forEach` method implementation
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
    return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  } : [].forEach;

  for (var COLLECTION_NAME$1 in domIterables) {
    var Collection$1 = global$1[COLLECTION_NAME$1];
    var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype$1 && CollectionPrototype$1.forEach !== arrayForEach) try {
      createNonEnumerableProperty(CollectionPrototype$1, 'forEach', arrayForEach);
    } catch (error) {
      CollectionPrototype$1.forEach = arrayForEach;
    }
  }

  var defineProperty$7 = objectDefineProperty.f;

  var FunctionPrototype = Function.prototype;
  var FunctionPrototypeToString = FunctionPrototype.toString;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME$1 = 'name';

  // Function instances `.name` property
  // https://tc39.es/ecma262/#sec-function-instances-name
  if (descriptors && !(NAME$1 in FunctionPrototype)) {
    defineProperty$7(FunctionPrototype, NAME$1, {
      configurable: true,
      get: function () {
        try {
          return FunctionPrototypeToString.call(this).match(nameRE)[1];
        } catch (error) {
          return '';
        }
      }
    });
  }

  var createProperty = function (object, key, value) {
    var propertyKey = toPrimitive(key);
    if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
    else object[propertyKey] = value;
  };

  var SPECIES$5 = wellKnownSymbol('species');

  var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return engineV8Version >= 51 || !fails(function () {
      var array = [];
      var constructor = array.constructor = {};
      constructor[SPECIES$5] = function () {
        return { foo: 1 };
      };
      return array[METHOD_NAME](Boolean).foo !== 1;
    });
  };

  var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
  var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/679
  var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
    var array = [];
    array[IS_CONCAT_SPREADABLE] = false;
    return array.concat()[0] !== array;
  });

  var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

  var isConcatSpreadable = function (O) {
    if (!isObject$1(O)) return false;
    var spreadable = O[IS_CONCAT_SPREADABLE];
    return spreadable !== undefined ? !!spreadable : isArray(O);
  };

  var FORCED$a = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

  // `Array.prototype.concat` method
  // https://tc39.es/ecma262/#sec-array.prototype.concat
  // with adding support of @@isConcatSpreadable and @@species
  _export({ target: 'Array', proto: true, forced: FORCED$a }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    concat: function concat(arg) {
      var O = toObject(this);
      var A = arraySpeciesCreate(O, 0);
      var n = 0;
      var i, k, length, len, E;
      for (i = -1, length = arguments.length; i < length; i++) {
        E = i === -1 ? O : arguments[i];
        if (isConcatSpreadable(E)) {
          len = toLength(E.length);
          if (n + len > MAX_SAFE_INTEGER$1) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
        } else {
          if (n >= MAX_SAFE_INTEGER$1) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
          createProperty(A, n++, E);
        }
      }
      A.length = n;
      return A;
    }
  });

  // `Object.keys` method
  // https://tc39.es/ecma262/#sec-object.keys
  var objectKeys = Object.keys || function keys(O) {
    return objectKeysInternal(O, enumBugKeys);
  };

  var FAILS_ON_PRIMITIVES$2 = fails(function () { objectKeys(1); });

  // `Object.keys` method
  // https://tc39.es/ecma262/#sec-object.keys
  _export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
    keys: function keys(it) {
      return objectKeys(toObject(it));
    }
  });

  // `Object.defineProperties` method
  // https://tc39.es/ecma262/#sec-object.defineproperties
  var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = objectKeys(Properties);
    var length = keys.length;
    var index = 0;
    var key;
    while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
    return O;
  };

  var html = getBuiltIn('document', 'documentElement');

  var GT = '>';
  var LT = '<';
  var PROTOTYPE$2 = 'prototype';
  var SCRIPT = 'script';
  var IE_PROTO$1 = sharedKey('IE_PROTO');

  var EmptyConstructor = function () { /* empty */ };

  var scriptTag = function (content) {
    return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
  };

  // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
  var NullProtoObjectViaActiveX = function (activeXDocument) {
    activeXDocument.write(scriptTag(''));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak
    return temp;
  };

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var NullProtoObjectViaIFrame = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement('iframe');
    var JS = 'java' + SCRIPT + ':';
    var iframeDocument;
    iframe.style.display = 'none';
    html.appendChild(iframe);
    // https://github.com/zloirock/core-js/issues/475
    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag('document.F=Object'));
    iframeDocument.close();
    return iframeDocument.F;
  };

  // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug
  var activeXDocument;
  var NullProtoObject = function () {
    try {
      /* global ActiveXObject -- old IE */
      activeXDocument = document.domain && new ActiveXObject('htmlfile');
    } catch (error) { /* ignore */ }
    NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
    var length = enumBugKeys.length;
    while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
    return NullProtoObject();
  };

  hiddenKeys$1[IE_PROTO$1] = true;

  // `Object.create` method
  // https://tc39.es/ecma262/#sec-object.create
  var objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      EmptyConstructor[PROTOTYPE$2] = anObject(O);
      result = new EmptyConstructor();
      EmptyConstructor[PROTOTYPE$2] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = NullProtoObject();
    return Properties === undefined ? result : objectDefineProperties(result, Properties);
  };

  var nativeGetOwnPropertyNames$1 = objectGetOwnPropertyNames.f;

  var toString$1 = {}.toString;

  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
    ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return nativeGetOwnPropertyNames$1(it);
    } catch (error) {
      return windowNames.slice();
    }
  };

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
  var f$2 = function getOwnPropertyNames(it) {
    return windowNames && toString$1.call(it) == '[object Window]'
      ? getWindowNames(it)
      : nativeGetOwnPropertyNames$1(toIndexedObject(it));
  };

  var objectGetOwnPropertyNamesExternal = {
  	f: f$2
  };

  var f$1 = wellKnownSymbol;

  var wellKnownSymbolWrapped = {
  	f: f$1
  };

  var defineProperty$6 = objectDefineProperty.f;

  var defineWellKnownSymbol = function (NAME) {
    var Symbol = path$1.Symbol || (path$1.Symbol = {});
    if (!has$2(Symbol, NAME)) defineProperty$6(Symbol, NAME, {
      value: wellKnownSymbolWrapped.f(NAME)
    });
  };

  var defineProperty$5 = objectDefineProperty.f;



  var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');

  var setToStringTag = function (it, TAG, STATIC) {
    if (it && !has$2(it = STATIC ? it : it.prototype, TO_STRING_TAG$4)) {
      defineProperty$5(it, TO_STRING_TAG$4, { configurable: true, value: TAG });
    }
  };

  var $forEach$1 = arrayIteration.forEach;

  var HIDDEN = sharedKey('hidden');
  var SYMBOL = 'Symbol';
  var PROTOTYPE$1 = 'prototype';
  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
  var setInternalState$6 = internalState.set;
  var getInternalState$4 = internalState.getterFor(SYMBOL);
  var ObjectPrototype$3 = Object[PROTOTYPE$1];
  var $Symbol = global$1.Symbol;
  var $stringify = getBuiltIn('JSON', 'stringify');
  var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
  var nativeDefineProperty = objectDefineProperty.f;
  var nativeGetOwnPropertyNames = objectGetOwnPropertyNamesExternal.f;
  var nativePropertyIsEnumerable = objectPropertyIsEnumerable.f;
  var AllSymbols = shared('symbols');
  var ObjectPrototypeSymbols = shared('op-symbols');
  var StringToSymbolRegistry = shared('string-to-symbol-registry');
  var SymbolToStringRegistry = shared('symbol-to-string-registry');
  var WellKnownSymbolsStore = shared('wks');
  var QObject = global$1.QObject;
  // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
  var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
  var setSymbolDescriptor = descriptors && fails(function () {
    return objectCreate(nativeDefineProperty({}, 'a', {
      get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
    })).a != 7;
  }) ? function (O, P, Attributes) {
    var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype$3, P);
    if (ObjectPrototypeDescriptor) delete ObjectPrototype$3[P];
    nativeDefineProperty(O, P, Attributes);
    if (ObjectPrototypeDescriptor && O !== ObjectPrototype$3) {
      nativeDefineProperty(ObjectPrototype$3, P, ObjectPrototypeDescriptor);
    }
  } : nativeDefineProperty;

  var wrap = function (tag, description) {
    var symbol = AllSymbols[tag] = objectCreate($Symbol[PROTOTYPE$1]);
    setInternalState$6(symbol, {
      type: SYMBOL,
      tag: tag,
      description: description
    });
    if (!descriptors) symbol.description = description;
    return symbol;
  };

  var isSymbol = useSymbolAsUid ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return Object(it) instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(O, P, Attributes) {
    if (O === ObjectPrototype$3) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
    anObject(O);
    var key = toPrimitive(P, true);
    anObject(Attributes);
    if (has$2(AllSymbols, key)) {
      if (!Attributes.enumerable) {
        if (!has$2(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, {}));
        O[HIDDEN][key] = true;
      } else {
        if (has$2(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
        Attributes = objectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
      } return setSymbolDescriptor(O, key, Attributes);
    } return nativeDefineProperty(O, key, Attributes);
  };

  var $defineProperties = function defineProperties(O, Properties) {
    anObject(O);
    var properties = toIndexedObject(Properties);
    var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
    $forEach$1(keys, function (key) {
      if (!descriptors || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
    });
    return O;
  };

  var $create = function create(O, Properties) {
    return Properties === undefined ? objectCreate(O) : $defineProperties(objectCreate(O), Properties);
  };

  var $propertyIsEnumerable = function propertyIsEnumerable(V) {
    var P = toPrimitive(V, true);
    var enumerable = nativePropertyIsEnumerable.call(this, P);
    if (this === ObjectPrototype$3 && has$2(AllSymbols, P) && !has$2(ObjectPrototypeSymbols, P)) return false;
    return enumerable || !has$2(this, P) || !has$2(AllSymbols, P) || has$2(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
  };

  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
    var it = toIndexedObject(O);
    var key = toPrimitive(P, true);
    if (it === ObjectPrototype$3 && has$2(AllSymbols, key) && !has$2(ObjectPrototypeSymbols, key)) return;
    var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
    if (descriptor && has$2(AllSymbols, key) && !(has$2(it, HIDDEN) && it[HIDDEN][key])) {
      descriptor.enumerable = true;
    }
    return descriptor;
  };

  var $getOwnPropertyNames = function getOwnPropertyNames(O) {
    var names = nativeGetOwnPropertyNames(toIndexedObject(O));
    var result = [];
    $forEach$1(names, function (key) {
      if (!has$2(AllSymbols, key) && !has$2(hiddenKeys$1, key)) result.push(key);
    });
    return result;
  };

  var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
    var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$3;
    var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
    var result = [];
    $forEach$1(names, function (key) {
      if (has$2(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has$2(ObjectPrototype$3, key))) {
        result.push(AllSymbols[key]);
      }
    });
    return result;
  };

  // `Symbol` constructor
  // https://tc39.es/ecma262/#sec-symbol-constructor
  if (!nativeSymbol) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
      var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
      var tag = uid(description);
      var setter = function (value) {
        if (this === ObjectPrototype$3) setter.call(ObjectPrototypeSymbols, value);
        if (has$2(this, HIDDEN) && has$2(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDescriptor(this, tag, createPropertyDescriptor(1, value));
      };
      if (descriptors && USE_SETTER) setSymbolDescriptor(ObjectPrototype$3, tag, { configurable: true, set: setter });
      return wrap(tag, description);
    };

    redefine($Symbol[PROTOTYPE$1], 'toString', function toString() {
      return getInternalState$4(this).tag;
    });

    redefine($Symbol, 'withoutSetter', function (description) {
      return wrap(uid(description), description);
    });

    objectPropertyIsEnumerable.f = $propertyIsEnumerable;
    objectDefineProperty.f = $defineProperty;
    objectGetOwnPropertyDescriptor.f = $getOwnPropertyDescriptor;
    objectGetOwnPropertyNames.f = objectGetOwnPropertyNamesExternal.f = $getOwnPropertyNames;
    objectGetOwnPropertySymbols.f = $getOwnPropertySymbols;

    wellKnownSymbolWrapped.f = function (name) {
      return wrap(wellKnownSymbol(name), name);
    };

    if (descriptors) {
      // https://github.com/tc39/proposal-Symbol-description
      nativeDefineProperty($Symbol[PROTOTYPE$1], 'description', {
        configurable: true,
        get: function description() {
          return getInternalState$4(this).description;
        }
      });
      {
        redefine(ObjectPrototype$3, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
      }
    }
  }

  _export({ global: true, wrap: true, forced: !nativeSymbol, sham: !nativeSymbol }, {
    Symbol: $Symbol
  });

  $forEach$1(objectKeys(WellKnownSymbolsStore), function (name) {
    defineWellKnownSymbol(name);
  });

  _export({ target: SYMBOL, stat: true, forced: !nativeSymbol }, {
    // `Symbol.for` method
    // https://tc39.es/ecma262/#sec-symbol.for
    'for': function (key) {
      var string = String(key);
      if (has$2(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
      var symbol = $Symbol(string);
      StringToSymbolRegistry[string] = symbol;
      SymbolToStringRegistry[symbol] = string;
      return symbol;
    },
    // `Symbol.keyFor` method
    // https://tc39.es/ecma262/#sec-symbol.keyfor
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
      if (has$2(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
    },
    useSetter: function () { USE_SETTER = true; },
    useSimple: function () { USE_SETTER = false; }
  });

  _export({ target: 'Object', stat: true, forced: !nativeSymbol, sham: !descriptors }, {
    // `Object.create` method
    // https://tc39.es/ecma262/#sec-object.create
    create: $create,
    // `Object.defineProperty` method
    // https://tc39.es/ecma262/#sec-object.defineproperty
    defineProperty: $defineProperty,
    // `Object.defineProperties` method
    // https://tc39.es/ecma262/#sec-object.defineproperties
    defineProperties: $defineProperties,
    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor
  });

  _export({ target: 'Object', stat: true, forced: !nativeSymbol }, {
    // `Object.getOwnPropertyNames` method
    // https://tc39.es/ecma262/#sec-object.getownpropertynames
    getOwnPropertyNames: $getOwnPropertyNames,
    // `Object.getOwnPropertySymbols` method
    // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
    getOwnPropertySymbols: $getOwnPropertySymbols
  });

  // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443
  _export({ target: 'Object', stat: true, forced: fails(function () { objectGetOwnPropertySymbols.f(1); }) }, {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return objectGetOwnPropertySymbols.f(toObject(it));
    }
  });

  // `JSON.stringify` method behavior with symbols
  // https://tc39.es/ecma262/#sec-json.stringify
  if ($stringify) {
    var FORCED_JSON_STRINGIFY = !nativeSymbol || fails(function () {
      var symbol = $Symbol();
      // MS Edge converts symbol values to JSON as {}
      return $stringify([symbol]) != '[null]'
        // WebKit converts symbol values to JSON as null
        || $stringify({ a: symbol }) != '{}'
        // V8 throws on boxed symbols
        || $stringify(Object(symbol)) != '{}';
    });

    _export({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
      // eslint-disable-next-line no-unused-vars -- required for `.length`
      stringify: function stringify(it, replacer, space) {
        var args = [it];
        var index = 1;
        var $replacer;
        while (arguments.length > index) args.push(arguments[index++]);
        $replacer = replacer;
        if (!isObject$1(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
        if (!isArray(replacer)) replacer = function (key, value) {
          if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
          if (!isSymbol(value)) return value;
        };
        args[1] = replacer;
        return $stringify.apply(null, args);
      }
    });
  }

  // `Symbol.prototype[@@toPrimitive]` method
  // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
  if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
    createNonEnumerableProperty($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
  }
  // `Symbol.prototype[@@toStringTag]` property
  // https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
  setToStringTag($Symbol, SYMBOL);

  hiddenKeys$1[HIDDEN] = true;

  var $filter$1 = arrayIteration.filter;


  var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport('filter');

  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  // with adding support of @@species
  _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
    filter: function filter(callbackfn /* , thisArg */) {
      return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;


  var FAILS_ON_PRIMITIVES$1 = fails(function () { nativeGetOwnPropertyDescriptor(1); });
  var FORCED$9 = !descriptors || FAILS_ON_PRIMITIVES$1;

  // `Object.getOwnPropertyDescriptor` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
  _export({ target: 'Object', stat: true, forced: FORCED$9, sham: !descriptors }, {
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
      return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
    }
  });

  // `Object.getOwnPropertyDescriptors` method
  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
  _export({ target: 'Object', stat: true, sham: !descriptors }, {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = toIndexedObject(object);
      var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
      var keys = ownKeys$6(O);
      var result = {};
      var index = 0;
      var key, descriptor;
      while (keys.length > index) {
        descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
        if (descriptor !== undefined) createProperty(result, key, descriptor);
      }
      return result;
    }
  });

  function _arrayLikeToArray$2(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$2(arr);
  }

  var defineProperty$4 = objectDefineProperty.f;


  var NativeSymbol = global$1.Symbol;

  if (descriptors && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
    // Safari 12 bug
    NativeSymbol().description !== undefined
  )) {
    var EmptyStringDescriptionStore = {};
    // wrap Symbol constructor for correct work with undefined description
    var SymbolWrapper = function Symbol() {
      var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
      var result = this instanceof SymbolWrapper
        ? new NativeSymbol(description)
        // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
        : description === undefined ? NativeSymbol() : NativeSymbol(description);
      if (description === '') EmptyStringDescriptionStore[result] = true;
      return result;
    };
    copyConstructorProperties(SymbolWrapper, NativeSymbol);
    var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
    symbolPrototype.constructor = SymbolWrapper;

    var symbolToString = symbolPrototype.toString;
    var native = String(NativeSymbol('test')) == 'Symbol(test)';
    var regexp = /^Symbol\((.*)\)[^)]+$/;
    defineProperty$4(symbolPrototype, 'description', {
      configurable: true,
      get: function description() {
        var symbol = isObject$1(this) ? this.valueOf() : this;
        var string = symbolToString.call(symbol);
        if (has$2(EmptyStringDescriptionStore, symbol)) return '';
        var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
        return desc === '' ? undefined : desc;
      }
    });

    _export({ global: true, forced: true }, {
      Symbol: SymbolWrapper
    });
  }

  var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
  var test = {};

  test[TO_STRING_TAG$3] = 'z';

  var toStringTagSupport = String(test) === '[object z]';

  var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
  // ES3 wrong here
  var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (error) { /* empty */ }
  };

  // getting tag from ES6+ `Object.prototype.toString`
  var classof = toStringTagSupport ? classofRaw : function (it) {
    var O, tag, result;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
      // builtinTag case
      : CORRECT_ARGUMENTS ? classofRaw(O)
      // ES3 arguments fallback
      : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
  };

  // `Object.prototype.toString` method implementation
  // https://tc39.es/ecma262/#sec-object.prototype.tostring
  var objectToString = toStringTagSupport ? {}.toString : function toString() {
    return '[object ' + classof(this) + ']';
  };

  // `Object.prototype.toString` method
  // https://tc39.es/ecma262/#sec-object.prototype.tostring
  if (!toStringTagSupport) {
    redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
  }

  // `Symbol.iterator` well-known symbol
  // https://tc39.es/ecma262/#sec-symbol.iterator
  defineWellKnownSymbol('iterator');

  // `String.prototype.{ codePointAt, at }` methods implementation
  var createMethod$2 = function (CONVERT_TO_STRING) {
    return function ($this, pos) {
      var S = String(requireObjectCoercible($this));
      var position = toInteger(pos);
      var size = S.length;
      var first, second;
      if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
      first = S.charCodeAt(position);
      return first < 0xD800 || first > 0xDBFF || position + 1 === size
        || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
          ? CONVERT_TO_STRING ? S.charAt(position) : first
          : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
    };
  };

  var stringMultibyte = {
    // `String.prototype.codePointAt` method
    // https://tc39.es/ecma262/#sec-string.prototype.codepointat
    codeAt: createMethod$2(false),
    // `String.prototype.at` method
    // https://github.com/mathiasbynens/String.prototype.at
    charAt: createMethod$2(true)
  };

  var correctPrototypeGetter = !fails(function () {
    function F() { /* empty */ }
    F.prototype.constructor = null;
    return Object.getPrototypeOf(new F()) !== F.prototype;
  });

  var IE_PROTO = sharedKey('IE_PROTO');
  var ObjectPrototype$2 = Object.prototype;

  // `Object.getPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.getprototypeof
  var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
    O = toObject(O);
    if (has$2(O, IE_PROTO)) return O[IE_PROTO];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectPrototype$2 : null;
  };

  var ITERATOR$6 = wellKnownSymbol('iterator');
  var BUGGY_SAFARI_ITERATORS$1 = false;

  var returnThis$2 = function () { return this; };

  // `%IteratorPrototype%` object
  // https://tc39.es/ecma262/#sec-%iteratorprototype%-object
  var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

  if ([].keys) {
    arrayIterator = [].keys();
    // Safari 8 has buggy iterators w/o `next`
    if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
    else {
      PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
      if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
    }
  }

  var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails(function () {
    var test = {};
    // FF44- legacy iterators case
    return IteratorPrototype$2[ITERATOR$6].call(test) !== test;
  });

  if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  if (!has$2(IteratorPrototype$2, ITERATOR$6)) {
    createNonEnumerableProperty(IteratorPrototype$2, ITERATOR$6, returnThis$2);
  }

  var iteratorsCore = {
    IteratorPrototype: IteratorPrototype$2,
    BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
  };

  var iterators = {};

  var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





  var returnThis$1 = function () { return this; };

  var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
    var TO_STRING_TAG = NAME + ' Iterator';
    IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
    setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
    iterators[TO_STRING_TAG] = returnThis$1;
    return IteratorConstructor;
  };

  var aPossiblePrototype = function (it) {
    if (!isObject$1(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + ' as a prototype');
    } return it;
  };

  /* eslint-disable no-proto -- safe */

  // `Object.setPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.
  var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
    var CORRECT_SETTER = false;
    var test = {};
    var setter;
    try {
      setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
      setter.call(test, []);
      CORRECT_SETTER = test instanceof Array;
    } catch (error) { /* empty */ }
    return function setPrototypeOf(O, proto) {
      anObject(O);
      aPossiblePrototype(proto);
      if (CORRECT_SETTER) setter.call(O, proto);
      else O.__proto__ = proto;
      return O;
    };
  }() : undefined);

  var IteratorPrototype = iteratorsCore.IteratorPrototype;
  var BUGGY_SAFARI_ITERATORS = iteratorsCore.BUGGY_SAFARI_ITERATORS;
  var ITERATOR$5 = wellKnownSymbol('iterator');
  var KEYS = 'keys';
  var VALUES = 'values';
  var ENTRIES = 'entries';

  var returnThis = function () { return this; };

  var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
    createIteratorConstructor(IteratorConstructor, NAME, next);

    var getIterationMethod = function (KIND) {
      if (KIND === DEFAULT && defaultIterator) return defaultIterator;
      if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
      switch (KIND) {
        case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
        case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
        case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
      } return function () { return new IteratorConstructor(this); };
    };

    var TO_STRING_TAG = NAME + ' Iterator';
    var INCORRECT_VALUES_NAME = false;
    var IterablePrototype = Iterable.prototype;
    var nativeIterator = IterablePrototype[ITERATOR$5]
      || IterablePrototype['@@iterator']
      || DEFAULT && IterablePrototype[DEFAULT];
    var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
    var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
    var CurrentIteratorPrototype, methods, KEY;

    // fix native
    if (anyNativeIterator) {
      CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
      if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
        if (objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
          if (objectSetPrototypeOf) {
            objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
          } else if (typeof CurrentIteratorPrototype[ITERATOR$5] != 'function') {
            createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$5, returnThis);
          }
        }
        // Set @@toStringTag to native iterators
        setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
      }
    }

    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return nativeIterator.call(this); };
    }

    // define iterator
    if (IterablePrototype[ITERATOR$5] !== defaultIterator) {
      createNonEnumerableProperty(IterablePrototype, ITERATOR$5, defaultIterator);
    }
    iterators[NAME] = defaultIterator;

    // export additional methods
    if (DEFAULT) {
      methods = {
        values: getIterationMethod(VALUES),
        keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
        entries: getIterationMethod(ENTRIES)
      };
      if (FORCED) for (KEY in methods) {
        if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
          redefine(IterablePrototype, KEY, methods[KEY]);
        }
      } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
    }

    return methods;
  };

  var charAt$1 = stringMultibyte.charAt;



  var STRING_ITERATOR = 'String Iterator';
  var setInternalState$5 = internalState.set;
  var getInternalState$3 = internalState.getterFor(STRING_ITERATOR);

  // `String.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-string.prototype-@@iterator
  defineIterator(String, 'String', function (iterated) {
    setInternalState$5(this, {
      type: STRING_ITERATOR,
      string: String(iterated),
      index: 0
    });
  // `%StringIteratorPrototype%.next` method
  // https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
  }, function next() {
    var state = getInternalState$3(this);
    var string = state.string;
    var index = state.index;
    var point;
    if (index >= string.length) return { value: undefined, done: true };
    point = charAt$1(string, index);
    state.index += point.length;
    return { value: point, done: false };
  });

  var UNSCOPABLES = wellKnownSymbol('unscopables');
  var ArrayPrototype$1 = Array.prototype;

  // Array.prototype[@@unscopables]
  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
    objectDefineProperty.f(ArrayPrototype$1, UNSCOPABLES, {
      configurable: true,
      value: objectCreate(null)
    });
  }

  // add a key to Array.prototype[@@unscopables]
  var addToUnscopables = function (key) {
    ArrayPrototype$1[UNSCOPABLES][key] = true;
  };

  var ARRAY_ITERATOR = 'Array Iterator';
  var setInternalState$4 = internalState.set;
  var getInternalState$2 = internalState.getterFor(ARRAY_ITERATOR);

  // `Array.prototype.entries` method
  // https://tc39.es/ecma262/#sec-array.prototype.entries
  // `Array.prototype.keys` method
  // https://tc39.es/ecma262/#sec-array.prototype.keys
  // `Array.prototype.values` method
  // https://tc39.es/ecma262/#sec-array.prototype.values
  // `Array.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-array.prototype-@@iterator
  // `CreateArrayIterator` internal method
  // https://tc39.es/ecma262/#sec-createarrayiterator
  var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
    setInternalState$4(this, {
      type: ARRAY_ITERATOR,
      target: toIndexedObject(iterated), // target
      index: 0,                          // next index
      kind: kind                         // kind
    });
  // `%ArrayIteratorPrototype%.next` method
  // https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
  }, function () {
    var state = getInternalState$2(this);
    var target = state.target;
    var kind = state.kind;
    var index = state.index++;
    if (!target || index >= target.length) {
      state.target = undefined;
      return { value: undefined, done: true };
    }
    if (kind == 'keys') return { value: index, done: false };
    if (kind == 'values') return { value: target[index], done: false };
    return { value: [index, target[index]], done: false };
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values%
  // https://tc39.es/ecma262/#sec-createunmappedargumentsobject
  // https://tc39.es/ecma262/#sec-createmappedargumentsobject
  iterators.Arguments = iterators.Array;

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');

  var ITERATOR$4 = wellKnownSymbol('iterator');
  var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
  var ArrayValues = es_array_iterator.values;

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global$1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype;
    if (CollectionPrototype) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[ITERATOR$4] !== ArrayValues) try {
        createNonEnumerableProperty(CollectionPrototype, ITERATOR$4, ArrayValues);
      } catch (error) {
        CollectionPrototype[ITERATOR$4] = ArrayValues;
      }
      if (!CollectionPrototype[TO_STRING_TAG$1]) {
        createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$1, COLLECTION_NAME);
      }
      if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
          createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
        } catch (error) {
          CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
        }
      }
    }
  }

  var iteratorClose = function (iterator) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) {
      return anObject(returnMethod.call(iterator)).value;
    }
  };

  // call something on iterator step with safe closing on error
  var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
    try {
      return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
    // 7.4.6 IteratorClose(iterator, completion)
    } catch (error) {
      iteratorClose(iterator);
      throw error;
    }
  };

  var ITERATOR$3 = wellKnownSymbol('iterator');
  var ArrayPrototype = Array.prototype;

  // check on default Array iterator
  var isArrayIteratorMethod = function (it) {
    return it !== undefined && (iterators.Array === it || ArrayPrototype[ITERATOR$3] === it);
  };

  var ITERATOR$2 = wellKnownSymbol('iterator');

  var getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$2]
      || it['@@iterator']
      || iterators[classof(it)];
  };

  // `Array.from` method implementation
  // https://tc39.es/ecma262/#sec-array.from
  var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var argumentsLength = arguments.length;
    var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iteratorMethod = getIteratorMethod(O);
    var index = 0;
    var length, result, step, iterator, next, value;
    if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
    // if the target is not iterable or it's an array with the default iterator - use a simple case
    if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
      iterator = iteratorMethod.call(O);
      next = iterator.next;
      result = new C();
      for (;!(step = next.call(iterator)).done; index++) {
        value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
        createProperty(result, index, value);
      }
    } else {
      length = toLength(O.length);
      result = new C(length);
      for (;length > index; index++) {
        value = mapping ? mapfn(O[index], index) : O[index];
        createProperty(result, index, value);
      }
    }
    result.length = index;
    return result;
  };

  var ITERATOR$1 = wellKnownSymbol('iterator');
  var SAFE_CLOSING = false;

  try {
    var called = 0;
    var iteratorWithReturn = {
      next: function () {
        return { done: !!called++ };
      },
      'return': function () {
        SAFE_CLOSING = true;
      }
    };
    iteratorWithReturn[ITERATOR$1] = function () {
      return this;
    };
    // eslint-disable-next-line no-throw-literal -- required for testing
    Array.from(iteratorWithReturn, function () { throw 2; });
  } catch (error) { /* empty */ }

  var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
    var ITERATION_SUPPORT = false;
    try {
      var object = {};
      object[ITERATOR$1] = function () {
        return {
          next: function () {
            return { done: ITERATION_SUPPORT = true };
          }
        };
      };
      exec(object);
    } catch (error) { /* empty */ }
    return ITERATION_SUPPORT;
  };

  var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration(function (iterable) {
    Array.from(iterable);
  });

  // `Array.from` method
  // https://tc39.es/ecma262/#sec-array.from
  _export({ target: 'Array', stat: true, forced: INCORRECT_ITERATION$1 }, {
    from: arrayFrom
  });

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('slice');

  var SPECIES$4 = wellKnownSymbol('species');
  var nativeSlice = [].slice;
  var max$2 = Math.max;

  // `Array.prototype.slice` method
  // https://tc39.es/ecma262/#sec-array.prototype.slice
  // fallback for not array-like ES3 strings and DOM objects
  _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
    slice: function slice(start, end) {
      var O = toIndexedObject(this);
      var length = toLength(O.length);
      var k = toAbsoluteIndex(start, length);
      var fin = toAbsoluteIndex(end === undefined ? length : end, length);
      // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
      var Constructor, result, n;
      if (isArray(O)) {
        Constructor = O.constructor;
        // cross-realm fallback
        if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
          Constructor = undefined;
        } else if (isObject$1(Constructor)) {
          Constructor = Constructor[SPECIES$4];
          if (Constructor === null) Constructor = undefined;
        }
        if (Constructor === Array || Constructor === undefined) {
          return nativeSlice.call(O, k, fin);
        }
      }
      result = new (Constructor === undefined ? Array : Constructor)(max$2(fin - k, 0));
      for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
      result.length = n;
      return result;
    }
  });

  function _unsupportedIterableToArray$2(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$2(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$2(o, minLen);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray$2(arr) || _nonIterableSpread();
  }

  var nativePromiseConstructor = global$1.Promise;

  var redefineAll = function (target, src, options) {
    for (var key in src) redefine(target, key, src[key], options);
    return target;
  };

  var SPECIES$3 = wellKnownSymbol('species');

  var setSpecies = function (CONSTRUCTOR_NAME) {
    var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
    var defineProperty = objectDefineProperty.f;

    if (descriptors && Constructor && !Constructor[SPECIES$3]) {
      defineProperty(Constructor, SPECIES$3, {
        configurable: true,
        get: function () { return this; }
      });
    }
  };

  var anInstance = function (it, Constructor, name) {
    if (!(it instanceof Constructor)) {
      throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
    } return it;
  };

  var Result = function (stopped, result) {
    this.stopped = stopped;
    this.result = result;
  };

  var iterate = function (iterable, unboundFunction, options) {
    var that = options && options.that;
    var AS_ENTRIES = !!(options && options.AS_ENTRIES);
    var IS_ITERATOR = !!(options && options.IS_ITERATOR);
    var INTERRUPTED = !!(options && options.INTERRUPTED);
    var fn = functionBindContext(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
    var iterator, iterFn, index, length, result, next, step;

    var stop = function (condition) {
      if (iterator) iteratorClose(iterator);
      return new Result(true, condition);
    };

    var callFn = function (value) {
      if (AS_ENTRIES) {
        anObject(value);
        return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
      } return INTERRUPTED ? fn(value, stop) : fn(value);
    };

    if (IS_ITERATOR) {
      iterator = iterable;
    } else {
      iterFn = getIteratorMethod(iterable);
      if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
      // optimisation for array iterators
      if (isArrayIteratorMethod(iterFn)) {
        for (index = 0, length = toLength(iterable.length); length > index; index++) {
          result = callFn(iterable[index]);
          if (result && result instanceof Result) return result;
        } return new Result(false);
      }
      iterator = iterFn.call(iterable);
    }

    next = iterator.next;
    while (!(step = next.call(iterator)).done) {
      try {
        result = callFn(step.value);
      } catch (error) {
        iteratorClose(iterator);
        throw error;
      }
      if (typeof result == 'object' && result && result instanceof Result) return result;
    } return new Result(false);
  };

  var SPECIES$2 = wellKnownSymbol('species');

  // `SpeciesConstructor` abstract operation
  // https://tc39.es/ecma262/#sec-speciesconstructor
  var speciesConstructor = function (O, defaultConstructor) {
    var C = anObject(O).constructor;
    var S;
    return C === undefined || (S = anObject(C)[SPECIES$2]) == undefined ? defaultConstructor : aFunction(S);
  };

  var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

  var location = global$1.location;
  var set$2 = global$1.setImmediate;
  var clear = global$1.clearImmediate;
  var process$2 = global$1.process;
  var MessageChannel = global$1.MessageChannel;
  var Dispatch = global$1.Dispatch;
  var counter = 0;
  var queue = {};
  var ONREADYSTATECHANGE = 'onreadystatechange';
  var defer, channel, port;

  var run = function (id) {
    // eslint-disable-next-line no-prototype-builtins -- safe
    if (queue.hasOwnProperty(id)) {
      var fn = queue[id];
      delete queue[id];
      fn();
    }
  };

  var runner = function (id) {
    return function () {
      run(id);
    };
  };

  var listener = function (event) {
    run(event.data);
  };

  var post = function (id) {
    // old engines have not location.origin
    global$1.postMessage(id + '', location.protocol + '//' + location.host);
  };

  // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
  if (!set$2 || !clear) {
    set$2 = function setImmediate(fn) {
      var args = [];
      var i = 1;
      while (arguments.length > i) args.push(arguments[i++]);
      queue[++counter] = function () {
        // eslint-disable-next-line no-new-func -- spec requirement
        (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
      };
      defer(counter);
      return counter;
    };
    clear = function clearImmediate(id) {
      delete queue[id];
    };
    // Node.js 0.8-
    if (engineIsNode) {
      defer = function (id) {
        process$2.nextTick(runner(id));
      };
    // Sphere (JS game engine) Dispatch API
    } else if (Dispatch && Dispatch.now) {
      defer = function (id) {
        Dispatch.now(runner(id));
      };
    // Browsers with MessageChannel, includes WebWorkers
    // except iOS - https://github.com/zloirock/core-js/issues/624
    } else if (MessageChannel && !engineIsIos) {
      channel = new MessageChannel();
      port = channel.port2;
      channel.port1.onmessage = listener;
      defer = functionBindContext(port.postMessage, port, 1);
    // Browsers with postMessage, skip WebWorkers
    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
    } else if (
      global$1.addEventListener &&
      typeof postMessage == 'function' &&
      !global$1.importScripts &&
      location && location.protocol !== 'file:' &&
      !fails(post)
    ) {
      defer = post;
      global$1.addEventListener('message', listener, false);
    // IE8-
    } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
      defer = function (id) {
        html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
          html.removeChild(this);
          run(id);
        };
      };
    // Rest old browsers
    } else {
      defer = function (id) {
        setTimeout(runner(id), 0);
      };
    }
  }

  var task$1 = {
    set: set$2,
    clear: clear
  };

  var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(engineUserAgent);

  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  var macrotask = task$1.set;




  var MutationObserver = global$1.MutationObserver || global$1.WebKitMutationObserver;
  var document$2 = global$1.document;
  var process$1 = global$1.process;
  var Promise$1 = global$1.Promise;
  // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
  var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global$1, 'queueMicrotask');
  var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

  var flush, head, last, notify$1, toggle, node, promise, then;

  // modern engines have queueMicrotask method
  if (!queueMicrotask) {
    flush = function () {
      var parent, fn;
      if (engineIsNode && (parent = process$1.domain)) parent.exit();
      while (head) {
        fn = head.fn;
        head = head.next;
        try {
          fn();
        } catch (error) {
          if (head) notify$1();
          else last = undefined;
          throw error;
        }
      } last = undefined;
      if (parent) parent.enter();
    };

    // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
    // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
    if (!engineIsIos && !engineIsNode && !engineIsWebosWebkit && MutationObserver && document$2) {
      toggle = true;
      node = document$2.createTextNode('');
      new MutationObserver(flush).observe(node, { characterData: true });
      notify$1 = function () {
        node.data = toggle = !toggle;
      };
    // environments with maybe non-completely correct, but existent Promise
    } else if (Promise$1 && Promise$1.resolve) {
      // Promise.resolve without an argument throws an error in LG WebOS 2
      promise = Promise$1.resolve(undefined);
      then = promise.then;
      notify$1 = function () {
        then.call(promise, flush);
      };
    // Node.js without promises
    } else if (engineIsNode) {
      notify$1 = function () {
        process$1.nextTick(flush);
      };
    // for other environments - macrotask based on:
    // - setImmediate
    // - MessageChannel
    // - window.postMessag
    // - onreadystatechange
    // - setTimeout
    } else {
      notify$1 = function () {
        // strange IE + webpack dev server bug - use .call(global)
        macrotask.call(global$1, flush);
      };
    }
  }

  var microtask = queueMicrotask || function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify$1();
    } last = task;
  };

  var PromiseCapability = function (C) {
    var resolve, reject;
    this.promise = new C(function ($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = aFunction(resolve);
    this.reject = aFunction(reject);
  };

  // 25.4.1.5 NewPromiseCapability(C)
  var f = function (C) {
    return new PromiseCapability(C);
  };

  var newPromiseCapability$1 = {
  	f: f
  };

  var promiseResolve = function (C, x) {
    anObject(C);
    if (isObject$1(x) && x.constructor === C) return x;
    var promiseCapability = newPromiseCapability$1.f(C);
    var resolve = promiseCapability.resolve;
    resolve(x);
    return promiseCapability.promise;
  };

  var hostReportErrors = function (a, b) {
    var console = global$1.console;
    if (console && console.error) {
      arguments.length === 1 ? console.error(a) : console.error(a, b);
    }
  };

  var perform = function (exec) {
    try {
      return { error: false, value: exec() };
    } catch (error) {
      return { error: true, value: error };
    }
  };

  var task = task$1.set;











  var SPECIES$1 = wellKnownSymbol('species');
  var PROMISE = 'Promise';
  var getInternalState$1 = internalState.get;
  var setInternalState$3 = internalState.set;
  var getInternalPromiseState = internalState.getterFor(PROMISE);
  var PromiseConstructor = nativePromiseConstructor;
  var TypeError$1 = global$1.TypeError;
  var document$1 = global$1.document;
  var process = global$1.process;
  var $fetch = getBuiltIn('fetch');
  var newPromiseCapability = newPromiseCapability$1.f;
  var newGenericPromiseCapability = newPromiseCapability;
  var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$1.dispatchEvent);
  var NATIVE_REJECTION_EVENT = typeof PromiseRejectionEvent == 'function';
  var UNHANDLED_REJECTION = 'unhandledrejection';
  var REJECTION_HANDLED = 'rejectionhandled';
  var PENDING = 0;
  var FULFILLED = 1;
  var REJECTED = 2;
  var HANDLED = 1;
  var UNHANDLED = 2;
  var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

  var FORCED$8 = isForced_1(PROMISE, function () {
    var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
    if (!GLOBAL_CORE_JS_PROMISE) {
      // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // We can't detect it synchronously, so just check versions
      if (engineV8Version === 66) return true;
      // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
      if (!engineIsNode && !NATIVE_REJECTION_EVENT) return true;
    }
    // We can't use @@species feature detection in V8 since it causes
    // deoptimization and performance degradation
    // https://github.com/zloirock/core-js/issues/679
    if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
    // Detect correctness of subclassing with @@species support
    var promise = PromiseConstructor.resolve(1);
    var FakePromise = function (exec) {
      exec(function () { /* empty */ }, function () { /* empty */ });
    };
    var constructor = promise.constructor = {};
    constructor[SPECIES$1] = FakePromise;
    return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
  });

  var INCORRECT_ITERATION = FORCED$8 || !checkCorrectnessOfIteration(function (iterable) {
    PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
  });

  // helpers
  var isThenable = function (it) {
    var then;
    return isObject$1(it) && typeof (then = it.then) == 'function' ? then : false;
  };

  var notify = function (state, isReject) {
    if (state.notified) return;
    state.notified = true;
    var chain = state.reactions;
    microtask(function () {
      var value = state.value;
      var ok = state.state == FULFILLED;
      var index = 0;
      // variable length - can't use forEach
      while (chain.length > index) {
        var reaction = chain[index++];
        var handler = ok ? reaction.ok : reaction.fail;
        var resolve = reaction.resolve;
        var reject = reaction.reject;
        var domain = reaction.domain;
        var result, then, exited;
        try {
          if (handler) {
            if (!ok) {
              if (state.rejection === UNHANDLED) onHandleUnhandled(state);
              state.rejection = HANDLED;
            }
            if (handler === true) result = value;
            else {
              if (domain) domain.enter();
              result = handler(value); // can throw
              if (domain) {
                domain.exit();
                exited = true;
              }
            }
            if (result === reaction.promise) {
              reject(TypeError$1('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else resolve(result);
          } else reject(value);
        } catch (error) {
          if (domain && !exited) domain.exit();
          reject(error);
        }
      }
      state.reactions = [];
      state.notified = false;
      if (isReject && !state.rejection) onUnhandled(state);
    });
  };

  var dispatchEvent = function (name, promise, reason) {
    var event, handler;
    if (DISPATCH_EVENT) {
      event = document$1.createEvent('Event');
      event.promise = promise;
      event.reason = reason;
      event.initEvent(name, false, true);
      global$1.dispatchEvent(event);
    } else event = { promise: promise, reason: reason };
    if (!NATIVE_REJECTION_EVENT && (handler = global$1['on' + name])) handler(event);
    else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
  };

  var onUnhandled = function (state) {
    task.call(global$1, function () {
      var promise = state.facade;
      var value = state.value;
      var IS_UNHANDLED = isUnhandled(state);
      var result;
      if (IS_UNHANDLED) {
        result = perform(function () {
          if (engineIsNode) {
            process.emit('unhandledRejection', value, promise);
          } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
        });
        // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
        state.rejection = engineIsNode || isUnhandled(state) ? UNHANDLED : HANDLED;
        if (result.error) throw result.value;
      }
    });
  };

  var isUnhandled = function (state) {
    return state.rejection !== HANDLED && !state.parent;
  };

  var onHandleUnhandled = function (state) {
    task.call(global$1, function () {
      var promise = state.facade;
      if (engineIsNode) {
        process.emit('rejectionHandled', promise);
      } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
    });
  };

  var bind = function (fn, state, unwrap) {
    return function (value) {
      fn(state, value, unwrap);
    };
  };

  var internalReject = function (state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;
    state.value = value;
    state.state = REJECTED;
    notify(state, true);
  };

  var internalResolve = function (state, value, unwrap) {
    if (state.done) return;
    state.done = true;
    if (unwrap) state = unwrap;
    try {
      if (state.facade === value) throw TypeError$1("Promise can't be resolved itself");
      var then = isThenable(value);
      if (then) {
        microtask(function () {
          var wrapper = { done: false };
          try {
            then.call(value,
              bind(internalResolve, wrapper, state),
              bind(internalReject, wrapper, state)
            );
          } catch (error) {
            internalReject(wrapper, error, state);
          }
        });
      } else {
        state.value = value;
        state.state = FULFILLED;
        notify(state, false);
      }
    } catch (error) {
      internalReject({ done: false }, error, state);
    }
  };

  // constructor polyfill
  if (FORCED$8) {
    // 25.4.3.1 Promise(executor)
    PromiseConstructor = function Promise(executor) {
      anInstance(this, PromiseConstructor, PROMISE);
      aFunction(executor);
      Internal.call(this);
      var state = getInternalState$1(this);
      try {
        executor(bind(internalResolve, state), bind(internalReject, state));
      } catch (error) {
        internalReject(state, error);
      }
    };
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    Internal = function Promise(executor) {
      setInternalState$3(this, {
        type: PROMISE,
        done: false,
        notified: false,
        parent: false,
        reactions: [],
        rejection: false,
        state: PENDING,
        value: undefined
      });
    };
    Internal.prototype = redefineAll(PromiseConstructor.prototype, {
      // `Promise.prototype.then` method
      // https://tc39.es/ecma262/#sec-promise.prototype.then
      then: function then(onFulfilled, onRejected) {
        var state = getInternalPromiseState(this);
        var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = engineIsNode ? process.domain : undefined;
        state.parent = true;
        state.reactions.push(reaction);
        if (state.state != PENDING) notify(state, false);
        return reaction.promise;
      },
      // `Promise.prototype.catch` method
      // https://tc39.es/ecma262/#sec-promise.prototype.catch
      'catch': function (onRejected) {
        return this.then(undefined, onRejected);
      }
    });
    OwnPromiseCapability = function () {
      var promise = new Internal();
      var state = getInternalState$1(promise);
      this.promise = promise;
      this.resolve = bind(internalResolve, state);
      this.reject = bind(internalReject, state);
    };
    newPromiseCapability$1.f = newPromiseCapability = function (C) {
      return C === PromiseConstructor || C === PromiseWrapper
        ? new OwnPromiseCapability(C)
        : newGenericPromiseCapability(C);
    };

    if (typeof nativePromiseConstructor == 'function') {
      nativeThen = nativePromiseConstructor.prototype.then;

      // wrap native Promise#then for native async functions
      redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          nativeThen.call(that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });

      // wrap fetch result
      if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
        // eslint-disable-next-line no-unused-vars -- required for `.length`
        fetch: function fetch(input /* , init */) {
          return promiseResolve(PromiseConstructor, $fetch.apply(global$1, arguments));
        }
      });
    }
  }

  _export({ global: true, wrap: true, forced: FORCED$8 }, {
    Promise: PromiseConstructor
  });

  setToStringTag(PromiseConstructor, PROMISE, false);
  setSpecies(PROMISE);

  PromiseWrapper = getBuiltIn(PROMISE);

  // statics
  _export({ target: PROMISE, stat: true, forced: FORCED$8 }, {
    // `Promise.reject` method
    // https://tc39.es/ecma262/#sec-promise.reject
    reject: function reject(r) {
      var capability = newPromiseCapability(this);
      capability.reject.call(undefined, r);
      return capability.promise;
    }
  });

  _export({ target: PROMISE, stat: true, forced: FORCED$8 }, {
    // `Promise.resolve` method
    // https://tc39.es/ecma262/#sec-promise.resolve
    resolve: function resolve(x) {
      return promiseResolve(this, x);
    }
  });

  _export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
    // `Promise.all` method
    // https://tc39.es/ecma262/#sec-promise.all
    all: function all(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var resolve = capability.resolve;
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction(C.resolve);
        var values = [];
        var counter = 0;
        var remaining = 1;
        iterate(iterable, function (promise) {
          var index = counter++;
          var alreadyCalled = false;
          values.push(undefined);
          remaining++;
          $promiseResolve.call(C, promise).then(function (value) {
            if (alreadyCalled) return;
            alreadyCalled = true;
            values[index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (result.error) reject(result.value);
      return capability.promise;
    },
    // `Promise.race` method
    // https://tc39.es/ecma262/#sec-promise.race
    race: function race(iterable) {
      var C = this;
      var capability = newPromiseCapability(C);
      var reject = capability.reject;
      var result = perform(function () {
        var $promiseResolve = aFunction(C.resolve);
        iterate(iterable, function (promise) {
          $promiseResolve.call(C, promise).then(capability.resolve, reject);
        });
      });
      if (result.error) reject(result.value);
      return capability.promise;
    }
  });

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck$7(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$6(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$6(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$6(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$6(Constructor, staticProps);
    return Constructor;
  }

  // `Symbol.asyncIterator` well-known symbol
  // https://tc39.es/ecma262/#sec-symbol.asynciterator
  defineWellKnownSymbol('asyncIterator');

  function _asyncIterator(iterable) {
    var method;

    if (typeof Symbol !== "undefined") {
      if (Symbol.asyncIterator) {
        method = iterable[Symbol.asyncIterator];
        if (method != null) return method.call(iterable);
      }

      if (Symbol.iterator) {
        method = iterable[Symbol.iterator];
        if (method != null) return method.call(iterable);
      }
    }

    throw new TypeError("Object is not async iterable");
  }

  // `thisNumberValue` abstract operation
  // https://tc39.es/ecma262/#sec-thisnumbervalue
  var thisNumberValue = function (value) {
    if (typeof value != 'number' && classofRaw(value) != 'Number') {
      throw TypeError('Incorrect invocation');
    }
    return +value;
  };

  // `String.prototype.repeat` method implementation
  // https://tc39.es/ecma262/#sec-string.prototype.repeat
  var stringRepeat = ''.repeat || function repeat(count) {
    var str = String(requireObjectCoercible(this));
    var result = '';
    var n = toInteger(count);
    if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
    for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
    return result;
  };

  var nativeToFixed = 1.0.toFixed;
  var floor$3 = Math.floor;

  var pow$1 = function (x, n, acc) {
    return n === 0 ? acc : n % 2 === 1 ? pow$1(x, n - 1, acc * x) : pow$1(x * x, n / 2, acc);
  };

  var log$2 = function (x) {
    var n = 0;
    var x2 = x;
    while (x2 >= 4096) {
      n += 12;
      x2 /= 4096;
    }
    while (x2 >= 2) {
      n += 1;
      x2 /= 2;
    } return n;
  };

  var multiply = function (data, n, c) {
    var index = -1;
    var c2 = c;
    while (++index < 6) {
      c2 += n * data[index];
      data[index] = c2 % 1e7;
      c2 = floor$3(c2 / 1e7);
    }
  };

  var divide = function (data, n) {
    var index = 6;
    var c = 0;
    while (--index >= 0) {
      c += data[index];
      data[index] = floor$3(c / n);
      c = (c % n) * 1e7;
    }
  };

  var dataToString = function (data) {
    var index = 6;
    var s = '';
    while (--index >= 0) {
      if (s !== '' || index === 0 || data[index] !== 0) {
        var t = String(data[index]);
        s = s === '' ? t : s + stringRepeat.call('0', 7 - t.length) + t;
      }
    } return s;
  };

  var FORCED$7 = nativeToFixed && (
    0.00008.toFixed(3) !== '0.000' ||
    0.9.toFixed(0) !== '1' ||
    1.255.toFixed(2) !== '1.25' ||
    1000000000000000128.0.toFixed(0) !== '1000000000000000128'
  ) || !fails(function () {
    // V8 ~ Android 4.3-
    nativeToFixed.call({});
  });

  // `Number.prototype.toFixed` method
  // https://tc39.es/ecma262/#sec-number.prototype.tofixed
  _export({ target: 'Number', proto: true, forced: FORCED$7 }, {
    toFixed: function toFixed(fractionDigits) {
      var number = thisNumberValue(this);
      var fractDigits = toInteger(fractionDigits);
      var data = [0, 0, 0, 0, 0, 0];
      var sign = '';
      var result = '0';
      var e, z, j, k;

      if (fractDigits < 0 || fractDigits > 20) throw RangeError('Incorrect fraction digits');
      // eslint-disable-next-line no-self-compare -- NaN check
      if (number != number) return 'NaN';
      if (number <= -1e21 || number >= 1e21) return String(number);
      if (number < 0) {
        sign = '-';
        number = -number;
      }
      if (number > 1e-21) {
        e = log$2(number * pow$1(2, 69, 1)) - 69;
        z = e < 0 ? number * pow$1(2, -e, 1) : number / pow$1(2, e, 1);
        z *= 0x10000000000000;
        e = 52 - e;
        if (e > 0) {
          multiply(data, 0, z);
          j = fractDigits;
          while (j >= 7) {
            multiply(data, 1e7, 0);
            j -= 7;
          }
          multiply(data, pow$1(10, j, 1), 0);
          j = e - 1;
          while (j >= 23) {
            divide(data, 1 << 23);
            j -= 23;
          }
          divide(data, 1 << j);
          multiply(data, 1, 1);
          divide(data, 2);
          result = dataToString(data);
        } else {
          multiply(data, 0, z);
          multiply(data, 1 << -e, 0);
          result = dataToString(data) + stringRepeat.call('0', fractDigits);
        }
      }
      if (fractDigits > 0) {
        k = result.length;
        result = sign + (k <= fractDigits
          ? '0.' + stringRepeat.call('0', fractDigits - k) + result
          : result.slice(0, k - fractDigits) + '.' + result.slice(k - fractDigits));
      } else {
        result = sign + result;
      } return result;
    }
  });

  var $find$1 = arrayIteration.find;


  var FIND = 'find';
  var SKIPS_HOLES = true;

  // Shouldn't skip holes
  if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  _export({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
    find: function find(callbackfn /* , that = undefined */) {
      return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables(FIND);

  var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('splice');

  var max$1 = Math.max;
  var min$4 = Math.min;
  var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
  var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

  // `Array.prototype.splice` method
  // https://tc39.es/ecma262/#sec-array.prototype.splice
  // with adding support of @@species
  _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
    splice: function splice(start, deleteCount /* , ...items */) {
      var O = toObject(this);
      var len = toLength(O.length);
      var actualStart = toAbsoluteIndex(start, len);
      var argumentsLength = arguments.length;
      var insertCount, actualDeleteCount, A, k, from, to;
      if (argumentsLength === 0) {
        insertCount = actualDeleteCount = 0;
      } else if (argumentsLength === 1) {
        insertCount = 0;
        actualDeleteCount = len - actualStart;
      } else {
        insertCount = argumentsLength - 2;
        actualDeleteCount = min$4(max$1(toInteger(deleteCount), 0), len - actualStart);
      }
      if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
        throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
      }
      A = arraySpeciesCreate(O, actualDeleteCount);
      for (k = 0; k < actualDeleteCount; k++) {
        from = actualStart + k;
        if (from in O) createProperty(A, k, O[from]);
      }
      A.length = actualDeleteCount;
      if (insertCount < actualDeleteCount) {
        for (k = actualStart; k < len - actualDeleteCount; k++) {
          from = k + actualDeleteCount;
          to = k + insertCount;
          if (from in O) O[to] = O[from];
          else delete O[to];
        }
        for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
      } else if (insertCount > actualDeleteCount) {
        for (k = len - actualDeleteCount; k > actualStart; k--) {
          from = k + actualDeleteCount - 1;
          to = k + insertCount - 1;
          if (from in O) O[to] = O[from];
          else delete O[to];
        }
      }
      for (k = 0; k < insertCount; k++) {
        O[k + actualStart] = arguments[k + 2];
      }
      O.length = len - actualDeleteCount + insertCount;
      return A;
    }
  });

  var $map$1 = arrayIteration.map;


  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  // with adding support of @@species
  _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
    map: function map(callbackfn /* , thisArg */) {
      return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  function _typeof$2(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$2 = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof$2 = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$2(obj);
  }

  // `Symbol.toStringTag` well-known symbol
  // https://tc39.es/ecma262/#sec-symbol.tostringtag
  defineWellKnownSymbol('toStringTag');

  // Math[@@toStringTag] property
  // https://tc39.es/ecma262/#sec-math-@@tostringtag
  setToStringTag(Math, 'Math', true);

  // JSON[@@toStringTag] property
  // https://tc39.es/ecma262/#sec-json-@@tostringtag
  setToStringTag(global$1.JSON, 'JSON', true);

  var FAILS_ON_PRIMITIVES = fails(function () { objectGetPrototypeOf(1); });

  // `Object.getPrototypeOf` method
  // https://tc39.es/ecma262/#sec-object.getprototypeof
  _export({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !correctPrototypeGetter }, {
    getPrototypeOf: function getPrototypeOf(it) {
      return objectGetPrototypeOf(toObject(it));
    }
  });

  // `RegExp.prototype.flags` getter implementation
  // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
  var regexpFlags = function () {
    var that = anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.dotAll) result += 's';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  var TO_STRING = 'toString';
  var RegExpPrototype$1 = RegExp.prototype;
  var nativeToString = RegExpPrototype$1[TO_STRING];

  var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
  // FF44- RegExp#toString has a wrong name
  var INCORRECT_NAME = nativeToString.name != TO_STRING;

  // `RegExp.prototype.toString` method
  // https://tc39.es/ecma262/#sec-regexp.prototype.tostring
  if (NOT_GENERIC || INCORRECT_NAME) {
    redefine(RegExp.prototype, TO_STRING, function toString() {
      var R = anObject(this);
      var p = String(R.source);
      var rf = R.flags;
      var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$1) ? regexpFlags.call(R) : rf);
      return '/' + p + '/' + f;
    }, { unsafe: true });
  }

  var runtime_1 = createCommonjsModule(function (module) {
    var runtime = function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.

      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function define(obj, key, value) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
        return obj[key];
      }

      try {
        // IE 8 has a broken Object.defineProperty that only works on DOM objects.
        define({}, "");
      } catch (err) {
        define = function define(obj, key, value) {
          return obj[key] = value;
        };
      }

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.

        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }

      exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.

      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.

      var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.

      function Generator() {}

      function GeneratorFunction() {}

      function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.


      var IteratorPrototype = {};

      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

      if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.

      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function (method) {
          define(prototype, method, function (arg) {
            return this._invoke(method, arg);
          });
        });
      }

      exports.isGeneratorFunction = function (genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };

      exports.mark = function (genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          define(genFun, toStringTagSymbol, "GeneratorFunction");
        }

        genFun.prototype = Object.create(Gp);
        return genFun;
      }; // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.


      exports.awrap = function (arg) {
        return {
          __await: arg
        };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);

          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;

            if (value && _typeof$2(value) === "object" && hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function (value) {
                invoke("next", value, resolve, reject);
              }, function (err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function (unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function (error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function (resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise = // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        } // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).


        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);

      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };

      exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.

      exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
        return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function (result) {
          return result.done ? result.value : iter.next();
        });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            } // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;

            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);

              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;
            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);
            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);

            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };
            } else if (record.type === "throw") {
              state = GenStateCompleted; // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.

              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      } // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.


      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];

        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError("The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (!info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

          context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.

          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }
        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        } // The delegate iterator is finished, so forget it and continue with
        // the outer generator.


        context.delegate = null;
        return ContinueSentinel;
      } // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.


      defineIteratorMethods(Gp);
      define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.

      Gp[iteratorSymbol] = function () {
        return this;
      };

      Gp.toString = function () {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = {
          tryLoc: locs[0]
        };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{
          tryLoc: "root"
        }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function (object) {
        var keys = [];

        for (var key in object) {
          keys.push(key);
        }

        keys.reverse(); // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.

        return function next() {
          while (keys.length) {
            var key = keys.pop();

            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          } // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.


          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];

          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;
              return next;
            };

            return next.next = next;
          }
        } // Return an iterator with no values.


        return {
          next: doneResult
        };
      }

      exports.values = values;

      function doneResult() {
        return {
          value: undefined$1,
          done: true
        };
      }

      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0; // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.

          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;
          this.method = "next";
          this.arg = undefined$1;
          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;

          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;

          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !!caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];

            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;

              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }

              return thrown;
            }
          } // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.


          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      }; // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.

      return exports;
    }( // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports );

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  });

  var regenerator = runtime_1;

  var formatBytes = function formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return "0 Bytes";
    }

    var k = 1024;
    var dm = decimals <= 0 ? 0 : decimals || 2;
    var sizes = ["Bytes", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    var n = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
    var size = sizes[i];
    return "".concat(n, " ").concat(size);
  };
  var getInputNameWithPrefix = function getInputNameWithPrefix(fieldName, prefix) {
    return prefix ? "".concat(prefix, "-").concat(fieldName) : fieldName;
  };

  var getInputNameWithoutPrefix = function getInputNameWithoutPrefix(fieldName, prefix) {
    return prefix ? fieldName.slice(prefix.length + 1) : fieldName;
  };

  var findInput = function findInput(form, fieldName, prefix) {
    var inputNameWithPrefix = getInputNameWithPrefix(fieldName, prefix);
    var input = form.querySelector("[name=\"".concat(inputNameWithPrefix, "\"]"));

    if (!input) {
      return null;
    }

    return input;
  };
  var getUploadsFieldName = function getUploadsFieldName(fieldName, prefix) {
    return "".concat(getInputNameWithoutPrefix(fieldName, prefix), "-uploads");
  };
  var getInputValueForFormAndPrefix = function getInputValueForFormAndPrefix(form, fieldName, prefix) {
    var _findInput;

    return (_findInput = findInput(form, fieldName, prefix)) === null || _findInput === void 0 ? void 0 : _findInput.value;
  };
  var getMetadataFieldName = function getMetadataFieldName(fieldName, prefix) {
    return "".concat(getInputNameWithoutPrefix(fieldName, prefix), "-metadata");
  };

  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
  // so we use an intermediate function.
  function RE(s, f) {
    return RegExp(s, f);
  }

  var UNSUPPORTED_Y$3 = fails(function () {
    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
    var re = RE('a', 'y');
    re.lastIndex = 2;
    return re.exec('abcd') != null;
  });

  var BROKEN_CARET = fails(function () {
    // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
    var re = RE('^r', 'gy');
    re.lastIndex = 2;
    return re.exec('str') != null;
  });

  var regexpStickyHelpers = {
  	UNSUPPORTED_Y: UNSUPPORTED_Y$3,
  	BROKEN_CARET: BROKEN_CARET
  };

  var nativeExec = RegExp.prototype.exec;
  // This always refers to the native implementation, because the
  // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
  // which loads this file before patching the method.
  var nativeReplace = String.prototype.replace;

  var patchedExec = nativeExec;

  var UPDATES_LAST_INDEX_WRONG = (function () {
    var re1 = /a/;
    var re2 = /b*/g;
    nativeExec.call(re1, 'a');
    nativeExec.call(re2, 'a');
    return re1.lastIndex !== 0 || re2.lastIndex !== 0;
  })();

  var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

  // nonparticipating capturing group, copied from es5-shim's String#split patch.
  // eslint-disable-next-line regexp/no-assertion-capturing-group, regexp/no-empty-group -- required for testing
  var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

  var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2;

  if (PATCH) {
    patchedExec = function exec(str) {
      var re = this;
      var lastIndex, reCopy, match, i;
      var sticky = UNSUPPORTED_Y$2 && re.sticky;
      var flags = regexpFlags.call(re);
      var source = re.source;
      var charsAdded = 0;
      var strCopy = str;

      if (sticky) {
        flags = flags.replace('y', '');
        if (flags.indexOf('g') === -1) {
          flags += 'g';
        }

        strCopy = String(str).slice(re.lastIndex);
        // Support anchored sticky behavior.
        if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
          source = '(?: ' + source + ')';
          strCopy = ' ' + strCopy;
          charsAdded++;
        }
        // ^(? + rx + ) is needed, in combination with some str slicing, to
        // simulate the 'y' flag.
        reCopy = new RegExp('^(?:' + source + ')', flags);
      }

      if (NPCG_INCLUDED) {
        reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
      }
      if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

      match = nativeExec.call(sticky ? reCopy : re, strCopy);

      if (sticky) {
        if (match) {
          match.input = match.input.slice(charsAdded);
          match[0] = match[0].slice(charsAdded);
          match.index = re.lastIndex;
          re.lastIndex += match[0].length;
        } else re.lastIndex = 0;
      } else if (UPDATES_LAST_INDEX_WRONG && match) {
        re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
      }
      if (NPCG_INCLUDED && match && match.length > 1) {
        // Fix browsers whose `exec` methods don't consistently return `undefined`
        // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
        nativeReplace.call(match[0], reCopy, function () {
          for (i = 1; i < arguments.length - 2; i++) {
            if (arguments[i] === undefined) match[i] = undefined;
          }
        });
      }

      return match;
    };
  }

  var regexpExec = patchedExec;

  // `RegExp.prototype.exec` method
  // https://tc39.es/ecma262/#sec-regexp.prototype.exec
  _export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
    exec: regexpExec
  });

  /*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   */
  var matchHtmlRegExp = /["'&<>]/;
  /**
   * Module exports.
   * @public
   */

  var escapeHtml_1 = escapeHtml;
  /**
   * Escape special characters in the given string of html.
   *
   * @param  {string} string The string to escape for inserting into HTML
   * @return {string}
   * @public
   */

  function escapeHtml(string) {
    var str = '' + string;
    var match = matchHtmlRegExp.exec(str);

    if (!match) {
      return str;
    }

    var escape;
    var html = '';
    var index = 0;
    var lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34:
          // "
          escape = '&quot;';
          break;

        case 38:
          // &
          escape = '&amp;';
          break;

        case 39:
          // '
          escape = '&#39;';
          break;

        case 60:
          // <
          escape = '&lt;';
          break;

        case 62:
          // >
          escape = '&gt;';
          break;

        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
  }

  var RenderUploadFile = /*#__PURE__*/function () {
    function RenderUploadFile(_ref) {
      var _parent = _ref.parent,
          input = _ref.input,
          skipRequired = _ref.skipRequired,
          translations = _ref.translations;

      _classCallCheck$7(this, RenderUploadFile);

      _defineProperty$2(this, "container", void 0);

      _defineProperty$2(this, "input", void 0);

      _defineProperty$2(this, "translations", void 0);

      _defineProperty$2(this, "createFilesContainer", function (parent) {
        var div = document.createElement("div");
        div.className = "dff-files";
        parent.appendChild(div);
        return div;
      });

      this.container = this.createFilesContainer(_parent);
      this.input = input;
      this.translations = translations;

      if (skipRequired) {
        this.input.required = false;
      }
    }

    _createClass$6(RenderUploadFile, [{
      key: "addNewUpload",
      value: function addNewUpload(filename, uploadIndex) {
        var div = this.addFile(filename, uploadIndex);
        var progressSpan = document.createElement("span");
        progressSpan.className = "dff-progress";
        var innerSpan = document.createElement("span");
        innerSpan.className = "dff-progress-inner";
        progressSpan.appendChild(innerSpan);
        div.appendChild(progressSpan);
        var cancelLink = document.createElement("a");
        cancelLink.className = "dff-cancel";
        cancelLink.innerHTML = this.translations.Cancel;
        cancelLink.setAttribute("data-index", "".concat(uploadIndex));
        cancelLink.href = "#";
        div.appendChild(cancelLink);
        return div;
      }
    }, {
      key: "addUploadedFile",
      value: function addUploadedFile(filename, uploadIndex, filesize) {
        var element = this.addFile(filename, uploadIndex);
        this.setSuccess(uploadIndex, filesize);
        return element;
      }
    }, {
      key: "clearInput",
      value: function clearInput() {
        var input = this.input;
        input.value = "";
      }
    }, {
      key: "deleteFile",
      value: function deleteFile(index) {
        var div = this.findFileDiv(index);

        if (div) {
          div.remove();
        }
      }
    }, {
      key: "disableCancel",
      value: function disableCancel(index) {
        var cancelSpan = this.findCancelSpan(index);

        if (cancelSpan) {
          cancelSpan.classList.add("dff-disabled");
        }
      }
    }, {
      key: "disableDelete",
      value: function disableDelete(index) {
        var deleteLink = this.findDeleteLink(index);

        if (deleteLink) {
          deleteLink.classList.add("dff-disabled");
        }
      }
    }, {
      key: "findFileDiv",
      value: function findFileDiv(index) {
        return this.container.querySelector(".dff-file-id-".concat(index));
      }
    }, {
      key: "removeDropHint",
      value: function removeDropHint() {
        var dropHint = this.container.querySelector(".dff-drop-hint");

        if (dropHint) {
          dropHint.remove();
        }
      }
    }, {
      key: "renderDropHint",
      value: function renderDropHint() {
        if (this.container.querySelector(".dff-drop-hint")) {
          return;
        }

        var dropHint = document.createElement("div");
        dropHint.className = "dff-drop-hint";
        dropHint.innerHTML = this.translations["Drop your files here"];
        this.container.appendChild(dropHint);
      }
    }, {
      key: "setDeleteFailed",
      value: function setDeleteFailed(index) {
        this.setErrorMessage(index, this.translations["Delete failed"]);
        this.enableDelete(index);
      }
    }, {
      key: "setError",
      value: function setError(index) {
        this.setErrorMessage(index, this.translations["Upload failed"]);
        var el = this.findFileDiv(index);

        if (el) {
          el.classList.add("dff-upload-fail");
        }

        this.removeProgress(index);
        this.removeCancel(index);
      }
    }, {
      key: "setSuccess",
      value: function setSuccess(index, size) {
        var translations = this.translations;
        var el = this.findFileDiv(index);

        if (el) {
          el.classList.add("dff-upload-success");

          if (size != null) {
            var fileSizeInfo = document.createElement("span");
            fileSizeInfo.innerHTML = formatBytes(size, 2);
            fileSizeInfo.className = "dff-filesize";
            el.appendChild(fileSizeInfo);
          }

          var deleteLink = document.createElement("a");
          deleteLink.innerHTML = translations.Delete;
          deleteLink.className = "dff-delete";
          deleteLink.setAttribute("data-index", "".concat(index));
          deleteLink.href = "#";
          el.appendChild(deleteLink);
        }

        this.removeProgress(index);
        this.removeCancel(index);
      }
    }, {
      key: "updateProgress",
      value: function updateProgress(index, percentage) {
        var el = this.container.querySelector(".dff-file-id-".concat(index));

        if (el) {
          var innerProgressSpan = el.querySelector(".dff-progress-inner");

          if (innerProgressSpan) {
            innerProgressSpan.style.width = "".concat(percentage, "%");
          }
        }
      }
    }, {
      key: "addFile",
      value: function addFile(filename, uploadIndex) {
        var div = document.createElement("div");
        div.className = "dff-file dff-file-id-".concat(uploadIndex);
        var nameSpan = document.createElement("span");
        nameSpan.innerHTML = escapeHtml_1(filename);
        div.appendChild(nameSpan);
        this.container.appendChild(div);
        this.input.required = false;
        return div;
      }
    }, {
      key: "removeProgress",
      value: function removeProgress(index) {
        var el = this.findFileDiv(index);

        if (el) {
          var progressSpan = el.querySelector(".dff-progress");

          if (progressSpan) {
            progressSpan.remove();
          }
        }
      }
    }, {
      key: "removeCancel",
      value: function removeCancel(index) {
        var cancelSpan = this.findCancelSpan(index);

        if (cancelSpan) {
          cancelSpan.remove();
        }
      }
    }, {
      key: "findCancelSpan",
      value: function findCancelSpan(index) {
        var el = this.findFileDiv(index);

        if (!el) {
          return null;
        }

        return el.querySelector(".dff-cancel");
      }
    }, {
      key: "enableDelete",
      value: function enableDelete(index) {
        var deleteLink = this.findDeleteLink(index);

        if (deleteLink) {
          deleteLink.classList.remove("dff-disabled");
        }
      }
    }, {
      key: "findDeleteLink",
      value: function findDeleteLink(index) {
        var div = this.findFileDiv(index);

        if (!div) {
          return div;
        }

        return div.querySelector(".dff-delete");
      }
    }, {
      key: "setErrorMessage",
      value: function setErrorMessage(index, message) {
        var el = this.findFileDiv(index);

        if (!el) {
          return;
        }

        var originalMessageSpan = document.querySelector(".dff-error");

        if (originalMessageSpan) {
          originalMessageSpan.remove();
        }

        var span = document.createElement("span");
        span.classList.add("dff-error");
        span.innerHTML = message;
        el.appendChild(span);
      }
    }]);

    return RenderUploadFile;
  }();

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest();
  }

  // TODO: Remove from `core-js@4` since it's moved to entry points







  var SPECIES = wellKnownSymbol('species');

  var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
    // #replace needs built-in support for named groups.
    // #match works fine because it just return the exec results, even if it has
    // a "grops" property.
    var re = /./;
    re.exec = function () {
      var result = [];
      result.groups = { a: '7' };
      return result;
    };
    return ''.replace(re, '$<a>') !== '7';
  });

  // IE <= 11 replaces $0 with the whole match, as if it was $&
  // https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
  var REPLACE_KEEPS_$0 = (function () {
    return 'a'.replace(/./, '$0') === '$0';
  })();

  var REPLACE = wellKnownSymbol('replace');
  // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
    if (/./[REPLACE]) {
      return /./[REPLACE]('a', '$0') === '';
    }
    return false;
  })();

  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  // Weex JS has frozen built-in prototypes, so use try / catch wrapper
  var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    var re = /(?:)/;
    var originalExec = re.exec;
    re.exec = function () { return originalExec.apply(this, arguments); };
    var result = 'ab'.split(re);
    return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
  });

  var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
    var SYMBOL = wellKnownSymbol(KEY);

    var DELEGATES_TO_SYMBOL = !fails(function () {
      // String methods call symbol-named RegEp methods
      var O = {};
      O[SYMBOL] = function () { return 7; };
      return ''[KEY](O) != 7;
    });

    var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
      // Symbol-named RegExp methods call .exec
      var execCalled = false;
      var re = /a/;

      if (KEY === 'split') {
        // We can't use real regex here since it causes deoptimization
        // and serious performance degradation in V8
        // https://github.com/zloirock/core-js/issues/306
        re = {};
        // RegExp[@@split] doesn't call the regex's exec method, but first creates
        // a new one. We need to return the patched regex when creating the new one.
        re.constructor = {};
        re.constructor[SPECIES] = function () { return re; };
        re.flags = '';
        re[SYMBOL] = /./[SYMBOL];
      }

      re.exec = function () { execCalled = true; return null; };

      re[SYMBOL]('');
      return !execCalled;
    });

    if (
      !DELEGATES_TO_SYMBOL ||
      !DELEGATES_TO_EXEC ||
      (KEY === 'replace' && !(
        REPLACE_SUPPORTS_NAMED_GROUPS &&
        REPLACE_KEEPS_$0 &&
        !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
      )) ||
      (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
    ) {
      var nativeRegExpMethod = /./[SYMBOL];
      var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }, {
        REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
        REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
      });
      var stringMethod = methods[0];
      var regexMethod = methods[1];

      redefine(String.prototype, KEY, stringMethod);
      redefine(RegExp.prototype, SYMBOL, length == 2
        // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
        // 21.2.5.11 RegExp.prototype[@@split](string, limit)
        ? function (string, arg) { return regexMethod.call(string, this, arg); }
        // 21.2.5.6 RegExp.prototype[@@match](string)
        // 21.2.5.9 RegExp.prototype[@@search](string)
        : function (string) { return regexMethod.call(string, this); }
      );
    }

    if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
  };

  var charAt = stringMultibyte.charAt;

  // `AdvanceStringIndex` abstract operation
  // https://tc39.es/ecma262/#sec-advancestringindex
  var advanceStringIndex = function (S, index, unicode) {
    return index + (unicode ? charAt(S, index).length : 1);
  };

  // `RegExpExec` abstract operation
  // https://tc39.es/ecma262/#sec-regexpexec
  var regexpExecAbstract = function (R, S) {
    var exec = R.exec;
    if (typeof exec === 'function') {
      var result = exec.call(R, S);
      if (typeof result !== 'object') {
        throw TypeError('RegExp exec method returned something other than an Object or null');
      }
      return result;
    }

    if (classofRaw(R) !== 'RegExp') {
      throw TypeError('RegExp#exec called on incompatible receiver');
    }

    return regexpExec.call(R, S);
  };

  var arrayPush = [].push;
  var min$3 = Math.min;
  var MAX_UINT32 = 0xFFFFFFFF;

  // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
  var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

  // @@split logic
  fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
    var internalSplit;
    if (
      'abbc'.split(/(b)*/)[1] == 'c' ||
      // eslint-disable-next-line regexp/no-empty-group -- required for testing
      'test'.split(/(?:)/, -1).length != 4 ||
      'ab'.split(/(?:ab)*/).length != 2 ||
      '.'.split(/(.?)(.?)/).length != 4 ||
      // eslint-disable-next-line regexp/no-assertion-capturing-group, regexp/no-empty-group -- required for testing
      '.'.split(/()()/).length > 1 ||
      ''.split(/.?/).length
    ) {
      // based on es5-shim implementation, need to rework it
      internalSplit = function (separator, limit) {
        var string = String(requireObjectCoercible(this));
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (separator === undefined) return [string];
        // If `separator` is not a regex, use native split
        if (!isRegexp(separator)) {
          return nativeSplit.call(string, separator, lim);
        }
        var output = [];
        var flags = (separator.ignoreCase ? 'i' : '') +
                    (separator.multiline ? 'm' : '') +
                    (separator.unicode ? 'u' : '') +
                    (separator.sticky ? 'y' : '');
        var lastLastIndex = 0;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        var separatorCopy = new RegExp(separator.source, flags + 'g');
        var match, lastIndex, lastLength;
        while (match = regexpExec.call(separatorCopy, string)) {
          lastIndex = separatorCopy.lastIndex;
          if (lastIndex > lastLastIndex) {
            output.push(string.slice(lastLastIndex, match.index));
            if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= lim) break;
          }
          if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
        }
        if (lastLastIndex === string.length) {
          if (lastLength || !separatorCopy.test('')) output.push('');
        } else output.push(string.slice(lastLastIndex));
        return output.length > lim ? output.slice(0, lim) : output;
      };
    // Chakra, V8
    } else if ('0'.split(undefined, 0).length) {
      internalSplit = function (separator, limit) {
        return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
      };
    } else internalSplit = nativeSplit;

    return [
      // `String.prototype.split` method
      // https://tc39.es/ecma262/#sec-string.prototype.split
      function split(separator, limit) {
        var O = requireObjectCoercible(this);
        var splitter = separator == undefined ? undefined : separator[SPLIT];
        return splitter !== undefined
          ? splitter.call(separator, O, limit)
          : internalSplit.call(String(O), separator, limit);
      },
      // `RegExp.prototype[@@split]` method
      // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
      //
      // NOTE: This cannot be properly polyfilled in engines that don't support
      // the 'y' flag.
      function (regexp, limit) {
        var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
        if (res.done) return res.value;

        var rx = anObject(regexp);
        var S = String(this);
        var C = speciesConstructor(rx, RegExp);

        var unicodeMatching = rx.unicode;
        var flags = (rx.ignoreCase ? 'i' : '') +
                    (rx.multiline ? 'm' : '') +
                    (rx.unicode ? 'u' : '') +
                    (SUPPORTS_Y ? 'y' : 'g');

        // ^(? + rx + ) is needed, in combination with some S slicing, to
        // simulate the 'y' flag.
        var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
        var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
        if (lim === 0) return [];
        if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
        var p = 0;
        var q = 0;
        var A = [];
        while (q < S.length) {
          splitter.lastIndex = SUPPORTS_Y ? q : 0;
          var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
          var e;
          if (
            z === null ||
            (e = min$3(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
          ) {
            q = advanceStringIndex(S, q, unicodeMatching);
          } else {
            A.push(S.slice(p, q));
            if (A.length === lim) return A;
            for (var i = 1; i <= z.length - 1; i++) {
              A.push(z[i]);
              if (A.length === lim) return A;
            }
            q = p = e;
          }
        }
        A.push(S.slice(p));
        return A;
      }
    ];
  }, !SUPPORTS_Y);

  // a string of all valid unicode whitespaces
  var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
    '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var whitespace$1 = '[' + whitespaces + ']';
  var ltrim = RegExp('^' + whitespace$1 + whitespace$1 + '*');
  var rtrim = RegExp(whitespace$1 + whitespace$1 + '*$');

  // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
  var createMethod$1 = function (TYPE) {
    return function ($this) {
      var string = String(requireObjectCoercible($this));
      if (TYPE & 1) string = string.replace(ltrim, '');
      if (TYPE & 2) string = string.replace(rtrim, '');
      return string;
    };
  };

  var stringTrim = {
    // `String.prototype.{ trimLeft, trimStart }` methods
    // https://tc39.es/ecma262/#sec-string.prototype.trimstart
    start: createMethod$1(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.es/ecma262/#sec-string.prototype.trimend
    end: createMethod$1(2),
    // `String.prototype.trim` method
    // https://tc39.es/ecma262/#sec-string.prototype.trim
    trim: createMethod$1(3)
  };

  var non = '\u200B\u0085\u180E';

  // check that a method works with the correct list
  // of whitespaces and has a correct name
  var stringTrimForced = function (METHOD_NAME) {
    return fails(function () {
      return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
    });
  };

  var $trim = stringTrim.trim;


  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  _export({ target: 'String', proto: true, forced: stringTrimForced('trim') }, {
    trim: function trim() {
      return $trim(this);
    }
  });

  var floor$2 = Math.floor;
  var replace = ''.replace;
  var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
  var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

  // https://tc39.es/ecma262/#sec-getsubstitution
  var getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor$2(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  };

  var max = Math.max;
  var min$2 = Math.min;

  var maybeToString = function (it) {
    return it === undefined ? it : String(it);
  };

  // @@replace logic
  fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
    var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
    var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
    var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

    return [
      // `String.prototype.replace` method
      // https://tc39.es/ecma262/#sec-string.prototype.replace
      function replace(searchValue, replaceValue) {
        var O = requireObjectCoercible(this);
        var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
        return replacer !== undefined
          ? replacer.call(searchValue, O, replaceValue)
          : nativeReplace.call(String(O), searchValue, replaceValue);
      },
      // `RegExp.prototype[@@replace]` method
      // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
      function (regexp, replaceValue) {
        if (
          (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
          (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
        ) {
          var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
          if (res.done) return res.value;
        }

        var rx = anObject(regexp);
        var S = String(this);

        var functionalReplace = typeof replaceValue === 'function';
        if (!functionalReplace) replaceValue = String(replaceValue);

        var global = rx.global;
        if (global) {
          var fullUnicode = rx.unicode;
          rx.lastIndex = 0;
        }
        var results = [];
        while (true) {
          var result = regexpExecAbstract(rx, S);
          if (result === null) break;

          results.push(result);
          if (!global) break;

          var matchStr = String(result[0]);
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        }

        var accumulatedResult = '';
        var nextSourcePosition = 0;
        for (var i = 0; i < results.length; i++) {
          result = results[i];

          var matched = String(result[0]);
          var position = max(min$2(toInteger(result.index), S.length), 0);
          var captures = [];
          // NOTE: This is equivalent to
          //   captures = result.slice(1).map(maybeToString)
          // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
          // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
          // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
          for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
          var namedCaptures = result.groups;
          if (functionalReplace) {
            var replacerArgs = [matched].concat(captures, position, S);
            if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
            var replacement = String(replaceValue.apply(undefined, replacerArgs));
          } else {
            replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
          }
          if (position >= nextSourcePosition) {
            accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
            nextSourcePosition = position + matched.length;
          }
        }
        return accumulatedResult + S.slice(nextSourcePosition);
      }
    ];
  });

  // makes subclassing work correct for wrapped built-ins
  var inheritIfRequired = function ($this, dummy, Wrapper) {
    var NewTarget, NewTargetPrototype;
    if (
      // it can work only with native `setPrototypeOf`
      objectSetPrototypeOf &&
      // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
      typeof (NewTarget = dummy.constructor) == 'function' &&
      NewTarget !== Wrapper &&
      isObject$1(NewTargetPrototype = NewTarget.prototype) &&
      NewTargetPrototype !== Wrapper.prototype
    ) objectSetPrototypeOf($this, NewTargetPrototype);
    return $this;
  };

  var defineProperty$3 = objectDefineProperty.f;
  var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;





  var setInternalState$2 = internalState.set;



  var MATCH = wellKnownSymbol('match');
  var NativeRegExp = global$1.RegExp;
  var RegExpPrototype = NativeRegExp.prototype;
  var re1 = /a/g;
  var re2 = /a/g;

  // "new" should create a new object, old webkit bug
  var CORRECT_NEW = new NativeRegExp(re1) !== re1;

  var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;

  var FORCED$6 = descriptors && isForced_1('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$1 || fails(function () {
    re2[MATCH] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
  })));

  // `RegExp` constructor
  // https://tc39.es/ecma262/#sec-regexp-constructor
  if (FORCED$6) {
    var RegExpWrapper = function RegExp(pattern, flags) {
      var thisIsRegExp = this instanceof RegExpWrapper;
      var patternIsRegExp = isRegexp(pattern);
      var flagsAreUndefined = flags === undefined;
      var sticky;

      if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
        return pattern;
      }

      if (CORRECT_NEW) {
        if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
      } else if (pattern instanceof RegExpWrapper) {
        if (flagsAreUndefined) flags = regexpFlags.call(pattern);
        pattern = pattern.source;
      }

      if (UNSUPPORTED_Y$1) {
        sticky = !!flags && flags.indexOf('y') > -1;
        if (sticky) flags = flags.replace(/y/g, '');
      }

      var result = inheritIfRequired(
        CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
        thisIsRegExp ? this : RegExpPrototype,
        RegExpWrapper
      );

      if (UNSUPPORTED_Y$1 && sticky) setInternalState$2(result, { sticky: sticky });

      return result;
    };
    var proxy = function (key) {
      key in RegExpWrapper || defineProperty$3(RegExpWrapper, key, {
        configurable: true,
        get: function () { return NativeRegExp[key]; },
        set: function (it) { NativeRegExp[key] = it; }
      });
    };
    var keys$1 = getOwnPropertyNames$1(NativeRegExp);
    var index = 0;
    while (keys$1.length > index) proxy(keys$1[index++]);
    RegExpPrototype.constructor = RegExpWrapper;
    RegExpWrapper.prototype = RegExpPrototype;
    redefine(global$1, 'RegExp', RegExpWrapper);
  }

  // https://tc39.es/ecma262/#sec-get-regexp-@@species
  setSpecies('RegExp');

  function Mime() {
    this._types = Object.create(null);
    this._extensions = Object.create(null);

    for (var i = 0; i < arguments.length; i++) {
      this.define(arguments[i]);
    }

    this.define = this.define.bind(this);
    this.getType = this.getType.bind(this);
    this.getExtension = this.getExtension.bind(this);
  }
  /**
   * Define mimetype -> extension mappings.  Each key is a mime-type that maps
   * to an array of extensions associated with the type.  The first extension is
   * used as the default extension for the type.
   *
   * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
   *
   * If a type declares an extension that has already been defined, an error will
   * be thrown.  To suppress this error and force the extension to be associated
   * with the new type, pass `force`=true.  Alternatively, you may prefix the
   * extension with "*" to map the type to extension, without mapping the
   * extension to the type.
   *
   * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
   *
   *
   * @param map (Object) type definitions
   * @param force (Boolean) if true, force overriding of existing definitions
   */


  Mime.prototype.define = function (typeMap, force) {
    for (var type in typeMap) {
      var extensions = typeMap[type].map(function (t) {
        return t.toLowerCase();
      });
      type = type.toLowerCase();

      for (var i = 0; i < extensions.length; i++) {
        var ext = extensions[i]; // '*' prefix = not the preferred type for this extension.  So fixup the
        // extension, and skip it.

        if (ext[0] === '*') {
          continue;
        }

        if (!force && ext in this._types) {
          throw new Error('Attempt to change mapping for "' + ext + '" extension from "' + this._types[ext] + '" to "' + type + '". Pass `force=true` to allow this, otherwise remove "' + ext + '" from the list of extensions for "' + type + '".');
        }

        this._types[ext] = type;
      } // Use first extension as default


      if (force || !this._extensions[type]) {
        var _ext = extensions[0];
        this._extensions[type] = _ext[0] !== '*' ? _ext : _ext.substr(1);
      }
    }
  };
  /**
   * Lookup a mime type based on extension
   */


  Mime.prototype.getType = function (path) {
    path = String(path);
    var last = path.replace(/^.*[/\\]/, '').toLowerCase();
    var ext = last.replace(/^.*\./, '').toLowerCase();
    var hasPath = last.length < path.length;
    var hasDot = ext.length < last.length - 1;
    return (hasDot || !hasPath) && this._types[ext] || null;
  };
  /**
   * Return file extension associated with a mime type
   */


  Mime.prototype.getExtension = function (type) {
    type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
    return type && this._extensions[type.toLowerCase()] || null;
  };

  var Mime_1 = Mime;

  var standard = {
    "application/andrew-inset": ["ez"],
    "application/applixware": ["aw"],
    "application/atom+xml": ["atom"],
    "application/atomcat+xml": ["atomcat"],
    "application/atomdeleted+xml": ["atomdeleted"],
    "application/atomsvc+xml": ["atomsvc"],
    "application/atsc-dwd+xml": ["dwd"],
    "application/atsc-held+xml": ["held"],
    "application/atsc-rsat+xml": ["rsat"],
    "application/bdoc": ["bdoc"],
    "application/calendar+xml": ["xcs"],
    "application/ccxml+xml": ["ccxml"],
    "application/cdfx+xml": ["cdfx"],
    "application/cdmi-capability": ["cdmia"],
    "application/cdmi-container": ["cdmic"],
    "application/cdmi-domain": ["cdmid"],
    "application/cdmi-object": ["cdmio"],
    "application/cdmi-queue": ["cdmiq"],
    "application/cu-seeme": ["cu"],
    "application/dash+xml": ["mpd"],
    "application/davmount+xml": ["davmount"],
    "application/docbook+xml": ["dbk"],
    "application/dssc+der": ["dssc"],
    "application/dssc+xml": ["xdssc"],
    "application/ecmascript": ["ecma", "es"],
    "application/emma+xml": ["emma"],
    "application/emotionml+xml": ["emotionml"],
    "application/epub+zip": ["epub"],
    "application/exi": ["exi"],
    "application/fdt+xml": ["fdt"],
    "application/font-tdpfr": ["pfr"],
    "application/geo+json": ["geojson"],
    "application/gml+xml": ["gml"],
    "application/gpx+xml": ["gpx"],
    "application/gxf": ["gxf"],
    "application/gzip": ["gz"],
    "application/hjson": ["hjson"],
    "application/hyperstudio": ["stk"],
    "application/inkml+xml": ["ink", "inkml"],
    "application/ipfix": ["ipfix"],
    "application/its+xml": ["its"],
    "application/java-archive": ["jar", "war", "ear"],
    "application/java-serialized-object": ["ser"],
    "application/java-vm": ["class"],
    "application/javascript": ["js", "mjs"],
    "application/json": ["json", "map"],
    "application/json5": ["json5"],
    "application/jsonml+json": ["jsonml"],
    "application/ld+json": ["jsonld"],
    "application/lgr+xml": ["lgr"],
    "application/lost+xml": ["lostxml"],
    "application/mac-binhex40": ["hqx"],
    "application/mac-compactpro": ["cpt"],
    "application/mads+xml": ["mads"],
    "application/manifest+json": ["webmanifest"],
    "application/marc": ["mrc"],
    "application/marcxml+xml": ["mrcx"],
    "application/mathematica": ["ma", "nb", "mb"],
    "application/mathml+xml": ["mathml"],
    "application/mbox": ["mbox"],
    "application/mediaservercontrol+xml": ["mscml"],
    "application/metalink+xml": ["metalink"],
    "application/metalink4+xml": ["meta4"],
    "application/mets+xml": ["mets"],
    "application/mmt-aei+xml": ["maei"],
    "application/mmt-usd+xml": ["musd"],
    "application/mods+xml": ["mods"],
    "application/mp21": ["m21", "mp21"],
    "application/mp4": ["mp4s", "m4p"],
    "application/mrb-consumer+xml": ["*xdf"],
    "application/mrb-publish+xml": ["*xdf"],
    "application/msword": ["doc", "dot"],
    "application/mxf": ["mxf"],
    "application/n-quads": ["nq"],
    "application/n-triples": ["nt"],
    "application/node": ["cjs"],
    "application/octet-stream": ["bin", "dms", "lrf", "mar", "so", "dist", "distz", "pkg", "bpk", "dump", "elc", "deploy", "exe", "dll", "deb", "dmg", "iso", "img", "msi", "msp", "msm", "buffer"],
    "application/oda": ["oda"],
    "application/oebps-package+xml": ["opf"],
    "application/ogg": ["ogx"],
    "application/omdoc+xml": ["omdoc"],
    "application/onenote": ["onetoc", "onetoc2", "onetmp", "onepkg"],
    "application/oxps": ["oxps"],
    "application/p2p-overlay+xml": ["relo"],
    "application/patch-ops-error+xml": ["*xer"],
    "application/pdf": ["pdf"],
    "application/pgp-encrypted": ["pgp"],
    "application/pgp-signature": ["asc", "sig"],
    "application/pics-rules": ["prf"],
    "application/pkcs10": ["p10"],
    "application/pkcs7-mime": ["p7m", "p7c"],
    "application/pkcs7-signature": ["p7s"],
    "application/pkcs8": ["p8"],
    "application/pkix-attr-cert": ["ac"],
    "application/pkix-cert": ["cer"],
    "application/pkix-crl": ["crl"],
    "application/pkix-pkipath": ["pkipath"],
    "application/pkixcmp": ["pki"],
    "application/pls+xml": ["pls"],
    "application/postscript": ["ai", "eps", "ps"],
    "application/provenance+xml": ["provx"],
    "application/pskc+xml": ["pskcxml"],
    "application/raml+yaml": ["raml"],
    "application/rdf+xml": ["rdf", "owl"],
    "application/reginfo+xml": ["rif"],
    "application/relax-ng-compact-syntax": ["rnc"],
    "application/resource-lists+xml": ["rl"],
    "application/resource-lists-diff+xml": ["rld"],
    "application/rls-services+xml": ["rs"],
    "application/route-apd+xml": ["rapd"],
    "application/route-s-tsid+xml": ["sls"],
    "application/route-usd+xml": ["rusd"],
    "application/rpki-ghostbusters": ["gbr"],
    "application/rpki-manifest": ["mft"],
    "application/rpki-roa": ["roa"],
    "application/rsd+xml": ["rsd"],
    "application/rss+xml": ["rss"],
    "application/rtf": ["rtf"],
    "application/sbml+xml": ["sbml"],
    "application/scvp-cv-request": ["scq"],
    "application/scvp-cv-response": ["scs"],
    "application/scvp-vp-request": ["spq"],
    "application/scvp-vp-response": ["spp"],
    "application/sdp": ["sdp"],
    "application/senml+xml": ["senmlx"],
    "application/sensml+xml": ["sensmlx"],
    "application/set-payment-initiation": ["setpay"],
    "application/set-registration-initiation": ["setreg"],
    "application/shf+xml": ["shf"],
    "application/sieve": ["siv", "sieve"],
    "application/smil+xml": ["smi", "smil"],
    "application/sparql-query": ["rq"],
    "application/sparql-results+xml": ["srx"],
    "application/srgs": ["gram"],
    "application/srgs+xml": ["grxml"],
    "application/sru+xml": ["sru"],
    "application/ssdl+xml": ["ssdl"],
    "application/ssml+xml": ["ssml"],
    "application/swid+xml": ["swidtag"],
    "application/tei+xml": ["tei", "teicorpus"],
    "application/thraud+xml": ["tfi"],
    "application/timestamped-data": ["tsd"],
    "application/toml": ["toml"],
    "application/ttml+xml": ["ttml"],
    "application/ubjson": ["ubj"],
    "application/urc-ressheet+xml": ["rsheet"],
    "application/urc-targetdesc+xml": ["td"],
    "application/voicexml+xml": ["vxml"],
    "application/wasm": ["wasm"],
    "application/widget": ["wgt"],
    "application/winhlp": ["hlp"],
    "application/wsdl+xml": ["wsdl"],
    "application/wspolicy+xml": ["wspolicy"],
    "application/xaml+xml": ["xaml"],
    "application/xcap-att+xml": ["xav"],
    "application/xcap-caps+xml": ["xca"],
    "application/xcap-diff+xml": ["xdf"],
    "application/xcap-el+xml": ["xel"],
    "application/xcap-error+xml": ["xer"],
    "application/xcap-ns+xml": ["xns"],
    "application/xenc+xml": ["xenc"],
    "application/xhtml+xml": ["xhtml", "xht"],
    "application/xliff+xml": ["xlf"],
    "application/xml": ["xml", "xsl", "xsd", "rng"],
    "application/xml-dtd": ["dtd"],
    "application/xop+xml": ["xop"],
    "application/xproc+xml": ["xpl"],
    "application/xslt+xml": ["*xsl", "xslt"],
    "application/xspf+xml": ["xspf"],
    "application/xv+xml": ["mxml", "xhvml", "xvml", "xvm"],
    "application/yang": ["yang"],
    "application/yin+xml": ["yin"],
    "application/zip": ["zip"],
    "audio/3gpp": ["*3gpp"],
    "audio/adpcm": ["adp"],
    "audio/amr": ["amr"],
    "audio/basic": ["au", "snd"],
    "audio/midi": ["mid", "midi", "kar", "rmi"],
    "audio/mobile-xmf": ["mxmf"],
    "audio/mp3": ["*mp3"],
    "audio/mp4": ["m4a", "mp4a"],
    "audio/mpeg": ["mpga", "mp2", "mp2a", "mp3", "m2a", "m3a"],
    "audio/ogg": ["oga", "ogg", "spx", "opus"],
    "audio/s3m": ["s3m"],
    "audio/silk": ["sil"],
    "audio/wav": ["wav"],
    "audio/wave": ["*wav"],
    "audio/webm": ["weba"],
    "audio/xm": ["xm"],
    "font/collection": ["ttc"],
    "font/otf": ["otf"],
    "font/ttf": ["ttf"],
    "font/woff": ["woff"],
    "font/woff2": ["woff2"],
    "image/aces": ["exr"],
    "image/apng": ["apng"],
    "image/avif": ["avif"],
    "image/bmp": ["bmp"],
    "image/cgm": ["cgm"],
    "image/dicom-rle": ["drle"],
    "image/emf": ["emf"],
    "image/fits": ["fits"],
    "image/g3fax": ["g3"],
    "image/gif": ["gif"],
    "image/heic": ["heic"],
    "image/heic-sequence": ["heics"],
    "image/heif": ["heif"],
    "image/heif-sequence": ["heifs"],
    "image/hej2k": ["hej2"],
    "image/hsj2": ["hsj2"],
    "image/ief": ["ief"],
    "image/jls": ["jls"],
    "image/jp2": ["jp2", "jpg2"],
    "image/jpeg": ["jpeg", "jpg", "jpe"],
    "image/jph": ["jph"],
    "image/jphc": ["jhc"],
    "image/jpm": ["jpm"],
    "image/jpx": ["jpx", "jpf"],
    "image/jxr": ["jxr"],
    "image/jxra": ["jxra"],
    "image/jxrs": ["jxrs"],
    "image/jxs": ["jxs"],
    "image/jxsc": ["jxsc"],
    "image/jxsi": ["jxsi"],
    "image/jxss": ["jxss"],
    "image/ktx": ["ktx"],
    "image/ktx2": ["ktx2"],
    "image/png": ["png"],
    "image/sgi": ["sgi"],
    "image/svg+xml": ["svg", "svgz"],
    "image/t38": ["t38"],
    "image/tiff": ["tif", "tiff"],
    "image/tiff-fx": ["tfx"],
    "image/webp": ["webp"],
    "image/wmf": ["wmf"],
    "message/disposition-notification": ["disposition-notification"],
    "message/global": ["u8msg"],
    "message/global-delivery-status": ["u8dsn"],
    "message/global-disposition-notification": ["u8mdn"],
    "message/global-headers": ["u8hdr"],
    "message/rfc822": ["eml", "mime"],
    "model/3mf": ["3mf"],
    "model/gltf+json": ["gltf"],
    "model/gltf-binary": ["glb"],
    "model/iges": ["igs", "iges"],
    "model/mesh": ["msh", "mesh", "silo"],
    "model/mtl": ["mtl"],
    "model/obj": ["obj"],
    "model/stl": ["stl"],
    "model/vrml": ["wrl", "vrml"],
    "model/x3d+binary": ["*x3db", "x3dbz"],
    "model/x3d+fastinfoset": ["x3db"],
    "model/x3d+vrml": ["*x3dv", "x3dvz"],
    "model/x3d+xml": ["x3d", "x3dz"],
    "model/x3d-vrml": ["x3dv"],
    "text/cache-manifest": ["appcache", "manifest"],
    "text/calendar": ["ics", "ifb"],
    "text/coffeescript": ["coffee", "litcoffee"],
    "text/css": ["css"],
    "text/csv": ["csv"],
    "text/html": ["html", "htm", "shtml"],
    "text/jade": ["jade"],
    "text/jsx": ["jsx"],
    "text/less": ["less"],
    "text/markdown": ["markdown", "md"],
    "text/mathml": ["mml"],
    "text/mdx": ["mdx"],
    "text/n3": ["n3"],
    "text/plain": ["txt", "text", "conf", "def", "list", "log", "in", "ini"],
    "text/richtext": ["rtx"],
    "text/rtf": ["*rtf"],
    "text/sgml": ["sgml", "sgm"],
    "text/shex": ["shex"],
    "text/slim": ["slim", "slm"],
    "text/spdx": ["spdx"],
    "text/stylus": ["stylus", "styl"],
    "text/tab-separated-values": ["tsv"],
    "text/troff": ["t", "tr", "roff", "man", "me", "ms"],
    "text/turtle": ["ttl"],
    "text/uri-list": ["uri", "uris", "urls"],
    "text/vcard": ["vcard"],
    "text/vtt": ["vtt"],
    "text/xml": ["*xml"],
    "text/yaml": ["yaml", "yml"],
    "video/3gpp": ["3gp", "3gpp"],
    "video/3gpp2": ["3g2"],
    "video/h261": ["h261"],
    "video/h263": ["h263"],
    "video/h264": ["h264"],
    "video/iso.segment": ["m4s"],
    "video/jpeg": ["jpgv"],
    "video/jpm": ["*jpm", "jpgm"],
    "video/mj2": ["mj2", "mjp2"],
    "video/mp2t": ["ts"],
    "video/mp4": ["mp4", "mp4v", "mpg4"],
    "video/mpeg": ["mpeg", "mpg", "mpe", "m1v", "m2v"],
    "video/ogg": ["ogv"],
    "video/quicktime": ["qt", "mov"],
    "video/webm": ["webm"]
  };

  var lite = new Mime_1(standard);

  // @@match logic
  fixRegexpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
    return [
      // `String.prototype.match` method
      // https://tc39.es/ecma262/#sec-string.prototype.match
      function match(regexp) {
        var O = requireObjectCoercible(this);
        var matcher = regexp == undefined ? undefined : regexp[MATCH];
        return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
      },
      // `RegExp.prototype[@@match]` method
      // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
      function (regexp) {
        var res = maybeCallNative(nativeMatch, regexp, this);
        if (res.done) return res.value;

        var rx = anObject(regexp);
        var S = String(this);

        if (!rx.global) return regexpExecAbstract(rx, S);

        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
        var A = [];
        var n = 0;
        var result;
        while ((result = regexpExecAbstract(rx, S)) !== null) {
          var matchStr = String(result[0]);
          A[n] = matchStr;
          if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
          n++;
        }
        return n === 0 ? null : A;
      }
    ];
  });

  var UNSUPPORTED_Y = regexpStickyHelpers.UNSUPPORTED_Y;

  // `RegExp.prototype.flags` getter
  // https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
  if (descriptors && (/./g.flags != 'g' || UNSUPPORTED_Y)) {
    objectDefineProperty.f(RegExp.prototype, 'flags', {
      configurable: true,
      get: regexpFlags
    });
  }

  var basename = function basename(path) {
    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    for (i = path.length - 1; i >= 0; --i) {
      if (path.charCodeAt(i) === 47) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end = i + 1;
      }
    }

    if (end === -1) {
      return '';
    }

    return path.slice(start, end);
  };

  var path = {
    basename: basename
  };

  function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  var WIN_SLASH = '\\\\/';
  var WIN_NO_SLASH = "[^".concat(WIN_SLASH, "]");
  /**
   * Posix glob regex
   */

  var DOT_LITERAL = '\\.';
  var PLUS_LITERAL = '\\+';
  var QMARK_LITERAL = '\\?';
  var SLASH_LITERAL = '\\/';
  var ONE_CHAR = '(?=.)';
  var QMARK = '[^/]';
  var END_ANCHOR = "(?:".concat(SLASH_LITERAL, "|$)");
  var START_ANCHOR = "(?:^|".concat(SLASH_LITERAL, ")");
  var DOTS_SLASH = "".concat(DOT_LITERAL, "{1,2}").concat(END_ANCHOR);
  var NO_DOT = "(?!".concat(DOT_LITERAL, ")");
  var NO_DOTS = "(?!".concat(START_ANCHOR).concat(DOTS_SLASH, ")");
  var NO_DOT_SLASH = "(?!".concat(DOT_LITERAL, "{0,1}").concat(END_ANCHOR, ")");
  var NO_DOTS_SLASH = "(?!".concat(DOTS_SLASH, ")");
  var QMARK_NO_DOT = "[^.".concat(SLASH_LITERAL, "]");
  var STAR = "".concat(QMARK, "*?");
  var POSIX_CHARS = {
    DOT_LITERAL: DOT_LITERAL,
    PLUS_LITERAL: PLUS_LITERAL,
    QMARK_LITERAL: QMARK_LITERAL,
    SLASH_LITERAL: SLASH_LITERAL,
    ONE_CHAR: ONE_CHAR,
    QMARK: QMARK,
    END_ANCHOR: END_ANCHOR,
    DOTS_SLASH: DOTS_SLASH,
    NO_DOT: NO_DOT,
    NO_DOTS: NO_DOTS,
    NO_DOT_SLASH: NO_DOT_SLASH,
    NO_DOTS_SLASH: NO_DOTS_SLASH,
    QMARK_NO_DOT: QMARK_NO_DOT,
    STAR: STAR,
    START_ANCHOR: START_ANCHOR
  };
  /**
   * Windows glob regex
   */

  var WINDOWS_CHARS = _objectSpread$5(_objectSpread$5({}, POSIX_CHARS), {}, {
    SLASH_LITERAL: "[".concat(WIN_SLASH, "]"),
    QMARK: WIN_NO_SLASH,
    STAR: "".concat(WIN_NO_SLASH, "*?"),
    DOTS_SLASH: "".concat(DOT_LITERAL, "{1,2}(?:[").concat(WIN_SLASH, "]|$)"),
    NO_DOT: "(?!".concat(DOT_LITERAL, ")"),
    NO_DOTS: "(?!(?:^|[".concat(WIN_SLASH, "])").concat(DOT_LITERAL, "{1,2}(?:[").concat(WIN_SLASH, "]|$))"),
    NO_DOT_SLASH: "(?!".concat(DOT_LITERAL, "{0,1}(?:[").concat(WIN_SLASH, "]|$))"),
    NO_DOTS_SLASH: "(?!".concat(DOT_LITERAL, "{1,2}(?:[").concat(WIN_SLASH, "]|$))"),
    QMARK_NO_DOT: "[^.".concat(WIN_SLASH, "]"),
    START_ANCHOR: "(?:^|[".concat(WIN_SLASH, "])"),
    END_ANCHOR: "(?:[".concat(WIN_SLASH, "]|$)")
  });
  /**
   * POSIX Bracket Regex
   */


  var POSIX_REGEX_SOURCE$1 = {
    alnum: 'a-zA-Z0-9',
    alpha: 'a-zA-Z',
    ascii: '\\x00-\\x7F',
    blank: ' \\t',
    cntrl: '\\x00-\\x1F\\x7F',
    digit: '0-9',
    graph: '\\x21-\\x7E',
    lower: 'a-z',
    print: '\\x20-\\x7E ',
    punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
    space: ' \\t\\r\\n\\v\\f',
    upper: 'A-Z',
    word: 'A-Za-z0-9_',
    xdigit: 'A-Fa-f0-9'
  };
  var constants = {
    MAX_LENGTH: 1024 * 64,
    POSIX_REGEX_SOURCE: POSIX_REGEX_SOURCE$1,
    // regular expressions
    REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
    REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
    REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
    REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
    REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
    REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
    // Replace globs with equivalent patterns to reduce parsing time.
    REPLACEMENTS: {
      '***': '*',
      '**/**': '**',
      '**/**/**': '**'
    },
    // Digits
    CHAR_0: 48,

    /* 0 */
    CHAR_9: 57,

    /* 9 */
    // Alphabet chars.
    CHAR_UPPERCASE_A: 65,

    /* A */
    CHAR_LOWERCASE_A: 97,

    /* a */
    CHAR_UPPERCASE_Z: 90,

    /* Z */
    CHAR_LOWERCASE_Z: 122,

    /* z */
    CHAR_LEFT_PARENTHESES: 40,

    /* ( */
    CHAR_RIGHT_PARENTHESES: 41,

    /* ) */
    CHAR_ASTERISK: 42,

    /* * */
    // Non-alphabetic chars.
    CHAR_AMPERSAND: 38,

    /* & */
    CHAR_AT: 64,

    /* @ */
    CHAR_BACKWARD_SLASH: 92,

    /* \ */
    CHAR_CARRIAGE_RETURN: 13,

    /* \r */
    CHAR_CIRCUMFLEX_ACCENT: 94,

    /* ^ */
    CHAR_COLON: 58,

    /* : */
    CHAR_COMMA: 44,

    /* , */
    CHAR_DOT: 46,

    /* . */
    CHAR_DOUBLE_QUOTE: 34,

    /* " */
    CHAR_EQUAL: 61,

    /* = */
    CHAR_EXCLAMATION_MARK: 33,

    /* ! */
    CHAR_FORM_FEED: 12,

    /* \f */
    CHAR_FORWARD_SLASH: 47,

    /* / */
    CHAR_GRAVE_ACCENT: 96,

    /* ` */
    CHAR_HASH: 35,

    /* # */
    CHAR_HYPHEN_MINUS: 45,

    /* - */
    CHAR_LEFT_ANGLE_BRACKET: 60,

    /* < */
    CHAR_LEFT_CURLY_BRACE: 123,

    /* { */
    CHAR_LEFT_SQUARE_BRACKET: 91,

    /* [ */
    CHAR_LINE_FEED: 10,

    /* \n */
    CHAR_NO_BREAK_SPACE: 160,

    /* \u00A0 */
    CHAR_PERCENT: 37,

    /* % */
    CHAR_PLUS: 43,

    /* + */
    CHAR_QUESTION_MARK: 63,

    /* ? */
    CHAR_RIGHT_ANGLE_BRACKET: 62,

    /* > */
    CHAR_RIGHT_CURLY_BRACE: 125,

    /* } */
    CHAR_RIGHT_SQUARE_BRACKET: 93,

    /* ] */
    CHAR_SEMICOLON: 59,

    /* ; */
    CHAR_SINGLE_QUOTE: 39,

    /* ' */
    CHAR_SPACE: 32,

    /*   */
    CHAR_TAB: 9,

    /* \t */
    CHAR_UNDERSCORE: 95,

    /* _ */
    CHAR_VERTICAL_LINE: 124,

    /* | */
    CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,

    /* \uFEFF */
    SEP: '/',

    /**
     * Create EXTGLOB_CHARS
     */
    extglobChars: function extglobChars(chars) {
      return {
        '!': {
          type: 'negate',
          open: '(?:(?!(?:',
          close: "))".concat(chars.STAR, ")")
        },
        '?': {
          type: 'qmark',
          open: '(?:',
          close: ')?'
        },
        '+': {
          type: 'plus',
          open: '(?:',
          close: ')+'
        },
        '*': {
          type: 'star',
          open: '(?:',
          close: ')*'
        },
        '@': {
          type: 'at',
          open: '(?:',
          close: ')'
        }
      };
    },

    /**
     * Create GLOB_CHARS
     */
    globChars: function globChars() {
      var win32 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
    }
  };

  var utils = createCommonjsModule(function (module, exports) {

    var REGEX_BACKSLASH = constants.REGEX_BACKSLASH,
        REGEX_REMOVE_BACKSLASH = constants.REGEX_REMOVE_BACKSLASH,
        REGEX_SPECIAL_CHARS = constants.REGEX_SPECIAL_CHARS,
        REGEX_SPECIAL_CHARS_GLOBAL = constants.REGEX_SPECIAL_CHARS_GLOBAL;

    exports.isObject = function (val) {
      return val !== null && _typeof$2(val) === 'object' && !Array.isArray(val);
    };

    exports.hasRegexChars = function (str) {
      return REGEX_SPECIAL_CHARS.test(str);
    };

    exports.isRegexChar = function (str) {
      return str.length === 1 && exports.hasRegexChars(str);
    };

    exports.escapeRegex = function (str) {
      return str.replace(REGEX_SPECIAL_CHARS_GLOBAL, '\\$1');
    };

    exports.toPosixSlashes = function (str) {
      return str.replace(REGEX_BACKSLASH, '/');
    };

    exports.removeBackslashes = function (str) {
      return str.replace(REGEX_REMOVE_BACKSLASH, function (match) {
        return match === '\\' ? '' : match;
      });
    };

    exports.isWindows = function (options) {
      if (options && typeof options.windows === 'boolean') {
        return options.windows;
      }

      return false;
    };

    exports.escapeLast = function (input, char, lastIdx) {
      var idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1) return input;
      if (input[idx - 1] === '\\') return exports.escapeLast(input, char, idx - 1);
      return "".concat(input.slice(0, idx), "\\").concat(input.slice(idx));
    };

    exports.removePrefix = function (input) {
      var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var output = input;

      if (output.startsWith('./')) {
        output = output.slice(2);
        state.prefix = './';
      }

      return output;
    };

    exports.wrapOutput = function (input) {
      var state = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var prepend = options.contains ? '' : '^';
      var append = options.contains ? '' : '$';
      var output = "".concat(prepend, "(?:").concat(input, ")").concat(append);

      if (state.negated === true) {
        output = "(?:^(?!".concat(output, ").*$)");
      }

      return output;
    };
  });

  var CHAR_ASTERISK = constants.CHAR_ASTERISK,
      CHAR_AT = constants.CHAR_AT,
      CHAR_BACKWARD_SLASH = constants.CHAR_BACKWARD_SLASH,
      CHAR_COMMA = constants.CHAR_COMMA,
      CHAR_DOT = constants.CHAR_DOT,
      CHAR_EXCLAMATION_MARK = constants.CHAR_EXCLAMATION_MARK,
      CHAR_FORWARD_SLASH = constants.CHAR_FORWARD_SLASH,
      CHAR_LEFT_CURLY_BRACE = constants.CHAR_LEFT_CURLY_BRACE,
      CHAR_LEFT_PARENTHESES = constants.CHAR_LEFT_PARENTHESES,
      CHAR_LEFT_SQUARE_BRACKET = constants.CHAR_LEFT_SQUARE_BRACKET,
      CHAR_PLUS = constants.CHAR_PLUS,
      CHAR_QUESTION_MARK = constants.CHAR_QUESTION_MARK,
      CHAR_RIGHT_CURLY_BRACE = constants.CHAR_RIGHT_CURLY_BRACE,
      CHAR_RIGHT_PARENTHESES = constants.CHAR_RIGHT_PARENTHESES,
      CHAR_RIGHT_SQUARE_BRACKET = constants.CHAR_RIGHT_SQUARE_BRACKET;

  var isPathSeparator = function isPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  };

  var depth = function depth(token) {
    if (token.isPrefix !== true) {
      token.depth = token.isGlobstar ? Infinity : 1;
    }
  };
  /**
   * Quickly scans a glob pattern and returns an object with a handful of
   * useful properties, like `isGlob`, `path` (the leading non-glob, if it exists),
   * `glob` (the actual pattern), and `negated` (true if the path starts with `!`).
   *
   * ```js
   * const pm = require('picomatch');
   * console.log(pm.scan('foo/bar/*.js'));
   * { isGlob: true, input: 'foo/bar/*.js', base: 'foo/bar', glob: '*.js' }
   * ```
   * @param {String} `str`
   * @param {Object} `options`
   * @return {Object} Returns an object with tokens and regex source string.
   * @api public
   */


  var scan = function scan(input, options) {
    var opts = options || {};
    var length = input.length - 1;
    var scanToEnd = opts.parts === true || opts.scanToEnd === true;
    var slashes = [];
    var tokens = [];
    var parts = [];
    var str = input;
    var index = -1;
    var start = 0;
    var lastIndex = 0;
    var isBrace = false;
    var isBracket = false;
    var isGlob = false;
    var isExtglob = false;
    var isGlobstar = false;
    var braceEscaped = false;
    var backslashes = false;
    var negated = false;
    var finished = false;
    var braces = 0;
    var prev;
    var code;
    var token = {
      value: '',
      depth: 0,
      isGlob: false
    };

    var eos = function eos() {
      return index >= length;
    };

    var peek = function peek() {
      return str.charCodeAt(index + 1);
    };

    var advance = function advance() {
      prev = code;
      return str.charCodeAt(++index);
    };

    while (index < length) {
      code = advance();
      var next = void 0;

      if (code === CHAR_BACKWARD_SLASH) {
        backslashes = token.backslashes = true;
        code = advance();

        if (code === CHAR_LEFT_CURLY_BRACE) {
          braceEscaped = true;
        }

        continue;
      }

      if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
        braces++;

        while (eos() !== true && (code = advance())) {
          if (code === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }

          if (code === CHAR_LEFT_CURLY_BRACE) {
            braces++;
            continue;
          }

          if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;

            if (scanToEnd === true) {
              continue;
            }

            break;
          }

          if (braceEscaped !== true && code === CHAR_COMMA) {
            isBrace = token.isBrace = true;
            isGlob = token.isGlob = true;
            finished = true;

            if (scanToEnd === true) {
              continue;
            }

            break;
          }

          if (code === CHAR_RIGHT_CURLY_BRACE) {
            braces--;

            if (braces === 0) {
              braceEscaped = false;
              isBrace = token.isBrace = true;
              finished = true;
              break;
            }
          }
        }

        if (scanToEnd === true) {
          continue;
        }

        break;
      }

      if (code === CHAR_FORWARD_SLASH) {
        slashes.push(index);
        tokens.push(token);
        token = {
          value: '',
          depth: 0,
          isGlob: false
        };
        if (finished === true) continue;

        if (prev === CHAR_DOT && index === start + 1) {
          start += 2;
          continue;
        }

        lastIndex = index + 1;
        continue;
      }

      if (opts.noext !== true) {
        var isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;

        if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          isExtglob = token.isExtglob = true;
          finished = true;

          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }

              if (code === CHAR_RIGHT_PARENTHESES) {
                isGlob = token.isGlob = true;
                finished = true;
                break;
              }
            }

            continue;
          }

          break;
        }
      }

      if (code === CHAR_ASTERISK) {
        if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
        isGlob = token.isGlob = true;
        finished = true;

        if (scanToEnd === true) {
          continue;
        }

        break;
      }

      if (code === CHAR_QUESTION_MARK) {
        isGlob = token.isGlob = true;
        finished = true;

        if (scanToEnd === true) {
          continue;
        }

        break;
      }

      if (code === CHAR_LEFT_SQUARE_BRACKET) {
        while (eos() !== true && (next = advance())) {
          if (next === CHAR_BACKWARD_SLASH) {
            backslashes = token.backslashes = true;
            advance();
            continue;
          }

          if (next === CHAR_RIGHT_SQUARE_BRACKET) {
            isBracket = token.isBracket = true;
            isGlob = token.isGlob = true;
            finished = true;

            if (scanToEnd === true) {
              continue;
            }

            break;
          }
        }
      }

      if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
        negated = token.negated = true;
        start++;
        continue;
      }

      if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
        isGlob = token.isGlob = true;

        if (scanToEnd === true) {
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_LEFT_PARENTHESES) {
              backslashes = token.backslashes = true;
              code = advance();
              continue;
            }

            if (code === CHAR_RIGHT_PARENTHESES) {
              finished = true;
              break;
            }
          }

          continue;
        }

        break;
      }

      if (isGlob === true) {
        finished = true;

        if (scanToEnd === true) {
          continue;
        }

        break;
      }
    }

    if (opts.noext === true) {
      isExtglob = false;
      isGlob = false;
    }

    var base = str;
    var prefix = '';
    var glob = '';

    if (start > 0) {
      prefix = str.slice(0, start);
      str = str.slice(start);
      lastIndex -= start;
    }

    if (base && isGlob === true && lastIndex > 0) {
      base = str.slice(0, lastIndex);
      glob = str.slice(lastIndex);
    } else if (isGlob === true) {
      base = '';
      glob = str;
    } else {
      base = str;
    }

    if (base && base !== '' && base !== '/' && base !== str) {
      if (isPathSeparator(base.charCodeAt(base.length - 1))) {
        base = base.slice(0, -1);
      }
    }

    if (opts.unescape === true) {
      if (glob) glob = utils.removeBackslashes(glob);

      if (base && backslashes === true) {
        base = utils.removeBackslashes(base);
      }
    }

    var state = {
      prefix: prefix,
      input: input,
      start: start,
      base: base,
      glob: glob,
      isBrace: isBrace,
      isBracket: isBracket,
      isGlob: isGlob,
      isExtglob: isExtglob,
      isGlobstar: isGlobstar,
      negated: negated
    };

    if (opts.tokens === true) {
      state.maxDepth = 0;

      if (!isPathSeparator(code)) {
        tokens.push(token);
      }

      state.tokens = tokens;
    }

    if (opts.parts === true || opts.tokens === true) {
      var prevIndex;

      for (var idx = 0; idx < slashes.length; idx++) {
        var n = prevIndex ? prevIndex + 1 : start;
        var i = slashes[idx];
        var value = input.slice(n, i);

        if (opts.tokens) {
          if (idx === 0 && start !== 0) {
            tokens[idx].isPrefix = true;
            tokens[idx].value = prefix;
          } else {
            tokens[idx].value = value;
          }

          depth(tokens[idx]);
          state.maxDepth += tokens[idx].depth;
        }

        if (idx !== 0 || value !== '') {
          parts.push(value);
        }

        prevIndex = i;
      }

      if (prevIndex && prevIndex + 1 < input.length) {
        var _value = input.slice(prevIndex + 1);

        parts.push(_value);

        if (opts.tokens) {
          tokens[tokens.length - 1].value = _value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
      }

      state.slashes = slashes;
      state.parts = parts;
    }

    return state;
  };

  var scan_1 = scan;

  var nativeJoin = [].join;

  var ES3_STRINGS = indexedObject != Object;
  var STRICT_METHOD$2 = arrayMethodIsStrict('join', ',');

  // `Array.prototype.join` method
  // https://tc39.es/ecma262/#sec-array.prototype.join
  _export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$2 }, {
    join: function join(separator) {
      return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
    }
  });

  var $includes$1 = arrayIncludes.includes;


  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  _export({ target: 'Array', proto: true }, {
    includes: function includes(el /* , fromIndex = 0 */) {
      return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
  addToUnscopables('includes');

  // `String.prototype.includes` method
  // https://tc39.es/ecma262/#sec-string.prototype.includes
  _export({ target: 'String', proto: true, forced: !correctIsRegexpLogic('includes') }, {
    includes: function includes(searchString /* , position = 0 */) {
      return !!~String(requireObjectCoercible(this))
        .indexOf(notARegexp(searchString), arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  // `String.prototype.repeat` method
  // https://tc39.es/ecma262/#sec-string.prototype.repeat
  _export({ target: 'String', proto: true }, {
    repeat: stringRepeat
  });

  function _createForOfIteratorHelper$1(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

  function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
  /**
   * Constants
   */


  var MAX_LENGTH = constants.MAX_LENGTH,
      POSIX_REGEX_SOURCE = constants.POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS = constants.REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF = constants.REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS = constants.REPLACEMENTS;
  /**
   * Helpers
   */

  var expandRange = function expandRange(args, options) {
    if (typeof options.expandRange === 'function') {
      return options.expandRange.apply(options, _toConsumableArray(args).concat([options]));
    }

    args.sort();
    var value = "[".concat(args.join('-'), "]");

    try {
      /* eslint-disable-next-line no-new */
      new RegExp(value);
    } catch (ex) {
      return args.map(function (v) {
        return utils.escapeRegex(v);
      }).join('..');
    }

    return value;
  };
  /**
   * Create the message for a syntax error
   */


  var syntaxError = function syntaxError(type, char) {
    return "Missing ".concat(type, ": \"").concat(char, "\" - use \"\\\\").concat(char, "\" to match literal characters");
  };
  /**
   * Parse the given input string.
   * @param {String} input
   * @param {Object} options
   * @return {Object}
   */


  var parse$1 = function parse(input, options) {
    if (typeof input !== 'string') {
      throw new TypeError('Expected a string');
    }

    input = REPLACEMENTS[input] || input;

    var opts = _objectSpread$4({}, options);

    var max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    var len = input.length;

    if (len > max) {
      throw new SyntaxError("Input length: ".concat(len, ", exceeds maximum allowed length: ").concat(max));
    }

    var bos = {
      type: 'bos',
      value: '',
      output: opts.prepend || ''
    };
    var tokens = [bos];
    var capture = opts.capture ? '' : '?:';
    var PLATFORM_CHARS = constants.globChars();
    var EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
    var DOT_LITERAL = PLATFORM_CHARS.DOT_LITERAL,
        PLUS_LITERAL = PLATFORM_CHARS.PLUS_LITERAL,
        SLASH_LITERAL = PLATFORM_CHARS.SLASH_LITERAL,
        ONE_CHAR = PLATFORM_CHARS.ONE_CHAR,
        DOTS_SLASH = PLATFORM_CHARS.DOTS_SLASH,
        NO_DOT = PLATFORM_CHARS.NO_DOT,
        NO_DOT_SLASH = PLATFORM_CHARS.NO_DOT_SLASH,
        NO_DOTS_SLASH = PLATFORM_CHARS.NO_DOTS_SLASH,
        QMARK = PLATFORM_CHARS.QMARK,
        QMARK_NO_DOT = PLATFORM_CHARS.QMARK_NO_DOT,
        STAR = PLATFORM_CHARS.STAR,
        START_ANCHOR = PLATFORM_CHARS.START_ANCHOR;

    var globstar = function globstar(opts) {
      return "(".concat(capture, "(?:(?!").concat(START_ANCHOR).concat(opts.dot ? DOTS_SLASH : DOT_LITERAL, ").)*?)");
    };

    var nodot = opts.dot ? '' : NO_DOT;
    var qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
    var star = opts.bash === true ? globstar(opts) : STAR;

    if (opts.capture) {
      star = "(".concat(star, ")");
    } // minimatch options support


    if (typeof opts.noext === 'boolean') {
      opts.noextglob = opts.noext;
    }

    var state = {
      input: input,
      index: -1,
      start: 0,
      dot: opts.dot === true,
      consumed: '',
      output: '',
      prefix: '',
      backtrack: false,
      negated: false,
      brackets: 0,
      braces: 0,
      parens: 0,
      quotes: 0,
      globstar: false,
      tokens: tokens
    };
    input = utils.removePrefix(input, state);
    len = input.length;
    var extglobs = [];
    var braces = [];
    var stack = [];
    var prev = bos;
    var value;
    /**
     * Tokenizing helpers
     */

    var eos = function eos() {
      return state.index === len - 1;
    };

    var peek = state.peek = function () {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      return input[state.index + n];
    };

    var advance = state.advance = function () {
      return input[++state.index];
    };

    var remaining = function remaining() {
      return input.slice(state.index + 1);
    };

    var consume = function consume() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var num = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      state.consumed += value;
      state.index += num;
    };

    var append = function append(token) {
      state.output += token.output != null ? token.output : token.value;
      consume(token.value);
    };

    var negate = function negate() {
      var count = 1;

      while (peek() === '!' && (peek(2) !== '(' || peek(3) === '?')) {
        advance();
        state.start++;
        count++;
      }

      if (count % 2 === 0) {
        return false;
      }

      state.negated = true;
      state.start++;
      return true;
    };

    var increment = function increment(type) {
      state[type]++;
      stack.push(type);
    };

    var decrement = function decrement(type) {
      state[type]--;
      stack.pop();
    };
    /**
     * Push tokens onto the tokens array. This helper speeds up
     * tokenizing by 1) helping us avoid backtracking as much as possible,
     * and 2) helping us avoid creating extra tokens when consecutive
     * characters are plain text. This improves performance and simplifies
     * lookbehinds.
     */


    var push = function push(tok) {
      if (prev.type === 'globstar') {
        var isBrace = state.braces > 0 && (tok.type === 'comma' || tok.type === 'brace');
        var isExtglob = tok.extglob === true || extglobs.length && (tok.type === 'pipe' || tok.type === 'paren');

        if (tok.type !== 'slash' && tok.type !== 'paren' && !isBrace && !isExtglob) {
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = 'star';
          prev.value = '*';
          prev.output = star;
          state.output += prev.output;
        }
      }

      if (extglobs.length && tok.type !== 'paren' && !EXTGLOB_CHARS[tok.value]) {
        extglobs[extglobs.length - 1].inner += tok.value;
      }

      if (tok.value || tok.output) append(tok);

      if (prev && prev.type === 'text' && tok.type === 'text') {
        prev.value += tok.value;
        prev.output = (prev.output || '') + tok.value;
        return;
      }

      tok.prev = prev;
      tokens.push(tok);
      prev = tok;
    };

    var extglobOpen = function extglobOpen(type, value) {
      var token = _objectSpread$4(_objectSpread$4({}, EXTGLOB_CHARS[value]), {}, {
        conditions: 1,
        inner: ''
      });

      token.prev = prev;
      token.parens = state.parens;
      token.output = state.output;
      var output = (opts.capture ? '(' : '') + token.open;
      increment('parens');
      push({
        type: type,
        value: value,
        output: state.output ? '' : ONE_CHAR
      });
      push({
        type: 'paren',
        extglob: true,
        value: advance(),
        output: output
      });
      extglobs.push(token);
    };

    var extglobClose = function extglobClose(token) {
      var output = token.close + (opts.capture ? ')' : '');

      if (token.type === 'negate') {
        var extglobStar = star;

        if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
          extglobStar = globstar(opts);
        }

        if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
          output = token.close = ")$))".concat(extglobStar);
        }

        if (token.prev.type === 'bos' && eos()) {
          state.negatedExtglob = true;
        }
      }

      push({
        type: 'paren',
        extglob: true,
        value: value,
        output: output
      });
      decrement('parens');
    };
    /**
     * Fast paths
     */


    if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
      var backslashes = false;
      var output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, function (m, esc, chars, first, rest, index) {
        if (first === '\\') {
          backslashes = true;
          return m;
        }

        if (first === '?') {
          if (esc) {
            return esc + first + (rest ? QMARK.repeat(rest.length) : '');
          }

          if (index === 0) {
            return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : '');
          }

          return QMARK.repeat(chars.length);
        }

        if (first === '.') {
          return DOT_LITERAL.repeat(chars.length);
        }

        if (first === '*') {
          if (esc) {
            return esc + first + (rest ? star : '');
          }

          return star;
        }

        return esc ? m : "\\".concat(m);
      });

      if (backslashes === true) {
        if (opts.unescape === true) {
          output = output.replace(/\\/g, '');
        } else {
          output = output.replace(/\\+/g, function (m) {
            return m.length % 2 === 0 ? '\\\\' : m ? '\\' : '';
          });
        }
      }

      if (output === input && opts.contains === true) {
        state.output = input;
        return state;
      }

      state.output = utils.wrapOutput(output, state, options);
      return state;
    }
    /**
     * Tokenize input until we reach end-of-string
     */


    while (!eos()) {
      value = advance();

      if (value === "\0") {
        continue;
      }
      /**
       * Escaped characters
       */


      if (value === '\\') {
        var next = peek();

        if (next === '/' && opts.bash !== true) {
          continue;
        }

        if (next === '.' || next === ';') {
          continue;
        }

        if (!next) {
          value += '\\';
          push({
            type: 'text',
            value: value
          });
          continue;
        } // collapse slashes to reduce potential for exploits


        var match = /^\\+/.exec(remaining());
        var slashes = 0;

        if (match && match[0].length > 2) {
          slashes = match[0].length;
          state.index += slashes;

          if (slashes % 2 !== 0) {
            value += '\\';
          }
        }

        if (opts.unescape === true) {
          value = advance() || '';
        } else {
          value += advance() || '';
        }

        if (state.brackets === 0) {
          push({
            type: 'text',
            value: value
          });
          continue;
        }
      }
      /**
       * If we're inside a regex character class, continue
       * until we reach the closing bracket.
       */


      if (state.brackets > 0 && (value !== ']' || prev.value === '[' || prev.value === '[^')) {
        if (opts.posix !== false && value === ':') {
          var inner = prev.value.slice(1);

          if (inner.includes('[')) {
            prev.posix = true;

            if (inner.includes(':')) {
              var idx = prev.value.lastIndexOf('[');
              var pre = prev.value.slice(0, idx);

              var _rest = prev.value.slice(idx + 2);

              var posix = POSIX_REGEX_SOURCE[_rest];

              if (posix) {
                prev.value = pre + posix;
                state.backtrack = true;
                advance();

                if (!bos.output && tokens.indexOf(prev) === 1) {
                  bos.output = ONE_CHAR;
                }

                continue;
              }
            }
          }
        }

        if (value === '[' && peek() !== ':' || value === '-' && peek() === ']') {
          value = "\\".concat(value);
        }

        if (value === ']' && (prev.value === '[' || prev.value === '[^')) {
          value = "\\".concat(value);
        }

        if (opts.posix === true && value === '!' && prev.value === '[') {
          value = '^';
        }

        prev.value += value;
        append({
          value: value
        });
        continue;
      }
      /**
       * If we're inside a quoted string, continue
       * until we reach the closing double quote.
       */


      if (state.quotes === 1 && value !== '"') {
        value = utils.escapeRegex(value);
        prev.value += value;
        append({
          value: value
        });
        continue;
      }
      /**
       * Double quotes
       */


      if (value === '"') {
        state.quotes = state.quotes === 1 ? 0 : 1;

        if (opts.keepQuotes === true) {
          push({
            type: 'text',
            value: value
          });
        }

        continue;
      }
      /**
       * Parentheses
       */


      if (value === '(') {
        increment('parens');
        push({
          type: 'paren',
          value: value
        });
        continue;
      }

      if (value === ')') {
        if (state.parens === 0 && opts.strictBrackets === true) {
          throw new SyntaxError(syntaxError('opening', '('));
        }

        var extglob = extglobs[extglobs.length - 1];

        if (extglob && state.parens === extglob.parens + 1) {
          extglobClose(extglobs.pop());
          continue;
        }

        push({
          type: 'paren',
          value: value,
          output: state.parens ? ')' : '\\)'
        });
        decrement('parens');
        continue;
      }
      /**
       * Square brackets
       */


      if (value === '[') {
        if (opts.nobracket === true || !remaining().includes(']')) {
          if (opts.nobracket !== true && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError('closing', ']'));
          }

          value = "\\".concat(value);
        } else {
          increment('brackets');
        }

        push({
          type: 'bracket',
          value: value
        });
        continue;
      }

      if (value === ']') {
        if (opts.nobracket === true || prev && prev.type === 'bracket' && prev.value.length === 1) {
          push({
            type: 'text',
            value: value,
            output: "\\".concat(value)
          });
          continue;
        }

        if (state.brackets === 0) {
          if (opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError('opening', '['));
          }

          push({
            type: 'text',
            value: value,
            output: "\\".concat(value)
          });
          continue;
        }

        decrement('brackets');
        var prevValue = prev.value.slice(1);

        if (prev.posix !== true && prevValue[0] === '^' && !prevValue.includes('/')) {
          value = "/".concat(value);
        }

        prev.value += value;
        append({
          value: value
        }); // when literal brackets are explicitly disabled
        // assume we should match with a regex character class

        if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
          continue;
        }

        var escaped = utils.escapeRegex(prev.value);
        state.output = state.output.slice(0, -prev.value.length); // when literal brackets are explicitly enabled
        // assume we should escape the brackets to match literal characters

        if (opts.literalBrackets === true) {
          state.output += escaped;
          prev.value = escaped;
          continue;
        } // when the user specifies nothing, try to match both


        prev.value = "(".concat(capture).concat(escaped, "|").concat(prev.value, ")");
        state.output += prev.value;
        continue;
      }
      /**
       * Braces
       */


      if (value === '{' && opts.nobrace !== true) {
        increment('braces');
        var open = {
          type: 'brace',
          value: value,
          output: '(',
          outputIndex: state.output.length,
          tokensIndex: state.tokens.length
        };
        braces.push(open);
        push(open);
        continue;
      }

      if (value === '}') {
        var brace = braces[braces.length - 1];

        if (opts.nobrace === true || !brace) {
          push({
            type: 'text',
            value: value,
            output: value
          });
          continue;
        }

        var _output = ')';

        if (brace.dots === true) {
          var arr = tokens.slice();
          var range = [];

          for (var i = arr.length - 1; i >= 0; i--) {
            tokens.pop();

            if (arr[i].type === 'brace') {
              break;
            }

            if (arr[i].type !== 'dots') {
              range.unshift(arr[i].value);
            }
          }

          _output = expandRange(range, opts);
          state.backtrack = true;
        }

        if (brace.comma !== true && brace.dots !== true) {
          var out = state.output.slice(0, brace.outputIndex);
          var toks = state.tokens.slice(brace.tokensIndex);
          brace.value = brace.output = '\\{';
          value = _output = '\\}';
          state.output = out;

          var _iterator = _createForOfIteratorHelper$1(toks),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var t = _step.value;
              state.output += t.output || t.value;
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }

        push({
          type: 'brace',
          value: value,
          output: _output
        });
        decrement('braces');
        braces.pop();
        continue;
      }
      /**
       * Pipes
       */


      if (value === '|') {
        if (extglobs.length > 0) {
          extglobs[extglobs.length - 1].conditions++;
        }

        push({
          type: 'text',
          value: value
        });
        continue;
      }
      /**
       * Commas
       */


      if (value === ',') {
        var _output2 = value;
        var _brace = braces[braces.length - 1];

        if (_brace && stack[stack.length - 1] === 'braces') {
          _brace.comma = true;
          _output2 = '|';
        }

        push({
          type: 'comma',
          value: value,
          output: _output2
        });
        continue;
      }
      /**
       * Slashes
       */


      if (value === '/') {
        // if the beginning of the glob is "./", advance the start
        // to the current index, and don't add the "./" characters
        // to the state. This greatly simplifies lookbehinds when
        // checking for BOS characters like "!" and "." (not "./")
        if (prev.type === 'dot' && state.index === state.start + 1) {
          state.start = state.index + 1;
          state.consumed = '';
          state.output = '';
          tokens.pop();
          prev = bos; // reset "prev" to the first token

          continue;
        }

        push({
          type: 'slash',
          value: value,
          output: SLASH_LITERAL
        });
        continue;
      }
      /**
       * Dots
       */


      if (value === '.') {
        if (state.braces > 0 && prev.type === 'dot') {
          if (prev.value === '.') prev.output = DOT_LITERAL;
          var _brace2 = braces[braces.length - 1];
          prev.type = 'dots';
          prev.output += value;
          prev.value += value;
          _brace2.dots = true;
          continue;
        }

        if (state.braces + state.parens === 0 && prev.type !== 'bos' && prev.type !== 'slash') {
          push({
            type: 'text',
            value: value,
            output: DOT_LITERAL
          });
          continue;
        }

        push({
          type: 'dot',
          value: value,
          output: DOT_LITERAL
        });
        continue;
      }
      /**
       * Question marks
       */


      if (value === '?') {
        var isGroup = prev && prev.value === '(';

        if (!isGroup && opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
          extglobOpen('qmark', value);
          continue;
        }

        if (prev && prev.type === 'paren') {
          var _next = peek();

          var _output3 = value;

          if (prev.value === '(' && !/[!=<:]/.test(_next) || _next === '<' && !/<([!=]|\w+>)/.test(remaining())) {
            _output3 = "\\".concat(value);
          }

          push({
            type: 'text',
            value: value,
            output: _output3
          });
          continue;
        }

        if (opts.dot !== true && (prev.type === 'slash' || prev.type === 'bos')) {
          push({
            type: 'qmark',
            value: value,
            output: QMARK_NO_DOT
          });
          continue;
        }

        push({
          type: 'qmark',
          value: value,
          output: QMARK
        });
        continue;
      }
      /**
       * Exclamation
       */


      if (value === '!') {
        if (opts.noextglob !== true && peek() === '(') {
          if (peek(2) !== '?' || !/[!=<:]/.test(peek(3))) {
            extglobOpen('negate', value);
            continue;
          }
        }

        if (opts.nonegate !== true && state.index === 0) {
          negate();
          continue;
        }
      }
      /**
       * Plus
       */


      if (value === '+') {
        if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
          extglobOpen('plus', value);
          continue;
        }

        if (prev && prev.value === '(' || opts.regex === false) {
          push({
            type: 'plus',
            value: value,
            output: PLUS_LITERAL
          });
          continue;
        }

        if (prev && (prev.type === 'bracket' || prev.type === 'paren' || prev.type === 'brace') || state.parens > 0) {
          push({
            type: 'plus',
            value: value
          });
          continue;
        }

        push({
          type: 'plus',
          value: PLUS_LITERAL
        });
        continue;
      }
      /**
       * Plain text
       */


      if (value === '@') {
        if (opts.noextglob !== true && peek() === '(' && peek(2) !== '?') {
          push({
            type: 'at',
            extglob: true,
            value: value,
            output: ''
          });
          continue;
        }

        push({
          type: 'text',
          value: value
        });
        continue;
      }
      /**
       * Plain text
       */


      if (value !== '*') {
        if (value === '$' || value === '^') {
          value = "\\".concat(value);
        }

        var _match = REGEX_NON_SPECIAL_CHARS.exec(remaining());

        if (_match) {
          value += _match[0];
          state.index += _match[0].length;
        }

        push({
          type: 'text',
          value: value
        });
        continue;
      }
      /**
       * Stars
       */


      if (prev && (prev.type === 'globstar' || prev.star === true)) {
        prev.type = 'star';
        prev.star = true;
        prev.value += value;
        prev.output = star;
        state.backtrack = true;
        state.globstar = true;
        consume(value);
        continue;
      }

      var rest = remaining();

      if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
        extglobOpen('star', value);
        continue;
      }

      if (prev.type === 'star') {
        if (opts.noglobstar === true) {
          consume(value);
          continue;
        }

        var prior = prev.prev;
        var before = prior.prev;
        var isStart = prior.type === 'slash' || prior.type === 'bos';
        var afterStar = before && (before.type === 'star' || before.type === 'globstar');

        if (opts.bash === true && (!isStart || rest[0] && rest[0] !== '/')) {
          push({
            type: 'star',
            value: value,
            output: ''
          });
          continue;
        }

        var isBrace = state.braces > 0 && (prior.type === 'comma' || prior.type === 'brace');
        var isExtglob = extglobs.length && (prior.type === 'pipe' || prior.type === 'paren');

        if (!isStart && prior.type !== 'paren' && !isBrace && !isExtglob) {
          push({
            type: 'star',
            value: value,
            output: ''
          });
          continue;
        } // strip consecutive `/**/`


        while (rest.slice(0, 3) === '/**') {
          var after = input[state.index + 4];

          if (after && after !== '/') {
            break;
          }

          rest = rest.slice(3);
          consume('/**', 3);
        }

        if (prior.type === 'bos' && eos()) {
          prev.type = 'globstar';
          prev.value += value;
          prev.output = globstar(opts);
          state.output = prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }

        if (prior.type === 'slash' && prior.prev.type !== 'bos' && !afterStar && eos()) {
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = "(?:".concat(prior.output);
          prev.type = 'globstar';
          prev.output = globstar(opts) + (opts.strictSlashes ? ')' : '|$)');
          prev.value += value;
          state.globstar = true;
          state.output += prior.output + prev.output;
          consume(value);
          continue;
        }

        if (prior.type === 'slash' && prior.prev.type !== 'bos' && rest[0] === '/') {
          var end = rest[1] !== void 0 ? '|$' : '';
          state.output = state.output.slice(0, -(prior.output + prev.output).length);
          prior.output = "(?:".concat(prior.output);
          prev.type = 'globstar';
          prev.output = "".concat(globstar(opts)).concat(SLASH_LITERAL, "|").concat(SLASH_LITERAL).concat(end, ")");
          prev.value += value;
          state.output += prior.output + prev.output;
          state.globstar = true;
          consume(value + advance());
          push({
            type: 'slash',
            value: '/',
            output: ''
          });
          continue;
        }

        if (prior.type === 'bos' && rest[0] === '/') {
          prev.type = 'globstar';
          prev.value += value;
          prev.output = "(?:^|".concat(SLASH_LITERAL, "|").concat(globstar(opts)).concat(SLASH_LITERAL, ")");
          state.output = prev.output;
          state.globstar = true;
          consume(value + advance());
          push({
            type: 'slash',
            value: '/',
            output: ''
          });
          continue;
        } // remove single star from output


        state.output = state.output.slice(0, -prev.output.length); // reset previous token to globstar

        prev.type = 'globstar';
        prev.output = globstar(opts);
        prev.value += value; // reset output with globstar

        state.output += prev.output;
        state.globstar = true;
        consume(value);
        continue;
      }

      var token = {
        type: 'star',
        value: value,
        output: star
      };

      if (opts.bash === true) {
        token.output = '.*?';

        if (prev.type === 'bos' || prev.type === 'slash') {
          token.output = nodot + token.output;
        }

        push(token);
        continue;
      }

      if (prev && (prev.type === 'bracket' || prev.type === 'paren') && opts.regex === true) {
        token.output = value;
        push(token);
        continue;
      }

      if (state.index === state.start || prev.type === 'slash' || prev.type === 'dot') {
        if (prev.type === 'dot') {
          state.output += NO_DOT_SLASH;
          prev.output += NO_DOT_SLASH;
        } else if (opts.dot === true) {
          state.output += NO_DOTS_SLASH;
          prev.output += NO_DOTS_SLASH;
        } else {
          state.output += nodot;
          prev.output += nodot;
        }

        if (peek() !== '*') {
          state.output += ONE_CHAR;
          prev.output += ONE_CHAR;
        }
      }

      push(token);
    }

    while (state.brackets > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ']'));
      state.output = utils.escapeLast(state.output, '[');
      decrement('brackets');
    }

    while (state.parens > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
      state.output = utils.escapeLast(state.output, '(');
      decrement('parens');
    }

    while (state.braces > 0) {
      if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
      state.output = utils.escapeLast(state.output, '{');
      decrement('braces');
    }

    if (opts.strictSlashes !== true && (prev.type === 'star' || prev.type === 'bracket')) {
      push({
        type: 'maybe_slash',
        value: '',
        output: "".concat(SLASH_LITERAL, "?")
      });
    } // rebuild the output if we had to backtrack at any point


    if (state.backtrack === true) {
      state.output = '';

      var _iterator2 = _createForOfIteratorHelper$1(state.tokens),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _token = _step2.value;
          state.output += _token.output != null ? _token.output : _token.value;

          if (_token.suffix) {
            state.output += _token.suffix;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    return state;
  };
  /**
   * Fast paths for creating regular expressions for common glob patterns.
   * This can significantly speed up processing and has very little downside
   * impact when none of the fast paths match.
   */


  parse$1.fastpaths = function (input, options) {
    var opts = _objectSpread$4({}, options);

    var max = typeof opts.maxLength === 'number' ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
    var len = input.length;

    if (len > max) {
      throw new SyntaxError("Input length: ".concat(len, ", exceeds maximum allowed length: ").concat(max));
    }

    input = REPLACEMENTS[input] || input; // create constants based on platform, for windows or posix

    var _constants$globChars = constants.globChars(),
        DOT_LITERAL = _constants$globChars.DOT_LITERAL,
        SLASH_LITERAL = _constants$globChars.SLASH_LITERAL,
        ONE_CHAR = _constants$globChars.ONE_CHAR,
        DOTS_SLASH = _constants$globChars.DOTS_SLASH,
        NO_DOT = _constants$globChars.NO_DOT,
        NO_DOTS = _constants$globChars.NO_DOTS,
        NO_DOTS_SLASH = _constants$globChars.NO_DOTS_SLASH,
        STAR = _constants$globChars.STAR,
        START_ANCHOR = _constants$globChars.START_ANCHOR;

    var nodot = opts.dot ? NO_DOTS : NO_DOT;
    var slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
    var capture = opts.capture ? '' : '?:';
    var state = {
      negated: false,
      prefix: ''
    };
    var star = opts.bash === true ? '.*?' : STAR;

    if (opts.capture) {
      star = "(".concat(star, ")");
    }

    var globstar = function globstar(opts) {
      if (opts.noglobstar === true) return star;
      return "(".concat(capture, "(?:(?!").concat(START_ANCHOR).concat(opts.dot ? DOTS_SLASH : DOT_LITERAL, ").)*?)");
    };

    var create = function create(str) {
      switch (str) {
        case '*':
          return "".concat(nodot).concat(ONE_CHAR).concat(star);

        case '.*':
          return "".concat(DOT_LITERAL).concat(ONE_CHAR).concat(star);

        case '*.*':
          return "".concat(nodot).concat(star).concat(DOT_LITERAL).concat(ONE_CHAR).concat(star);

        case '*/*':
          return "".concat(nodot).concat(star).concat(SLASH_LITERAL).concat(ONE_CHAR).concat(slashDot).concat(star);

        case '**':
          return nodot + globstar(opts);

        case '**/*':
          return "(?:".concat(nodot).concat(globstar(opts)).concat(SLASH_LITERAL, ")?").concat(slashDot).concat(ONE_CHAR).concat(star);

        case '**/*.*':
          return "(?:".concat(nodot).concat(globstar(opts)).concat(SLASH_LITERAL, ")?").concat(slashDot).concat(star).concat(DOT_LITERAL).concat(ONE_CHAR).concat(star);

        case '**/.*':
          return "(?:".concat(nodot).concat(globstar(opts)).concat(SLASH_LITERAL, ")?").concat(DOT_LITERAL).concat(ONE_CHAR).concat(star);

        default:
          {
            var match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;

            var _source = create(match[1]);

            if (!_source) return;
            return _source + DOT_LITERAL + match[2];
          }
      }
    };

    var output = utils.removePrefix(input, state);
    var source = create(output);

    if (source && opts.strictSlashes !== true) {
      source += "".concat(SLASH_LITERAL, "?");
    }

    return source;
  };

  var parse_1 = parse$1;

  function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  var isObject = function isObject(val) {
    return val && _typeof$2(val) === 'object' && !Array.isArray(val);
  };
  /**
   * Creates a matcher function from one or more glob patterns. The
   * returned function takes a string to match as its first argument,
   * and returns true if the string is a match. The returned matcher
   * function also takes a boolean as the second argument that, when true,
   * returns an object with additional information.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch(glob[, options]);
   *
   * const isMatch = picomatch('*.!(*a)');
   * console.log(isMatch('a.a')); //=> false
   * console.log(isMatch('a.b')); //=> true
   * ```
   * @name picomatch
   * @param {String|Array} `globs` One or more glob patterns.
   * @param {Object=} `options`
   * @return {Function=} Returns a matcher function.
   * @api public
   */


  var picomatch$1 = function picomatch(glob, options) {
    var returnState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (Array.isArray(glob)) {
      var fns = glob.map(function (input) {
        return picomatch(input, options, returnState);
      });

      var arrayMatcher = function arrayMatcher(str) {
        var _iterator = _createForOfIteratorHelper(fns),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var isMatch = _step.value;

            var _state = isMatch(str);

            if (_state) return _state;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        return false;
      };

      return arrayMatcher;
    }

    var isState = isObject(glob) && glob.tokens && glob.input;

    if (glob === '' || typeof glob !== 'string' && !isState) {
      throw new TypeError('Expected pattern to be a non-empty string');
    }

    var opts = options || {};
    var posix = utils.isWindows(options);
    var regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
    var state = regex.state;
    delete regex.state;

    var isIgnored = function isIgnored() {
      return false;
    };

    if (opts.ignore) {
      var ignoreOpts = _objectSpread$3(_objectSpread$3({}, options), {}, {
        ignore: null,
        onMatch: null,
        onResult: null
      });

      isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
    }

    var matcher = function matcher(input) {
      var returnObject = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var _picomatch$test = picomatch.test(input, regex, options, {
        glob: glob,
        posix: posix
      }),
          isMatch = _picomatch$test.isMatch,
          match = _picomatch$test.match,
          output = _picomatch$test.output;

      var result = {
        glob: glob,
        state: state,
        regex: regex,
        posix: posix,
        input: input,
        output: output,
        match: match,
        isMatch: isMatch
      };

      if (typeof opts.onResult === 'function') {
        opts.onResult(result);
      }

      if (isMatch === false) {
        result.isMatch = false;
        return returnObject ? result : false;
      }

      if (isIgnored(input)) {
        if (typeof opts.onIgnore === 'function') {
          opts.onIgnore(result);
        }

        result.isMatch = false;
        return returnObject ? result : false;
      }

      if (typeof opts.onMatch === 'function') {
        opts.onMatch(result);
      }

      return returnObject ? result : true;
    };

    if (returnState) {
      matcher.state = state;
    }

    return matcher;
  };
  /**
   * Test `input` with the given `regex`. This is used by the main
   * `picomatch()` function to test the input string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.test(input, regex[, options]);
   *
   * console.log(picomatch.test('foo/bar', /^(?:([^/]*?)\/([^/]*?))$/));
   * // { isMatch: true, match: [ 'foo/', 'foo', 'bar' ], output: 'foo/bar' }
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp} `regex`
   * @return {Object} Returns an object with matching info.
   * @api public
   */


  picomatch$1.test = function (input, regex, options) {
    var _ref = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        glob = _ref.glob,
        posix = _ref.posix;

    if (typeof input !== 'string') {
      throw new TypeError('Expected input to be a string');
    }

    if (input === '') {
      return {
        isMatch: false,
        output: ''
      };
    }

    var opts = options || {};
    var format = opts.format || (posix ? utils.toPosixSlashes : null);
    var match = input === glob;
    var output = match && format ? format(input) : input;

    if (match === false) {
      output = format ? format(input) : input;
      match = output === glob;
    }

    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = picomatch$1.matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output);
      }
    }

    return {
      isMatch: Boolean(match),
      match: match,
      output: output
    };
  };
  /**
   * Match the basename of a filepath.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.matchBase(input, glob[, options]);
   * console.log(picomatch.matchBase('foo/bar.js', '*.js'); // true
   * ```
   * @param {String} `input` String to test.
   * @param {RegExp|String} `glob` Glob pattern or regex created by [.makeRe](#makeRe).
   * @return {Boolean}
   * @api public
   */


  picomatch$1.matchBase = function (input, glob, options) {
    arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : utils.isWindows(options);
    var regex = glob instanceof RegExp ? glob : picomatch$1.makeRe(glob, options);
    return regex.test(path.basename(input));
  };
  /**
   * Returns true if **any** of the given glob `patterns` match the specified `string`.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.isMatch(string, patterns[, options]);
   *
   * console.log(picomatch.isMatch('a.a', ['b.*', '*.a'])); //=> true
   * console.log(picomatch.isMatch('a.a', 'b.*')); //=> false
   * ```
   * @param {String|Array} str The string to test.
   * @param {String|Array} patterns One or more glob patterns to use for matching.
   * @param {Object} [options] See available [options](#options).
   * @return {Boolean} Returns true if any patterns match `str`
   * @api public
   */


  picomatch$1.isMatch = function (str, patterns, options) {
    return picomatch$1(patterns, options)(str);
  };
  /**
   * Parse a glob pattern to create the source string for a regular
   * expression.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const result = picomatch.parse(pattern[, options]);
   * ```
   * @param {String} `pattern`
   * @param {Object} `options`
   * @return {Object} Returns an object with useful properties and output to be used as a regex source string.
   * @api public
   */


  picomatch$1.parse = function (pattern, options) {
    if (Array.isArray(pattern)) return pattern.map(function (p) {
      return picomatch$1.parse(p, options);
    });
    return parse_1(pattern, _objectSpread$3(_objectSpread$3({}, options), {}, {
      fastpaths: false
    }));
  };
  /**
   * Scan a glob pattern to separate the pattern into segments.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.scan(input[, options]);
   *
   * const result = picomatch.scan('!./foo/*.js');
   * console.log(result);
   * { prefix: '!./',
   *   input: '!./foo/*.js',
   *   start: 3,
   *   base: 'foo',
   *   glob: '*.js',
   *   isBrace: false,
   *   isBracket: false,
   *   isGlob: true,
   *   isExtglob: false,
   *   isGlobstar: false,
   *   negated: true }
   * ```
   * @param {String} `input` Glob pattern to scan.
   * @param {Object} `options`
   * @return {Object} Returns an object with
   * @api public
   */


  picomatch$1.scan = function (input, options) {
    return scan_1(input, options);
  };
  /**
   * Create a regular expression from a parsed glob pattern.
   *
   * ```js
   * const picomatch = require('picomatch');
   * const state = picomatch.parse('*.js');
   * // picomatch.compileRe(state[, options]);
   *
   * console.log(picomatch.compileRe(state));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `state` The object returned from the `.parse` method.
   * @param {Object} `options`
   * @return {RegExp} Returns a regex created from the given pattern.
   * @api public
   */


  picomatch$1.compileRe = function (parsed, options) {
    var returnOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var returnState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (returnOutput === true) {
      return parsed.output;
    }

    var opts = options || {};
    var prepend = opts.contains ? '' : '^';
    var append = opts.contains ? '' : '$';
    var source = "".concat(prepend, "(?:").concat(parsed.output, ")").concat(append);

    if (parsed && parsed.negated === true) {
      source = "^(?!".concat(source, ").*$");
    }

    var regex = picomatch$1.toRegex(source, options);

    if (returnState === true) {
      regex.state = parsed;
    }

    return regex;
  };

  picomatch$1.makeRe = function (input, options) {
    var returnOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var returnState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    if (!input || typeof input !== 'string') {
      throw new TypeError('Expected a non-empty string');
    }

    var opts = options || {};
    var parsed = {
      negated: false,
      fastpaths: true
    };
    var prefix = '';
    var output;

    if (input.startsWith('./')) {
      input = input.slice(2);
      prefix = parsed.prefix = './';
    }

    if (opts.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
      output = parse_1.fastpaths(input, options);
    }

    if (output === undefined) {
      parsed = parse_1(input, options);
      parsed.prefix = prefix + (parsed.prefix || '');
    } else {
      parsed.output = output;
    }

    return picomatch$1.compileRe(parsed, options, returnOutput, returnState);
  };
  /**
   * Create a regular expression from the given regex source string.
   *
   * ```js
   * const picomatch = require('picomatch');
   * // picomatch.toRegex(source[, options]);
   *
   * const { output } = picomatch.parse('*.js');
   * console.log(picomatch.toRegex(output));
   * //=> /^(?:(?!\.)(?=.)[^/]*?\.js)$/
   * ```
   * @param {String} `source` Regular expression source string.
   * @param {Object} `options`
   * @return {RegExp}
   * @api public
   */


  picomatch$1.toRegex = function (source, options) {
    try {
      var opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? 'i' : ''));
    } catch (err) {
      if (options && options.debug === true) throw err;
      return /$^/;
    }
  };
  /**
   * Picomatch constants.
   * @return {Object}
   */


  picomatch$1.constants = constants;
  /**
   * Expose "picomatch"
   */

  var picomatch_1 = picomatch$1;

  var picomatch = picomatch_1;

  var parseInputAccept = function parseInputAccept(inputAccept) {
    var extensions = [];
    var mimeTypes = [];
    inputAccept.split(",").map(function (mimeType) {
      return mimeType.trim();
    }).filter(Boolean).forEach(function (fileType) {
      if (fileType.startsWith(".")) {
        extensions.push("*".concat(fileType));
      } else {
        mimeTypes.push(fileType);
      }
    });
    return [extensions, mimeTypes];
  };

  var AcceptedFileTypes = /*#__PURE__*/function () {
    function AcceptedFileTypes(inputAccept) {
      _classCallCheck$7(this, AcceptedFileTypes);

      _defineProperty$2(this, "extensions", void 0);

      _defineProperty$2(this, "mimeTypes", void 0);

      var _parseInputAccept = parseInputAccept(inputAccept),
          _parseInputAccept2 = _slicedToArray(_parseInputAccept, 2),
          extensions = _parseInputAccept2[0],
          mimeTypes = _parseInputAccept2[1];

      this.extensions = extensions;
      this.mimeTypes = mimeTypes;
    }

    _createClass$6(AcceptedFileTypes, [{
      key: "isAccepted",
      value: function isAccepted(fileName) {
        if (this.extensions.length === 0 && this.mimeTypes.length === 0) {
          return true;
        }

        return this.isMimeTypeAccepted(lite.getType(fileName)) || this.isExtensionAccepted(fileName);
      }
    }, {
      key: "isMimeTypeAccepted",
      value: function isMimeTypeAccepted(mimeType) {
        if (this.mimeTypes.length === 0) {
          return false;
        }

        return picomatch.isMatch(mimeType, this.mimeTypes);
      }
    }, {
      key: "isExtensionAccepted",
      value: function isExtensionAccepted(fileName) {
        if (this.extensions.length === 0) {
          return false;
        }

        return picomatch.isMatch(fileName, this.extensions);
      }
    }]);

    return AcceptedFileTypes;
  }();

  var getEntriesFromDirectory = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(directoryEntry) {
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                return directoryEntry.createReader().readEntries(resolve, reject);
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function getEntriesFromDirectory(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  var getFileFromFileEntry = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(fileEntry) {
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt("return", new Promise(function (resolve, reject) {
                return fileEntry.file(resolve, reject);
              }));

            case 1:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function getFileFromFileEntry(_x2) {
      return _ref2.apply(this, arguments);
    };
  }();

  var getFilesFromFileSystemEntries = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(entries) {
      var result, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, entry, file, entriesFromDirectory, _files;

      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              result = [];
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _context3.prev = 3;
              _iterator = _asyncIterator(entries);

            case 5:
              _context3.next = 7;
              return _iterator.next();

            case 7:
              _step = _context3.sent;
              _iteratorNormalCompletion = _step.done;
              _context3.next = 11;
              return _step.value;

            case 11:
              _value = _context3.sent;

              if (_iteratorNormalCompletion) {
                _context3.next = 32;
                break;
              }

              entry = _value;

              if (!entry.isFile) {
                _context3.next = 21;
                break;
              }

              _context3.next = 17;
              return getFileFromFileEntry(entry);

            case 17:
              file = _context3.sent;
              result.push(file);
              _context3.next = 29;
              break;

            case 21:
              if (!entry.isDirectory) {
                _context3.next = 29;
                break;
              }

              _context3.next = 24;
              return getEntriesFromDirectory(entry);

            case 24:
              entriesFromDirectory = _context3.sent;
              _context3.next = 27;
              return getFilesFromFileSystemEntries(entriesFromDirectory);

            case 27:
              _files = _context3.sent;

              _files.forEach(function (file) {
                return result.push(file);
              });

            case 29:
              _iteratorNormalCompletion = true;
              _context3.next = 5;
              break;

            case 32:
              _context3.next = 38;
              break;

            case 34:
              _context3.prev = 34;
              _context3.t0 = _context3["catch"](3);
              _didIteratorError = true;
              _iteratorError = _context3.t0;

            case 38:
              _context3.prev = 38;
              _context3.prev = 39;

              if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
                _context3.next = 43;
                break;
              }

              _context3.next = 43;
              return _iterator.return();

            case 43:
              _context3.prev = 43;

              if (!_didIteratorError) {
                _context3.next = 46;
                break;
              }

              throw _iteratorError;

            case 46:
              return _context3.finish(43);

            case 47:
              return _context3.finish(38);

            case 48:
              return _context3.abrupt("return", result);

            case 49:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[3, 34, 38, 48], [39,, 43, 47]]);
    }));

    return function getFilesFromFileSystemEntries(_x3) {
      return _ref3.apply(this, arguments);
    };
  }();

  var getFilesFromDataTransfer = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(dataTransfer) {
      var entries, _files2;

      return regenerator.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (!dataTransfer.items) {
                _context4.next = 8;
                break;
              }

              entries = _toConsumableArray(dataTransfer.items).map(function (item) {
                return item.webkitGetAsEntry();
              });
              _context4.next = 4;
              return getFilesFromFileSystemEntries(entries);

            case 4:
              _files2 = _context4.sent;
              return _context4.abrupt("return", _files2);

            case 8:
              return _context4.abrupt("return", _toConsumableArray(dataTransfer.files));

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function getFilesFromDataTransfer(_x4) {
      return _ref4.apply(this, arguments);
    };
  }();

  var DropArea = function DropArea(_ref5) {
    var _this = this;

    var container = _ref5.container,
        inputAccept = _ref5.inputAccept,
        onUploadFiles = _ref5.onUploadFiles;

    _classCallCheck$7(this, DropArea);

    _defineProperty$2(this, "acceptedFileTypes", void 0);

    _defineProperty$2(this, "container", void 0);

    _defineProperty$2(this, "onUploadFiles", void 0);

    _defineProperty$2(this, "onDrop", function (e) {
      var dragEvent = e;

      _this.container.classList.remove("dff-dropping");

      dragEvent.preventDefault();
      dragEvent.stopPropagation();

      var uploadFiles = /*#__PURE__*/function () {
        var _ref6 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee5() {
          var _files3, acceptedFiles;

          return regenerator.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.prev = 0;

                  if (!dragEvent.dataTransfer) {
                    _context5.next = 7;
                    break;
                  }

                  _context5.next = 4;
                  return getFilesFromDataTransfer(dragEvent.dataTransfer);

                case 4:
                  _files3 = _context5.sent;
                  acceptedFiles = _files3.filter(function (file) {
                    return _this.acceptedFileTypes.isAccepted(file.name);
                  });

                  _this.onUploadFiles(acceptedFiles);

                case 7:
                  _context5.next = 12;
                  break;

                case 9:
                  _context5.prev = 9;
                  _context5.t0 = _context5["catch"](0);
                  console.error(_context5.t0);

                case 12:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5, null, [[0, 9]]);
        }));

        return function uploadFiles() {
          return _ref6.apply(this, arguments);
        };
      }();

      void uploadFiles();
    });

    this.container = container;
    this.onUploadFiles = onUploadFiles;
    this.acceptedFileTypes = new AcceptedFileTypes(inputAccept);
    container.addEventListener("dragenter", function () {
      container.classList.add("dff-dropping");
    });
    container.addEventListener("dragleave", function () {
      container.classList.remove("dff-dropping");
    });
    container.addEventListener("dragover", function (e) {
      container.classList.add("dff-dropping");
      e.preventDefault();
    });
    container.addEventListener("drop", this.onDrop);
  };

  var slice = [].slice;
  var factories = {};

  var construct = function (C, argsLength, args) {
    if (!(argsLength in factories)) {
      for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
      // eslint-disable-next-line no-new-func -- we have no proper alternatives, IE8- only
      factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
    } return factories[argsLength](C, args);
  };

  // `Function.prototype.bind` method implementation
  // https://tc39.es/ecma262/#sec-function.prototype.bind
  var functionBind = Function.bind || function bind(that /* , ...args */) {
    var fn = aFunction(this);
    var partArgs = slice.call(arguments, 1);
    var boundFunction = function bound(/* args... */) {
      var args = partArgs.concat(slice.call(arguments));
      return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
    };
    if (isObject$1(fn.prototype)) boundFunction.prototype = fn.prototype;
    return boundFunction;
  };

  var nativeConstruct = getBuiltIn('Reflect', 'construct');

  // `Reflect.construct` method
  // https://tc39.es/ecma262/#sec-reflect.construct
  // MS Edge supports only 2 arguments and argumentsList argument is optional
  // FF Nightly sets third argument as `new.target`, but does not create `this` from it
  var NEW_TARGET_BUG = fails(function () {
    function F() { /* empty */ }
    return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
  });
  var ARGS_BUG = !fails(function () {
    nativeConstruct(function () { /* empty */ });
  });
  var FORCED$5 = NEW_TARGET_BUG || ARGS_BUG;

  _export({ target: 'Reflect', stat: true, forced: FORCED$5, sham: FORCED$5 }, {
    construct: function construct(Target, args /* , newTarget */) {
      aFunction(Target);
      anObject(args);
      var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
      if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
      if (Target == newTarget) {
        // w/o altered newTarget, optimization for 0-4 arguments
        switch (args.length) {
          case 0: return new Target();
          case 1: return new Target(args[0]);
          case 2: return new Target(args[0], args[1]);
          case 3: return new Target(args[0], args[1], args[2]);
          case 4: return new Target(args[0], args[1], args[2], args[3]);
        }
        // w/o altered newTarget, lot of arguments case
        var $args = [null];
        $args.push.apply($args, args);
        return new (functionBind.apply(Target, $args))();
      }
      // with altered newTarget, not support built-in constructors
      var proto = newTarget.prototype;
      var instance = objectCreate(isObject$1(proto) ? proto : Object.prototype);
      var result = Function.apply.call(Target, instance, args);
      return isObject$1(result) ? result : instance;
    }
  });

  function _assertThisInitialized$2(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _setPrototypeOf$2(o, p) {
    _setPrototypeOf$2 = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf$2(o, p);
  }

  function _inherits$2(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf$2(subClass, superClass);
  }

  function _possibleConstructorReturn$2(self, call) {
    if (call && (_typeof$2(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized$2(self);
  }

  function _getPrototypeOf$2(o) {
    _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf$2(o);
  }

  // `Array.prototype.{ reduce, reduceRight }` methods implementation
  var createMethod = function (IS_RIGHT) {
    return function (that, callbackfn, argumentsLength, memo) {
      aFunction(callbackfn);
      var O = toObject(that);
      var self = indexedObject(O);
      var length = toLength(O.length);
      var index = IS_RIGHT ? length - 1 : 0;
      var i = IS_RIGHT ? -1 : 1;
      if (argumentsLength < 2) while (true) {
        if (index in self) {
          memo = self[index];
          index += i;
          break;
        }
        index += i;
        if (IS_RIGHT ? index < 0 : length <= index) {
          throw TypeError('Reduce of empty array with no initial value');
        }
      }
      for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
        memo = callbackfn(memo, self[index], index, O);
      }
      return memo;
    };
  };

  var arrayReduce = {
    // `Array.prototype.reduce` method
    // https://tc39.es/ecma262/#sec-array.prototype.reduce
    left: createMethod(false),
    // `Array.prototype.reduceRight` method
    // https://tc39.es/ecma262/#sec-array.prototype.reduceright
    right: createMethod(true)
  };

  var $reduce$1 = arrayReduce.left;




  var STRICT_METHOD$1 = arrayMethodIsStrict('reduce');
  // Chrome 80-82 has a critical bug
  // https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
  var CHROME_BUG = !engineIsNode && engineV8Version > 79 && engineV8Version < 83;

  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  _export({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 || CHROME_BUG }, {
    reduce: function reduce(callbackfn /* , initialValue */) {
      return $reduce$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
    }
  });

  var BaseUpload$1 = /*#__PURE__*/function () {
    function BaseUpload(_ref) {
      var name = _ref.name,
          status = _ref.status,
          type = _ref.type,
          uploadIndex = _ref.uploadIndex;

      _classCallCheck$7(this, BaseUpload);

      _defineProperty$2(this, "name", void 0);

      _defineProperty$2(this, "status", void 0);

      _defineProperty$2(this, "type", void 0);

      _defineProperty$2(this, "uploadIndex", void 0);

      this.name = name;
      this.status = status;
      this.type = type;
      this.uploadIndex = uploadIndex;
    }

    _createClass$6(BaseUpload, [{
      key: "abort",
      value: function () {
        var _abort = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function abort() {
          return _abort.apply(this, arguments);
        }

        return abort;
      }()
    }, {
      key: "delete",
      value: function () {
        var _delete2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function _delete() {
          return _delete2.apply(this, arguments);
        }

        return _delete;
      }()
    }]);

    return BaseUpload;
  }();

  var urlJoin = createCommonjsModule(function (module) {
    (function (name, context, definition) {
      if (module.exports) module.exports = definition();else context[name] = definition();
    })('urljoin', commonjsGlobal, function () {
      function normalize(strArray) {
        var resultArray = [];

        if (strArray.length === 0) {
          return '';
        }

        if (typeof strArray[0] !== 'string') {
          throw new TypeError('Url must be a string. Received ' + strArray[0]);
        } // If the first part is a plain protocol, we combine it with the next part.


        if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
          var first = strArray.shift();
          strArray[0] = first + strArray[0];
        } // There must be two or three slashes in the file protocol, two slashes in anything else.


        if (strArray[0].match(/^file:\/\/\//)) {
          strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
        } else {
          strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
        }

        for (var i = 0; i < strArray.length; i++) {
          var component = strArray[i];

          if (typeof component !== 'string') {
            throw new TypeError('Url must be a string. Received ' + component);
          }

          if (component === '') {
            continue;
          }

          if (i > 0) {
            // Removing the starting slashes for each component but the first.
            component = component.replace(/^[\/]+/, '');
          }

          if (i < strArray.length - 1) {
            // Removing the ending slashes for each component but the last.
            component = component.replace(/[\/]+$/, '');
          } else {
            // For the last component we will combine multiple slashes to a single one.
            component = component.replace(/[\/]+$/, '/');
          }

          resultArray.push(component);
        }

        var str = resultArray.join('/'); // Each input component is now separated by a single slash except the possible first plain protocol part.
        // remove trailing slash before parameters or hash

        str = str.replace(/\/(\?|&|#[^!])/g, '$1'); // replace ? in parameters with &

        var parts = str.split('?');
        str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');
        return str;
      }

      return function () {
        var input;

        if (_typeof$2(arguments[0]) === 'object') {
          input = arguments[0];
        } else {
          input = [].slice.call(arguments);
        }

        return normalize(input);
      };
    });
  });

  var MB = 1024 * 1024;
  var abortMultipartUpload = function abortMultipartUpload(_ref) {
    var csrfToken = _ref.csrfToken,
        key = _ref.key,
        uploadId = _ref.uploadId,
        endpoint = _ref.endpoint;
    var filename = encodeURIComponent(key);
    var uploadIdEnc = encodeURIComponent(uploadId);
    var headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    var url = urlJoin(endpoint, uploadIdEnc, "?key=".concat(filename));
    return fetch(url, {
      method: "delete",
      headers: headers
    }).then(function (response) {
      return response.json();
    });
  };
  var completeMultipartUpload = function completeMultipartUpload(_ref2) {
    var csrfToken = _ref2.csrfToken,
        key = _ref2.key,
        uploadId = _ref2.uploadId,
        parts = _ref2.parts,
        endpoint = _ref2.endpoint;
    var filename = encodeURIComponent(key);
    var uploadIdEnc = encodeURIComponent(uploadId);
    var headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    var url = urlJoin(endpoint, uploadIdEnc, "complete", "?key=".concat(filename));
    return fetch(url, {
      method: "post",
      headers: headers,
      body: JSON.stringify({
        parts: parts
      })
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      return data;
    });
  };
  var createMultipartUpload = function createMultipartUpload(_ref3) {
    var csrfToken = _ref3.csrfToken,
        endpoint = _ref3.endpoint,
        file = _ref3.file,
        s3UploadDir = _ref3.s3UploadDir;
    var headers = new Headers({
      accept: "application/json",
      "content-type": "application/json",
      "X-CSRFToken": csrfToken
    });
    return fetch(endpoint, {
      method: "post",
      headers: headers,
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        s3UploadDir: s3UploadDir
      })
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      return data;
    });
  };
  var getChunkSize = function getChunkSize(file) {
    return Math.ceil(file.size / 10000);
  };
  var prepareUploadPart = function prepareUploadPart(_ref4) {
    var csrfToken = _ref4.csrfToken,
        endpoint = _ref4.endpoint,
        key = _ref4.key,
        number = _ref4.number,
        uploadId = _ref4.uploadId;
    var filename = encodeURIComponent(key);
    var headers = new Headers({
      "X-CSRFToken": csrfToken
    });
    var url = urlJoin(endpoint, uploadId, "".concat(number), "?key=".concat(filename));
    return fetch(url, {
      method: "get",
      headers: headers
    }).then(function (response) {
      return response.json();
    }).then(function (data) {
      return data;
    });
  };
  var remove = function remove(arr, el) {
    var i = arr.indexOf(el);

    if (i !== -1) {
      arr.splice(i, 1);
    }
  };

  function _createSuper$4(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$4(); return function _createSuperInternal() { var Super = _getPrototypeOf$2(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$2(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$2(this, result); }; }

  function _isNativeReflectConstruct$4() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var S3Upload = /*#__PURE__*/function (_BaseUpload) {
    _inherits$2(S3Upload, _BaseUpload);

    var _super = _createSuper$4(S3Upload);

    function S3Upload(_ref) {
      var _this;

      var csrfToken = _ref.csrfToken,
          endpoint = _ref.endpoint,
          file = _ref.file,
          s3UploadDir = _ref.s3UploadDir,
          uploadIndex = _ref.uploadIndex;

      _classCallCheck$7(this, S3Upload);

      _this = _super.call(this, {
        name: file.name,
        status: "uploading",
        type: "s3",
        uploadIndex: uploadIndex
      });

      _defineProperty$2(_assertThisInitialized$2(_this), "onError", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "onProgress", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "onSuccess", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "chunkState", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "chunks", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "createdPromise", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "csrfToken", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "endpoint", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "file", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "key", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "parts", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "s3UploadDir", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "uploadId", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "uploading", void 0);

      _this.csrfToken = csrfToken;
      _this.endpoint = endpoint;
      _this.file = file;
      _this.s3UploadDir = s3UploadDir;
      _this.key = null;
      _this.uploadId = null;
      _this.parts = []; // Do `this.createdPromise.then(OP)` to execute an operation `OP` _only_ if the
      // upload was created already. That also ensures that the sequencing is right
      // (so the `OP` definitely happens if the upload is created).
      //
      // This mostly exists to make `abortUpload` work well: only sending the abort request if
      // the upload was already created, and if the createMultipartUpload request is still in flight,
      // aborting it immediately after it finishes.

      _this.createdPromise = Promise.reject(); // eslint-disable-line prefer-promise-reject-errors

      _this.chunks = [];
      _this.chunkState = [];
      _this.uploading = [];
      _this.onError = undefined;
      _this.onProgress = undefined;
      _this.onSuccess = undefined;

      _this.initChunks();

      _this.createdPromise.catch(function () {
        return {};
      }); // silence uncaught rejection warning


      return _this;
    }

    _createClass$6(S3Upload, [{
      key: "abort",
      value: function () {
        var _abort = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  this.uploading.slice().forEach(function (xhr) {
                    xhr.abort();
                  });
                  this.uploading = [];
                  _context.next = 4;
                  return this.createdPromise;

                case 4:
                  if (!(this.key && this.uploadId)) {
                    _context.next = 7;
                    break;
                  }

                  _context.next = 7;
                  return abortMultipartUpload({
                    csrfToken: this.csrfToken,
                    endpoint: this.endpoint,
                    key: this.key,
                    uploadId: this.uploadId
                  });

                case 7:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function abort() {
          return _abort.apply(this, arguments);
        }

        return abort;
      }()
    }, {
      key: "delete",
      value: function () {
        var _delete2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  return _context2.abrupt("return", Promise.resolve());

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function _delete() {
          return _delete2.apply(this, arguments);
        }

        return _delete;
      }()
    }, {
      key: "getInitialFile",
      value: function getInitialFile() {
        return {
          id: this.uploadId || "",
          name: this.key || "",
          size: this.file.size,
          original_name: this.file.name,
          type: "s3"
        };
      }
    }, {
      key: "getSize",
      value: function getSize() {
        return this.file.size;
      }
    }, {
      key: "start",
      value: function start() {
        void this.createUpload();
      }
    }, {
      key: "initChunks",
      value: function initChunks() {
        var chunks = [];
        var desiredChunkSize = getChunkSize(this.file); // at least 5MB per request, at most 10k requests

        var minChunkSize = Math.max(5 * MB, Math.ceil(this.file.size / 10000));
        var chunkSize = Math.max(desiredChunkSize, minChunkSize);

        for (var i = 0; i < this.file.size; i += chunkSize) {
          var end = Math.min(this.file.size, i + chunkSize);
          chunks.push(this.file.slice(i, end));
        }

        this.chunks = chunks;
        this.chunkState = chunks.map(function () {
          return {
            uploaded: 0,
            busy: false,
            done: false
          };
        });
      }
    }, {
      key: "createUpload",
      value: function createUpload() {
        var _this2 = this;

        this.createdPromise = createMultipartUpload({
          csrfToken: this.csrfToken,
          endpoint: this.endpoint,
          file: this.file,
          s3UploadDir: this.s3UploadDir
        });
        return this.createdPromise.then(function (result) {
          var valid = _typeof$2(result) === "object" && result && typeof result.uploadId === "string" && typeof result.key === "string";

          if (!valid) {
            throw new TypeError("AwsS3/Multipart: Got incorrect result from `createMultipartUpload()`, expected an object `{ uploadId, key }`.");
          }

          _this2.key = result.key;
          _this2.uploadId = result.uploadId;

          _this2.uploadParts();
        }).catch(function (err) {
          _this2.handleError(err);
        });
      }
    }, {
      key: "uploadParts",
      value: function uploadParts() {
        var _this3 = this;

        var need = 1 - this.uploading.length;

        if (need === 0) {
          return;
        } // All parts are uploaded.


        if (this.chunkState.every(function (state) {
          return state.done;
        })) {
          void this.completeUpload();
          return;
        }

        var candidates = [];

        for (var i = 0; i < this.chunkState.length; i++) {
          var state = this.chunkState[i];

          if (state.done || state.busy) {
            continue;
          }

          candidates.push(i);

          if (candidates.length >= need) {
            break;
          }
        }

        candidates.forEach(function (index) {
          void _this3.uploadPart(index);
        });
      }
    }, {
      key: "uploadPart",
      value: function uploadPart(index) {
        var _this4 = this;

        this.chunkState[index].busy = true;

        if (!this.key || !this.uploadId) {
          return Promise.resolve();
        }

        return prepareUploadPart({
          csrfToken: this.csrfToken,
          endpoint: this.endpoint,
          key: this.key,
          number: index + 1,
          uploadId: this.uploadId
        }).then(function (result) {
          var valid = _typeof$2(result) === "object" && result && typeof result.url === "string";

          if (!valid) {
            throw new TypeError("AwsS3/Multipart: Got incorrect result from `prepareUploadPart()`, expected an object `{ url }`.");
          }

          return result;
        }).then(function (_ref2) {
          var url = _ref2.url;

          _this4.uploadPartBytes(index, url);
        }, function (err) {
          _this4.handleError(err);
        });
      }
    }, {
      key: "onPartProgress",
      value: function onPartProgress(index, sent) {
        this.chunkState[index].uploaded = sent;

        if (this.onProgress) {
          var totalUploaded = this.chunkState.reduce(function (n, c) {
            return n + c.uploaded;
          }, 0);
          this.onProgress(totalUploaded, this.file.size);
        }
      }
    }, {
      key: "onPartComplete",
      value: function onPartComplete(index, etag) {
        this.chunkState[index].etag = etag;
        this.chunkState[index].done = true;
        var part = {
          PartNumber: index + 1,
          ETag: etag
        };
        this.parts.push(part);
        this.uploadParts();
      }
    }, {
      key: "uploadPartBytes",
      value: function uploadPartBytes(index, url) {
        var _this5 = this;

        var body = this.chunks[index];
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        xhr.responseType = "text";
        this.uploading.push(xhr);
        xhr.upload.addEventListener("progress", function (ev) {
          if (!ev.lengthComputable) {
            return;
          }

          _this5.onPartProgress(index, ev.loaded);
        });
        xhr.addEventListener("abort", function (ev) {
          remove(_this5.uploading, ev.target);
          _this5.chunkState[index].busy = false;
        });
        xhr.addEventListener("load", function (ev) {
          var target = ev.target;
          remove(_this5.uploading, target);
          _this5.chunkState[index].busy = false;

          if (target.status < 200 || target.status >= 300) {
            _this5.handleError(new Error("Non 2xx"));

            return;
          }

          _this5.onPartProgress(index, body.size); // NOTE This must be allowed by CORS.


          var etag = target.getResponseHeader("ETag");

          if (etag === null) {
            _this5.handleError(new Error("AwsS3/Multipart: Could not read the ETag header. This likely means CORS is not configured correctly on the S3 Bucket. See https://uppy.io/docs/aws-s3-multipart#S3-Bucket-Configuration for instructions."));

            return;
          }

          _this5.onPartComplete(index, etag);
        });
        xhr.addEventListener("error", function (ev) {
          remove(_this5.uploading, ev.target);
          _this5.chunkState[index].busy = false;
          var error = new Error("Unknown error"); // error.source = ev.target

          _this5.handleError(error);
        });
        xhr.send(body);
      }
    }, {
      key: "completeUpload",
      value: function completeUpload() {
        var _this6 = this;

        // Parts may not have completed uploading in sorted order, if limit > 1.
        this.parts.sort(function (a, b) {
          return a.PartNumber - b.PartNumber;
        });

        if (!this.uploadId || !this.key) {
          return Promise.resolve();
        }

        return completeMultipartUpload({
          csrfToken: this.csrfToken,
          endpoint: this.endpoint,
          key: this.key,
          uploadId: this.uploadId,
          parts: this.parts
        }).then(function () {
          if (_this6.onSuccess) {
            _this6.onSuccess();
          }
        }, function (err) {
          _this6.handleError(err);
        });
      }
    }, {
      key: "handleError",
      value: function handleError(error) {
        if (this.onError) {
          this.onError(error);
        } else {
          throw error;
        }
      }
    }]);

    return S3Upload;
  }(BaseUpload$1);

  var deleteUpload = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(url, csrfToken) {
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.open("DELETE", url);

                xhr.onload = function () {
                  if (xhr.status === 204) {
                    resolve();
                  } else {
                    reject();
                  }
                };

                xhr.setRequestHeader("Tus-Resumable", "1.0.0");
                xhr.setRequestHeader("X-CSRFToken", csrfToken);
                xhr.send(null);
              }));

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function deleteUpload(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();

  function _createSuper$3(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct$3(); return function _createSuperInternal() { var Super = _getPrototypeOf$2(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$2(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$2(this, result); }; }

  function _isNativeReflectConstruct$3() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
  var BaseUploadedFile = /*#__PURE__*/function (_BaseUpload) {
    _inherits$2(BaseUploadedFile, _BaseUpload);

    var _super = _createSuper$3(BaseUploadedFile);

    function BaseUploadedFile(_ref) {
      var _this;

      var name = _ref.name,
          size = _ref.size,
          type = _ref.type,
          uploadIndex = _ref.uploadIndex;

      _classCallCheck$7(this, BaseUploadedFile);

      _this = _super.call(this, {
        name: name,
        status: "done",
        type: type,
        uploadIndex: uploadIndex
      });

      _defineProperty$2(_assertThisInitialized$2(_this), "size", void 0);

      _this.size = size;
      return _this;
    }

    _createClass$6(BaseUploadedFile, [{
      key: "abort",
      value: function () {
        var _abort = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  return _context.abrupt("return", Promise.resolve());

                case 1:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function abort() {
          return _abort.apply(this, arguments);
        }

        return abort;
      }()
    }, {
      key: "delete",
      value: function () {
        var _delete2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  return _context2.abrupt("return", Promise.resolve());

                case 1:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function _delete() {
          return _delete2.apply(this, arguments);
        }

        return _delete;
      }()
    }, {
      key: "getSize",
      value: function getSize() {
        return this.size;
      }
    }]);

    return BaseUploadedFile;
  }(BaseUpload$1);

  var PlaceholderFile = /*#__PURE__*/function (_BaseUploadedFile) {
    _inherits$2(PlaceholderFile, _BaseUploadedFile);

    var _super2 = _createSuper$3(PlaceholderFile);

    function PlaceholderFile(initialFile, uploadIndex) {
      var _this2;

      _classCallCheck$7(this, PlaceholderFile);

      _this2 = _super2.call(this, {
        name: initialFile.name,
        size: initialFile.size,
        type: "placeholder",
        uploadIndex: uploadIndex
      });

      _defineProperty$2(_assertThisInitialized$2(_this2), "id", void 0);

      _this2.id = initialFile.id;
      return _this2;
    }

    _createClass$6(PlaceholderFile, [{
      key: "getInitialFile",
      value: function getInitialFile() {
        return {
          id: this.id,
          name: this.name,
          size: this.size,
          type: "placeholder"
        };
      }
    }]);

    return PlaceholderFile;
  }(BaseUploadedFile);

  var UploadedS3File = /*#__PURE__*/function (_BaseUploadedFile2) {
    _inherits$2(UploadedS3File, _BaseUploadedFile2);

    var _super3 = _createSuper$3(UploadedS3File);

    function UploadedS3File(initialFile, uploadIndex) {
      var _this3;

      _classCallCheck$7(this, UploadedS3File);

      _this3 = _super3.call(this, {
        name: initialFile.original_name || initialFile.name,
        size: initialFile.size,
        type: "uploadedS3",
        uploadIndex: uploadIndex
      });

      _defineProperty$2(_assertThisInitialized$2(_this3), "id", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this3), "key", void 0);

      _this3.id = initialFile.id;
      _this3.key = initialFile.name;
      return _this3;
    }

    _createClass$6(UploadedS3File, [{
      key: "getInitialFile",
      value: function getInitialFile() {
        return {
          id: this.id,
          name: this.key,
          original_name: this.name,
          size: this.size,
          type: "s3"
        };
      }
    }]);

    return UploadedS3File;
  }(BaseUploadedFile);
  var ExistingFile = /*#__PURE__*/function (_BaseUploadedFile3) {
    _inherits$2(ExistingFile, _BaseUploadedFile3);

    var _super4 = _createSuper$3(ExistingFile);

    function ExistingFile(initialFile, uploadIndex) {
      _classCallCheck$7(this, ExistingFile);

      return _super4.call(this, {
        name: initialFile.name,
        size: initialFile.size,
        type: "existing",
        uploadIndex: uploadIndex
      });
    }

    _createClass$6(ExistingFile, [{
      key: "getInitialFile",
      value: function getInitialFile() {
        return {
          name: this.name,
          size: this.size,
          type: "existing"
        };
      }
    }]);

    return ExistingFile;
  }(BaseUploadedFile);
  var UploadedTusFile = /*#__PURE__*/function (_BaseUploadedFile4) {
    _inherits$2(UploadedTusFile, _BaseUploadedFile4);

    var _super5 = _createSuper$3(UploadedTusFile);

    function UploadedTusFile(_ref2) {
      var _this4;

      var csrfToken = _ref2.csrfToken,
          initialFile = _ref2.initialFile,
          uploadIndex = _ref2.uploadIndex,
          uploadUrl = _ref2.uploadUrl;

      _classCallCheck$7(this, UploadedTusFile);

      _this4 = _super5.call(this, {
        name: initialFile.name,
        size: initialFile.size,
        type: "uploadedTus",
        uploadIndex: uploadIndex
      });

      _defineProperty$2(_assertThisInitialized$2(_this4), "csrfToken", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this4), "id", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this4), "url", void 0);

      _this4.csrfToken = csrfToken;
      _this4.id = initialFile.id;
      _this4.url = "".concat(uploadUrl).concat(initialFile.id);
      return _this4;
    }

    _createClass$6(UploadedTusFile, [{
      key: "delete",
      value: function () {
        var _delete3 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3() {
          return regenerator.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return deleteUpload(this.url, this.csrfToken);

                case 2:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        function _delete() {
          return _delete3.apply(this, arguments);
        }

        return _delete;
      }()
    }, {
      key: "getInitialFile",
      value: function getInitialFile() {
        return {
          id: this.id,
          name: this.name,
          size: this.size,
          type: "tus",
          url: ""
        };
      }
    }]);

    return UploadedTusFile;
  }(BaseUploadedFile);
  var createUploadedFile = function createUploadedFile(_ref3) {
    var csrfToken = _ref3.csrfToken,
        initialFile = _ref3.initialFile,
        uploadIndex = _ref3.uploadIndex,
        uploadUrl = _ref3.uploadUrl;

    switch (initialFile.type) {
      case "existing":
        return new ExistingFile(initialFile, uploadIndex);

      case "placeholder":
        return new PlaceholderFile(initialFile, uploadIndex);

      case "s3":
        return new UploadedS3File(initialFile, uploadIndex);

      case "tus":
        return new UploadedTusFile({
          csrfToken: csrfToken,
          initialFile: initialFile,
          uploadUrl: uploadUrl,
          uploadIndex: uploadIndex
        });
    }
  };

  var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

  var defineProperty$2 = objectDefineProperty.f;





  var Int8Array$3 = global$1.Int8Array;
  var Int8ArrayPrototype = Int8Array$3 && Int8Array$3.prototype;
  var Uint8ClampedArray = global$1.Uint8ClampedArray;
  var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
  var TypedArray = Int8Array$3 && objectGetPrototypeOf(Int8Array$3);
  var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
  var ObjectPrototype$1 = Object.prototype;
  var isPrototypeOf = ObjectPrototype$1.isPrototypeOf;

  var TO_STRING_TAG = wellKnownSymbol('toStringTag');
  var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
  // Fixing native typed arrays in Opera Presto crashes the browser, see #595
  var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferNative && !!objectSetPrototypeOf && classof(global$1.opera) !== 'Opera';
  var TYPED_ARRAY_TAG_REQIRED = false;
  var NAME;

  var TypedArrayConstructorsList = {
    Int8Array: 1,
    Uint8Array: 1,
    Uint8ClampedArray: 1,
    Int16Array: 2,
    Uint16Array: 2,
    Int32Array: 4,
    Uint32Array: 4,
    Float32Array: 4,
    Float64Array: 8
  };

  var BigIntArrayConstructorsList = {
    BigInt64Array: 8,
    BigUint64Array: 8
  };

  var isView = function isView(it) {
    if (!isObject$1(it)) return false;
    var klass = classof(it);
    return klass === 'DataView'
      || has$2(TypedArrayConstructorsList, klass)
      || has$2(BigIntArrayConstructorsList, klass);
  };

  var isTypedArray = function (it) {
    if (!isObject$1(it)) return false;
    var klass = classof(it);
    return has$2(TypedArrayConstructorsList, klass)
      || has$2(BigIntArrayConstructorsList, klass);
  };

  var aTypedArray$m = function (it) {
    if (isTypedArray(it)) return it;
    throw TypeError('Target is not a typed array');
  };

  var aTypedArrayConstructor$4 = function (C) {
    if (objectSetPrototypeOf) {
      if (isPrototypeOf.call(TypedArray, C)) return C;
    } else for (var ARRAY in TypedArrayConstructorsList) if (has$2(TypedArrayConstructorsList, NAME)) {
      var TypedArrayConstructor = global$1[ARRAY];
      if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
        return C;
      }
    } throw TypeError('Target is not a typed array constructor');
  };

  var exportTypedArrayMethod$n = function (KEY, property, forced) {
    if (!descriptors) return;
    if (forced) for (var ARRAY in TypedArrayConstructorsList) {
      var TypedArrayConstructor = global$1[ARRAY];
      if (TypedArrayConstructor && has$2(TypedArrayConstructor.prototype, KEY)) {
        delete TypedArrayConstructor.prototype[KEY];
      }
    }
    if (!TypedArrayPrototype[KEY] || forced) {
      redefine(TypedArrayPrototype, KEY, forced ? property
        : NATIVE_ARRAY_BUFFER_VIEWS$1 && Int8ArrayPrototype[KEY] || property);
    }
  };

  var exportTypedArrayStaticMethod$1 = function (KEY, property, forced) {
    var ARRAY, TypedArrayConstructor;
    if (!descriptors) return;
    if (objectSetPrototypeOf) {
      if (forced) for (ARRAY in TypedArrayConstructorsList) {
        TypedArrayConstructor = global$1[ARRAY];
        if (TypedArrayConstructor && has$2(TypedArrayConstructor, KEY)) {
          delete TypedArrayConstructor[KEY];
        }
      }
      if (!TypedArray[KEY] || forced) {
        // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
        try {
          return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$1 && Int8Array$3[KEY] || property);
        } catch (error) { /* empty */ }
      } else return;
    }
    for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global$1[ARRAY];
      if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
        redefine(TypedArrayConstructor, KEY, property);
      }
    }
  };

  for (NAME in TypedArrayConstructorsList) {
    if (!global$1[NAME]) NATIVE_ARRAY_BUFFER_VIEWS$1 = false;
  }

  // WebKit bug - typed arrays constructors prototype is Object.prototype
  if (!NATIVE_ARRAY_BUFFER_VIEWS$1 || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
    // eslint-disable-next-line no-shadow -- safe
    TypedArray = function TypedArray() {
      throw TypeError('Incorrect invocation');
    };
    if (NATIVE_ARRAY_BUFFER_VIEWS$1) for (NAME in TypedArrayConstructorsList) {
      if (global$1[NAME]) objectSetPrototypeOf(global$1[NAME], TypedArray);
    }
  }

  if (!NATIVE_ARRAY_BUFFER_VIEWS$1 || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$1) {
    TypedArrayPrototype = TypedArray.prototype;
    if (NATIVE_ARRAY_BUFFER_VIEWS$1) for (NAME in TypedArrayConstructorsList) {
      if (global$1[NAME]) objectSetPrototypeOf(global$1[NAME].prototype, TypedArrayPrototype);
    }
  }

  // WebKit bug - one more object in Uint8ClampedArray prototype chain
  if (NATIVE_ARRAY_BUFFER_VIEWS$1 && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
    objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
  }

  if (descriptors && !has$2(TypedArrayPrototype, TO_STRING_TAG)) {
    TYPED_ARRAY_TAG_REQIRED = true;
    defineProperty$2(TypedArrayPrototype, TO_STRING_TAG, { get: function () {
      return isObject$1(this) ? this[TYPED_ARRAY_TAG] : undefined;
    } });
    for (NAME in TypedArrayConstructorsList) if (global$1[NAME]) {
      createNonEnumerableProperty(global$1[NAME], TYPED_ARRAY_TAG, NAME);
    }
  }

  var arrayBufferViewCore = {
    NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$1,
    TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
    aTypedArray: aTypedArray$m,
    aTypedArrayConstructor: aTypedArrayConstructor$4,
    exportTypedArrayMethod: exportTypedArrayMethod$n,
    exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$1,
    isView: isView,
    isTypedArray: isTypedArray,
    TypedArray: TypedArray,
    TypedArrayPrototype: TypedArrayPrototype
  };

  /* eslint-disable no-new -- required for testing */

  var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

  var ArrayBuffer$1 = global$1.ArrayBuffer;
  var Int8Array$2 = global$1.Int8Array;

  var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
    Int8Array$2(1);
  }) || !fails(function () {
    new Int8Array$2(-1);
  }) || !checkCorrectnessOfIteration(function (iterable) {
    new Int8Array$2();
    new Int8Array$2(null);
    new Int8Array$2(1.5);
    new Int8Array$2(iterable);
  }, true) || fails(function () {
    // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
    return new Int8Array$2(new ArrayBuffer$1(2), 1, undefined).length !== 1;
  });

  // `ToIndex` abstract operation
  // https://tc39.es/ecma262/#sec-toindex
  var toIndex = function (it) {
    if (it === undefined) return 0;
    var number = toInteger(it);
    var length = toLength(number);
    if (number !== length) throw RangeError('Wrong length or index');
    return length;
  };

  // IEEE754 conversions based on https://github.com/feross/ieee754
  var abs = Math.abs;
  var pow = Math.pow;
  var floor$1 = Math.floor;
  var log$1 = Math.log;
  var LN2 = Math.LN2;

  var pack = function (number, mantissaLength, bytes) {
    var buffer = new Array(bytes);
    var exponentLength = bytes * 8 - mantissaLength - 1;
    var eMax = (1 << exponentLength) - 1;
    var eBias = eMax >> 1;
    var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
    var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
    var index = 0;
    var exponent, mantissa, c;
    number = abs(number);
    // eslint-disable-next-line no-self-compare -- NaN check
    if (number != number || number === Infinity) {
      // eslint-disable-next-line no-self-compare -- NaN check
      mantissa = number != number ? 1 : 0;
      exponent = eMax;
    } else {
      exponent = floor$1(log$1(number) / LN2);
      if (number * (c = pow(2, -exponent)) < 1) {
        exponent--;
        c *= 2;
      }
      if (exponent + eBias >= 1) {
        number += rt / c;
      } else {
        number += rt * pow(2, 1 - eBias);
      }
      if (number * c >= 2) {
        exponent++;
        c /= 2;
      }
      if (exponent + eBias >= eMax) {
        mantissa = 0;
        exponent = eMax;
      } else if (exponent + eBias >= 1) {
        mantissa = (number * c - 1) * pow(2, mantissaLength);
        exponent = exponent + eBias;
      } else {
        mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
        exponent = 0;
      }
    }
    for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
    exponent = exponent << mantissaLength | mantissa;
    exponentLength += mantissaLength;
    for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
    buffer[--index] |= sign * 128;
    return buffer;
  };

  var unpack = function (buffer, mantissaLength) {
    var bytes = buffer.length;
    var exponentLength = bytes * 8 - mantissaLength - 1;
    var eMax = (1 << exponentLength) - 1;
    var eBias = eMax >> 1;
    var nBits = exponentLength - 7;
    var index = bytes - 1;
    var sign = buffer[index--];
    var exponent = sign & 127;
    var mantissa;
    sign >>= 7;
    for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
    mantissa = exponent & (1 << -nBits) - 1;
    exponent >>= -nBits;
    nBits += mantissaLength;
    for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
    if (exponent === 0) {
      exponent = 1 - eBias;
    } else if (exponent === eMax) {
      return mantissa ? NaN : sign ? -Infinity : Infinity;
    } else {
      mantissa = mantissa + pow(2, mantissaLength);
      exponent = exponent - eBias;
    } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
  };

  var ieee754 = {
    pack: pack,
    unpack: unpack
  };

  // `Array.prototype.fill` method implementation
  // https://tc39.es/ecma262/#sec-array.prototype.fill
  var arrayFill = function fill(value /* , start = 0, end = @length */) {
    var O = toObject(this);
    var length = toLength(O.length);
    var argumentsLength = arguments.length;
    var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
    var end = argumentsLength > 2 ? arguments[2] : undefined;
    var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
    while (endPos > index) O[index++] = value;
    return O;
  };

  var getOwnPropertyNames = objectGetOwnPropertyNames.f;
  var defineProperty$1 = objectDefineProperty.f;




  var getInternalState = internalState.get;
  var setInternalState$1 = internalState.set;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var DATA_VIEW = 'DataView';
  var PROTOTYPE = 'prototype';
  var WRONG_LENGTH = 'Wrong length';
  var WRONG_INDEX = 'Wrong index';
  var NativeArrayBuffer = global$1[ARRAY_BUFFER];
  var $ArrayBuffer = NativeArrayBuffer;
  var $DataView = global$1[DATA_VIEW];
  var $DataViewPrototype = $DataView && $DataView[PROTOTYPE];
  var ObjectPrototype = Object.prototype;
  var RangeError$1 = global$1.RangeError;

  var packIEEE754 = ieee754.pack;
  var unpackIEEE754 = ieee754.unpack;

  var packInt8 = function (number) {
    return [number & 0xFF];
  };

  var packInt16 = function (number) {
    return [number & 0xFF, number >> 8 & 0xFF];
  };

  var packInt32 = function (number) {
    return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
  };

  var unpackInt32 = function (buffer) {
    return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
  };

  var packFloat32 = function (number) {
    return packIEEE754(number, 23, 4);
  };

  var packFloat64 = function (number) {
    return packIEEE754(number, 52, 8);
  };

  var addGetter = function (Constructor, key) {
    defineProperty$1(Constructor[PROTOTYPE], key, { get: function () { return getInternalState(this)[key]; } });
  };

  var get = function (view, count, index, isLittleEndian) {
    var intIndex = toIndex(index);
    var store = getInternalState(view);
    if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
    var bytes = getInternalState(store.buffer).bytes;
    var start = intIndex + store.byteOffset;
    var pack = bytes.slice(start, start + count);
    return isLittleEndian ? pack : pack.reverse();
  };

  var set$1 = function (view, count, index, conversion, value, isLittleEndian) {
    var intIndex = toIndex(index);
    var store = getInternalState(view);
    if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
    var bytes = getInternalState(store.buffer).bytes;
    var start = intIndex + store.byteOffset;
    var pack = conversion(+value);
    for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
  };

  if (!arrayBufferNative) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
      var byteLength = toIndex(length);
      setInternalState$1(this, {
        bytes: arrayFill.call(new Array(byteLength), 0),
        byteLength: byteLength
      });
      if (!descriptors) this.byteLength = byteLength;
    };

    $DataView = function DataView(buffer, byteOffset, byteLength) {
      anInstance(this, $DataView, DATA_VIEW);
      anInstance(buffer, $ArrayBuffer, DATA_VIEW);
      var bufferLength = getInternalState(buffer).byteLength;
      var offset = toInteger(byteOffset);
      if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
      byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
      if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
      setInternalState$1(this, {
        buffer: buffer,
        byteLength: byteLength,
        byteOffset: offset
      });
      if (!descriptors) {
        this.buffer = buffer;
        this.byteLength = byteLength;
        this.byteOffset = offset;
      }
    };

    if (descriptors) {
      addGetter($ArrayBuffer, 'byteLength');
      addGetter($DataView, 'buffer');
      addGetter($DataView, 'byteLength');
      addGetter($DataView, 'byteOffset');
    }

    redefineAll($DataView[PROTOTYPE], {
      getInt8: function getInt8(byteOffset) {
        return get(this, 1, byteOffset)[0] << 24 >> 24;
      },
      getUint8: function getUint8(byteOffset) {
        return get(this, 1, byteOffset)[0];
      },
      getInt16: function getInt16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
        return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
      },
      getUint16: function getUint16(byteOffset /* , littleEndian */) {
        var bytes = get(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
        return bytes[1] << 8 | bytes[0];
      },
      getInt32: function getInt32(byteOffset /* , littleEndian */) {
        return unpackInt32(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
      },
      getUint32: function getUint32(byteOffset /* , littleEndian */) {
        return unpackInt32(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
      },
      getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
      },
      getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
        return unpackIEEE754(get(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
      },
      setInt8: function setInt8(byteOffset, value) {
        set$1(this, 1, byteOffset, packInt8, value);
      },
      setUint8: function setUint8(byteOffset, value) {
        set$1(this, 1, byteOffset, packInt8, value);
      },
      setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
        set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
      },
      setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
        set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
      },
      setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
        set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
      },
      setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
        set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
      },
      setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
        set$1(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
      },
      setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
        set$1(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
      }
    });
  } else {
    /* eslint-disable no-new -- required for testing */
    if (!fails(function () {
      NativeArrayBuffer(1);
    }) || !fails(function () {
      new NativeArrayBuffer(-1);
    }) || fails(function () {
      new NativeArrayBuffer();
      new NativeArrayBuffer(1.5);
      new NativeArrayBuffer(NaN);
      return NativeArrayBuffer.name != ARRAY_BUFFER;
    })) {
    /* eslint-enable no-new -- required for testing */
      $ArrayBuffer = function ArrayBuffer(length) {
        anInstance(this, $ArrayBuffer);
        return new NativeArrayBuffer(toIndex(length));
      };
      var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE] = NativeArrayBuffer[PROTOTYPE];
      for (var keys = getOwnPropertyNames(NativeArrayBuffer), j = 0, key$1; keys.length > j;) {
        if (!((key$1 = keys[j++]) in $ArrayBuffer)) {
          createNonEnumerableProperty($ArrayBuffer, key$1, NativeArrayBuffer[key$1]);
        }
      }
      ArrayBufferPrototype.constructor = $ArrayBuffer;
    }

    // WebKit bug - the same parent prototype for typed arrays and data view
    if (objectSetPrototypeOf && objectGetPrototypeOf($DataViewPrototype) !== ObjectPrototype) {
      objectSetPrototypeOf($DataViewPrototype, ObjectPrototype);
    }

    // iOS Safari 7.x bug
    var testView = new $DataView(new $ArrayBuffer(2));
    var nativeSetInt8 = $DataViewPrototype.setInt8;
    testView.setInt8(0, 2147483648);
    testView.setInt8(1, 2147483649);
    if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataViewPrototype, {
      setInt8: function setInt8(byteOffset, value) {
        nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
      },
      setUint8: function setUint8(byteOffset, value) {
        nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
      }
    }, { unsafe: true });
  }

  setToStringTag($ArrayBuffer, ARRAY_BUFFER);
  setToStringTag($DataView, DATA_VIEW);

  var arrayBuffer = {
    ArrayBuffer: $ArrayBuffer,
    DataView: $DataView
  };

  var toPositiveInteger = function (it) {
    var result = toInteger(it);
    if (result < 0) throw RangeError("The argument can't be less than 0");
    return result;
  };

  var toOffset = function (it, BYTES) {
    var offset = toPositiveInteger(it);
    if (offset % BYTES) throw RangeError('Wrong offset');
    return offset;
  };

  var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;

  var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
    var O = toObject(source);
    var argumentsLength = arguments.length;
    var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iteratorMethod = getIteratorMethod(O);
    var i, length, result, step, iterator, next;
    if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
      iterator = iteratorMethod.call(O);
      next = iterator.next;
      O = [];
      while (!(step = next.call(iterator)).done) {
        O.push(step.value);
      }
    }
    if (mapping && argumentsLength > 2) {
      mapfn = functionBindContext(mapfn, arguments[2], 2);
    }
    length = toLength(O.length);
    result = new (aTypedArrayConstructor$3(this))(length);
    for (i = 0; length > i; i++) {
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var typedArrayConstructor = createCommonjsModule(function (module) {


















  var getOwnPropertyNames = objectGetOwnPropertyNames.f;

  var forEach = arrayIteration.forEach;






  var getInternalState = internalState.get;
  var setInternalState = internalState.set;
  var nativeDefineProperty = objectDefineProperty.f;
  var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
  var round = Math.round;
  var RangeError = global$1.RangeError;
  var ArrayBuffer = arrayBuffer.ArrayBuffer;
  var DataView = arrayBuffer.DataView;
  var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
  var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
  var TypedArray = arrayBufferViewCore.TypedArray;
  var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
  var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
  var isTypedArray = arrayBufferViewCore.isTypedArray;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var WRONG_LENGTH = 'Wrong length';

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = new (aTypedArrayConstructor(C))(length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key) {
    nativeDefineProperty(it, key, { get: function () {
      return getInternalState(this)[key];
    } });
  };

  var isArrayBuffer = function (it) {
    var klass;
    return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
  };

  var isTypedArrayIndex = function (target, key) {
    return isTypedArray(target)
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };

  var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
    return isTypedArrayIndex(target, key = toPrimitive(key, true))
      ? createPropertyDescriptor(2, target[key])
      : nativeGetOwnPropertyDescriptor(target, key);
  };

  var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
    if (isTypedArrayIndex(target, key = toPrimitive(key, true))
      && isObject$1(descriptor)
      && has$2(descriptor, 'value')
      && !has$2(descriptor, 'get')
      && !has$2(descriptor, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !descriptor.configurable
      && (!has$2(descriptor, 'writable') || descriptor.writable)
      && (!has$2(descriptor, 'enumerable') || descriptor.enumerable)
    ) {
      target[key] = descriptor.value;
      return target;
    } return nativeDefineProperty(target, key, descriptor);
  };

  if (descriptors) {
    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
      objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
      objectDefineProperty.f = wrappedDefineProperty;
      addGetter(TypedArrayPrototype, 'buffer');
      addGetter(TypedArrayPrototype, 'byteOffset');
      addGetter(TypedArrayPrototype, 'byteLength');
      addGetter(TypedArrayPrototype, 'length');
    }

    _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
      getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
      defineProperty: wrappedDefineProperty
    });

    module.exports = function (TYPE, wrapper, CLAMPED) {
      var BYTES = TYPE.match(/\d+$/)[0] / 8;
      var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
      var GETTER = 'get' + TYPE;
      var SETTER = 'set' + TYPE;
      var NativeTypedArrayConstructor = global$1[CONSTRUCTOR_NAME];
      var TypedArrayConstructor = NativeTypedArrayConstructor;
      var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
      var exported = {};

      var getter = function (that, index) {
        var data = getInternalState(that);
        return data.view[GETTER](index * BYTES + data.byteOffset, true);
      };

      var setter = function (that, index, value) {
        var data = getInternalState(that);
        if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
        data.view[SETTER](index * BYTES + data.byteOffset, value, true);
      };

      var addElement = function (that, index) {
        nativeDefineProperty(that, index, {
          get: function () {
            return getter(this, index);
          },
          set: function (value) {
            return setter(this, index, value);
          },
          enumerable: true
        });
      };

      if (!NATIVE_ARRAY_BUFFER_VIEWS) {
        TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
          anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
          var index = 0;
          var byteOffset = 0;
          var buffer, byteLength, length;
          if (!isObject$1(data)) {
            length = toIndex(data);
            byteLength = length * BYTES;
            buffer = new ArrayBuffer(byteLength);
          } else if (isArrayBuffer(data)) {
            buffer = data;
            byteOffset = toOffset(offset, BYTES);
            var $len = data.byteLength;
            if ($length === undefined) {
              if ($len % BYTES) throw RangeError(WRONG_LENGTH);
              byteLength = $len - byteOffset;
              if (byteLength < 0) throw RangeError(WRONG_LENGTH);
            } else {
              byteLength = toLength($length) * BYTES;
              if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
            }
            length = byteLength / BYTES;
          } else if (isTypedArray(data)) {
            return fromList(TypedArrayConstructor, data);
          } else {
            return typedArrayFrom.call(TypedArrayConstructor, data);
          }
          setInternalState(that, {
            buffer: buffer,
            byteOffset: byteOffset,
            byteLength: byteLength,
            length: length,
            view: new DataView(buffer)
          });
          while (index < length) addElement(that, index++);
        });

        if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
        TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
      } else if (typedArrayConstructorsRequireWrappers) {
        TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
          anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
          return inheritIfRequired(function () {
            if (!isObject$1(data)) return new NativeTypedArrayConstructor(toIndex(data));
            if (isArrayBuffer(data)) return $length !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
              : typedArrayOffset !== undefined
                ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
                : new NativeTypedArrayConstructor(data);
            if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
            return typedArrayFrom.call(TypedArrayConstructor, data);
          }(), dummy, TypedArrayConstructor);
        });

        if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
        forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
          if (!(key in TypedArrayConstructor)) {
            createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
          }
        });
        TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
      }

      if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
        createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
      }

      if (TYPED_ARRAY_TAG) {
        createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
      }

      exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

      _export({
        global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
      }, exported);

      if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
        createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
      }

      if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
        createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
      }

      setSpecies(CONSTRUCTOR_NAME);
    };
  } else module.exports = function () { /* empty */ };
  });

  // `Uint8Array` constructor
  // https://tc39.es/ecma262/#sec-typedarray-objects
  typedArrayConstructor('Uint8', function (init) {
    return function Uint8Array(data, byteOffset, length) {
      return init(this, data, byteOffset, length);
    };
  });

  var min$1 = Math.min;

  // `Array.prototype.copyWithin` method implementation
  // https://tc39.es/ecma262/#sec-array.prototype.copywithin
  var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
    var O = toObject(this);
    var len = toLength(O.length);
    var to = toAbsoluteIndex(target, len);
    var from = toAbsoluteIndex(start, len);
    var end = arguments.length > 2 ? arguments[2] : undefined;
    var count = min$1((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
    var inc = 1;
    if (from < to && to < from + count) {
      inc = -1;
      from += count - 1;
      to += count - 1;
    }
    while (count-- > 0) {
      if (from in O) O[to] = O[from];
      else delete O[to];
      to += inc;
      from += inc;
    } return O;
  };

  var aTypedArray$l = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.copyWithin` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
  exportTypedArrayMethod$m('copyWithin', function copyWithin(target, start /* , end */) {
    return arrayCopyWithin.call(aTypedArray$l(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
  });

  var $every = arrayIteration.every;

  var aTypedArray$k = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.every` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
  exportTypedArrayMethod$l('every', function every(callbackfn /* , thisArg */) {
    return $every(aTypedArray$k(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  });

  var aTypedArray$j = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.fill` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  exportTypedArrayMethod$k('fill', function fill(value /* , start, end */) {
    return arrayFill.apply(aTypedArray$j(this), arguments);
  });

  var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;


  var typedArrayFromSpeciesAndList = function (instance, list) {
    var C = speciesConstructor(instance, instance.constructor);
    var index = 0;
    var length = list.length;
    var result = new (aTypedArrayConstructor$2(C))(length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var $filter = arrayIteration.filter;


  var aTypedArray$i = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.filter` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
  exportTypedArrayMethod$j('filter', function filter(callbackfn /* , thisArg */) {
    var list = $filter(aTypedArray$i(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return typedArrayFromSpeciesAndList(this, list);
  });

  var $find = arrayIteration.find;

  var aTypedArray$h = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.find` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
  exportTypedArrayMethod$i('find', function find(predicate /* , thisArg */) {
    return $find(aTypedArray$h(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
  });

  var $findIndex = arrayIteration.findIndex;

  var aTypedArray$g = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
  exportTypedArrayMethod$h('findIndex', function findIndex(predicate /* , thisArg */) {
    return $findIndex(aTypedArray$g(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
  });

  var $forEach = arrayIteration.forEach;

  var aTypedArray$f = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
  exportTypedArrayMethod$g('forEach', function forEach(callbackfn /* , thisArg */) {
    $forEach(aTypedArray$f(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  });

  var $includes = arrayIncludes.includes;

  var aTypedArray$e = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.includes` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
  exportTypedArrayMethod$f('includes', function includes(searchElement /* , fromIndex */) {
    return $includes(aTypedArray$e(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
  });

  var $indexOf = arrayIncludes.indexOf;

  var aTypedArray$d = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
  exportTypedArrayMethod$e('indexOf', function indexOf(searchElement /* , fromIndex */) {
    return $indexOf(aTypedArray$d(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
  });

  var ITERATOR = wellKnownSymbol('iterator');
  var Uint8Array$2 = global$1.Uint8Array;
  var arrayValues = es_array_iterator.values;
  var arrayKeys = es_array_iterator.keys;
  var arrayEntries = es_array_iterator.entries;
  var aTypedArray$c = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;
  var nativeTypedArrayIterator = Uint8Array$2 && Uint8Array$2.prototype[ITERATOR];

  var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
    && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

  var typedArrayValues = function values() {
    return arrayValues.call(aTypedArray$c(this));
  };

  // `%TypedArray%.prototype.entries` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
  exportTypedArrayMethod$d('entries', function entries() {
    return arrayEntries.call(aTypedArray$c(this));
  });
  // `%TypedArray%.prototype.keys` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
  exportTypedArrayMethod$d('keys', function keys() {
    return arrayKeys.call(aTypedArray$c(this));
  });
  // `%TypedArray%.prototype.values` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
  exportTypedArrayMethod$d('values', typedArrayValues, !CORRECT_ITER_NAME);
  // `%TypedArray%.prototype[@@iterator]` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
  exportTypedArrayMethod$d(ITERATOR, typedArrayValues, !CORRECT_ITER_NAME);

  var aTypedArray$b = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;
  var $join = [].join;

  // `%TypedArray%.prototype.join` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  exportTypedArrayMethod$c('join', function join(separator) {
    return $join.apply(aTypedArray$b(this), arguments);
  });

  var min = Math.min;
  var nativeLastIndexOf = [].lastIndexOf;
  var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
  var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
  var FORCED$4 = NEGATIVE_ZERO || !STRICT_METHOD;

  // `Array.prototype.lastIndexOf` method implementation
  // https://tc39.es/ecma262/#sec-array.prototype.lastindexof
  var arrayLastIndexOf = FORCED$4 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
    // convert -0 to +0
    if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var index = length - 1;
    if (arguments.length > 1) index = min(index, toInteger(arguments[1]));
    if (index < 0) index = length + index;
    for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
    return -1;
  } : nativeLastIndexOf;

  var aTypedArray$a = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.lastIndexOf` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  exportTypedArrayMethod$b('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
    return arrayLastIndexOf.apply(aTypedArray$a(this), arguments);
  });

  var $map = arrayIteration.map;


  var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
  var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;
  var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.map` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
  exportTypedArrayMethod$a('map', function map(mapfn /* , thisArg */) {
    return $map(aTypedArray$9(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
      return new (aTypedArrayConstructor$1(speciesConstructor(O, O.constructor)))(length);
    });
  });

  var $reduce = arrayReduce.left;

  var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
  exportTypedArrayMethod$9('reduce', function reduce(callbackfn /* , initialValue */) {
    return $reduce(aTypedArray$8(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  });

  var $reduceRight = arrayReduce.right;

  var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.reduceRicht` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
  exportTypedArrayMethod$8('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight(aTypedArray$7(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  });

  var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;
  var floor = Math.floor;

  // `%TypedArray%.prototype.reverse` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
  exportTypedArrayMethod$7('reverse', function reverse() {
    var that = this;
    var length = aTypedArray$6(that).length;
    var middle = floor(length / 2);
    var index = 0;
    var value;
    while (index < middle) {
      value = that[index];
      that[index++] = that[--length];
      that[length] = value;
    } return that;
  });

  var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;

  var FORCED$3 = fails(function () {
    /* global Int8Array -- safe */
    new Int8Array(1).set({});
  });

  // `%TypedArray%.prototype.set` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
  exportTypedArrayMethod$6('set', function set(arrayLike /* , offset */) {
    aTypedArray$5(this);
    var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
    var length = this.length;
    var src = toObject(arrayLike);
    var len = toLength(src.length);
    var index = 0;
    if (len + offset > length) throw RangeError('Wrong length');
    while (index < len) this[offset + index] = src[index++];
  }, FORCED$3);

  var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
  var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
  var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;
  var $slice$1 = [].slice;

  var FORCED$2 = fails(function () {
    /* global Int8Array -- safe */
    new Int8Array(1).slice();
  });

  // `%TypedArray%.prototype.slice` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
  exportTypedArrayMethod$5('slice', function slice(start, end) {
    var list = $slice$1.call(aTypedArray$4(this), start, end);
    var C = speciesConstructor(this, this.constructor);
    var index = 0;
    var length = list.length;
    var result = new (aTypedArrayConstructor(C))(length);
    while (length > index) result[index] = list[index++];
    return result;
  }, FORCED$2);

  var $some = arrayIteration.some;

  var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.some` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
  exportTypedArrayMethod$4('some', function some(callbackfn /* , thisArg */) {
    return $some(aTypedArray$3(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  });

  var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;
  var $sort = [].sort;

  // `%TypedArray%.prototype.sort` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
  exportTypedArrayMethod$3('sort', function sort(comparefn) {
    return $sort.call(aTypedArray$2(this), comparefn);
  });

  var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;

  // `%TypedArray%.prototype.subarray` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
  exportTypedArrayMethod$2('subarray', function subarray(begin, end) {
    var O = aTypedArray$1(this);
    var length = O.length;
    var beginIndex = toAbsoluteIndex(begin, length);
    return new (speciesConstructor(O, O.constructor))(
      O.buffer,
      O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
      toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
    );
  });

  var Int8Array$1 = global$1.Int8Array;
  var aTypedArray = arrayBufferViewCore.aTypedArray;
  var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;
  var $toLocaleString = [].toLocaleString;
  var $slice = [].slice;

  // iOS Safari 6.x fails here
  var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails(function () {
    $toLocaleString.call(new Int8Array$1(1));
  });

  var FORCED$1 = fails(function () {
    return [1, 2].toLocaleString() != new Int8Array$1([1, 2]).toLocaleString();
  }) || !fails(function () {
    Int8Array$1.prototype.toLocaleString.call([1, 2]);
  });

  // `%TypedArray%.prototype.toLocaleString` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
  exportTypedArrayMethod$1('toLocaleString', function toLocaleString() {
    return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice.call(aTypedArray(this)) : aTypedArray(this), arguments);
  }, FORCED$1);

  var exportTypedArrayMethod = arrayBufferViewCore.exportTypedArrayMethod;



  var Uint8Array$1 = global$1.Uint8Array;
  var Uint8ArrayPrototype = Uint8Array$1 && Uint8Array$1.prototype || {};
  var arrayToString = [].toString;
  var arrayJoin = [].join;

  if (fails(function () { arrayToString.call({}); })) {
    arrayToString = function toString() {
      return arrayJoin.call(this);
    };
  }

  var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

  // `%TypedArray%.prototype.toString` method
  // https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
  exportTypedArrayMethod('toString', arrayToString, IS_NOT_ARRAY_METHOD);

  var exportTypedArrayStaticMethod = arrayBufferViewCore.exportTypedArrayStaticMethod;


  // `%TypedArray%.from` method
  // https://tc39.es/ecma262/#sec-%typedarray%.from
  exportTypedArrayStaticMethod('from', typedArrayFrom, typedArrayConstructorsRequireWrappers);

  var base64 = createCommonjsModule(function (module, exports) {

    (function (global, factory) {
      module.exports = factory(global) ;
    })(typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : commonjsGlobal, function (global) {

      global = global || {};
      var _Base64 = global.Base64;
      var version = "2.6.4"; // constants

      var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      var b64tab = function (bin) {
        var t = {};

        for (var i = 0, l = bin.length; i < l; i++) {
          t[bin.charAt(i)] = i;
        }

        return t;
      }(b64chars);

      var fromCharCode = String.fromCharCode; // encoder stuff

      var cb_utob = function cb_utob(c) {
        if (c.length < 2) {
          var cc = c.charCodeAt(0);
          return cc < 0x80 ? c : cc < 0x800 ? fromCharCode(0xc0 | cc >>> 6) + fromCharCode(0x80 | cc & 0x3f) : fromCharCode(0xe0 | cc >>> 12 & 0x0f) + fromCharCode(0x80 | cc >>> 6 & 0x3f) + fromCharCode(0x80 | cc & 0x3f);
        } else {
          var cc = 0x10000 + (c.charCodeAt(0) - 0xD800) * 0x400 + (c.charCodeAt(1) - 0xDC00);
          return fromCharCode(0xf0 | cc >>> 18 & 0x07) + fromCharCode(0x80 | cc >>> 12 & 0x3f) + fromCharCode(0x80 | cc >>> 6 & 0x3f) + fromCharCode(0x80 | cc & 0x3f);
        }
      };

      var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;

      var utob = function utob(u) {
        return u.replace(re_utob, cb_utob);
      };

      var cb_encode = function cb_encode(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
            ord = ccc.charCodeAt(0) << 16 | (ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8 | (ccc.length > 2 ? ccc.charCodeAt(2) : 0),
            chars = [b64chars.charAt(ord >>> 18), b64chars.charAt(ord >>> 12 & 63), padlen >= 2 ? '=' : b64chars.charAt(ord >>> 6 & 63), padlen >= 1 ? '=' : b64chars.charAt(ord & 63)];
        return chars.join('');
      };

      var btoa = global.btoa && typeof global.btoa == 'function' ? function (b) {
        return global.btoa(b);
      } : function (b) {
        if (b.match(/[^\x00-\xFF]/)) throw new RangeError('The string contains invalid characters.');
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
      };

      var _encode = function _encode(u) {
        return btoa(utob(String(u)));
      };

      var mkUriSafe = function mkUriSafe(b64) {
        return b64.replace(/[+\/]/g, function (m0) {
          return m0 == '+' ? '-' : '_';
        }).replace(/=/g, '');
      };

      var encode = function encode(u, urisafe) {
        return urisafe ? mkUriSafe(_encode(u)) : _encode(u);
      };

      var encodeURI = function encodeURI(u) {
        return encode(u, true);
      };

      var fromUint8Array;
      if (global.Uint8Array) fromUint8Array = function fromUint8Array(a, urisafe) {
        // return btoa(fromCharCode.apply(null, a));
        var b64 = '';

        for (var i = 0, l = a.length; i < l; i += 3) {
          var a0 = a[i],
              a1 = a[i + 1],
              a2 = a[i + 2];
          var ord = a0 << 16 | a1 << 8 | a2;
          b64 += b64chars.charAt(ord >>> 18) + b64chars.charAt(ord >>> 12 & 63) + (typeof a1 != 'undefined' ? b64chars.charAt(ord >>> 6 & 63) : '=') + (typeof a2 != 'undefined' ? b64chars.charAt(ord & 63) : '=');
        }

        return urisafe ? mkUriSafe(b64) : b64;
      }; // decoder stuff

      var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;

      var cb_btou = function cb_btou(cccc) {
        switch (cccc.length) {
          case 4:
            var cp = (0x07 & cccc.charCodeAt(0)) << 18 | (0x3f & cccc.charCodeAt(1)) << 12 | (0x3f & cccc.charCodeAt(2)) << 6 | 0x3f & cccc.charCodeAt(3),
                offset = cp - 0x10000;
            return fromCharCode((offset >>> 10) + 0xD800) + fromCharCode((offset & 0x3FF) + 0xDC00);

          case 3:
            return fromCharCode((0x0f & cccc.charCodeAt(0)) << 12 | (0x3f & cccc.charCodeAt(1)) << 6 | 0x3f & cccc.charCodeAt(2));

          default:
            return fromCharCode((0x1f & cccc.charCodeAt(0)) << 6 | 0x3f & cccc.charCodeAt(1));
        }
      };

      var btou = function btou(b) {
        return b.replace(re_btou, cb_btou);
      };

      var cb_decode = function cb_decode(cccc) {
        var len = cccc.length,
            padlen = len % 4,
            n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0),
            chars = [fromCharCode(n >>> 16), fromCharCode(n >>> 8 & 0xff), fromCharCode(n & 0xff)];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
      };

      var _atob = global.atob && typeof global.atob == 'function' ? function (a) {
        return global.atob(a);
      } : function (a) {
        return a.replace(/\S{1,4}/g, cb_decode);
      };

      var atob = function atob(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
      };

      var _decode = function _decode(a) {
        return btou(_atob(a));
      };

      var _fromURI = function _fromURI(a) {
        return String(a).replace(/[-_]/g, function (m0) {
          return m0 == '-' ? '+' : '/';
        }).replace(/[^A-Za-z0-9\+\/]/g, '');
      };

      var decode = function decode(a) {
        return _decode(_fromURI(a));
      };

      var toUint8Array;
      if (global.Uint8Array) toUint8Array = function toUint8Array(a) {
        return Uint8Array.from(atob(_fromURI(a)), function (c) {
          return c.charCodeAt(0);
        });
      };

      var noConflict = function noConflict() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
      }; // export Base64


      global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        fromUint8Array: fromUint8Array,
        toUint8Array: toUint8Array
      }; // if ES5 is available, make Base64.extendString() available

      if (typeof Object.defineProperty === 'function') {
        var noEnum = function noEnum(v) {
          return {
            value: v,
            enumerable: false,
            writable: true,
            configurable: true
          };
        };

        global.Base64.extendString = function () {
          Object.defineProperty(String.prototype, 'fromBase64', noEnum(function () {
            return decode(this);
          }));
          Object.defineProperty(String.prototype, 'toBase64', noEnum(function (urisafe) {
            return encode(this, urisafe);
          }));
          Object.defineProperty(String.prototype, 'toBase64URI', noEnum(function () {
            return encode(this, true);
          }));
        };
      } //
      // export Base64 to the namespace
      //


      if (global['Meteor']) {
        // Meteor.js
        Base64 = global.Base64;
      } // module.exports and AMD are mutually exclusive.
      // module.exports has precedence.


      if (module.exports) {
        module.exports.Base64 = global.Base64;
      } // that's it!


      return {
        Base64: global.Base64
      };
    });
  });

  var $trimStart = stringTrim.start;


  var FORCED = stringTrimForced('trimStart');

  var trimStart = FORCED ? function trimStart() {
    return $trimStart(this);
  } : ''.trimStart;

  // `String.prototype.{ trimStart, trimLeft }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  // https://tc39.es/ecma262/#String.prototype.trimleft
  _export({ target: 'String', proto: true, forced: FORCED }, {
    trimStart: trimStart,
    trimLeft: trimStart
  });

  var requiresPort = function required(port, protocol) {
    protocol = protocol.split(':')[0];
    port = +port;
    if (!port) return false;

    switch (protocol) {
      case 'http':
      case 'ws':
        return port !== 80;

      case 'https':
      case 'wss':
        return port !== 443;

      case 'ftp':
        return port !== 21;

      case 'gopher':
        return port !== 70;

      case 'file':
        return false;
    }

    return port !== 0;
  };

  var has = Object.prototype.hasOwnProperty,
      undef;
  /**
   * Decode a URI encoded string.
   *
   * @param {String} input The URI encoded string.
   * @returns {String|Null} The decoded string.
   * @api private
   */

  function decode(input) {
    try {
      return decodeURIComponent(input.replace(/\+/g, ' '));
    } catch (e) {
      return null;
    }
  }
  /**
   * Attempts to encode a given input.
   *
   * @param {String} input The string that needs to be encoded.
   * @returns {String|Null} The encoded string.
   * @api private
   */


  function encode(input) {
    try {
      return encodeURIComponent(input);
    } catch (e) {
      return null;
    }
  }
  /**
   * Simple query string parser.
   *
   * @param {String} query The query string that needs to be parsed.
   * @returns {Object}
   * @api public
   */


  function querystring(query) {
    var parser = /([^=?#&]+)=?([^&]*)/g,
        result = {},
        part;

    while (part = parser.exec(query)) {
      var key = decode(part[1]),
          value = decode(part[2]); //
      // Prevent overriding of existing properties. This ensures that build-in
      // methods like `toString` or __proto__ are not overriden by malicious
      // querystrings.
      //
      // In the case if failed decoding, we want to omit the key/value pairs
      // from the result.
      //

      if (key === null || value === null || key in result) continue;
      result[key] = value;
    }

    return result;
  }
  /**
   * Transform a query string to an object.
   *
   * @param {Object} obj Object that should be transformed.
   * @param {String} prefix Optional prefix.
   * @returns {String}
   * @api public
   */


  function querystringify(obj, prefix) {
    prefix = prefix || '';
    var pairs = [],
        value,
        key; //
    // Optionally prefix with a '?' if needed
    //

    if ('string' !== typeof prefix) prefix = '?';

    for (key in obj) {
      if (has.call(obj, key)) {
        value = obj[key]; //
        // Edge cases where we actually want to encode the value to an empty
        // string instead of the stringified value.
        //

        if (!value && (value === null || value === undef || isNaN(value))) {
          value = '';
        }

        key = encode(key);
        value = encode(value); //
        // If we failed to encode the strings, we should bail out as we don't
        // want to add invalid strings to the query.
        //

        if (key === null || value === null) continue;
        pairs.push(key + '=' + value);
      }
    }

    return pairs.length ? prefix + pairs.join('&') : '';
  } //
  // Expose the module.
  //


  var stringify = querystringify;
  var parse = querystring;
  var querystringify_1 = {
    stringify: stringify,
    parse: parse
  };

  var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:[\\/]+/,
      protocolre = /^([a-z][a-z0-9.+-]*:)?([\\/]{1,})?([\S\s]*)/i,
      whitespace = "[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]",
      left = new RegExp('^' + whitespace + '+');
  /**
   * Trim a given string.
   *
   * @param {String} str String to trim.
   * @public
   */

  function trimLeft(str) {
    return (str ? str : '').toString().replace(left, '');
  }
  /**
   * These are the parse rules for the URL parser, it informs the parser
   * about:
   *
   * 0. The char it Needs to parse, if it's a string it should be done using
   *    indexOf, RegExp using exec and NaN means set as current value.
   * 1. The property we should set when parsing this value.
   * 2. Indication if it's backwards or forward parsing, when set as number it's
   *    the value of extra chars that should be split off.
   * 3. Inherit from location if non existing in the parser.
   * 4. `toLowerCase` the resulting value.
   */


  var rules = [['#', 'hash'], // Extract from the back.
  ['?', 'query'], // Extract from the back.
  function sanitize(address) {
    // Sanitize what is left of the address
    return address.replace('\\', '/');
  }, ['/', 'pathname'], // Extract from the back.
  ['@', 'auth', 1], // Extract from the front.
  [NaN, 'host', undefined, 1, 1], // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1], // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1] // Set left over.
  ];
  /**
   * These properties should not be copied or inherited from. This is only needed
   * for all non blob URL's as a blob URL does not include a hash, only the
   * origin.
   *
   * @type {Object}
   * @private
   */

  var ignore = {
    hash: 1,
    query: 1
  };
  /**
   * The location object differs when your code is loaded through a normal page,
   * Worker or through a worker using a blob. And with the blobble begins the
   * trouble as the location object will contain the URL of the blob, not the
   * location of the page where our code is loaded in. The actual origin is
   * encoded in the `pathname` so we can thankfully generate a good "default"
   * location from it so we can generate proper relative URL's again.
   *
   * @param {Object|String} loc Optional default location object.
   * @returns {Object} lolcation object.
   * @public
   */

  function lolcation(loc) {
    var globalVar;
    if (typeof window !== 'undefined') globalVar = window;else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;else if (typeof self !== 'undefined') globalVar = self;else globalVar = {};
    var location = globalVar.location || {};
    loc = loc || location;

    var finaldestination = {},
        type = _typeof$2(loc),
        key;

    if ('blob:' === loc.protocol) {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if ('string' === type) {
      finaldestination = new Url(loc, {});

      for (key in ignore) {
        delete finaldestination[key];
      }
    } else if ('object' === type) {
      for (key in loc) {
        if (key in ignore) continue;
        finaldestination[key] = loc[key];
      }

      if (finaldestination.slashes === undefined) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }

    return finaldestination;
  }
  /**
   * @typedef ProtocolExtract
   * @type Object
   * @property {String} protocol Protocol matched in the URL, in lowercase.
   * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
   * @property {String} rest Rest of the URL that is not part of the protocol.
   */

  /**
   * Extract protocol information from a URL with/without double slash ("//").
   *
   * @param {String} address URL we want to extract from.
   * @return {ProtocolExtract} Extracted information.
   * @private
   */


  function extractProtocol(address) {
    address = trimLeft(address);
    var match = protocolre.exec(address),
        protocol = match[1] ? match[1].toLowerCase() : '',
        slashes = !!(match[2] && match[2].length >= 2),
        rest = match[2] && match[2].length === 1 ? '/' + match[3] : match[3];
    return {
      protocol: protocol,
      slashes: slashes,
      rest: rest
    };
  }
  /**
   * Resolve a relative URL pathname against a base URL pathname.
   *
   * @param {String} relative Pathname of the relative URL.
   * @param {String} base Pathname of the base URL.
   * @return {String} Resolved pathname.
   * @private
   */


  function resolve(relative, base) {
    if (relative === '') return base;
    var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/')),
        i = path.length,
        last = path[i - 1],
        unshift = false,
        up = 0;

    while (i--) {
      if (path[i] === '.') {
        path.splice(i, 1);
      } else if (path[i] === '..') {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0) unshift = true;
        path.splice(i, 1);
        up--;
      }
    }

    if (unshift) path.unshift('');
    if (last === '.' || last === '..') path.push('');
    return path.join('/');
  }
  /**
   * The actual URL instance. Instead of returning an object we've opted-in to
   * create an actual constructor as it's much more memory efficient and
   * faster and it pleases my OCD.
   *
   * It is worth noting that we should not use `URL` as class name to prevent
   * clashes with the global URL instance that got introduced in browsers.
   *
   * @constructor
   * @param {String} address URL we want to parse.
   * @param {Object|String} [location] Location defaults for relative paths.
   * @param {Boolean|Function} [parser] Parser for the query string.
   * @private
   */


  function Url(address, location, parser) {
    address = trimLeft(address);

    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }

    var relative,
        extracted,
        parse,
        instruction,
        index,
        key,
        instructions = rules.slice(),
        type = _typeof$2(location),
        url = this,
        i = 0; //
    // The following if statements allows this module two have compatibility with
    // 2 different API:
    //
    // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
    //    where the boolean indicates that the query string should also be parsed.
    //
    // 2. The `URL` interface of the browser which accepts a URL, object as
    //    arguments. The supplied object will be used as default values / fall-back
    //    for relative paths.
    //


    if ('object' !== type && 'string' !== type) {
      parser = location;
      location = null;
    }

    if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;
    location = lolcation(location); //
    // Extract protocol information before running the instructions.
    //

    extracted = extractProtocol(address || '');
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || '';
    address = extracted.rest; //
    // When the authority component is absent the URL starts with a path
    // component.
    //

    if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

    for (; i < instructions.length; i++) {
      instruction = instructions[i];

      if (typeof instruction === 'function') {
        address = instruction(address);
        continue;
      }

      parse = instruction[0];
      key = instruction[1];

      if (parse !== parse) {
        url[key] = address;
      } else if ('string' === typeof parse) {
        if (~(index = address.indexOf(parse))) {
          if ('number' === typeof instruction[2]) {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if (index = parse.exec(address)) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }

      url[key] = url[key] || (relative && instruction[3] ? location[key] || '' : ''); //
      // Hostname, host and protocol should be lowercased so they can be used to
      // create a proper `origin`.
      //

      if (instruction[4]) url[key] = url[key].toLowerCase();
    } //
    // Also parse the supplied query string in to an object. If we're supplied
    // with a custom parser as function use that instead of the default build-in
    // parser.
    //


    if (parser) url.query = parser(url.query); //
    // If the URL is relative, resolve the pathname against the base URL.
    //

    if (relative && location.slashes && url.pathname.charAt(0) !== '/' && (url.pathname !== '' || location.pathname !== '')) {
      url.pathname = resolve(url.pathname, location.pathname);
    } //
    // Default to a / for pathname if none exists. This normalizes the URL
    // to always have a /
    //


    if (url.pathname.charAt(0) !== '/' && url.hostname) {
      url.pathname = '/' + url.pathname;
    } //
    // We should not add port numbers if they are already the default port number
    // for a given protocol. As the host also contains the port number we're going
    // override it with the hostname which contains no port number.
    //


    if (!requiresPort(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = '';
    } //
    // Parse down the `auth` for the username and password.
    //


    url.username = url.password = '';

    if (url.auth) {
      instruction = url.auth.split(':');
      url.username = instruction[0] || '';
      url.password = instruction[1] || '';
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:' ? url.protocol + '//' + url.host : 'null'; //
    // The href is just the compiled result.
    //

    url.href = url.toString();
  }
  /**
   * This is convenience method for changing properties in the URL instance to
   * insure that they all propagate correctly.
   *
   * @param {String} part          Property we need to adjust.
   * @param {Mixed} value          The newly assigned value.
   * @param {Boolean|Function} fn  When setting the query, it will be the function
   *                               used to parse the query.
   *                               When setting the protocol, double slash will be
   *                               removed from the final url if it is true.
   * @returns {URL} URL instance for chaining.
   * @public
   */


  function set(part, value, fn) {
    var url = this;

    switch (part) {
      case 'query':
        if ('string' === typeof value && value.length) {
          value = (fn || querystringify_1.parse)(value);
        }

        url[part] = value;
        break;

      case 'port':
        url[part] = value;

        if (!requiresPort(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = '';
        } else if (value) {
          url.host = url.hostname + ':' + value;
        }

        break;

      case 'hostname':
        url[part] = value;
        if (url.port) value += ':' + url.port;
        url.host = value;
        break;

      case 'host':
        url[part] = value;

        if (/:\d+$/.test(value)) {
          value = value.split(':');
          url.port = value.pop();
          url.hostname = value.join(':');
        } else {
          url.hostname = value;
          url.port = '';
        }

        break;

      case 'protocol':
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;

      case 'pathname':
      case 'hash':
        if (value) {
          var char = part === 'pathname' ? '/' : '#';
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }

        break;

      default:
        url[part] = value;
    }

    for (var i = 0; i < rules.length; i++) {
      var ins = rules[i];
      if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:' ? url.protocol + '//' + url.host : 'null';
    url.href = url.toString();
    return url;
  }
  /**
   * Transform the properties back in to a valid and full URL string.
   *
   * @param {Function} stringify Optional query stringify function.
   * @returns {String} Compiled version of the URL.
   * @public
   */


  function toString(stringify) {
    if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;
    var query,
        url = this,
        protocol = url.protocol;
    if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
    var result = protocol + (url.slashes ? '//' : '');

    if (url.username) {
      result += url.username;
      if (url.password) result += ':' + url.password;
      result += '@';
    }

    result += url.host + url.pathname;
    query = 'object' === _typeof$2(url.query) ? stringify(url.query) : url.query;
    if (query) result += '?' !== query.charAt(0) ? '?' + query : query;
    if (url.hash) result += url.hash;
    return result;
  }

  Url.prototype = {
    set: set,
    toString: toString
  }; //
  // Expose the URL parser and some additional properties that might be useful for
  // others or testing.
  //

  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.trimLeft = trimLeft;
  Url.qs = querystringify_1;
  var urlParse = Url;

  var freezing = !fails(function () {
    return Object.isExtensible(Object.preventExtensions({}));
  });

  var internalMetadata = createCommonjsModule(function (module) {
  var defineProperty = objectDefineProperty.f;



  var METADATA = uid('meta');
  var id = 0;

  var isExtensible = Object.isExtensible || function () {
    return true;
  };

  var setMetadata = function (it) {
    defineProperty(it, METADATA, { value: {
      objectID: 'O' + ++id, // object ID
      weakData: {}          // weak collections IDs
    } });
  };

  var fastKey = function (it, create) {
    // return a primitive with prefix
    if (!isObject$1(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!has$2(it, METADATA)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMetadata(it);
    // return object ID
    } return it[METADATA].objectID;
  };

  var getWeakData = function (it, create) {
    if (!has$2(it, METADATA)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMetadata(it);
    // return the store of weak collections IDs
    } return it[METADATA].weakData;
  };

  // add metadata on freeze-family methods calling
  var onFreeze = function (it) {
    if (freezing && meta.REQUIRED && isExtensible(it) && !has$2(it, METADATA)) setMetadata(it);
    return it;
  };

  var meta = module.exports = {
    REQUIRED: false,
    fastKey: fastKey,
    getWeakData: getWeakData,
    onFreeze: onFreeze
  };

  hiddenKeys$1[METADATA] = true;
  });

  var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
    var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
    var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
    var ADDER = IS_MAP ? 'set' : 'add';
    var NativeConstructor = global$1[CONSTRUCTOR_NAME];
    var NativePrototype = NativeConstructor && NativeConstructor.prototype;
    var Constructor = NativeConstructor;
    var exported = {};

    var fixMethod = function (KEY) {
      var nativeMethod = NativePrototype[KEY];
      redefine(NativePrototype, KEY,
        KEY == 'add' ? function add(value) {
          nativeMethod.call(this, value === 0 ? 0 : value);
          return this;
        } : KEY == 'delete' ? function (key) {
          return IS_WEAK && !isObject$1(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
        } : KEY == 'get' ? function get(key) {
          return IS_WEAK && !isObject$1(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
        } : KEY == 'has' ? function has(key) {
          return IS_WEAK && !isObject$1(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
        } : function set(key, value) {
          nativeMethod.call(this, key === 0 ? 0 : key, value);
          return this;
        }
      );
    };

    var REPLACE = isForced_1(
      CONSTRUCTOR_NAME,
      typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
        new NativeConstructor().entries().next();
      }))
    );

    if (REPLACE) {
      // create collection constructor
      Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
      internalMetadata.REQUIRED = true;
    } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
      var instance = new Constructor();
      // early implementations not supports chaining
      var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
      // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
      var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      // eslint-disable-next-line no-new -- required for testing
      var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
      // for early implementations -0 and +0 not the same
      var BUGGY_ZERO = !IS_WEAK && fails(function () {
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new NativeConstructor();
        var index = 5;
        while (index--) $instance[ADDER](index, index);
        return !$instance.has(-0);
      });

      if (!ACCEPT_ITERABLES) {
        Constructor = wrapper(function (dummy, iterable) {
          anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
          var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
          if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
          return that;
        });
        Constructor.prototype = NativePrototype;
        NativePrototype.constructor = Constructor;
      }

      if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
        fixMethod('delete');
        fixMethod('has');
        IS_MAP && fixMethod('get');
      }

      if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

      // weak collections should not contains .clear method
      if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
    }

    exported[CONSTRUCTOR_NAME] = Constructor;
    _export({ global: true, forced: Constructor != NativeConstructor }, exported);

    setToStringTag(Constructor, CONSTRUCTOR_NAME);

    if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

    return Constructor;
  };

  var defineProperty = objectDefineProperty.f;








  var fastKey = internalMetadata.fastKey;


  var setInternalState = internalState.set;
  var internalStateGetterFor = internalState.getterFor;

  var collectionStrong = {
    getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
      var C = wrapper(function (that, iterable) {
        anInstance(that, C, CONSTRUCTOR_NAME);
        setInternalState(that, {
          type: CONSTRUCTOR_NAME,
          index: objectCreate(null),
          first: undefined,
          last: undefined,
          size: 0
        });
        if (!descriptors) that.size = 0;
        if (iterable != undefined) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
      });

      var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

      var define = function (that, key, value) {
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        var previous, index;
        // change existing entry
        if (entry) {
          entry.value = value;
        // create new entry
        } else {
          state.last = entry = {
            index: index = fastKey(key, true),
            key: key,
            value: value,
            previous: previous = state.last,
            next: undefined,
            removed: false
          };
          if (!state.first) state.first = entry;
          if (previous) previous.next = entry;
          if (descriptors) state.size++;
          else that.size++;
          // add to index
          if (index !== 'F') state.index[index] = entry;
        } return that;
      };

      var getEntry = function (that, key) {
        var state = getInternalState(that);
        // fast case
        var index = fastKey(key);
        var entry;
        if (index !== 'F') return state.index[index];
        // frozen object case
        for (entry = state.first; entry; entry = entry.next) {
          if (entry.key == key) return entry;
        }
      };

      redefineAll(C.prototype, {
        // 23.1.3.1 Map.prototype.clear()
        // 23.2.3.2 Set.prototype.clear()
        clear: function clear() {
          var that = this;
          var state = getInternalState(that);
          var data = state.index;
          var entry = state.first;
          while (entry) {
            entry.removed = true;
            if (entry.previous) entry.previous = entry.previous.next = undefined;
            delete data[entry.index];
            entry = entry.next;
          }
          state.first = state.last = undefined;
          if (descriptors) state.size = 0;
          else that.size = 0;
        },
        // 23.1.3.3 Map.prototype.delete(key)
        // 23.2.3.4 Set.prototype.delete(value)
        'delete': function (key) {
          var that = this;
          var state = getInternalState(that);
          var entry = getEntry(that, key);
          if (entry) {
            var next = entry.next;
            var prev = entry.previous;
            delete state.index[entry.index];
            entry.removed = true;
            if (prev) prev.next = next;
            if (next) next.previous = prev;
            if (state.first == entry) state.first = next;
            if (state.last == entry) state.last = prev;
            if (descriptors) state.size--;
            else that.size--;
          } return !!entry;
        },
        // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
        // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
        forEach: function forEach(callbackfn /* , that = undefined */) {
          var state = getInternalState(this);
          var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
          var entry;
          while (entry = entry ? entry.next : state.first) {
            boundFunction(entry.value, entry.key, this);
            // revert to the last existing entry
            while (entry && entry.removed) entry = entry.previous;
          }
        },
        // 23.1.3.7 Map.prototype.has(key)
        // 23.2.3.7 Set.prototype.has(value)
        has: function has(key) {
          return !!getEntry(this, key);
        }
      });

      redefineAll(C.prototype, IS_MAP ? {
        // 23.1.3.6 Map.prototype.get(key)
        get: function get(key) {
          var entry = getEntry(this, key);
          return entry && entry.value;
        },
        // 23.1.3.9 Map.prototype.set(key, value)
        set: function set(key, value) {
          return define(this, key === 0 ? 0 : key, value);
        }
      } : {
        // 23.2.3.1 Set.prototype.add(value)
        add: function add(value) {
          return define(this, value = value === 0 ? 0 : value, value);
        }
      });
      if (descriptors) defineProperty(C.prototype, 'size', {
        get: function () {
          return getInternalState(this).size;
        }
      });
      return C;
    },
    setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
      var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
      var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
      var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
      // add .keys, .values, .entries, [@@iterator]
      // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
      defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
        setInternalState(this, {
          type: ITERATOR_NAME,
          target: iterated,
          state: getInternalCollectionState(iterated),
          kind: kind,
          last: undefined
        });
      }, function () {
        var state = getInternalIteratorState(this);
        var kind = state.kind;
        var entry = state.last;
        // revert to the last existing entry
        while (entry && entry.removed) entry = entry.previous;
        // get next entry
        if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
          // or finish the iteration
          state.target = undefined;
          return { value: undefined, done: true };
        }
        // return step by kind
        if (kind == 'keys') return { value: entry.key, done: false };
        if (kind == 'values') return { value: entry.value, done: false };
        return { value: [entry.key, entry.value], done: false };
      }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

      // add [@@species], 23.1.2.2, 23.2.2.2
      setSpecies(CONSTRUCTOR_NAME);
    }
  };

  // `Map` constructor
  // https://tc39.es/ecma262/#sec-map-objects
  collection('Map', function (init) {
    return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
  }, collectionStrong);

  function _typeof$1(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof$1(obj);
  }

  function _classCallCheck$6(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _inherits$1(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf$1(subClass, superClass);
  }

  function _createSuper$2(Derived) {
    return function () {
      var Super = _getPrototypeOf$1(Derived),
          result;

      if (_isNativeReflectConstruct$2()) {
        var NewTarget = _getPrototypeOf$1(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn$1(this, result);
    };
  }

  function _possibleConstructorReturn$1(self, call) {
    if (call && (_typeof$1(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized$1(self);
  }

  function _assertThisInitialized$1(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf$1(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf$1(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _construct(Parent, args, Class) {
    if (_isNativeReflectConstruct$2()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf$1(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _isNativeReflectConstruct$2() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function _setPrototypeOf$1(o, p) {
    _setPrototypeOf$1 = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf$1(o, p);
  }

  function _getPrototypeOf$1(o) {
    _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf$1(o);
  }

  var DetailedError = /*#__PURE__*/function (_Error) {
    _inherits$1(DetailedError, _Error);

    var _super = _createSuper$2(DetailedError);

    function DetailedError(message) {
      var _this;

      var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var req = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var res = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

      _classCallCheck$6(this, DetailedError);

      _this = _super.call(this, message);
      _this.originalRequest = req;
      _this.originalResponse = res;
      _this.causingError = causingErr;

      if (causingErr != null) {
        message += ", caused by ".concat(causingErr.toString());
      }

      if (req != null) {
        var requestId = req.getHeader("X-Request-ID") || "n/a";
        var method = req.getMethod();
        var url = req.getURL();
        var status = res ? res.getStatus() : "n/a";
        var body = res ? res.getBody() || "" : "n/a";
        message += ", originated from request (method: ".concat(method, ", url: ").concat(url, ", response code: ").concat(status, ", response text: ").concat(body, ", request id: ").concat(requestId, ")");
      }

      _this.message = message;
      return _this;
    }

    return DetailedError;
  }( /*#__PURE__*/_wrapNativeSuper(Error));

  /* eslint no-console: "off" */
  function log(msg) {
    return;
  }

  /**
   * Generate a UUID v4 based on random numbers. We intentioanlly use the less
   * secure Math.random function here since the more secure crypto.getRandomNumbers
   * is not available on all platforms.
   * This is not a problem for us since we use the UUID only for generating a
   * request ID, so we can correlate server logs to client errors.
   *
   * This function is taken from following site:
   * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
   *
   * @return {string} The generate UUID
   */
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
          v = c == "x" ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }

  function ownKeys$2(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread$2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys$2(Object(source), true).forEach(function (key) {
          _defineProperty$1(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys$2(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty$1(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _classCallCheck$5(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$5(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$5(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$5(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$5(Constructor, staticProps);
    return Constructor;
  }
  var defaultOptions$1 = {
    endpoint: null,
    uploadUrl: null,
    metadata: {},
    fingerprint: null,
    uploadSize: null,
    onProgress: null,
    onChunkComplete: null,
    onSuccess: null,
    onError: null,
    _onUploadUrlAvailable: null,
    overridePatchMethod: false,
    headers: {},
    addRequestId: false,
    onBeforeRequest: null,
    onAfterResponse: null,
    onShouldRetry: null,
    chunkSize: Infinity,
    retryDelays: [0, 1000, 3000, 5000],
    parallelUploads: 1,
    storeFingerprintForResuming: true,
    removeFingerprintOnSuccess: false,
    uploadLengthDeferred: false,
    uploadDataDuringCreation: false,
    urlStorage: null,
    fileReader: null,
    httpStack: null
  };

  var BaseUpload = /*#__PURE__*/function () {
    function BaseUpload(file, options) {
      _classCallCheck$5(this, BaseUpload); // Warn about removed options from previous versions


      if ("resume" in options) {
        console.log("tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead."); // eslint-disable-line no-console
      } // The default options will already be added from the wrapper classes.


      this.options = options; // The storage module used to store URLs

      this._urlStorage = this.options.urlStorage; // The underlying File/Blob object

      this.file = file; // The URL against which the file will be uploaded

      this.url = null; // The underlying request object for the current PATCH request

      this._req = null; // The fingerpinrt for the current file (set after start())

      this._fingerprint = null; // The key that the URL storage returned when saving an URL with a fingerprint,

      this._urlStorageKey = null; // The offset used in the current PATCH request

      this._offset = null; // True if the current PATCH request has been aborted

      this._aborted = false; // The file's size in bytes

      this._size = null; // The Source object which will wrap around the given file and provides us
      // with a unified interface for getting its size and slice chunks from its
      // content allowing us to easily handle Files, Blobs, Buffers and Streams.

      this._source = null; // The current count of attempts which have been made. Zero indicates none.

      this._retryAttempt = 0; // The timeout's ID which is used to delay the next retry

      this._retryTimeout = null; // The offset of the remote upload before the latest attempt was started.

      this._offsetBeforeRetry = 0; // An array of BaseUpload instances which are used for uploading the different
      // parts, if the parallelUploads option is used.

      this._parallelUploads = null; // An array of upload URLs which are used for uploading the different
      // parts, if the parallelUploads option is used.

      this._parallelUploadUrls = null;
    }
    /**
     * Use the Termination extension to delete an upload from the server by sending a DELETE
     * request to the specified upload URL. This is only possible if the server supports the
     * Termination extension. If the `options.retryDelays` property is set, the method will
     * also retry if an error ocurrs.
     *
     * @param {String} url The upload's URL which will be terminated.
     * @param {object} options Optional options for influencing HTTP requests.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */


    _createClass$5(BaseUpload, [{
      key: "findPreviousUploads",
      value: function findPreviousUploads() {
        var _this = this;

        return this.options.fingerprint(this.file, this.options).then(function (fingerprint) {
          return _this._urlStorage.findUploadsByFingerprint(fingerprint);
        });
      }
    }, {
      key: "resumeFromPreviousUpload",
      value: function resumeFromPreviousUpload(previousUpload) {
        this.url = previousUpload.uploadUrl || null;
        this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
        this._urlStorageKey = previousUpload.urlStorageKey;
      }
    }, {
      key: "start",
      value: function start() {
        var _this2 = this;

        var file = this.file;

        if (!file) {
          this._emitError(new Error("tus: no file or stream to upload provided"));

          return;
        }

        if (!this.options.endpoint && !this.options.uploadUrl) {
          this._emitError(new Error("tus: neither an endpoint or an upload URL is provided"));

          return;
        }

        var retryDelays = this.options.retryDelays;

        if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== "[object Array]") {
          this._emitError(new Error("tus: the `retryDelays` option must either be an array or null"));

          return;
        }

        if (this.options.parallelUploads > 1) {
          // Test which options are incompatible with parallel uploads.
          ["uploadUrl", "uploadSize", "uploadLengthDeferred"].forEach(function (optionName) {
            if (_this2.options[optionName]) {
              _this2._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
            }
          });
        }

        this.options.fingerprint(file, this.options).then(function (fingerprint) {

          _this2._fingerprint = fingerprint;

          if (_this2._source) {
            return _this2._source;
          } else {
            return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
          }
        }).then(function (source) {
          _this2._source = source; // If the upload was configured to use multiple requests or if we resume from
          // an upload which used multiple requests, we start a parallel upload.

          if (_this2.options.parallelUploads > 1 || _this2._parallelUploadUrls != null) {
            _this2._startParallelUpload();
          } else {
            _this2._startSingleUpload();
          }
        })["catch"](function (err) {
          _this2._emitError(err);
        });
      }
      /**
       * Initiate the uploading procedure for a parallelized upload, where one file is split into
       * multiple request which are run in parallel.
       *
       * @api private
       */

    }, {
      key: "_startParallelUpload",
      value: function _startParallelUpload() {
        var _this3 = this;

        var totalSize = this._size = this._source.size;
        var totalProgress = 0;
        this._parallelUploads = [];
        var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads; // The input file will be split into multiple slices which are uploaded in separate
        // requests. Here we generate the start and end position for the slices.

        var parts = splitSizeIntoParts(this._source.size, partCount, this._parallelUploadUrls); // Create an empty list for storing the upload URLs

        this._parallelUploadUrls = new Array(parts.length); // Generate a promise for each slice that will be resolve if the respective
        // upload is completed.

        var uploads = parts.map(function (part, index) {
          var lastPartProgress = 0;
          return _this3._source.slice(part.start, part.end).then(function (_ref) {
            var value = _ref.value;
            return new Promise(function (resolve, reject) {
              // Merge with the user supplied options but overwrite some values.
              var options = _objectSpread$2({}, _this3.options, {
                // If available, the partial upload should be resumed from a previous URL.
                uploadUrl: part.uploadUrl || null,
                // We take manually care of resuming for partial uploads, so they should
                // not be stored in the URL storage.
                storeFingerprintForResuming: false,
                removeFingerprintOnSuccess: false,
                // Reset the parallelUploads option to not cause recursion.
                parallelUploads: 1,
                metadata: {},
                // Add the header to indicate the this is a partial upload.
                headers: _objectSpread$2({}, _this3.options.headers, {
                  "Upload-Concat": "partial"
                }),
                // Reject or resolve the promise if the upload errors or completes.
                onSuccess: resolve,
                onError: reject,
                // Based in the progress for this partial upload, calculate the progress
                // for the entire final upload.
                onProgress: function onProgress(newPartProgress) {
                  totalProgress = totalProgress - lastPartProgress + newPartProgress;
                  lastPartProgress = newPartProgress;

                  _this3._emitProgress(totalProgress, totalSize);
                },
                // Wait until every partial upload has an upload URL, so we can add
                // them to the URL storage.
                _onUploadUrlAvailable: function _onUploadUrlAvailable() {
                  _this3._parallelUploadUrls[index] = upload.url; // Test if all uploads have received an URL

                  if (_this3._parallelUploadUrls.filter(function (u) {
                    return !!u;
                  }).length === parts.length) {
                    _this3._saveUploadInUrlStorage();
                  }
                }
              });

              var upload = new BaseUpload(value, options);
              upload.start(); // Store the upload in an array, so we can later abort them if necessary.

              _this3._parallelUploads.push(upload);
            });
          });
        });
        var req; // Wait until all partial uploads are finished and we can send the POST request for
        // creating the final upload.

        Promise.all(uploads).then(function () {
          req = _this3._openRequest("POST", _this3.options.endpoint);
          req.setHeader("Upload-Concat", "final;".concat(_this3._parallelUploadUrls.join(" "))); // Add metadata if values have been added

          var metadata = encodeMetadata(_this3.options.metadata);

          if (metadata !== "") {
            req.setHeader("Upload-Metadata", metadata);
          }

          return _this3._sendRequest(req, null);
        }).then(function (res) {
          if (!inStatusCategory(res.getStatus(), 200)) {
            _this3._emitHttpError(req, res, "tus: unexpected response while creating upload");

            return;
          }

          var location = res.getHeader("Location");

          if (location == null) {
            _this3._emitHttpError(req, res, "tus: invalid or missing Location header");

            return;
          }

          _this3.url = resolveUrl(_this3.options.endpoint, location);
          log("Created upload at ".concat(_this3.url));

          _this3._emitSuccess();
        })["catch"](function (err) {
          _this3._emitError(err);
        });
      }
      /**
       * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
       * uploaded in a sequential matter.
       *
       * @api private
       */

    }, {
      key: "_startSingleUpload",
      value: function _startSingleUpload() {
        // First, we look at the uploadLengthDeferred option.
        // Next, we check if the caller has supplied a manual upload size.
        // Finally, we try to use the calculated size from the source object.
        if (this.options.uploadLengthDeferred) {
          this._size = null;
        } else if (this.options.uploadSize != null) {
          this._size = +this.options.uploadSize;

          if (isNaN(this._size)) {
            this._emitError(new Error("tus: cannot convert `uploadSize` option into a number"));

            return;
          }
        } else {
          this._size = this._source.size;

          if (this._size == null) {
            this._emitError(new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option"));

            return;
          }
        } // Reset the aborted flag when the upload is started or else the
        // _performUpload will stop before sending a request if the upload has been
        // aborted previously.


        this._aborted = false; // The upload had been started previously and we should reuse this URL.

        if (this.url != null) {
          log("Resuming upload from previous URL: ".concat(this.url));

          this._resumeUpload();

          return;
        } // A URL has manually been specified, so we try to resume


        if (this.options.uploadUrl != null) {
          log("Resuming upload from provided URL: ".concat(this.options.url));
          this.url = this.options.uploadUrl;

          this._resumeUpload();

          return;
        } // An upload has not started for the file yet, so we start a new one

        this._createUpload();
      }
      /**
       * Abort any running request and stop the current upload. After abort is called, no event
       * handler will be invoked anymore. You can use the `start` method to resume the upload
       * again.
       * If `shouldTerminate` is true, the `terminate` function will be called to remove the
       * current upload from the server.
       *
       * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
       * @return {Promise} The Promise will be resolved/rejected when the requests finish.
       */

    }, {
      key: "abort",
      value: function abort(shouldTerminate, cb) {
        var _this4 = this;

        if (typeof cb === "function") {
          throw new Error("tus: the abort function does not accept a callback since v2 anymore; please use the returned Promise instead");
        } // Stop any parallel partial uploads, that have been started in _startParallelUploads.


        if (this._parallelUploads != null) {
          this._parallelUploads.forEach(function (upload) {
            upload.abort(shouldTerminate);
          });
        } // Stop any current running request.


        if (this._req !== null) {
          this._req.abort();

          this._source.close();
        }

        this._aborted = true; // Stop any timeout used for initiating a retry.

        if (this._retryTimeout != null) {
          clearTimeout(this._retryTimeout);
          this._retryTimeout = null;
        }

        if (!shouldTerminate || this.url == null) {
          return Promise.resolve();
        }

        return BaseUpload.terminate(this.url, this.options) // Remove entry from the URL storage since the upload URL is no longer valid.
        .then(function () {
          return _this4._removeFromUrlStorage();
        });
      }
    }, {
      key: "_emitHttpError",
      value: function _emitHttpError(req, res, message, causingErr) {
        this._emitError(new DetailedError(message, causingErr, req, res));
      }
    }, {
      key: "_emitError",
      value: function _emitError(err) {
        var _this5 = this; // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.


        if (this._aborted) return; // Check if we should retry, when enabled, before sending the error to the user.

        if (this.options.retryDelays != null) {
          // We will reset the attempt counter if
          // - we were already able to connect to the server (offset != null) and
          // - we were able to upload a small chunk of data to the server
          var shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;

          if (shouldResetDelays) {
            this._retryAttempt = 0;
          }

          if (shouldRetry(err, this._retryAttempt, this.options)) {
            var delay = this.options.retryDelays[this._retryAttempt++];
            this._offsetBeforeRetry = this._offset;
            this._retryTimeout = setTimeout(function () {
              _this5.start();
            }, delay);
            return;
          }
        }

        if (typeof this.options.onError === "function") {
          this.options.onError(err);
        } else {
          throw err;
        }
      }
      /**
       * Publishes notification if the upload has been successfully completed.
       *
       * @api private
       */

    }, {
      key: "_emitSuccess",
      value: function _emitSuccess() {
        if (this.options.removeFingerprintOnSuccess) {
          // Remove stored fingerprint and corresponding endpoint. This causes
          // new uploads of the same file to be treated as a different file.
          this._removeFromUrlStorage();
        }

        if (typeof this.options.onSuccess === "function") {
          this.options.onSuccess();
        }
      }
      /**
       * Publishes notification when data has been sent to the server. This
       * data may not have been accepted by the server yet.
       *
       * @param {number} bytesSent  Number of bytes sent to the server.
       * @param {number} bytesTotal Total number of bytes to be sent to the server.
       * @api private
       */

    }, {
      key: "_emitProgress",
      value: function _emitProgress(bytesSent, bytesTotal) {
        if (typeof this.options.onProgress === "function") {
          this.options.onProgress(bytesSent, bytesTotal);
        }
      }
      /**
       * Publishes notification when a chunk of data has been sent to the server
       * and accepted by the server.
       * @param {number} chunkSize  Size of the chunk that was accepted by the server.
       * @param {number} bytesAccepted Total number of bytes that have been
       *                                accepted by the server.
       * @param {number} bytesTotal Total number of bytes to be sent to the server.
       * @api private
       */

    }, {
      key: "_emitChunkComplete",
      value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
        if (typeof this.options.onChunkComplete === "function") {
          this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
        }
      }
      /**
       * Create a new upload using the creation extension by sending a POST
       * request to the endpoint. After successful creation the file will be
       * uploaded
       *
       * @api private
       */

    }, {
      key: "_createUpload",
      value: function _createUpload() {
        var _this6 = this;

        if (!this.options.endpoint) {
          this._emitError(new Error("tus: unable to create upload because no endpoint is provided"));

          return;
        }

        var req = this._openRequest("POST", this.options.endpoint);

        if (this.options.uploadLengthDeferred) {
          req.setHeader("Upload-Defer-Length", 1);
        } else {
          req.setHeader("Upload-Length", this._size);
        } // Add metadata if values have been added


        var metadata = encodeMetadata(this.options.metadata);

        if (metadata !== "") {
          req.setHeader("Upload-Metadata", metadata);
        }

        var promise;

        if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
          this._offset = 0;
          promise = this._addChunkToRequest(req);
        } else {
          promise = this._sendRequest(req, null);
        }

        promise.then(function (res) {
          if (!inStatusCategory(res.getStatus(), 200)) {
            _this6._emitHttpError(req, res, "tus: unexpected response while creating upload");

            return;
          }

          var location = res.getHeader("Location");

          if (location == null) {
            _this6._emitHttpError(req, res, "tus: invalid or missing Location header");

            return;
          }

          _this6.url = resolveUrl(_this6.options.endpoint, location);
          log("Created upload at ".concat(_this6.url));

          if (typeof _this6.options._onUploadUrlAvailable === "function") {
            _this6.options._onUploadUrlAvailable();
          }

          if (_this6._size === 0) {
            // Nothing to upload and file was successfully created
            _this6._emitSuccess();

            _this6._source.close();

            return;
          }

          _this6._saveUploadInUrlStorage();

          if (_this6.options.uploadDataDuringCreation) {
            _this6._handleUploadResponse(req, res);
          } else {
            _this6._offset = 0;

            _this6._performUpload();
          }
        })["catch"](function (err) {
          _this6._emitHttpError(req, null, "tus: failed to create upload", err);
        });
      }
      /*
       * Try to resume an existing upload. First a HEAD request will be sent
       * to retrieve the offset. If the request fails a new upload will be
       * created. In the case of a successful response the file will be uploaded.
       *
       * @api private
       */

    }, {
      key: "_resumeUpload",
      value: function _resumeUpload() {
        var _this7 = this;

        var req = this._openRequest("HEAD", this.url);

        var promise = this._sendRequest(req, null);

        promise.then(function (res) {
          var status = res.getStatus();

          if (!inStatusCategory(status, 200)) {
            if (inStatusCategory(status, 400)) {
              // Remove stored fingerprint and corresponding endpoint,
              // on client errors since the file can not be found
              _this7._removeFromUrlStorage();
            } // If the upload is locked (indicated by the 423 Locked status code), we
            // emit an error instead of directly starting a new upload. This way the
            // retry logic can catch the error and will retry the upload. An upload
            // is usually locked for a short period of time and will be available
            // afterwards.


            if (status === 423) {
              _this7._emitHttpError(req, res, "tus: upload is currently locked; retry later");

              return;
            }

            if (!_this7.options.endpoint) {
              // Don't attempt to create a new upload if no endpoint is provided.
              _this7._emitHttpError(req, res, "tus: unable to resume upload (new upload cannot be created without an endpoint)");

              return;
            } // Try to create a new upload


            _this7.url = null;

            _this7._createUpload();

            return;
          }

          var offset = parseInt(res.getHeader("Upload-Offset"), 10);

          if (isNaN(offset)) {
            _this7._emitHttpError(req, res, "tus: invalid or missing offset value");

            return;
          }

          var length = parseInt(res.getHeader("Upload-Length"), 10);

          if (isNaN(length) && !_this7.options.uploadLengthDeferred) {
            _this7._emitHttpError(req, res, "tus: invalid or missing length value");

            return;
          }

          if (typeof _this7.options._onUploadUrlAvailable === "function") {
            _this7.options._onUploadUrlAvailable();
          } // Upload has already been completed and we do not need to send additional
          // data to the server


          if (offset === length) {
            _this7._emitProgress(length, length);

            _this7._emitSuccess();

            return;
          }

          _this7._offset = offset;

          _this7._performUpload();
        })["catch"](function (err) {
          _this7._emitHttpError(req, null, "tus: failed to resume upload", err);
        });
      }
      /**
       * Start uploading the file using PATCH requests. The file will be divided
       * into chunks as specified in the chunkSize option. During the upload
       * the onProgress event handler may be invoked multiple times.
       *
       * @api private
       */

    }, {
      key: "_performUpload",
      value: function _performUpload() {
        var _this8 = this; // If the upload has been aborted, we will not send the next PATCH request.
        // This is important if the abort method was called during a callback, such
        // as onChunkComplete or onProgress.


        if (this._aborted) {
          return;
        }

        var req; // Some browser and servers may not support the PATCH method. For those
        // cases, you can tell tus-js-client to use a POST request with the
        // X-HTTP-Method-Override header for simulating a PATCH request.

        if (this.options.overridePatchMethod) {
          req = this._openRequest("POST", this.url);
          req.setHeader("X-HTTP-Method-Override", "PATCH");
        } else {
          req = this._openRequest("PATCH", this.url);
        }

        req.setHeader("Upload-Offset", this._offset);

        var promise = this._addChunkToRequest(req);

        promise.then(function (res) {
          if (!inStatusCategory(res.getStatus(), 200)) {
            _this8._emitHttpError(req, res, "tus: unexpected response while uploading chunk");

            return;
          }

          _this8._handleUploadResponse(req, res);
        })["catch"](function (err) {
          // Don't emit an error if the upload was aborted manually
          if (_this8._aborted) {
            return;
          }

          _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset " + _this8._offset, err);
        });
      }
      /**
       * _addChunktoRequest reads a chunk from the source and sends it using the
       * supplied request object. It will not handle the response.
       *
       * @api private
       */

    }, {
      key: "_addChunkToRequest",
      value: function _addChunkToRequest(req) {
        var _this9 = this;

        var start = this._offset;
        var end = this._offset + this.options.chunkSize;
        req.setProgressHandler(function (bytesSent) {
          _this9._emitProgress(start + bytesSent, _this9._size);
        });
        req.setHeader("Content-Type", "application/offset+octet-stream"); // The specified chunkSize may be Infinity or the calcluated end position
        // may exceed the file's size. In both cases, we limit the end position to
        // the input's total size for simpler calculations and correctness.

        if ((end === Infinity || end > this._size) && !this.options.uploadLengthDeferred) {
          end = this._size;
        }

        return this._source.slice(start, end).then(function (_ref2) {
          var value = _ref2.value,
              done = _ref2.done; // If the upload length is deferred, the upload size was not specified during
          // upload creation. So, if the file reader is done reading, we know the total
          // upload size and can tell the tus server.

          if (_this9.options.uploadLengthDeferred && done) {
            _this9._size = _this9._offset + (value && value.size ? value.size : 0);
            req.setHeader("Upload-Length", _this9._size);
          }

          if (value === null) {
            return _this9._sendRequest(req);
          } else {
            _this9._emitProgress(_this9._offset, _this9._size);

            return _this9._sendRequest(req, value);
          }
        });
      }
      /**
       * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
       * and already have received a response.
       *
       * @api private
       */

    }, {
      key: "_handleUploadResponse",
      value: function _handleUploadResponse(req, res) {
        var offset = parseInt(res.getHeader("Upload-Offset"), 10);

        if (isNaN(offset)) {
          this._emitHttpError(req, res, "tus: invalid or missing offset value");

          return;
        }

        this._emitProgress(offset, this._size);

        this._emitChunkComplete(offset - this._offset, offset, this._size);

        this._offset = offset;

        if (offset == this._size) {
          // Yay, finally done :)
          this._emitSuccess();

          this._source.close();

          return;
        }

        this._performUpload();
      }
      /**
       * Create a new HTTP request object with the given method and URL.
       *
       * @api private
       */

    }, {
      key: "_openRequest",
      value: function _openRequest(method, url) {
        var req = openRequest(method, url, this.options);
        this._req = req;
        return req;
      }
      /**
       * Remove the entry in the URL storage, if it has been saved before.
       *
       * @api private
       */

    }, {
      key: "_removeFromUrlStorage",
      value: function _removeFromUrlStorage() {
        var _this10 = this;

        if (!this._urlStorageKey) return;

        this._urlStorage.removeUpload(this._urlStorageKey)["catch"](function (err) {
          _this10._emitError(err);
        });

        this._urlStorageKey = null;
      }
      /**
       * Add the upload URL to the URL storage, if possible.
       *
       * @api private
       */

    }, {
      key: "_saveUploadInUrlStorage",
      value: function _saveUploadInUrlStorage() {
        var _this11 = this; // Only if a fingerprint was calculated for the input (i.e. not a stream), we can store the upload URL.


        if (!this.options.storeFingerprintForResuming || !this._fingerprint) {
          return;
        }

        var storedUpload = {
          size: this._size,
          metadata: this.options.metadata,
          creationTime: new Date().toString()
        };

        if (this._parallelUploads) {
          // Save multiple URLs if the parallelUploads option is used ...
          storedUpload.parallelUploadUrls = this._parallelUploadUrls;
        } else {
          // ... otherwise we just save the one available URL.
          storedUpload.uploadUrl = this.url;
        }

        this._urlStorage.addUpload(this._fingerprint, storedUpload).then(function (urlStorageKey) {
          return _this11._urlStorageKey = urlStorageKey;
        })["catch"](function (err) {
          _this11._emitError(err);
        });
      }
      /**
       * Send a request with the provided body.
       *
       * @api private
       */

    }, {
      key: "_sendRequest",
      value: function _sendRequest(req) {
        var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        return sendRequest(req, body, this.options);
      }
    }], [{
      key: "terminate",
      value: function terminate(url) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var cb = arguments.length > 2 ? arguments[2] : undefined;

        if (typeof options === "function" || typeof cb === "function") {
          throw new Error("tus: the terminate function does not accept a callback since v2 anymore; please use the returned Promise instead");
        }

        var req = openRequest("DELETE", url, options);
        return sendRequest(req, null, options).then(function (res) {
          // A 204 response indicates a successfull request
          if (res.getStatus() === 204) {
            return;
          }

          throw new DetailedError("tus: unexpected response while terminating upload", null, req, res);
        })["catch"](function (err) {
          if (!(err instanceof DetailedError)) {
            err = new DetailedError("tus: failed to terminate upload", err, req, null);
          }

          if (!shouldRetry(err, 0, options)) {
            throw err;
          } // Instead of keeping track of the retry attempts, we remove the first element from the delays
          // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
          // We recursively call the terminate function will removing elements from the retryDelays array.


          var delay = options.retryDelays[0];
          var remainingDelays = options.retryDelays.slice(1);

          var newOptions = _objectSpread$2({}, options, {
            retryDelays: remainingDelays
          });

          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          }).then(function () {
            return BaseUpload.terminate(url, newOptions);
          });
        });
      }
    }]);

    return BaseUpload;
  }();

  function encodeMetadata(metadata) {
    var encoded = [];

    for (var key in metadata) {
      encoded.push(key + " " + base64.Base64.encode(metadata[key]));
    }

    return encoded.join(",");
  }
  /**
   * Checks whether a given status is in the range of the expected category.
   * For example, only a status between 200 and 299 will satisfy the category 200.
   *
   * @api private
   */


  function inStatusCategory(status, category) {
    return status >= category && status < category + 100;
  }
  /**
   * Create a new HTTP request with the specified method and URL.
   * The necessary headers that are included in every request
   * will be added, including the request ID.
   *
   * @api private
   */


  function openRequest(method, url, options) {
    var req = options.httpStack.createRequest(method, url);
    req.setHeader("Tus-Resumable", "1.0.0");
    var headers = options.headers || {};

    for (var name in headers) {
      req.setHeader(name, headers[name]);
    }

    if (options.addRequestId) {
      var requestId = uuid();
      req.setHeader("X-Request-ID", requestId);
    }

    return req;
  }
  /**
   * Send a request with the provided body while invoking the onBeforeRequest
   * and onAfterResponse callbacks.
   *
   * @api private
   */


  function sendRequest(req, body, options) {
    var onBeforeRequestPromise = typeof options.onBeforeRequest === "function" ? Promise.resolve(options.onBeforeRequest(req)) : Promise.resolve();
    return onBeforeRequestPromise.then(function () {
      return req.send(body).then(function (res) {
        var onAfterResponsePromise = typeof options.onAfterResponse === "function" ? Promise.resolve(options.onAfterResponse(req, res)) : Promise.resolve();
        return onAfterResponsePromise.then(function () {
          return res;
        });
      });
    });
  }
  /**
   * Checks whether the browser running this code has internet access.
   * This function will always return true in the node.js environment
   *
   * @api private
   */


  function isOnline() {
    var online = true;

    if (typeof window !== "undefined" && "navigator" in window && window.navigator.onLine === false) {
      online = false;
    }

    return online;
  }
  /**
   * Checks whether or not it is ok to retry a request.
   * @param {Error} err the error returned from the last request
   * @param {number} retryAttempt the number of times the request has already been retried
   * @param {object} options tus Upload options
   *
   * @api private
   */


  function shouldRetry(err, retryAttempt, options) {
    // We only attempt a retry if
    // - retryDelays option is set
    // - we didn't exceed the maxium number of retries, yet, and
    // - this error was caused by a request or it's response and
    // - the error is server error (i.e. not a status 4xx except a 409 or 423) or
    // a onShouldRetry is specified and returns true
    // - the browser does not indicate that we are offline
    if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
      return false;
    }

    if (options && typeof options.onShouldRetry === "function") {
      return options.onShouldRetry(err, retryAttempt, options);
    }

    var status = err.originalResponse ? err.originalResponse.getStatus() : 0;
    return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
  }
  /**
   * Resolve a relative link given the origin as source. For example,
   * if a HTTP request to http://example.com/files/ returns a Location
   * header with the value /upload/abc, the resolved URL will be:
   * http://example.com/upload/abc
   */


  function resolveUrl(origin, link) {
    return new urlParse(link, origin).toString();
  }
  /**
   * Calculate the start and end positions for the parts if an upload
   * is split into multiple parallel requests.
   *
   * @param {number} totalSize The byte size of the upload, which will be split.
   * @param {number} partCount The number in how many parts the upload will be split.
   * @param {string[]} previousUrls The upload URLs for previous parts.
   * @return {object[]}
   * @api private
   */


  function splitSizeIntoParts(totalSize, partCount, previousUrls) {
    var partSize = Math.floor(totalSize / partCount);
    var parts = [];

    for (var i = 0; i < partCount; i++) {
      parts.push({
        start: partSize * i,
        end: partSize * (i + 1)
      });
    }

    parts[partCount - 1].end = totalSize; // Attach URLs from previous uploads, if available.

    if (previousUrls) {
      parts.forEach(function (part, index) {
        part.uploadUrl = previousUrls[index] || null;
      });
    }

    return parts;
  }

  BaseUpload.defaultOptions = defaultOptions$1;

  function _classCallCheck$4(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$4(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$4(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$4(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$4(Constructor, staticProps);
    return Constructor;
  }
  /* eslint no-unused-vars: "off" */


  var NoopUrlStorage = /*#__PURE__*/function () {
    function NoopUrlStorage() {
      _classCallCheck$4(this, NoopUrlStorage);
    }

    _createClass$4(NoopUrlStorage, [{
      key: "listAllUploads",
      value: function listAllUploads() {
        return Promise.resolve([]);
      }
    }, {
      key: "findUploadsByFingerprint",
      value: function findUploadsByFingerprint(fingerprint) {
        return Promise.resolve([]);
      }
    }, {
      key: "removeUpload",
      value: function removeUpload(urlStorageKey) {
        return Promise.resolve();
      }
    }, {
      key: "addUpload",
      value: function addUpload(fingerprint, upload) {
        return Promise.resolve(null);
      }
    }]);

    return NoopUrlStorage;
  }();

  function _classCallCheck$3(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$3(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$3(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$3(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$3(Constructor, staticProps);
    return Constructor;
  }
  /* global window, localStorage */


  var hasStorage = false;

  try {
    hasStorage = "localStorage" in window; // Attempt to store and read entries from the local storage to detect Private
    // Mode on Safari on iOS (see #49)

    var key = "tusSupport";
    localStorage.setItem(key, localStorage.getItem(key));
  } catch (e) {
    // If we try to access localStorage inside a sandboxed iframe, a SecurityError
    // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
    // thrown (see #49)
    if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
      hasStorage = false;
    } else {
      throw e;
    }
  }

  var canStoreURLs = hasStorage;
  var WebStorageUrlStorage = /*#__PURE__*/function () {
    function WebStorageUrlStorage() {
      _classCallCheck$3(this, WebStorageUrlStorage);
    }

    _createClass$3(WebStorageUrlStorage, [{
      key: "findAllUploads",
      value: function findAllUploads() {
        var results = this._findEntries("tus::");

        return Promise.resolve(results);
      }
    }, {
      key: "findUploadsByFingerprint",
      value: function findUploadsByFingerprint(fingerprint) {
        var results = this._findEntries("tus::".concat(fingerprint, "::"));

        return Promise.resolve(results);
      }
    }, {
      key: "removeUpload",
      value: function removeUpload(urlStorageKey) {
        localStorage.removeItem(urlStorageKey);
        return Promise.resolve();
      }
    }, {
      key: "addUpload",
      value: function addUpload(fingerprint, upload) {
        var id = Math.round(Math.random() * 1e12);
        var key = "tus::".concat(fingerprint, "::").concat(id);
        localStorage.setItem(key, JSON.stringify(upload));
        return Promise.resolve(key);
      }
    }, {
      key: "_findEntries",
      value: function _findEntries(prefix) {
        var results = [];

        for (var i = 0; i < localStorage.length; i++) {
          var _key = localStorage.key(i);

          if (_key.indexOf(prefix) !== 0) continue;

          try {
            var upload = JSON.parse(localStorage.getItem(_key));
            upload.urlStorageKey = _key;
            results.push(upload);
          } catch (e) {// The JSON parse error is intentionally ignored here, so a malformed
            // entry in the storage cannot prevent an upload.
          }
        }

        return results;
      }
    }]);

    return WebStorageUrlStorage;
  }();

  function _classCallCheck$2(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$2(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$2(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$2(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$2(Constructor, staticProps);
    return Constructor;
  }
  /* global window */


  var XHRHttpStack = /*#__PURE__*/function () {
    function XHRHttpStack() {
      _classCallCheck$2(this, XHRHttpStack);
    }

    _createClass$2(XHRHttpStack, [{
      key: "createRequest",
      value: function createRequest(method, url) {
        return new Request(method, url);
      }
    }, {
      key: "getName",
      value: function getName() {
        return "XHRHttpStack";
      }
    }]);

    return XHRHttpStack;
  }();

  var Request = /*#__PURE__*/function () {
    function Request(method, url) {
      _classCallCheck$2(this, Request);

      this._xhr = new XMLHttpRequest();

      this._xhr.open(method, url, true);

      this._method = method;
      this._url = url;
      this._headers = {};
    }

    _createClass$2(Request, [{
      key: "getMethod",
      value: function getMethod() {
        return this._method;
      }
    }, {
      key: "getURL",
      value: function getURL() {
        return this._url;
      }
    }, {
      key: "setHeader",
      value: function setHeader(header, value) {
        this._xhr.setRequestHeader(header, value);

        this._headers[header] = value;
      }
    }, {
      key: "getHeader",
      value: function getHeader(header) {
        return this._headers[header];
      }
    }, {
      key: "setProgressHandler",
      value: function setProgressHandler(progressHandler) {
        // Test support for progress events before attaching an event listener
        if (!("upload" in this._xhr)) {
          return;
        }

        this._xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) {
            return;
          }

          progressHandler(e.loaded);
        };
      }
    }, {
      key: "send",
      value: function send() {
        var _this = this;

        var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        return new Promise(function (resolve, reject) {
          _this._xhr.onload = function () {
            resolve(new Response(_this._xhr));
          };

          _this._xhr.onerror = function (err) {
            reject(err);
          };

          _this._xhr.send(body);
        });
      }
    }, {
      key: "abort",
      value: function abort() {
        this._xhr.abort();

        return Promise.resolve();
      }
    }, {
      key: "getUnderlyingObject",
      value: function getUnderlyingObject() {
        return this._xhr;
      }
    }]);

    return Request;
  }();

  var Response = /*#__PURE__*/function () {
    function Response(xhr) {
      _classCallCheck$2(this, Response);

      this._xhr = xhr;
    }

    _createClass$2(Response, [{
      key: "getStatus",
      value: function getStatus() {
        return this._xhr.status;
      }
    }, {
      key: "getHeader",
      value: function getHeader(header) {
        return this._xhr.getResponseHeader(header);
      }
    }, {
      key: "getBody",
      value: function getBody() {
        return this._xhr.responseText;
      }
    }, {
      key: "getUnderlyingObject",
      value: function getUnderlyingObject() {
        return this._xhr;
      }
    }]);

    return Response;
  }();

  var isReactNative = function isReactNative() {
    return typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
  };

  /**
   * uriToBlob resolves a URI to a Blob object. This is used for
   * React Native to retrieve a file (identified by a file://
   * URI) as a blob.
   */
  function uriToBlob(uri) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.responseType = "blob";

      xhr.onload = function () {
        var blob = xhr.response;
        resolve(blob);
      };

      xhr.onerror = function (err) {
        reject(err);
      };

      xhr.open("GET", uri);
      xhr.send();
    });
  }

  var isCordova = function isCordova() {
    return typeof window != "undefined" && (typeof window.PhoneGap != "undefined" || typeof window.Cordova != "undefined" || typeof window.cordova != "undefined");
  };

  /**
   * readAsByteArray converts a File object to a Uint8Array.
   * This function is only used on the Apache Cordova platform.
   * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
   */
  function readAsByteArray(chunk) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();

      reader.onload = function () {
        var value = new Uint8Array(reader.result);
        resolve({
          value: value
        });
      };

      reader.onerror = function (err) {
        reject(err);
      };

      reader.readAsArrayBuffer(chunk);
    });
  }

  function _classCallCheck$1(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties$1(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass$1(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties$1(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties$1(Constructor, staticProps);
    return Constructor;
  }

  var FileSource = /*#__PURE__*/function () {
    // Make this.size a method
    function FileSource(file) {
      _classCallCheck$1(this, FileSource);

      this._file = file;
      this.size = file.size;
    }

    _createClass$1(FileSource, [{
      key: "slice",
      value: function slice(start, end) {
        // In Apache Cordova applications, a File must be resolved using
        // FileReader instances, see
        // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
        if (isCordova()) {
          return readAsByteArray(this._file.slice(start, end));
        }

        var value = this._file.slice(start, end);

        return Promise.resolve({
          value: value
        });
      }
    }, {
      key: "close",
      value: function close() {// Nothing to do here since we don't need to release any resources.
      }
    }]);

    return FileSource;
  }();

  var StreamSource = /*#__PURE__*/function () {
    function StreamSource(reader, chunkSize) {
      _classCallCheck$1(this, StreamSource);

      this._chunkSize = chunkSize;
      this._buffer = undefined;
      this._bufferOffset = 0;
      this._reader = reader;
      this._done = false;
    }

    _createClass$1(StreamSource, [{
      key: "slice",
      value: function slice(start, end) {
        if (start < this._bufferOffset) {
          return Promise.reject(new Error("Requested data is before the reader's current offset"));
        }

        return this._readUntilEnoughDataOrDone(start, end);
      }
    }, {
      key: "_readUntilEnoughDataOrDone",
      value: function _readUntilEnoughDataOrDone(start, end) {
        var _this = this;

        var hasEnoughData = end <= this._bufferOffset + len(this._buffer);

        if (this._done || hasEnoughData) {
          var value = this._getDataFromBuffer(start, end);

          var done = value == null ? this._done : false;
          return Promise.resolve({
            value: value,
            done: done
          });
        }

        return this._reader.read().then(function (_ref) {
          var value = _ref.value,
              done = _ref.done;

          if (done) {
            _this._done = true;
          } else if (_this._buffer === undefined) {
            _this._buffer = value;
          } else {
            _this._buffer = concat(_this._buffer, value);
          }

          return _this._readUntilEnoughDataOrDone(start, end);
        });
      }
    }, {
      key: "_getDataFromBuffer",
      value: function _getDataFromBuffer(start, end) {
        // Remove data from buffer before `start`.
        // Data might be reread from the buffer if an upload fails, so we can only
        // safely delete data when it comes *before* what is currently being read.
        if (start > this._bufferOffset) {
          this._buffer = this._buffer.slice(start - this._bufferOffset);
          this._bufferOffset = start;
        } // If the buffer is empty after removing old data, all data has been read.


        var hasAllDataBeenRead = len(this._buffer) === 0;

        if (this._done && hasAllDataBeenRead) {
          return null;
        } // We already removed data before `start`, so we just return the first
        // chunk from the buffer.


        return this._buffer.slice(0, end - start);
      }
    }, {
      key: "close",
      value: function close() {
        if (this._reader.cancel) {
          this._reader.cancel();
        }
      }
    }]);

    return StreamSource;
  }();

  function len(blobOrArray) {
    if (blobOrArray === undefined) return 0;
    if (blobOrArray.size !== undefined) return blobOrArray.size;
    return blobOrArray.length;
  }
  /*
    Typed arrays and blobs don't have a concat method.
    This function helps StreamSource accumulate data to reach chunkSize.
  */


  function concat(a, b) {
    if (a.concat) {
      // Is `a` an Array?
      return a.concat(b);
    }

    if (a instanceof Blob) {
      return new Blob([a, b], {
        type: a.type
      });
    }

    if (a.set) {
      // Is `a` a typed array?
      var c = new a.constructor(a.length + b.length);
      c.set(a);
      c.set(b, a.length);
      return c;
    }

    throw new Error("Unknown data type");
  }

  var FileReader$1 = /*#__PURE__*/function () {
    function FileReader() {
      _classCallCheck$1(this, FileReader);
    }

    _createClass$1(FileReader, [{
      key: "openFile",
      value: function openFile(input, chunkSize) {
        // In React Native, when user selects a file, instead of a File or Blob,
        // you usually get a file object {} with a uri property that contains
        // a local path to the file. We use XMLHttpRequest to fetch
        // the file blob, before uploading with tus.
        if (isReactNative() && input && typeof input.uri !== "undefined") {
          return uriToBlob(input.uri).then(function (blob) {
            return new FileSource(blob);
          })["catch"](function (err) {
            throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. " + err);
          });
        } // Since we emulate the Blob type in our tests (not all target browsers
        // support it), we cannot use `instanceof` for testing whether the input value
        // can be handled. Instead, we simply check is the slice() function and the
        // size property are available.


        if (typeof input.slice === "function" && typeof input.size !== "undefined") {
          return Promise.resolve(new FileSource(input));
        }

        if (typeof input.read === "function") {
          chunkSize = +chunkSize;

          if (!isFinite(chunkSize)) {
            return Promise.reject(new Error("cannot create source for stream without a finite value for the `chunkSize` option"));
          }

          return Promise.resolve(new StreamSource(input, chunkSize));
        }

        return Promise.reject(new Error("source object may only be an instance of File, Blob, or Reader in this environment"));
      }
    }]);

    return FileReader;
  }();

  /**
   * Generate a fingerprint for a file which will be used the store the endpoint
   *
   * @param {File} file
   * @param {Object} options
   * @param {Function} callback
   */

  function fingerprint(file, options) {
    if (isReactNative()) {
      return Promise.resolve(reactNativeFingerprint(file, options));
    }

    return Promise.resolve(["tus-br", file.name, file.type, file.size, file.lastModified, options.endpoint].join("-"));
  }

  function reactNativeFingerprint(file, options) {
    var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : "noexif";
    return ["tus-rn", file.name || "noname", file.size || "nosize", exifHash, options.endpoint].join("/");
  }

  function hashCode(str) {
    // from https://stackoverflow.com/a/8831937/151666
    var hash = 0;

    if (str.length === 0) {
      return hash;
    }

    for (var i = 0; i < str.length; i++) {
      var _char = str.charCodeAt(i);

      hash = (hash << 5) - hash + _char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _createSuper$1(Derived) {
    return function () {
      var Super = _getPrototypeOf(Derived),
          result;

      if (_isNativeReflectConstruct$1()) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _isNativeReflectConstruct$1() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function ownKeys$1(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread$1(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys$1(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys$1(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defaultOptions = _objectSpread$1({}, BaseUpload.defaultOptions, {
    httpStack: new XHRHttpStack(),
    fileReader: new FileReader$1(),
    urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
    fingerprint: fingerprint
  });

  var Upload = /*#__PURE__*/function (_BaseUpload) {
    _inherits(Upload, _BaseUpload);

    var _super = _createSuper$1(Upload);

    function Upload() {
      var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Upload);

      options = _objectSpread$1({}, defaultOptions, {}, options);
      return _super.call(this, file, options);
    }

    _createClass(Upload, null, [{
      key: "terminate",
      value: function terminate(url, options, cb) {
        options = _objectSpread$1({}, defaultOptions, {}, options);
        return BaseUpload.terminate(url, options, cb);
      }
    }]);

    return Upload;
  }(BaseUpload);

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf$2(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf$2(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn$2(this, result); }; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  var TusUpload = /*#__PURE__*/function (_BaseUpload) {
    _inherits$2(TusUpload, _BaseUpload);

    var _super = _createSuper(TusUpload);

    function TusUpload(_ref) {
      var _this;

      var chunkSize = _ref.chunkSize,
          csrfToken = _ref.csrfToken,
          fieldName = _ref.fieldName,
          file = _ref.file,
          formId = _ref.formId,
          retryDelays = _ref.retryDelays,
          uploadIndex = _ref.uploadIndex,
          uploadUrl = _ref.uploadUrl;

      _classCallCheck$7(this, TusUpload);

      _this = _super.call(this, {
        name: file.name,
        status: "uploading",
        type: "tus",
        uploadIndex: uploadIndex
      });

      _defineProperty$2(_assertThisInitialized$2(_this), "onError", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "onProgress", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "onSuccess", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "upload", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "csrfToken", void 0);

      _defineProperty$2(_assertThisInitialized$2(_this), "handleError", function (error) {
        if (_this.onError) {
          _this.onError(error);
        } else {
          throw error;
        }
      });

      _defineProperty$2(_assertThisInitialized$2(_this), "handleProgress", function (bytesUploaded, bytesTotal) {
        if (_this.onProgress) {
          _this.onProgress(bytesUploaded, bytesTotal);
        }
      });

      _defineProperty$2(_assertThisInitialized$2(_this), "handleSucces", function () {
        if (_this.onSuccess) {
          _this.onSuccess();
        }
      });

      _defineProperty$2(_assertThisInitialized$2(_this), "addCsrTokenToRequest", function (request) {
        request.setHeader("X-CSRFToken", _this.csrfToken);
      });

      _this.csrfToken = csrfToken;
      _this.upload = new Upload(file, {
        chunkSize: chunkSize,
        endpoint: uploadUrl,
        metadata: {
          fieldName: fieldName,
          filename: file.name,
          formId: formId
        },
        onBeforeRequest: _this.addCsrTokenToRequest,
        onError: _this.handleError,
        onProgress: _this.handleProgress,
        onSuccess: _this.handleSucces,
        retryDelays: retryDelays || [0, 1000, 3000, 5000]
      });
      _this.onError = undefined;
      _this.onProgress = undefined;
      _this.onSuccess = undefined;
      return _this;
    }

    _createClass$6(TusUpload, [{
      key: "abort",
      value: function () {
        var _abort = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee() {
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return this.upload.abort(true);

                case 2:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function abort() {
          return _abort.apply(this, arguments);
        }

        return abort;
      }()
    }, {
      key: "delete",
      value: function () {
        var _delete2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2() {
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (this.upload.url) {
                    _context2.next = 2;
                    break;
                  }

                  return _context2.abrupt("return", Promise.resolve());

                case 2:
                  _context2.next = 4;
                  return deleteUpload(this.upload.url, this.csrfToken);

                case 4:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function _delete() {
          return _delete2.apply(this, arguments);
        }

        return _delete;
      }()
    }, {
      key: "getSize",
      value: function getSize() {
        return this.upload.file.size;
      }
    }, {
      key: "start",
      value: function start() {
        this.upload.start();
      }
    }, {
      key: "getInitialFile",
      value: function getInitialFile() {
        return {
          id: this.name,
          name: this.name,
          size: this.getSize(),
          type: "tus",
          url: ""
        };
      }
    }]);

    return TusUpload;
  }(BaseUpload$1);

  var FileField = /*#__PURE__*/function () {
    function FileField(_ref) {
      var _this = this;

      var callbacks = _ref.callbacks,
          chunkSize = _ref.chunkSize,
          csrfToken = _ref.csrfToken,
          eventEmitter = _ref.eventEmitter,
          fieldName = _ref.fieldName,
          form = _ref.form,
          formId = _ref.formId,
          initial = _ref.initial,
          input = _ref.input,
          multiple = _ref.multiple,
          parent = _ref.parent,
          prefix = _ref.prefix,
          retryDelays = _ref.retryDelays,
          s3UploadDir = _ref.s3UploadDir,
          skipRequired = _ref.skipRequired,
          supportDropArea = _ref.supportDropArea,
          translations = _ref.translations,
          uploadUrl = _ref.uploadUrl;

      _classCallCheck$7(this, FileField);

      _defineProperty$2(this, "callbacks", void 0);

      _defineProperty$2(this, "chunkSize", void 0);

      _defineProperty$2(this, "csrfToken", void 0);

      _defineProperty$2(this, "eventEmitter", void 0);

      _defineProperty$2(this, "fieldName", void 0);

      _defineProperty$2(this, "form", void 0);

      _defineProperty$2(this, "formId", void 0);

      _defineProperty$2(this, "multiple", void 0);

      _defineProperty$2(this, "nextUploadIndex", void 0);

      _defineProperty$2(this, "prefix", void 0);

      _defineProperty$2(this, "renderer", void 0);

      _defineProperty$2(this, "retryDelays", void 0);

      _defineProperty$2(this, "s3UploadDir", void 0);

      _defineProperty$2(this, "supportDropArea", void 0);

      _defineProperty$2(this, "uploads", void 0);

      _defineProperty$2(this, "uploadUrl", void 0);

      _defineProperty$2(this, "uploadFiles", /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(files) {
          var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, file;

          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(files.length === 0)) {
                    _context.next = 2;
                    break;
                  }

                  return _context.abrupt("return");

                case 2:
                  if (!_this.multiple && _this.uploads.length !== 0) {
                    _this.renderer.deleteFile(0);

                    _this.uploads = [];
                  }

                  _iteratorNormalCompletion = true;
                  _didIteratorError = false;
                  _context.prev = 5;
                  _iterator = _asyncIterator(files);

                case 7:
                  _context.next = 9;
                  return _iterator.next();

                case 9:
                  _step = _context.sent;
                  _iteratorNormalCompletion = _step.done;
                  _context.next = 13;
                  return _step.value;

                case 13:
                  _value = _context.sent;

                  if (_iteratorNormalCompletion) {
                    _context.next = 21;
                    break;
                  }

                  file = _value;
                  _context.next = 18;
                  return _this.uploadFile(file);

                case 18:
                  _iteratorNormalCompletion = true;
                  _context.next = 7;
                  break;

                case 21:
                  _context.next = 27;
                  break;

                case 23:
                  _context.prev = 23;
                  _context.t0 = _context["catch"](5);
                  _didIteratorError = true;
                  _iteratorError = _context.t0;

                case 27:
                  _context.prev = 27;
                  _context.prev = 28;

                  if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
                    _context.next = 32;
                    break;
                  }

                  _context.next = 32;
                  return _iterator.return();

                case 32:
                  _context.prev = 32;

                  if (!_didIteratorError) {
                    _context.next = 35;
                    break;
                  }

                  throw _iteratorError;

                case 35:
                  return _context.finish(32);

                case 36:
                  return _context.finish(27);

                case 37:
                  _this.checkDropHint();

                case 38:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, null, [[5, 23, 27, 37], [28,, 32, 36]]);
        }));

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      }());

      _defineProperty$2(this, "onChange", function (e) {
        var files = e.target.files;

        if (files) {
          void _this.uploadFiles(_toConsumableArray(files));
        }
      });

      _defineProperty$2(this, "onClick", function (e) {
        var target = e.target;

        var getUpload = function getUpload() {
          var dataIndex = target.getAttribute("data-index");

          if (!dataIndex) {
            return undefined;
          }

          var uploadIndex = parseInt(dataIndex, 10);
          return _this.getUploadByIndex(uploadIndex);
        };

        if (target.classList.contains("dff-delete") && !target.classList.contains("dff-disabled")) {
          var _upload = getUpload();

          if (_upload) {
            void _this.removeExistingUpload(_upload);
          }

          e.preventDefault();
        } else if (target.classList.contains("dff-cancel")) {
          var _upload2 = getUpload();

          if (_upload2) {
            void _this.handleCancel(_upload2);
          }

          e.preventDefault();
        }
      });

      _defineProperty$2(this, "handleProgress", function (upload, bytesUploaded, bytesTotal) {
        var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);

        _this.renderer.updateProgress(upload.uploadIndex, percentage);

        var onProgress = _this.callbacks.onProgress;

        if (onProgress) {
          if (upload instanceof TusUpload) {
            onProgress(bytesUploaded, bytesTotal, upload);
          }
        }
      });

      _defineProperty$2(this, "handleError", function (upload, error) {
        _this.renderer.setError(upload.uploadIndex);

        upload.status = "error";
        var onError = _this.callbacks.onError;

        if (onError) {
          if (upload instanceof TusUpload) {
            onError(error, upload);
          }
        }
      });

      _defineProperty$2(this, "handleSuccess", function (upload) {
        var renderer = _this.renderer;

        _this.updatePlaceholderInput();

        renderer.clearInput();
        renderer.setSuccess(upload.uploadIndex, upload.getSize());
        upload.status = "done";
        var onSuccess = _this.callbacks.onSuccess;
        var element = document.getElementsByClassName("dff-file-id-".concat(upload.uploadIndex))[0];

        _this.emitEvent("uploadComplete", element, upload);

        if (onSuccess && upload.type === "tus") {
          onSuccess(upload);
        }
      });

      this.callbacks = callbacks;
      this.chunkSize = chunkSize;
      this.csrfToken = csrfToken;
      this.eventEmitter = eventEmitter;
      this.fieldName = fieldName;
      this.form = form;
      this.formId = formId;
      this.multiple = multiple;
      this.prefix = prefix;
      this.retryDelays = retryDelays;
      this.s3UploadDir = s3UploadDir;
      this.supportDropArea = supportDropArea;
      this.uploadUrl = uploadUrl;
      this.uploads = [];
      this.nextUploadIndex = 0;
      this.renderer = new RenderUploadFile({
        parent: parent,
        input: input,
        skipRequired: skipRequired,
        translations: translations
      });
      var filesContainer = this.renderer.container;

      if (supportDropArea) {
        this.initDropArea(filesContainer, input.accept);
      }

      if (initial) {
        this.addInitialFiles(initial);
      }

      this.checkDropHint();
      input.addEventListener("change", this.onChange);
      filesContainer.addEventListener("click", this.onClick);
    }

    _createClass$6(FileField, [{
      key: "addInitialFiles",
      value: function addInitialFiles(initialFiles) {
        var _this2 = this;

        if (initialFiles.length === 0) {
          return;
        }

        var multiple = this.multiple,
            renderer = this.renderer;

        var addInitialFile = function addInitialFile(initialFile) {
          var size = initialFile.size;
          var name = initialFile.type === "s3" && initialFile.original_name ? initialFile.original_name : initialFile.name;
          var element = renderer.addUploadedFile(name, _this2.nextUploadIndex, size);
          var upload = createUploadedFile({
            csrfToken: _this2.csrfToken,
            initialFile: initialFile,
            uploadIndex: _this2.nextUploadIndex,
            uploadUrl: _this2.uploadUrl
          });

          _this2.uploads.push(upload);

          _this2.emitEvent("addUpload", element, upload);
        };

        if (multiple) {
          initialFiles.forEach(function (file) {
            addInitialFile(file);
            _this2.nextUploadIndex += 1;
          });
        } else {
          addInitialFile(initialFiles[0]);
        }
      }
    }, {
      key: "uploadFile",
      value: function () {
        var _uploadFile = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(file) {
          var _this3 = this;

          var createUpload, fieldName, formId, renderer, uploadUrl, fileName, existingUpload, newUploadIndex, upload, element;
          return regenerator.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  createUpload = function createUpload() {
                    var csrfToken = _this3.csrfToken,
                        s3UploadDir = _this3.s3UploadDir;

                    if (s3UploadDir != null) {
                      return new S3Upload({
                        csrfToken: csrfToken,
                        endpoint: uploadUrl,
                        file: file,
                        s3UploadDir: s3UploadDir,
                        uploadIndex: newUploadIndex
                      });
                    } else {
                      return new TusUpload({
                        chunkSize: _this3.chunkSize,
                        csrfToken: _this3.csrfToken,
                        fieldName: fieldName,
                        file: file,
                        formId: formId,
                        retryDelays: _this3.retryDelays,
                        uploadIndex: newUploadIndex,
                        uploadUrl: uploadUrl
                      });
                    }
                  };

                  fieldName = this.fieldName, formId = this.formId, renderer = this.renderer, uploadUrl = this.uploadUrl;
                  fileName = file.name;
                  existingUpload = this.findUploadByName(fileName);
                  newUploadIndex = existingUpload ? existingUpload.uploadIndex : this.nextUploadIndex;

                  if (!existingUpload) {
                    this.nextUploadIndex += 1;
                  }

                  if (!existingUpload) {
                    _context2.next = 9;
                    break;
                  }

                  _context2.next = 9;
                  return this.removeExistingUpload(existingUpload);

                case 9:
                  upload = createUpload();

                  upload.onError = function (error) {
                    return _this3.handleError(upload, error);
                  };

                  upload.onProgress = function (bytesUploaded, bytesTotal) {
                    return _this3.handleProgress(upload, bytesUploaded, bytesTotal);
                  };

                  upload.onSuccess = function () {
                    return _this3.handleSuccess(upload);
                  };

                  upload.start();
                  this.uploads.push(upload);
                  element = renderer.addNewUpload(fileName, newUploadIndex);
                  this.emitEvent("addUpload", element, upload);

                case 17:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        function uploadFile(_x2) {
          return _uploadFile.apply(this, arguments);
        }

        return uploadFile;
      }()
    }, {
      key: "getUploadByIndex",
      value: function getUploadByIndex(uploadIndex) {
        return this.uploads.find(function (upload) {
          return upload.uploadIndex === uploadIndex;
        });
      }
    }, {
      key: "findUploadByName",
      value: function findUploadByName(fileName) {
        return this.uploads.find(function (upload) {
          return upload.name === fileName;
        });
      }
    }, {
      key: "removeExistingUpload",
      value: function () {
        var _removeExistingUpload = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee3(upload) {
          var element;
          return regenerator.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  element = this.renderer.findFileDiv(upload.uploadIndex);

                  if (element) {
                    this.emitEvent("removeUpload", element, upload);
                  }

                  if (!(upload.status === "uploading")) {
                    _context3.next = 8;
                    break;
                  }

                  this.renderer.disableCancel(upload.uploadIndex);
                  _context3.next = 6;
                  return upload.abort();

                case 6:
                  _context3.next = 19;
                  break;

                case 8:
                  if (!(upload.status === "done")) {
                    _context3.next = 19;
                    break;
                  }

                  this.renderer.disableDelete(upload.uploadIndex);
                  _context3.prev = 10;
                  _context3.next = 13;
                  return upload.delete();

                case 13:
                  _context3.next = 19;
                  break;

                case 15:
                  _context3.prev = 15;
                  _context3.t0 = _context3["catch"](10);
                  this.renderer.setDeleteFailed(upload.uploadIndex);
                  return _context3.abrupt("return");

                case 19:
                  this.removeUploadFromList(upload);
                  this.updatePlaceholderInput();

                case 21:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this, [[10, 15]]);
        }));

        function removeExistingUpload(_x3) {
          return _removeExistingUpload.apply(this, arguments);
        }

        return removeExistingUpload;
      }()
    }, {
      key: "removeUploadFromList",
      value: function removeUploadFromList(upload) {
        this.renderer.deleteFile(upload.uploadIndex);
        var index = this.uploads.indexOf(upload);

        if (index >= 0) {
          this.uploads.splice(index, 1);
        }

        this.checkDropHint();
        var onDelete = this.callbacks.onDelete;

        if (onDelete) {
          onDelete(upload);
        }
      }
    }, {
      key: "handleCancel",
      value: function () {
        var _handleCancel = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee4(upload) {
          return regenerator.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  this.renderer.disableCancel(upload.uploadIndex);
                  _context4.next = 3;
                  return upload.abort();

                case 3:
                  this.removeUploadFromList(upload);

                case 4:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4, this);
        }));

        function handleCancel(_x4) {
          return _handleCancel.apply(this, arguments);
        }

        return handleCancel;
      }()
    }, {
      key: "initDropArea",
      value: function initDropArea(container, inputAccept) {
        new DropArea({
          container: container,
          inputAccept: inputAccept,
          onUploadFiles: this.uploadFiles
        });
      }
    }, {
      key: "checkDropHint",
      value: function checkDropHint() {
        if (!this.supportDropArea) {
          return;
        }

        var nonEmptyUploads = this.uploads.filter(function (e) {
          return e;
        });

        if (nonEmptyUploads.length === 0) {
          this.renderer.renderDropHint();
        } else {
          this.renderer.removeDropHint();
        }
      }
    }, {
      key: "updatePlaceholderInput",
      value: function updatePlaceholderInput() {
        var input = findInput(this.form, getUploadsFieldName(this.fieldName, this.prefix), this.prefix);

        if (!input) {
          return;
        }

        var placeholdersInfo = this.uploads.filter(function (upload) {
          return upload.type === "placeholder" || upload.type === "s3" || upload.type === "uploadedS3";
        }).map(function (upload) {
          return upload.getInitialFile();
        });
        input.value = JSON.stringify(placeholdersInfo);
      }
    }, {
      key: "getMetaDataField",
      value: function getMetaDataField() {
        return findInput(this.form, getMetadataFieldName(this.fieldName, this.prefix), this.prefix);
      }
    }, {
      key: "emitEvent",
      value: function emitEvent(eventName, element, upload) {
        if (this.eventEmitter) {
          this.eventEmitter.emit(eventName, {
            element: element,
            fieldName: this.fieldName,
            fileName: upload.name,
            metaDataField: this.getMetaDataField(),
            upload: upload
          });
        }
      }
    }]);

    return FileField;
  }();

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

  var initUploadFields = function initUploadFields(form) {
    var _findInput;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var matchesPrefix = function matchesPrefix(fieldName) {
      if (!(options && options.prefix)) {
        return true;
      }

      return fieldName.startsWith("".concat(options.prefix, "-"));
    };

    var getPrefix = function getPrefix() {
      return options && options.prefix ? options.prefix : null;
    };

    var getInputValue = function getInputValue(fieldName) {
      return getInputValueForFormAndPrefix(form, fieldName, getPrefix());
    };

    var getInitialFiles = function getInitialFiles(element) {
      var filesData = element.dataset.files;

      if (!filesData) {
        return [];
      }

      return JSON.parse(filesData);
    };

    var getPlaceholders = function getPlaceholders(fieldName) {
      var data = getInputValue(getUploadsFieldName(fieldName, getPrefix()));

      if (!data) {
        return [];
      }

      return JSON.parse(data);
    };

    var uploadUrl = getInputValue("upload_url");
    var formId = getInputValue("form_id");
    var s3UploadDir = getInputValue("s3_upload_dir");
    var skipRequired = options.skipRequired || false;
    var prefix = getPrefix();
    var csrfToken = (_findInput = findInput(form, "csrfmiddlewaretoken", null)) === null || _findInput === void 0 ? void 0 : _findInput.value;

    if (!csrfToken) {
      throw Error("Csrf token not found");
    }

    if (!formId || !uploadUrl) {
      return;
    }

    form.querySelectorAll(".dff-uploader").forEach(function (uploaderDiv) {
      var container = uploaderDiv.querySelector(".dff-container");

      if (!container) {
        return;
      }

      var input = container.querySelector("input[type=file]");

      if (!(input && matchesPrefix(input.name))) {
        return;
      }

      var fieldName = input.name;
      var multiple = input.multiple;
      var initial = getInitialFiles(container).concat(getPlaceholders(fieldName));
      var dataTranslations = container.getAttribute("data-translations");
      var translations = dataTranslations ? JSON.parse(dataTranslations) : {};
      var supportDropArea = !(options.supportDropArea === false);
      new FileField({
        callbacks: options.callbacks || {},
        chunkSize: options.chunkSize || 2621440,
        csrfToken: csrfToken,
        eventEmitter: options.eventEmitter,
        fieldName: fieldName,
        form: form,
        formId: formId,
        s3UploadDir: s3UploadDir || null,
        initial: initial,
        input: input,
        multiple: multiple,
        parent: container,
        prefix: prefix,
        retryDelays: options.retryDelays || null,
        skipRequired: skipRequired,
        supportDropArea: supportDropArea,
        translations: translations,
        uploadUrl: uploadUrl
      });
    });
  };

  var initFormSet = function initFormSet(form, optionsParam) {
    var options;

    if (typeof optionsParam === "string") {
      options = {
        prefix: optionsParam
      };
    } else {
      options = optionsParam;
    }

    var prefix = options.prefix || "form";
    var totalFormsValue = getInputValueForFormAndPrefix(form, "TOTAL_FORMS", prefix);

    if (!totalFormsValue) {
      return;
    }

    var formCount = parseInt(totalFormsValue, 10);

    for (var i = 0; i < formCount; i += 1) {
      var subFormPrefix = getInputNameWithPrefix("".concat(i), null);
      initUploadFields(form, _objectSpread(_objectSpread({}, options), {}, {
        prefix: "".concat(prefix, "-").concat(subFormPrefix)
      }));
    }
  };

  // eslint-disable-line @typescript-eslint/no-explicit-any
  window.initFormSet = initFormSet; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

  window.initUploadFields = initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

}());
//# sourceMappingURL=file_form.debug.js.map
