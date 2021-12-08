(function () {

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global$19 =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var objectGetOwnPropertyDescriptor = {};

	var fails$E = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var fails$D = fails$E;

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails$D(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var call$k = Function.prototype.call;

	var functionCall = call$k.bind ? call$k.bind(call$k) : function () {
	  return call$k.apply(call$k, arguments);
	};

	var objectPropertyIsEnumerable = {};

	var $propertyIsEnumerable$1 = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor$3 && !$propertyIsEnumerable$1.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$3(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable$1;

	var createPropertyDescriptor$6 = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var FunctionPrototype$3 = Function.prototype;
	var bind$b = FunctionPrototype$3.bind;
	var call$j = FunctionPrototype$3.call;
	var callBind = bind$b && bind$b.bind(call$j);

	var functionUncurryThis = bind$b ? function (fn) {
	  return fn && callBind(call$j, fn);
	} : function (fn) {
	  return fn && function () {
	    return call$j.apply(fn, arguments);
	  };
	};

	var uncurryThis$E = functionUncurryThis;

	var toString$h = uncurryThis$E({}.toString);
	var stringSlice$9 = uncurryThis$E(''.slice);

	var classofRaw$1 = function (it) {
	  return stringSlice$9(toString$h(it), 8, -1);
	};

	var global$18 = global$19;
	var uncurryThis$D = functionUncurryThis;
	var fails$C = fails$E;
	var classof$d = classofRaw$1;

	var Object$5 = global$18.Object;
	var split = uncurryThis$D(''.split);

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails$C(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !Object$5('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof$d(it) == 'String' ? split(it, '') : Object$5(it);
	} : Object$5;

	var global$17 = global$19;

	var TypeError$k = global$17.TypeError;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible$a = function (it) {
	  if (it == undefined) throw TypeError$k("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings
	var IndexedObject$3 = indexedObject;
	var requireObjectCoercible$9 = requireObjectCoercible$a;

	var toIndexedObject$c = function (it) {
	  return IndexedObject$3(requireObjectCoercible$9(it));
	};

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	var isCallable$o = function (argument) {
	  return typeof argument == 'function';
	};

	var isCallable$n = isCallable$o;

	var isObject$m = function (it) {
	  return typeof it == 'object' ? it !== null : isCallable$n(it);
	};

	var global$16 = global$19;
	var isCallable$m = isCallable$o;

	var aFunction = function (argument) {
	  return isCallable$m(argument) ? argument : undefined;
	};

	var getBuiltIn$9 = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(global$16[namespace]) : global$16[namespace] && global$16[namespace][method];
	};

	var uncurryThis$C = functionUncurryThis;

	var objectIsPrototypeOf = uncurryThis$C({}.isPrototypeOf);

	var getBuiltIn$8 = getBuiltIn$9;

	var engineUserAgent = getBuiltIn$8('navigator', 'userAgent') || '';

	var global$15 = global$19;
	var userAgent$5 = engineUserAgent;

	var process$3 = global$15.process;
	var Deno = global$15.Deno;
	var versions = process$3 && process$3.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
	  // but their correct versions are not interesting for us
	  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}

	// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if (!version && userAgent$5) {
	  match = userAgent$5.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent$5.match(/Chrome\/(\d+)/);
	    if (match) version = +match[1];
	  }
	}

	var engineV8Version = version;

	/* eslint-disable es/no-symbol -- required for testing */

	var V8_VERSION$3 = engineV8Version;
	var fails$B = fails$E;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$B(function () {
	  var symbol = Symbol();
	  // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && V8_VERSION$3 && V8_VERSION$3 < 41;
	});

	/* eslint-disable es/no-symbol -- required for testing */

	var NATIVE_SYMBOL$3 = nativeSymbol;

	var useSymbolAsUid = NATIVE_SYMBOL$3
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';

	var global$14 = global$19;
	var getBuiltIn$7 = getBuiltIn$9;
	var isCallable$l = isCallable$o;
	var isPrototypeOf$8 = objectIsPrototypeOf;
	var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

	var Object$4 = global$14.Object;

	var isSymbol$4 = USE_SYMBOL_AS_UID$1 ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn$7('Symbol');
	  return isCallable$l($Symbol) && isPrototypeOf$8($Symbol.prototype, Object$4(it));
	};

	var global$13 = global$19;

	var String$6 = global$13.String;

	var tryToString$5 = function (argument) {
	  try {
	    return String$6(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};

	var global$12 = global$19;
	var isCallable$k = isCallable$o;
	var tryToString$4 = tryToString$5;

	var TypeError$j = global$12.TypeError;

	// `Assert: IsCallable(argument) is true`
	var aCallable$9 = function (argument) {
	  if (isCallable$k(argument)) return argument;
	  throw TypeError$j(tryToString$4(argument) + ' is not a function');
	};

	var aCallable$8 = aCallable$9;

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	var getMethod$6 = function (V, P) {
	  var func = V[P];
	  return func == null ? undefined : aCallable$8(func);
	};

	var global$11 = global$19;
	var call$i = functionCall;
	var isCallable$j = isCallable$o;
	var isObject$l = isObject$m;

	var TypeError$i = global$11.TypeError;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	var ordinaryToPrimitive$1 = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable$j(fn = input.toString) && !isObject$l(val = call$i(fn, input))) return val;
	  if (isCallable$j(fn = input.valueOf) && !isObject$l(val = call$i(fn, input))) return val;
	  if (pref !== 'string' && isCallable$j(fn = input.toString) && !isObject$l(val = call$i(fn, input))) return val;
	  throw TypeError$i("Can't convert object to primitive value");
	};

	var shared$5 = {exports: {}};

	var global$10 = global$19;

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$9 = Object.defineProperty;

	var setGlobal$3 = function (key, value) {
	  try {
	    defineProperty$9(global$10, key, { value: value, configurable: true, writable: true });
	  } catch (error) {
	    global$10[key] = value;
	  } return value;
	};

	var global$$ = global$19;
	var setGlobal$2 = setGlobal$3;

	var SHARED = '__core-js_shared__';
	var store$3 = global$$[SHARED] || setGlobal$2(SHARED, {});

	var sharedStore = store$3;

	var store$2 = sharedStore;

	(shared$5.exports = function (key, value) {
	  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.19.3',
	  mode: 'global',
	  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
	});

	var global$_ = global$19;
	var requireObjectCoercible$8 = requireObjectCoercible$a;

	var Object$3 = global$_.Object;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject$g = function (argument) {
	  return Object$3(requireObjectCoercible$8(argument));
	};

	var uncurryThis$B = functionUncurryThis;
	var toObject$f = toObject$g;

	var hasOwnProperty = uncurryThis$B({}.hasOwnProperty);

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty(toObject$f(it), key);
	};

	var uncurryThis$A = functionUncurryThis;

	var id$1 = 0;
	var postfix = Math.random();
	var toString$g = uncurryThis$A(1.0.toString);

	var uid$5 = function (key) {
	  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$g(++id$1 + postfix, 36);
	};

	var global$Z = global$19;
	var shared$4 = shared$5.exports;
	var hasOwn$h = hasOwnProperty_1;
	var uid$4 = uid$5;
	var NATIVE_SYMBOL$2 = nativeSymbol;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;

	var WellKnownSymbolsStore$1 = shared$4('wks');
	var Symbol$1 = global$Z.Symbol;
	var symbolFor = Symbol$1 && Symbol$1['for'];
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$4;

	var wellKnownSymbol$r = function (name) {
	  if (!hasOwn$h(WellKnownSymbolsStore$1, name) || !(NATIVE_SYMBOL$2 || typeof WellKnownSymbolsStore$1[name] == 'string')) {
	    var description = 'Symbol.' + name;
	    if (NATIVE_SYMBOL$2 && hasOwn$h(Symbol$1, name)) {
	      WellKnownSymbolsStore$1[name] = Symbol$1[name];
	    } else if (USE_SYMBOL_AS_UID && symbolFor) {
	      WellKnownSymbolsStore$1[name] = symbolFor(description);
	    } else {
	      WellKnownSymbolsStore$1[name] = createWellKnownSymbol(description);
	    }
	  } return WellKnownSymbolsStore$1[name];
	};

	var global$Y = global$19;
	var call$h = functionCall;
	var isObject$k = isObject$m;
	var isSymbol$3 = isSymbol$4;
	var getMethod$5 = getMethod$6;
	var ordinaryToPrimitive = ordinaryToPrimitive$1;
	var wellKnownSymbol$q = wellKnownSymbol$r;

	var TypeError$h = global$Y.TypeError;
	var TO_PRIMITIVE$1 = wellKnownSymbol$q('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	var toPrimitive$1 = function (input, pref) {
	  if (!isObject$k(input) || isSymbol$3(input)) return input;
	  var exoticToPrim = getMethod$5(input, TO_PRIMITIVE$1);
	  var result;
	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = call$h(exoticToPrim, input, pref);
	    if (!isObject$k(result) || isSymbol$3(result)) return result;
	    throw TypeError$h("Can't convert object to primitive value");
	  }
	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};

	var toPrimitive = toPrimitive$1;
	var isSymbol$2 = isSymbol$4;

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	var toPropertyKey$5 = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol$2(key) ? key : key + '';
	};

	var global$X = global$19;
	var isObject$j = isObject$m;

	var document$3 = global$X.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS$1 = isObject$j(document$3) && isObject$j(document$3.createElement);

	var documentCreateElement$2 = function (it) {
	  return EXISTS$1 ? document$3.createElement(it) : {};
	};

	var DESCRIPTORS$h = descriptors;
	var fails$A = fails$E;
	var createElement$1 = documentCreateElement$2;

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !DESCRIPTORS$h && !fails$A(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
	  return Object.defineProperty(createElement$1('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var DESCRIPTORS$g = descriptors;
	var call$g = functionCall;
	var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
	var createPropertyDescriptor$5 = createPropertyDescriptor$6;
	var toIndexedObject$b = toIndexedObject$c;
	var toPropertyKey$4 = toPropertyKey$5;
	var hasOwn$g = hasOwnProperty_1;
	var IE8_DOM_DEFINE$1 = ie8DomDefine;

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	objectGetOwnPropertyDescriptor.f = DESCRIPTORS$g ? $getOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject$b(O);
	  P = toPropertyKey$4(P);
	  if (IE8_DOM_DEFINE$1) try {
	    return $getOwnPropertyDescriptor$1(O, P);
	  } catch (error) { /* empty */ }
	  if (hasOwn$g(O, P)) return createPropertyDescriptor$5(!call$g(propertyIsEnumerableModule$1.f, O, P), O[P]);
	};

	var objectDefineProperty = {};

	var global$W = global$19;
	var isObject$i = isObject$m;

	var String$5 = global$W.String;
	var TypeError$g = global$W.TypeError;

	// `Assert: Type(argument) is Object`
	var anObject$j = function (argument) {
	  if (isObject$i(argument)) return argument;
	  throw TypeError$g(String$5(argument) + ' is not an object');
	};

	var global$V = global$19;
	var DESCRIPTORS$f = descriptors;
	var IE8_DOM_DEFINE = ie8DomDefine;
	var anObject$i = anObject$j;
	var toPropertyKey$3 = toPropertyKey$5;

	var TypeError$f = global$V.TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty$1 = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS$f ? $defineProperty$1 : function defineProperty(O, P, Attributes) {
	  anObject$i(O);
	  P = toPropertyKey$3(P);
	  anObject$i(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return $defineProperty$1(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError$f('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var DESCRIPTORS$e = descriptors;
	var definePropertyModule$7 = objectDefineProperty;
	var createPropertyDescriptor$4 = createPropertyDescriptor$6;

	var createNonEnumerableProperty$b = DESCRIPTORS$e ? function (object, key, value) {
	  return definePropertyModule$7.f(object, key, createPropertyDescriptor$4(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var redefine$c = {exports: {}};

	var uncurryThis$z = functionUncurryThis;
	var isCallable$i = isCallable$o;
	var store$1 = sharedStore;

	var functionToString$1 = uncurryThis$z(Function.toString);

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable$i(store$1.inspectSource)) {
	  store$1.inspectSource = function (it) {
	    return functionToString$1(it);
	  };
	}

	var inspectSource$4 = store$1.inspectSource;

	var global$U = global$19;
	var isCallable$h = isCallable$o;
	var inspectSource$3 = inspectSource$4;

	var WeakMap$1 = global$U.WeakMap;

	var nativeWeakMap = isCallable$h(WeakMap$1) && /native code/.test(inspectSource$3(WeakMap$1));

	var shared$3 = shared$5.exports;
	var uid$3 = uid$5;

	var keys$2 = shared$3('keys');

	var sharedKey$4 = function (key) {
	  return keys$2[key] || (keys$2[key] = uid$3(key));
	};

	var hiddenKeys$6 = {};

	var NATIVE_WEAK_MAP = nativeWeakMap;
	var global$T = global$19;
	var uncurryThis$y = functionUncurryThis;
	var isObject$h = isObject$m;
	var createNonEnumerableProperty$a = createNonEnumerableProperty$b;
	var hasOwn$f = hasOwnProperty_1;
	var shared$2 = sharedStore;
	var sharedKey$3 = sharedKey$4;
	var hiddenKeys$5 = hiddenKeys$6;

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError$e = global$T.TypeError;
	var WeakMap = global$T.WeakMap;
	var set$3, get$1, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get$1(it) : set$3(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject$h(it) || (state = get$1(it)).type !== TYPE) {
	      throw TypeError$e('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared$2.state) {
	  var store = shared$2.state || (shared$2.state = new WeakMap());
	  var wmget = uncurryThis$y(store.get);
	  var wmhas = uncurryThis$y(store.has);
	  var wmset = uncurryThis$y(store.set);
	  set$3 = function (it, metadata) {
	    if (wmhas(store, it)) throw new TypeError$e(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    wmset(store, it, metadata);
	    return metadata;
	  };
	  get$1 = function (it) {
	    return wmget(store, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas(store, it);
	  };
	} else {
	  var STATE = sharedKey$3('state');
	  hiddenKeys$5[STATE] = true;
	  set$3 = function (it, metadata) {
	    if (hasOwn$f(it, STATE)) throw new TypeError$e(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty$a(it, STATE, metadata);
	    return metadata;
	  };
	  get$1 = function (it) {
	    return hasOwn$f(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return hasOwn$f(it, STATE);
	  };
	}

	var internalState = {
	  set: set$3,
	  get: get$1,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var DESCRIPTORS$d = descriptors;
	var hasOwn$e = hasOwnProperty_1;

	var FunctionPrototype$2 = Function.prototype;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor = DESCRIPTORS$d && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwn$e(FunctionPrototype$2, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!DESCRIPTORS$d || (DESCRIPTORS$d && getDescriptor(FunctionPrototype$2, 'name').configurable));

	var functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};

	var global$S = global$19;
	var isCallable$g = isCallable$o;
	var hasOwn$d = hasOwnProperty_1;
	var createNonEnumerableProperty$9 = createNonEnumerableProperty$b;
	var setGlobal$1 = setGlobal$3;
	var inspectSource$2 = inspectSource$4;
	var InternalStateModule$7 = internalState;
	var CONFIGURABLE_FUNCTION_NAME$2 = functionName.CONFIGURABLE;

	var getInternalState$7 = InternalStateModule$7.get;
	var enforceInternalState$1 = InternalStateModule$7.enforce;
	var TEMPLATE = String(String).split('String');

	(redefine$c.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  var name = options && options.name !== undefined ? options.name : key;
	  var state;
	  if (isCallable$g(value)) {
	    if (String(name).slice(0, 7) === 'Symbol(') {
	      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
	    }
	    if (!hasOwn$d(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$2 && value.name !== name)) {
	      createNonEnumerableProperty$9(value, 'name', name);
	    }
	    state = enforceInternalState$1(value);
	    if (!state.source) {
	      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
	    }
	  }
	  if (O === global$S) {
	    if (simple) O[key] = value;
	    else setGlobal$1(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty$9(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return isCallable$g(this) && getInternalState$7(this).source || inspectSource$2(this);
	});

	var objectGetOwnPropertyNames = {};

	var ceil = Math.ceil;
	var floor$6 = Math.floor;

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	var toIntegerOrInfinity$b = function (argument) {
	  var number = +argument;
	  // eslint-disable-next-line no-self-compare -- safe
	  return number !== number || number === 0 ? 0 : (number > 0 ? floor$6 : ceil)(number);
	};

	var toIntegerOrInfinity$a = toIntegerOrInfinity$b;

	var max$4 = Math.max;
	var min$7 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex$7 = function (index, length) {
	  var integer = toIntegerOrInfinity$a(index);
	  return integer < 0 ? max$4(integer + length, 0) : min$7(integer, length);
	};

	var toIntegerOrInfinity$9 = toIntegerOrInfinity$b;

	var min$6 = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength$9 = function (argument) {
	  return argument > 0 ? min$6(toIntegerOrInfinity$9(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toLength$8 = toLength$9;

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	var lengthOfArrayLike$f = function (obj) {
	  return toLength$8(obj.length);
	};

	var toIndexedObject$a = toIndexedObject$c;
	var toAbsoluteIndex$6 = toAbsoluteIndex$7;
	var lengthOfArrayLike$e = lengthOfArrayLike$f;

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod$4 = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject$a($this);
	    var length = lengthOfArrayLike$e(O);
	    var index = toAbsoluteIndex$6(fromIndex, length);
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

	var uncurryThis$x = functionUncurryThis;
	var hasOwn$c = hasOwnProperty_1;
	var toIndexedObject$9 = toIndexedObject$c;
	var indexOf$1 = arrayIncludes.indexOf;
	var hiddenKeys$4 = hiddenKeys$6;

	var push$6 = uncurryThis$x([].push);

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject$9(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !hasOwn$c(hiddenKeys$4, key) && hasOwn$c(O, key) && push$6(result, key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (hasOwn$c(O, key = names[i++])) {
	    ~indexOf$1(result, key) || push$6(result, key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys$3 = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var internalObjectKeys$1 = objectKeysInternal;
	var enumBugKeys$2 = enumBugKeys$3;

	var hiddenKeys$3 = enumBugKeys$2.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return internalObjectKeys$1(O, hiddenKeys$3);
	};

	var objectGetOwnPropertySymbols = {};

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

	var getBuiltIn$6 = getBuiltIn$9;
	var uncurryThis$w = functionUncurryThis;
	var getOwnPropertyNamesModule$2 = objectGetOwnPropertyNames;
	var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
	var anObject$h = anObject$j;

	var concat$3 = uncurryThis$w([].concat);

	// all object keys, includes non-enumerable and symbols
	var ownKeys$8 = getBuiltIn$6('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = getOwnPropertyNamesModule$2.f(anObject$h(it));
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
	  return getOwnPropertySymbols ? concat$3(keys, getOwnPropertySymbols(it)) : keys;
	};

	var hasOwn$b = hasOwnProperty_1;
	var ownKeys$7 = ownKeys$8;
	var getOwnPropertyDescriptorModule$3 = objectGetOwnPropertyDescriptor;
	var definePropertyModule$6 = objectDefineProperty;

	var copyConstructorProperties$2 = function (target, source) {
	  var keys = ownKeys$7(source);
	  var defineProperty = definePropertyModule$6.f;
	  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$3.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!hasOwn$b(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var fails$z = fails$E;
	var isCallable$f = isCallable$o;

	var replacement = /#|\.prototype\./;

	var isForced$4 = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : isCallable$f(detection) ? fails$z(detection)
	    : !!detection;
	};

	var normalize = isForced$4.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced$4.data = {};
	var NATIVE = isForced$4.NATIVE = 'N';
	var POLYFILL = isForced$4.POLYFILL = 'P';

	var isForced_1 = isForced$4;

	var global$R = global$19;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var createNonEnumerableProperty$8 = createNonEnumerableProperty$b;
	var redefine$b = redefine$c.exports;
	var setGlobal = setGlobal$3;
	var copyConstructorProperties$1 = copyConstructorProperties$2;
	var isForced$3 = isForced_1;

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
	  options.name        - the .name of the function if it does not match the key
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global$R;
	  } else if (STATIC) {
	    target = global$R[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global$R[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$2(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced$3(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty == typeof targetProperty) continue;
	      copyConstructorProperties$1(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty$8(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine$b(target, key, sourceProperty, options);
	  }
	};

	var uncurryThis$v = functionUncurryThis;
	var aCallable$7 = aCallable$9;

	var bind$a = uncurryThis$v(uncurryThis$v.bind);

	// optional / simple context binding
	var functionBindContext = function (fn, that) {
	  aCallable$7(fn);
	  return that === undefined ? fn : bind$a ? bind$a(fn, that) : function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var call$f = functionCall;
	var anObject$g = anObject$j;
	var getMethod$4 = getMethod$6;

	var iteratorClose$2 = function (iterator, kind, value) {
	  var innerResult, innerError;
	  anObject$g(iterator);
	  try {
	    innerResult = getMethod$4(iterator, 'return');
	    if (!innerResult) {
	      if (kind === 'throw') throw value;
	      return value;
	    }
	    innerResult = call$f(innerResult, iterator);
	  } catch (error) {
	    innerError = true;
	    innerResult = error;
	  }
	  if (kind === 'throw') throw value;
	  if (innerError) throw innerResult;
	  anObject$g(innerResult);
	  return value;
	};

	var anObject$f = anObject$j;
	var iteratorClose$1 = iteratorClose$2;

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject$f(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    iteratorClose$1(iterator, 'throw', error);
	  }
	};

	var iterators = {};

	var wellKnownSymbol$p = wellKnownSymbol$r;
	var Iterators$4 = iterators;

	var ITERATOR$6 = wellKnownSymbol$p('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod$3 = function (it) {
	  return it !== undefined && (Iterators$4.Array === it || ArrayPrototype$1[ITERATOR$6] === it);
	};

	var wellKnownSymbol$o = wellKnownSymbol$r;

	var TO_STRING_TAG$4 = wellKnownSymbol$o('toStringTag');
	var test$1 = {};

	test$1[TO_STRING_TAG$4] = 'z';

	var toStringTagSupport = String(test$1) === '[object z]';

	var global$Q = global$19;
	var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
	var isCallable$e = isCallable$o;
	var classofRaw = classofRaw$1;
	var wellKnownSymbol$n = wellKnownSymbol$r;

	var TO_STRING_TAG$3 = wellKnownSymbol$n('toStringTag');
	var Object$2 = global$Q.Object;

	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof$c = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object$2(it), TO_STRING_TAG$3)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && isCallable$e(O.callee) ? 'Arguments' : result;
	};

	var uncurryThis$u = functionUncurryThis;
	var fails$y = fails$E;
	var isCallable$d = isCallable$o;
	var classof$b = classof$c;
	var getBuiltIn$5 = getBuiltIn$9;
	var inspectSource$1 = inspectSource$4;

	var noop = function () { /* empty */ };
	var empty = [];
	var construct$1 = getBuiltIn$5('Reflect', 'construct');
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec$3 = uncurryThis$u(constructorRegExp.exec);
	var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

	var isConstructorModern = function (argument) {
	  if (!isCallable$d(argument)) return false;
	  try {
	    construct$1(noop, empty, argument);
	    return true;
	  } catch (error) {
	    return false;
	  }
	};

	var isConstructorLegacy = function (argument) {
	  if (!isCallable$d(argument)) return false;
	  switch (classof$b(argument)) {
	    case 'AsyncFunction':
	    case 'GeneratorFunction':
	    case 'AsyncGeneratorFunction': return false;
	    // we can't check .prototype since constructors produced by .bind haven't it
	  } return INCORRECT_TO_STRING || !!exec$3(constructorRegExp, inspectSource$1(argument));
	};

	// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	var isConstructor$4 = !construct$1 || fails$y(function () {
	  var called;
	  return isConstructorModern(isConstructorModern.call)
	    || !isConstructorModern(Object)
	    || !isConstructorModern(function () { called = true; })
	    || called;
	}) ? isConstructorLegacy : isConstructorModern;

	var toPropertyKey$2 = toPropertyKey$5;
	var definePropertyModule$5 = objectDefineProperty;
	var createPropertyDescriptor$3 = createPropertyDescriptor$6;

	var createProperty$6 = function (object, key, value) {
	  var propertyKey = toPropertyKey$2(key);
	  if (propertyKey in object) definePropertyModule$5.f(object, propertyKey, createPropertyDescriptor$3(0, value));
	  else object[propertyKey] = value;
	};

	var classof$a = classof$c;
	var getMethod$3 = getMethod$6;
	var Iterators$3 = iterators;
	var wellKnownSymbol$m = wellKnownSymbol$r;

	var ITERATOR$5 = wellKnownSymbol$m('iterator');

	var getIteratorMethod$4 = function (it) {
	  if (it != undefined) return getMethod$3(it, ITERATOR$5)
	    || getMethod$3(it, '@@iterator')
	    || Iterators$3[classof$a(it)];
	};

	var global$P = global$19;
	var call$e = functionCall;
	var aCallable$6 = aCallable$9;
	var anObject$e = anObject$j;
	var tryToString$3 = tryToString$5;
	var getIteratorMethod$3 = getIteratorMethod$4;

	var TypeError$d = global$P.TypeError;

	var getIterator$3 = function (argument, usingIterator) {
	  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$3(argument) : usingIterator;
	  if (aCallable$6(iteratorMethod)) return anObject$e(call$e(iteratorMethod, argument));
	  throw TypeError$d(tryToString$3(argument) + ' is not iterable');
	};

	var global$O = global$19;
	var bind$9 = functionBindContext;
	var call$d = functionCall;
	var toObject$e = toObject$g;
	var callWithSafeIterationClosing = callWithSafeIterationClosing$1;
	var isArrayIteratorMethod$2 = isArrayIteratorMethod$3;
	var isConstructor$3 = isConstructor$4;
	var lengthOfArrayLike$d = lengthOfArrayLike$f;
	var createProperty$5 = createProperty$6;
	var getIterator$2 = getIterator$3;
	var getIteratorMethod$2 = getIteratorMethod$4;

	var Array$7 = global$O.Array;

	// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject$e(arrayLike);
	  var IS_CONSTRUCTOR = isConstructor$3(this);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  if (mapping) mapfn = bind$9(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
	  var iteratorMethod = getIteratorMethod$2(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod && !(this == Array$7 && isArrayIteratorMethod$2(iteratorMethod))) {
	    iterator = getIterator$2(O, iteratorMethod);
	    next = iterator.next;
	    result = IS_CONSTRUCTOR ? new this() : [];
	    for (;!(step = call$d(next, iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty$5(result, index, value);
	    }
	  } else {
	    length = lengthOfArrayLike$d(O);
	    result = IS_CONSTRUCTOR ? new this(length) : Array$7(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty$5(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	var wellKnownSymbol$l = wellKnownSymbol$r;

	var ITERATOR$4 = wellKnownSymbol$l('iterator');
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
	  iteratorWithReturn[ITERATOR$4] = function () {
	    return this;
	  };
	  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration$4 = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$4] = function () {
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

	var $$t = _export;
	var from = arrayFrom;
	var checkCorrectnessOfIteration$3 = checkCorrectnessOfIteration$4;

	var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration$3(function (iterable) {
	  // eslint-disable-next-line es/no-array-from -- required for testing
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.es/ecma262/#sec-array.from
	$$t({ target: 'Array', stat: true, forced: INCORRECT_ITERATION$1 }, {
	  from: from
	});

	var global$N = global$19;
	var classof$9 = classof$c;

	var String$4 = global$N.String;

	var toString$f = function (argument) {
	  if (classof$9(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
	  return String$4(argument);
	};

	var uncurryThis$t = functionUncurryThis;
	var toIntegerOrInfinity$8 = toIntegerOrInfinity$b;
	var toString$e = toString$f;
	var requireObjectCoercible$7 = requireObjectCoercible$a;

	var charAt$5 = uncurryThis$t(''.charAt);
	var charCodeAt = uncurryThis$t(''.charCodeAt);
	var stringSlice$8 = uncurryThis$t(''.slice);

	var createMethod$3 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = toString$e(requireObjectCoercible$7($this));
	    var position = toIntegerOrInfinity$8(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = charCodeAt(S, position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING
	          ? charAt$5(S, position)
	          : first
	        : CONVERT_TO_STRING
	          ? stringSlice$8(S, position, position + 2)
	          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$3(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$3(true)
	};

	var internalObjectKeys = objectKeysInternal;
	var enumBugKeys$1 = enumBugKeys$3;

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	var objectKeys$2 = Object.keys || function keys(O) {
	  return internalObjectKeys(O, enumBugKeys$1);
	};

	var DESCRIPTORS$c = descriptors;
	var definePropertyModule$4 = objectDefineProperty;
	var anObject$d = anObject$j;
	var toIndexedObject$8 = toIndexedObject$c;
	var objectKeys$1 = objectKeys$2;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	var objectDefineProperties = DESCRIPTORS$c ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject$d(O);
	  var props = toIndexedObject$8(Properties);
	  var keys = objectKeys$1(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) definePropertyModule$4.f(O, key = keys[index++], props[key]);
	  return O;
	};

	var getBuiltIn$4 = getBuiltIn$9;

	var html$2 = getBuiltIn$4('document', 'documentElement');

	/* global ActiveXObject -- old IE, WSH */

	var anObject$c = anObject$j;
	var defineProperties = objectDefineProperties;
	var enumBugKeys = enumBugKeys$3;
	var hiddenKeys$2 = hiddenKeys$6;
	var html$1 = html$2;
	var documentCreateElement$1 = documentCreateElement$2;
	var sharedKey$2 = sharedKey$4;

	var GT = '>';
	var LT = '<';
	var PROTOTYPE$2 = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO$1 = sharedKey$2('IE_PROTO');

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
	  var iframe = documentCreateElement$1('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html$1.appendChild(iframe);
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
	    activeXDocument = new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = typeof document != 'undefined'
	    ? document.domain && activeXDocument
	      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
	      : NullProtoObjectViaIFrame()
	    : NullProtoObjectViaActiveX(activeXDocument); // WSH
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys$2[IE_PROTO$1] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE$2] = anObject$c(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE$2] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : defineProperties(result, Properties);
	};

	var fails$x = fails$E;

	var correctPrototypeGetter = !fails$x(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var global$M = global$19;
	var hasOwn$a = hasOwnProperty_1;
	var isCallable$c = isCallable$o;
	var toObject$d = toObject$g;
	var sharedKey$1 = sharedKey$4;
	var CORRECT_PROTOTYPE_GETTER$1 = correctPrototypeGetter;

	var IE_PROTO = sharedKey$1('IE_PROTO');
	var Object$1 = global$M.Object;
	var ObjectPrototype$4 = Object$1.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER$1 ? Object$1.getPrototypeOf : function (O) {
	  var object = toObject$d(O);
	  if (hasOwn$a(object, IE_PROTO)) return object[IE_PROTO];
	  var constructor = object.constructor;
	  if (isCallable$c(constructor) && object instanceof constructor) {
	    return constructor.prototype;
	  } return object instanceof Object$1 ? ObjectPrototype$4 : null;
	};

	var fails$w = fails$E;
	var isCallable$b = isCallable$o;
	var getPrototypeOf$3 = objectGetPrototypeOf;
	var redefine$a = redefine$c.exports;
	var wellKnownSymbol$k = wellKnownSymbol$r;

	var ITERATOR$3 = wellKnownSymbol$k('iterator');
	var BUGGY_SAFARI_ITERATORS$1 = false;

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = getPrototypeOf$3(getPrototypeOf$3(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$2 == undefined || fails$w(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype$2[ITERATOR$3].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

	// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if (!isCallable$b(IteratorPrototype$2[ITERATOR$3])) {
	  redefine$a(IteratorPrototype$2, ITERATOR$3, function () {
	    return this;
	  });
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype$2,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
	};

	var defineProperty$8 = objectDefineProperty.f;
	var hasOwn$9 = hasOwnProperty_1;
	var wellKnownSymbol$j = wellKnownSymbol$r;

	var TO_STRING_TAG$2 = wellKnownSymbol$j('toStringTag');

	var setToStringTag$8 = function (it, TAG, STATIC) {
	  if (it && !hasOwn$9(it = STATIC ? it : it.prototype, TO_STRING_TAG$2)) {
	    defineProperty$8(it, TO_STRING_TAG$2, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
	var create$5 = objectCreate;
	var createPropertyDescriptor$2 = createPropertyDescriptor$6;
	var setToStringTag$7 = setToStringTag$8;
	var Iterators$2 = iterators;

	var returnThis$1 = function () { return this; };

	var createIteratorConstructor$1 = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = create$5(IteratorPrototype$1, { next: createPropertyDescriptor$2(+!ENUMERABLE_NEXT, next) });
	  setToStringTag$7(IteratorConstructor, TO_STRING_TAG, false);
	  Iterators$2[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var global$L = global$19;
	var isCallable$a = isCallable$o;

	var String$3 = global$L.String;
	var TypeError$c = global$L.TypeError;

	var aPossiblePrototype$1 = function (argument) {
	  if (typeof argument == 'object' || isCallable$a(argument)) return argument;
	  throw TypeError$c("Can't set " + String$3(argument) + ' as a prototype');
	};

	/* eslint-disable no-proto -- safe */

	var uncurryThis$s = functionUncurryThis;
	var anObject$b = anObject$j;
	var aPossiblePrototype = aPossiblePrototype$1;

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    setter = uncurryThis$s(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set);
	    setter(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject$b(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var $$s = _export;
	var call$c = functionCall;
	var FunctionName$1 = functionName;
	var isCallable$9 = isCallable$o;
	var createIteratorConstructor = createIteratorConstructor$1;
	var getPrototypeOf$2 = objectGetPrototypeOf;
	var setPrototypeOf$5 = objectSetPrototypeOf;
	var setToStringTag$6 = setToStringTag$8;
	var createNonEnumerableProperty$7 = createNonEnumerableProperty$b;
	var redefine$9 = redefine$c.exports;
	var wellKnownSymbol$i = wellKnownSymbol$r;
	var Iterators$1 = iterators;
	var IteratorsCore = iteratorsCore;

	var PROPER_FUNCTION_NAME$4 = FunctionName$1.PROPER;
	var CONFIGURABLE_FUNCTION_NAME$1 = FunctionName$1.CONFIGURABLE;
	var IteratorPrototype = IteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$2 = wellKnownSymbol$i('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis = function () { return this; };

	var defineIterator$3 = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
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
	  var nativeIterator = IterablePrototype[ITERATOR$2]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = getPrototypeOf$2(anyNativeIterator.call(new Iterable()));
	    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
	      if (getPrototypeOf$2(CurrentIteratorPrototype) !== IteratorPrototype) {
	        if (setPrototypeOf$5) {
	          setPrototypeOf$5(CurrentIteratorPrototype, IteratorPrototype);
	        } else if (!isCallable$9(CurrentIteratorPrototype[ITERATOR$2])) {
	          redefine$9(CurrentIteratorPrototype, ITERATOR$2, returnThis);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag$6(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
	  if (PROPER_FUNCTION_NAME$4 && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    if (CONFIGURABLE_FUNCTION_NAME$1) {
	      createNonEnumerableProperty$7(IterablePrototype, 'name', VALUES);
	    } else {
	      INCORRECT_VALUES_NAME = true;
	      defaultIterator = function values() { return call$c(nativeIterator, this); };
	    }
	  }

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine$9(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else $$s({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
	  }

	  // define iterator
	  if (IterablePrototype[ITERATOR$2] !== defaultIterator) {
	    redefine$9(IterablePrototype, ITERATOR$2, defaultIterator, { name: DEFAULT });
	  }
	  Iterators$1[NAME] = defaultIterator;

	  return methods;
	};

	var charAt$4 = stringMultibyte.charAt;
	var toString$d = toString$f;
	var InternalStateModule$6 = internalState;
	var defineIterator$2 = defineIterator$3;

	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$6 = InternalStateModule$6.set;
	var getInternalState$6 = InternalStateModule$6.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator$2(String, 'String', function (iterated) {
	  setInternalState$6(this, {
	    type: STRING_ITERATOR,
	    string: toString$d(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$6(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt$4(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var wellKnownSymbol$h = wellKnownSymbol$r;
	var create$4 = objectCreate;
	var definePropertyModule$3 = objectDefineProperty;

	var UNSCOPABLES = wellKnownSymbol$h('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  definePropertyModule$3.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: create$4(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables$3 = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var toIndexedObject$7 = toIndexedObject$c;
	var addToUnscopables$2 = addToUnscopables$3;
	var Iterators = iterators;
	var InternalStateModule$5 = internalState;
	var defineIterator$1 = defineIterator$3;

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$5 = InternalStateModule$5.set;
	var getInternalState$5 = InternalStateModule$5.getterFor(ARRAY_ITERATOR);

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
	var es_array_iterator = defineIterator$1(Array, 'Array', function (iterated, kind) {
	  setInternalState$5(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject$7(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$5(this);
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
	Iterators.Arguments = Iterators.Array;

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables$2('keys');
	addToUnscopables$2('values');
	addToUnscopables$2('entries');

	var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
	var classof$8 = classof$c;

	// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
	  return '[object ' + classof$8(this) + ']';
	};

	var TO_STRING_TAG_SUPPORT = toStringTagSupport;
	var redefine$8 = redefine$c.exports;
	var toString$c = objectToString;

	// `Object.prototype.toString` method
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	if (!TO_STRING_TAG_SUPPORT) {
	  redefine$8(Object.prototype, 'toString', toString$c, { unsafe: true });
	}

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

	// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
	var documentCreateElement = documentCreateElement$2;

	var classList = documentCreateElement('span').classList;
	var DOMTokenListPrototype$2 = classList && classList.constructor && classList.constructor.prototype;

	var domTokenListPrototype = DOMTokenListPrototype$2 === Object.prototype ? undefined : DOMTokenListPrototype$2;

	var global$K = global$19;
	var DOMIterables$1 = domIterables;
	var DOMTokenListPrototype$1 = domTokenListPrototype;
	var ArrayIteratorMethods = es_array_iterator;
	var createNonEnumerableProperty$6 = createNonEnumerableProperty$b;
	var wellKnownSymbol$g = wellKnownSymbol$r;

	var ITERATOR$1 = wellKnownSymbol$g('iterator');
	var TO_STRING_TAG$1 = wellKnownSymbol$g('toStringTag');
	var ArrayValues = ArrayIteratorMethods.values;

	var handlePrototype$1 = function (CollectionPrototype, COLLECTION_NAME) {
	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$1] !== ArrayValues) try {
	      createNonEnumerableProperty$6(CollectionPrototype, ITERATOR$1, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$1] = ArrayValues;
	    }
	    if (!CollectionPrototype[TO_STRING_TAG$1]) {
	      createNonEnumerableProperty$6(CollectionPrototype, TO_STRING_TAG$1, COLLECTION_NAME);
	    }
	    if (DOMIterables$1[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
	        createNonEnumerableProperty$6(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
	      }
	    }
	  }
	};

	for (var COLLECTION_NAME$1 in DOMIterables$1) {
	  handlePrototype$1(global$K[COLLECTION_NAME$1] && global$K[COLLECTION_NAME$1].prototype, COLLECTION_NAME$1);
	}

	handlePrototype$1(DOMTokenListPrototype$1, 'DOMTokenList');

	var internalMetadata = {exports: {}};

	var objectGetOwnPropertyNamesExternal = {};

	var global$J = global$19;
	var toAbsoluteIndex$5 = toAbsoluteIndex$7;
	var lengthOfArrayLike$c = lengthOfArrayLike$f;
	var createProperty$4 = createProperty$6;

	var Array$6 = global$J.Array;
	var max$3 = Math.max;

	var arraySliceSimple = function (O, start, end) {
	  var length = lengthOfArrayLike$c(O);
	  var k = toAbsoluteIndex$5(start, length);
	  var fin = toAbsoluteIndex$5(end === undefined ? length : end, length);
	  var result = Array$6(max$3(fin - k, 0));
	  for (var n = 0; k < fin; k++, n++) createProperty$4(result, n, O[k]);
	  result.length = n;
	  return result;
	};

	/* eslint-disable es/no-object-getownpropertynames -- safe */

	var classof$7 = classofRaw$1;
	var toIndexedObject$6 = toIndexedObject$c;
	var $getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
	var arraySlice$9 = arraySliceSimple;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return $getOwnPropertyNames$1(it);
	  } catch (error) {
	    return arraySlice$9(windowNames);
	  }
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
	  return windowNames && classof$7(it) == 'Window'
	    ? getWindowNames(it)
	    : $getOwnPropertyNames$1(toIndexedObject$6(it));
	};

	// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
	var fails$v = fails$E;

	var arrayBufferNonExtensible = fails$v(function () {
	  if (typeof ArrayBuffer == 'function') {
	    var buffer = new ArrayBuffer(8);
	    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
	    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
	  }
	});

	var fails$u = fails$E;
	var isObject$g = isObject$m;
	var classof$6 = classofRaw$1;
	var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

	// eslint-disable-next-line es/no-object-isextensible -- safe
	var $isExtensible = Object.isExtensible;
	var FAILS_ON_PRIMITIVES$3 = fails$u(function () { $isExtensible(1); });

	// `Object.isExtensible` method
	// https://tc39.es/ecma262/#sec-object.isextensible
	var objectIsExtensible = (FAILS_ON_PRIMITIVES$3 || ARRAY_BUFFER_NON_EXTENSIBLE) ? function isExtensible(it) {
	  if (!isObject$g(it)) return false;
	  if (ARRAY_BUFFER_NON_EXTENSIBLE && classof$6(it) == 'ArrayBuffer') return false;
	  return $isExtensible ? $isExtensible(it) : true;
	} : $isExtensible;

	var fails$t = fails$E;

	var freezing = !fails$t(function () {
	  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var $$r = _export;
	var uncurryThis$r = functionUncurryThis;
	var hiddenKeys$1 = hiddenKeys$6;
	var isObject$f = isObject$m;
	var hasOwn$8 = hasOwnProperty_1;
	var defineProperty$7 = objectDefineProperty.f;
	var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
	var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
	var isExtensible = objectIsExtensible;
	var uid$2 = uid$5;
	var FREEZING = freezing;

	var REQUIRED = false;
	var METADATA = uid$2('meta');
	var id = 0;

	var setMetadata = function (it) {
	  defineProperty$7(it, METADATA, { value: {
	    objectID: 'O' + id++, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey$1 = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject$f(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!hasOwn$8(it, METADATA)) {
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
	  if (!hasOwn$8(it, METADATA)) {
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
	  if (FREEZING && REQUIRED && isExtensible(it) && !hasOwn$8(it, METADATA)) setMetadata(it);
	  return it;
	};

	var enable = function () {
	  meta.enable = function () { /* empty */ };
	  REQUIRED = true;
	  var getOwnPropertyNames = getOwnPropertyNamesModule$1.f;
	  var splice = uncurryThis$r([].splice);
	  var test = {};
	  test[METADATA] = 1;

	  // prevent exposing of metadata key
	  if (getOwnPropertyNames(test).length) {
	    getOwnPropertyNamesModule$1.f = function (it) {
	      var result = getOwnPropertyNames(it);
	      for (var i = 0, length = result.length; i < length; i++) {
	        if (result[i] === METADATA) {
	          splice(result, i, 1);
	          break;
	        }
	      } return result;
	    };

	    $$r({ target: 'Object', stat: true, forced: true }, {
	      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
	    });
	  }
	};

	var meta = internalMetadata.exports = {
	  enable: enable,
	  fastKey: fastKey$1,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys$1[METADATA] = true;

	var global$I = global$19;
	var bind$8 = functionBindContext;
	var call$b = functionCall;
	var anObject$a = anObject$j;
	var tryToString$2 = tryToString$5;
	var isArrayIteratorMethod$1 = isArrayIteratorMethod$3;
	var lengthOfArrayLike$b = lengthOfArrayLike$f;
	var isPrototypeOf$7 = objectIsPrototypeOf;
	var getIterator$1 = getIterator$3;
	var getIteratorMethod$1 = getIteratorMethod$4;
	var iteratorClose = iteratorClose$2;

	var TypeError$b = global$I.TypeError;

	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var ResultPrototype = Result.prototype;

	var iterate$3 = function (iterable, unboundFunction, options) {
	  var that = options && options.that;
	  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
	  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
	  var INTERRUPTED = !!(options && options.INTERRUPTED);
	  var fn = bind$8(unboundFunction, that);
	  var iterator, iterFn, index, length, result, next, step;

	  var stop = function (condition) {
	    if (iterator) iteratorClose(iterator, 'normal', condition);
	    return new Result(true, condition);
	  };

	  var callFn = function (value) {
	    if (AS_ENTRIES) {
	      anObject$a(value);
	      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
	    } return INTERRUPTED ? fn(value, stop) : fn(value);
	  };

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod$1(iterable);
	    if (!iterFn) throw TypeError$b(tryToString$2(iterable) + ' is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod$1(iterFn)) {
	      for (index = 0, length = lengthOfArrayLike$b(iterable); length > index; index++) {
	        result = callFn(iterable[index]);
	        if (result && isPrototypeOf$7(ResultPrototype, result)) return result;
	      } return new Result(false);
	    }
	    iterator = getIterator$1(iterable, iterFn);
	  }

	  next = iterator.next;
	  while (!(step = call$b(next, iterator)).done) {
	    try {
	      result = callFn(step.value);
	    } catch (error) {
	      iteratorClose(iterator, 'throw', error);
	    }
	    if (typeof result == 'object' && result && isPrototypeOf$7(ResultPrototype, result)) return result;
	  } return new Result(false);
	};

	var global$H = global$19;
	var isPrototypeOf$6 = objectIsPrototypeOf;

	var TypeError$a = global$H.TypeError;

	var anInstance$5 = function (it, Prototype) {
	  if (isPrototypeOf$6(Prototype, it)) return it;
	  throw TypeError$a('Incorrect invocation');
	};

	var isCallable$8 = isCallable$o;
	var isObject$e = isObject$m;
	var setPrototypeOf$4 = objectSetPrototypeOf;

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired$3 = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    setPrototypeOf$4 &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    isCallable$8(NewTarget = dummy.constructor) &&
	    NewTarget !== Wrapper &&
	    isObject$e(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) setPrototypeOf$4($this, NewTargetPrototype);
	  return $this;
	};

	var $$q = _export;
	var global$G = global$19;
	var uncurryThis$q = functionUncurryThis;
	var isForced$2 = isForced_1;
	var redefine$7 = redefine$c.exports;
	var InternalMetadataModule = internalMetadata.exports;
	var iterate$2 = iterate$3;
	var anInstance$4 = anInstance$5;
	var isCallable$7 = isCallable$o;
	var isObject$d = isObject$m;
	var fails$s = fails$E;
	var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration$4;
	var setToStringTag$5 = setToStringTag$8;
	var inheritIfRequired$2 = inheritIfRequired$3;

	var collection$2 = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global$G[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var uncurriedNativeMethod = uncurryThis$q(NativePrototype[KEY]);
	    redefine$7(NativePrototype, KEY,
	      KEY == 'add' ? function add(value) {
	        uncurriedNativeMethod(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY == 'delete' ? function (key) {
	        return IS_WEAK && !isObject$d(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : KEY == 'get' ? function get(key) {
	        return IS_WEAK && !isObject$d(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : KEY == 'has' ? function has(key) {
	        return IS_WEAK && !isObject$d(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };

	  var REPLACE = isForced$2(
	    CONSTRUCTOR_NAME,
	    !isCallable$7(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$s(function () {
	      new NativeConstructor().entries().next();
	    }))
	  );

	  if (REPLACE) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    InternalMetadataModule.enable();
	  } else if (isForced$2(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails$s(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new -- required for testing
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$2(function (iterable) { new NativeConstructor(iterable); });
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails$s(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance$4(dummy, NativePrototype);
	        var that = inheritIfRequired$2(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate$2(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
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
	  $$q({ global: true, forced: Constructor != NativeConstructor }, exported);

	  setToStringTag$5(Constructor, CONSTRUCTOR_NAME);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};

	var redefine$6 = redefine$c.exports;

	var redefineAll$3 = function (target, src, options) {
	  for (var key in src) redefine$6(target, key, src[key], options);
	  return target;
	};

	var getBuiltIn$3 = getBuiltIn$9;
	var definePropertyModule$2 = objectDefineProperty;
	var wellKnownSymbol$f = wellKnownSymbol$r;
	var DESCRIPTORS$b = descriptors;

	var SPECIES$6 = wellKnownSymbol$f('species');

	var setSpecies$4 = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn$3(CONSTRUCTOR_NAME);
	  var defineProperty = definePropertyModule$2.f;

	  if (DESCRIPTORS$b && Constructor && !Constructor[SPECIES$6]) {
	    defineProperty(Constructor, SPECIES$6, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var defineProperty$6 = objectDefineProperty.f;
	var create$3 = objectCreate;
	var redefineAll$2 = redefineAll$3;
	var bind$7 = functionBindContext;
	var anInstance$3 = anInstance$5;
	var iterate$1 = iterate$3;
	var defineIterator = defineIterator$3;
	var setSpecies$3 = setSpecies$4;
	var DESCRIPTORS$a = descriptors;
	var fastKey = internalMetadata.exports.fastKey;
	var InternalStateModule$4 = internalState;

	var setInternalState$4 = InternalStateModule$4.set;
	var internalStateGetterFor = InternalStateModule$4.getterFor;

	var collectionStrong$2 = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var Constructor = wrapper(function (that, iterable) {
	      anInstance$3(that, Prototype);
	      setInternalState$4(that, {
	        type: CONSTRUCTOR_NAME,
	        index: create$3(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!DESCRIPTORS$a) that.size = 0;
	      if (iterable != undefined) iterate$1(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	    });

	    var Prototype = Constructor.prototype;

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
	        if (DESCRIPTORS$a) state.size++;
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

	    redefineAll$2(Prototype, {
	      // `{ Map, Set }.prototype.clear()` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.clear
	      // https://tc39.es/ecma262/#sec-set.prototype.clear
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
	        if (DESCRIPTORS$a) state.size = 0;
	        else that.size = 0;
	      },
	      // `{ Map, Set }.prototype.delete(key)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.delete
	      // https://tc39.es/ecma262/#sec-set.prototype.delete
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
	          if (DESCRIPTORS$a) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.foreach
	      // https://tc39.es/ecma262/#sec-set.prototype.foreach
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        var state = getInternalState(this);
	        var boundFunction = bind$7(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          // revert to the last existing entry
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // `{ Map, Set}.prototype.has(key)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.has
	      // https://tc39.es/ecma262/#sec-set.prototype.has
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });

	    redefineAll$2(Prototype, IS_MAP ? {
	      // `Map.prototype.get(key)` method
	      // https://tc39.es/ecma262/#sec-map.prototype.get
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // `Map.prototype.set(key, value)` method
	      // https://tc39.es/ecma262/#sec-map.prototype.set
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // `Set.prototype.add(value)` method
	      // https://tc39.es/ecma262/#sec-set.prototype.add
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (DESCRIPTORS$a) defineProperty$6(Prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return Constructor;
	  },
	  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
	    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
	    // https://tc39.es/ecma262/#sec-map.prototype.entries
	    // https://tc39.es/ecma262/#sec-map.prototype.keys
	    // https://tc39.es/ecma262/#sec-map.prototype.values
	    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
	    // https://tc39.es/ecma262/#sec-set.prototype.entries
	    // https://tc39.es/ecma262/#sec-set.prototype.keys
	    // https://tc39.es/ecma262/#sec-set.prototype.values
	    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
	    defineIterator(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$4(this, {
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

	    // `{ Map, Set }.prototype[@@species]` accessors
	    // https://tc39.es/ecma262/#sec-get-map-@@species
	    // https://tc39.es/ecma262/#sec-get-set-@@species
	    setSpecies$3(CONSTRUCTOR_NAME);
	  }
	};

	var collection$1 = collection$2;
	var collectionStrong$1 = collectionStrong$2;

	// `Set` constructor
	// https://tc39.es/ecma262/#sec-set-objects
	collection$1('Set', function (init) {
	  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong$1);

	var classof$5 = classofRaw$1;

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es/no-array-isarray -- safe
	var isArray$4 = Array.isArray || function isArray(argument) {
	  return classof$5(argument) == 'Array';
	};

	var global$F = global$19;
	var isArray$3 = isArray$4;
	var isConstructor$2 = isConstructor$4;
	var isObject$c = isObject$m;
	var wellKnownSymbol$e = wellKnownSymbol$r;

	var SPECIES$5 = wellKnownSymbol$e('species');
	var Array$5 = global$F.Array;

	// a part of `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesConstructor$1 = function (originalArray) {
	  var C;
	  if (isArray$3(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (isConstructor$2(C) && (C === Array$5 || isArray$3(C.prototype))) C = undefined;
	    else if (isObject$c(C)) {
	      C = C[SPECIES$5];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? Array$5 : C;
	};

	var arraySpeciesConstructor = arraySpeciesConstructor$1;

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate$3 = function (originalArray, length) {
	  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
	};

	var bind$6 = functionBindContext;
	var uncurryThis$p = functionUncurryThis;
	var IndexedObject$2 = indexedObject;
	var toObject$c = toObject$g;
	var lengthOfArrayLike$a = lengthOfArrayLike$f;
	var arraySpeciesCreate$2 = arraySpeciesCreate$3;

	var push$5 = uncurryThis$p([].push);

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
	var createMethod$2 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var IS_FILTER_REJECT = TYPE == 7;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject$c($this);
	    var self = IndexedObject$2(O);
	    var boundFunction = bind$6(callbackfn, that);
	    var length = lengthOfArrayLike$a(self);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate$2;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
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
	          case 2: push$5(target, value);      // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push$5(target, value);      // filterReject
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$2(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod$2(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod$2(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod$2(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod$2(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod$2(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$2(6),
	  // `Array.prototype.filterReject` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterReject: createMethod$2(7)
	};

	var fails$r = fails$E;
	var wellKnownSymbol$d = wellKnownSymbol$r;
	var V8_VERSION$2 = engineV8Version;

	var SPECIES$4 = wellKnownSymbol$d('species');

	var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return V8_VERSION$2 >= 51 || !fails$r(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$4] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var $$p = _export;
	var $map$1 = arrayIteration.map;
	var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;

	var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$4('map');

	// `Array.prototype.map` method
	// https://tc39.es/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	$$p({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
	  map: function map(callbackfn /* , thisArg */) {
	    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var fails$q = fails$E;

	var arrayMethodIsStrict$4 = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails$q(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $forEach$2 = arrayIteration.forEach;
	var arrayMethodIsStrict$3 = arrayMethodIsStrict$4;

	var STRICT_METHOD$3 = arrayMethodIsStrict$3('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	} : [].forEach;

	var global$E = global$19;
	var DOMIterables = domIterables;
	var DOMTokenListPrototype = domTokenListPrototype;
	var forEach$1 = arrayForEach;
	var createNonEnumerableProperty$5 = createNonEnumerableProperty$b;

	var handlePrototype = function (CollectionPrototype) {
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== forEach$1) try {
	    createNonEnumerableProperty$5(CollectionPrototype, 'forEach', forEach$1);
	  } catch (error) {
	    CollectionPrototype.forEach = forEach$1;
	  }
	};

	for (var COLLECTION_NAME in DOMIterables) {
	  if (DOMIterables[COLLECTION_NAME]) {
	    handlePrototype(global$E[COLLECTION_NAME] && global$E[COLLECTION_NAME].prototype);
	  }
	}

	handlePrototype(DOMTokenListPrototype);

	var findForm = function findForm(element) {
	  var parent = element.parentElement;

	  if (!parent) {
	    return null;
	  }

	  if (parent.tagName === "FORM") {
	    return parent;
	  }

	  return findForm(parent);
	};

	var unique = function unique(values) {
	  return Array.from(new Set(values).values());
	};

	// eslint-disable-line @typescript-eslint/no-explicit-any
	var autoInitFileForms = function autoInitFileForms() {
	  var initUploadFields = window.initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

	  var forms = unique(Array.from(document.querySelectorAll(".dff-uploader")).map(findForm));
	  forms.forEach(initUploadFields);
	};

	var $$o = _export;
	var toObject$b = toObject$g;
	var nativeKeys = objectKeys$2;
	var fails$p = fails$E;

	var FAILS_ON_PRIMITIVES$2 = fails$p(function () { nativeKeys(1); });

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	$$o({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
	  keys: function keys(it) {
	    return nativeKeys(toObject$b(it));
	  }
	});

	var FunctionPrototype$1 = Function.prototype;
	var apply$8 = FunctionPrototype$1.apply;
	var bind$5 = FunctionPrototype$1.bind;
	var call$a = FunctionPrototype$1.call;

	// eslint-disable-next-line es/no-reflect -- safe
	var functionApply = typeof Reflect == 'object' && Reflect.apply || (bind$5 ? call$a.bind(apply$8) : function () {
	  return call$a.apply(apply$8, arguments);
	});

	var uncurryThis$o = functionUncurryThis;

	var arraySlice$8 = uncurryThis$o([].slice);

	var wellKnownSymbolWrapped = {};

	var wellKnownSymbol$c = wellKnownSymbol$r;

	wellKnownSymbolWrapped.f = wellKnownSymbol$c;

	var global$D = global$19;

	var path$3 = global$D;

	var path$2 = path$3;
	var hasOwn$7 = hasOwnProperty_1;
	var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
	var defineProperty$5 = objectDefineProperty.f;

	var defineWellKnownSymbol$4 = function (NAME) {
	  var Symbol = path$2.Symbol || (path$2.Symbol = {});
	  if (!hasOwn$7(Symbol, NAME)) defineProperty$5(Symbol, NAME, {
	    value: wrappedWellKnownSymbolModule$1.f(NAME)
	  });
	};

	var $$n = _export;
	var global$C = global$19;
	var getBuiltIn$2 = getBuiltIn$9;
	var apply$7 = functionApply;
	var call$9 = functionCall;
	var uncurryThis$n = functionUncurryThis;
	var DESCRIPTORS$9 = descriptors;
	var NATIVE_SYMBOL$1 = nativeSymbol;
	var fails$o = fails$E;
	var hasOwn$6 = hasOwnProperty_1;
	var isArray$2 = isArray$4;
	var isCallable$6 = isCallable$o;
	var isObject$b = isObject$m;
	var isPrototypeOf$5 = objectIsPrototypeOf;
	var isSymbol$1 = isSymbol$4;
	var anObject$9 = anObject$j;
	var toObject$a = toObject$g;
	var toIndexedObject$5 = toIndexedObject$c;
	var toPropertyKey$1 = toPropertyKey$5;
	var $toString$1 = toString$f;
	var createPropertyDescriptor$1 = createPropertyDescriptor$6;
	var nativeObjectCreate = objectCreate;
	var objectKeys = objectKeys$2;
	var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
	var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
	var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
	var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;
	var definePropertyModule$1 = objectDefineProperty;
	var propertyIsEnumerableModule = objectPropertyIsEnumerable;
	var arraySlice$7 = arraySlice$8;
	var redefine$5 = redefine$c.exports;
	var shared$1 = shared$5.exports;
	var sharedKey = sharedKey$4;
	var hiddenKeys = hiddenKeys$6;
	var uid$1 = uid$5;
	var wellKnownSymbol$b = wellKnownSymbol$r;
	var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
	var defineWellKnownSymbol$3 = defineWellKnownSymbol$4;
	var setToStringTag$4 = setToStringTag$8;
	var InternalStateModule$3 = internalState;
	var $forEach$1 = arrayIteration.forEach;

	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE$1 = 'prototype';
	var TO_PRIMITIVE = wellKnownSymbol$b('toPrimitive');

	var setInternalState$3 = InternalStateModule$3.set;
	var getInternalState$4 = InternalStateModule$3.getterFor(SYMBOL);

	var ObjectPrototype$3 = Object[PROTOTYPE$1];
	var $Symbol = global$C.Symbol;
	var SymbolPrototype$1 = $Symbol && $Symbol[PROTOTYPE$1];
	var TypeError$9 = global$C.TypeError;
	var QObject = global$C.QObject;
	var $stringify = getBuiltIn$2('JSON', 'stringify');
	var nativeGetOwnPropertyDescriptor$2 = getOwnPropertyDescriptorModule$2.f;
	var nativeDefineProperty$1 = definePropertyModule$1.f;
	var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
	var push$4 = uncurryThis$n([].push);

	var AllSymbols = shared$1('symbols');
	var ObjectPrototypeSymbols = shared$1('op-symbols');
	var StringToSymbolRegistry = shared$1('string-to-symbol-registry');
	var SymbolToStringRegistry = shared$1('symbol-to-string-registry');
	var WellKnownSymbolsStore = shared$1('wks');

	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDescriptor = DESCRIPTORS$9 && fails$o(function () {
	  return nativeObjectCreate(nativeDefineProperty$1({}, 'a', {
	    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$2(ObjectPrototype$3, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype$3[P];
	  nativeDefineProperty$1(O, P, Attributes);
	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$3) {
	    nativeDefineProperty$1(ObjectPrototype$3, P, ObjectPrototypeDescriptor);
	  }
	} : nativeDefineProperty$1;

	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype$1);
	  setInternalState$3(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!DESCRIPTORS$9) symbol.description = description;
	  return symbol;
	};

	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype$3) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject$9(O);
	  var key = toPropertyKey$1(P);
	  anObject$9(Attributes);
	  if (hasOwn$6(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!hasOwn$6(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor$1(1, {}));
	      O[HIDDEN][key] = true;
	    } else {
	      if (hasOwn$6(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor$1(0, false) });
	    } return setSymbolDescriptor(O, key, Attributes);
	  } return nativeDefineProperty$1(O, key, Attributes);
	};

	var $defineProperties = function defineProperties(O, Properties) {
	  anObject$9(O);
	  var properties = toIndexedObject$5(Properties);
	  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
	  $forEach$1(keys, function (key) {
	    if (!DESCRIPTORS$9 || call$9($propertyIsEnumerable, properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};

	var $create = function create(O, Properties) {
	  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
	};

	var $propertyIsEnumerable = function propertyIsEnumerable(V) {
	  var P = toPropertyKey$1(V);
	  var enumerable = call$9(nativePropertyIsEnumerable, this, P);
	  if (this === ObjectPrototype$3 && hasOwn$6(AllSymbols, P) && !hasOwn$6(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !hasOwn$6(this, P) || !hasOwn$6(AllSymbols, P) || hasOwn$6(this, HIDDEN) && this[HIDDEN][P]
	    ? enumerable : true;
	};

	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject$5(O);
	  var key = toPropertyKey$1(P);
	  if (it === ObjectPrototype$3 && hasOwn$6(AllSymbols, key) && !hasOwn$6(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor$2(it, key);
	  if (descriptor && hasOwn$6(AllSymbols, key) && !(hasOwn$6(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }
	  return descriptor;
	};

	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames(toIndexedObject$5(O));
	  var result = [];
	  $forEach$1(names, function (key) {
	    if (!hasOwn$6(AllSymbols, key) && !hasOwn$6(hiddenKeys, key)) push$4(result, key);
	  });
	  return result;
	};

	var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$3;
	  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$5(O));
	  var result = [];
	  $forEach$1(names, function (key) {
	    if (hasOwn$6(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn$6(ObjectPrototype$3, key))) {
	      push$4(result, AllSymbols[key]);
	    }
	  });
	  return result;
	};

	// `Symbol` constructor
	// https://tc39.es/ecma262/#sec-symbol-constructor
	if (!NATIVE_SYMBOL$1) {
	  $Symbol = function Symbol() {
	    if (isPrototypeOf$5(SymbolPrototype$1, this)) throw TypeError$9('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString$1(arguments[0]);
	    var tag = uid$1(description);
	    var setter = function (value) {
	      if (this === ObjectPrototype$3) call$9(setter, ObjectPrototypeSymbols, value);
	      if (hasOwn$6(this, HIDDEN) && hasOwn$6(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDescriptor(this, tag, createPropertyDescriptor$1(1, value));
	    };
	    if (DESCRIPTORS$9 && USE_SETTER) setSymbolDescriptor(ObjectPrototype$3, tag, { configurable: true, set: setter });
	    return wrap(tag, description);
	  };

	  SymbolPrototype$1 = $Symbol[PROTOTYPE$1];

	  redefine$5(SymbolPrototype$1, 'toString', function toString() {
	    return getInternalState$4(this).tag;
	  });

	  redefine$5($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid$1(description), description);
	  });

	  propertyIsEnumerableModule.f = $propertyIsEnumerable;
	  definePropertyModule$1.f = $defineProperty;
	  getOwnPropertyDescriptorModule$2.f = $getOwnPropertyDescriptor;
	  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

	  wrappedWellKnownSymbolModule.f = function (name) {
	    return wrap(wellKnownSymbol$b(name), name);
	  };

	  if (DESCRIPTORS$9) {
	    // https://github.com/tc39/proposal-Symbol-description
	    nativeDefineProperty$1(SymbolPrototype$1, 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState$4(this).description;
	      }
	    });
	    {
	      redefine$5(ObjectPrototype$3, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
	    }
	  }
	}

	$$n({ global: true, wrap: true, forced: !NATIVE_SYMBOL$1, sham: !NATIVE_SYMBOL$1 }, {
	  Symbol: $Symbol
	});

	$forEach$1(objectKeys(WellKnownSymbolsStore), function (name) {
	  defineWellKnownSymbol$3(name);
	});

	$$n({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL$1 }, {
	  // `Symbol.for` method
	  // https://tc39.es/ecma262/#sec-symbol.for
	  'for': function (key) {
	    var string = $toString$1(key);
	    if (hasOwn$6(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = $Symbol(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry[symbol] = string;
	    return symbol;
	  },
	  // `Symbol.keyFor` method
	  // https://tc39.es/ecma262/#sec-symbol.keyfor
	  keyFor: function keyFor(sym) {
	    if (!isSymbol$1(sym)) throw TypeError$9(sym + ' is not a symbol');
	    if (hasOwn$6(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  },
	  useSetter: function () { USE_SETTER = true; },
	  useSimple: function () { USE_SETTER = false; }
	});

	$$n({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$1, sham: !DESCRIPTORS$9 }, {
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

	$$n({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$1 }, {
	  // `Object.getOwnPropertyNames` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertynames
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // `Object.getOwnPropertySymbols` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	$$n({ target: 'Object', stat: true, forced: fails$o(function () { getOwnPropertySymbolsModule.f(1); }) }, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    return getOwnPropertySymbolsModule.f(toObject$a(it));
	  }
	});

	// `JSON.stringify` method behavior with symbols
	// https://tc39.es/ecma262/#sec-json.stringify
	if ($stringify) {
	  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL$1 || fails$o(function () {
	    var symbol = $Symbol();
	    // MS Edge converts symbol values to JSON as {}
	    return $stringify([symbol]) != '[null]'
	      // WebKit converts symbol values to JSON as null
	      || $stringify({ a: symbol }) != '{}'
	      // V8 throws on boxed symbols
	      || $stringify(Object(symbol)) != '{}';
	  });

	  $$n({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
	    // eslint-disable-next-line no-unused-vars -- required for `.length`
	    stringify: function stringify(it, replacer, space) {
	      var args = arraySlice$7(arguments);
	      var $replacer = replacer;
	      if (!isObject$b(replacer) && it === undefined || isSymbol$1(it)) return; // IE8 returns string on undefined
	      if (!isArray$2(replacer)) replacer = function (key, value) {
	        if (isCallable$6($replacer)) value = call$9($replacer, this, key, value);
	        if (!isSymbol$1(value)) return value;
	      };
	      args[1] = replacer;
	      return apply$7($stringify, null, args);
	    }
	  });
	}

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	if (!SymbolPrototype$1[TO_PRIMITIVE]) {
	  var valueOf = SymbolPrototype$1.valueOf;
	  // eslint-disable-next-line no-unused-vars -- required for .length
	  redefine$5(SymbolPrototype$1, TO_PRIMITIVE, function (hint) {
	    // TODO: improve hint logic
	    return call$9(valueOf, this);
	  });
	}
	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag$4($Symbol, SYMBOL);

	hiddenKeys[HIDDEN] = true;

	var $$m = _export;
	var $filter$1 = arrayIteration.filter;
	var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;

	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$3('filter');

	// `Array.prototype.filter` method
	// https://tc39.es/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	$$m({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var $$l = _export;
	var fails$n = fails$E;
	var toIndexedObject$4 = toIndexedObject$c;
	var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var DESCRIPTORS$8 = descriptors;

	var FAILS_ON_PRIMITIVES$1 = fails$n(function () { nativeGetOwnPropertyDescriptor$1(1); });
	var FORCED$b = !DESCRIPTORS$8 || FAILS_ON_PRIMITIVES$1;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	$$l({ target: 'Object', stat: true, forced: FORCED$b, sham: !DESCRIPTORS$8 }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
	    return nativeGetOwnPropertyDescriptor$1(toIndexedObject$4(it), key);
	  }
	});

	var $$k = _export;
	var DESCRIPTORS$7 = descriptors;
	var ownKeys$6 = ownKeys$8;
	var toIndexedObject$3 = toIndexedObject$c;
	var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;
	var createProperty$3 = createProperty$6;

	// `Object.getOwnPropertyDescriptors` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	$$k({ target: 'Object', stat: true, sham: !DESCRIPTORS$7 }, {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
	    var O = toIndexedObject$3(object);
	    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$1.f;
	    var keys = ownKeys$6(O);
	    var result = {};
	    var index = 0;
	    var key, descriptor;
	    while (keys.length > index) {
	      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
	      if (descriptor !== undefined) createProperty$3(result, key, descriptor);
	    }
	    return result;
	  }
	});

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

	var $$j = _export;
	var global$B = global$19;
	var fails$m = fails$E;
	var isArray$1 = isArray$4;
	var isObject$a = isObject$m;
	var toObject$9 = toObject$g;
	var lengthOfArrayLike$9 = lengthOfArrayLike$f;
	var createProperty$2 = createProperty$6;
	var arraySpeciesCreate$1 = arraySpeciesCreate$3;
	var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;
	var wellKnownSymbol$a = wellKnownSymbol$r;
	var V8_VERSION$1 = engineV8Version;

	var IS_CONCAT_SPREADABLE = wellKnownSymbol$a('isConcatSpreadable');
	var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';
	var TypeError$8 = global$B.TypeError;

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$m(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$2('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject$a(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray$1(O);
	};

	var FORCED$a = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.es/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	$$j({ target: 'Array', proto: true, forced: FORCED$a }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  concat: function concat(arg) {
	    var O = toObject$9(this);
	    var A = arraySpeciesCreate$1(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = lengthOfArrayLike$9(E);
	        if (n + len > MAX_SAFE_INTEGER$1) throw TypeError$8(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty$2(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER$1) throw TypeError$8(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty$2(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var isObject$9 = isObject$m;
	var classof$4 = classofRaw$1;
	var wellKnownSymbol$9 = wellKnownSymbol$r;

	var MATCH$2 = wellKnownSymbol$9('match');

	// `IsRegExp` abstract operation
	// https://tc39.es/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject$9(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classof$4(it) == 'RegExp');
	};

	var global$A = global$19;
	var isRegExp$2 = isRegexp;

	var TypeError$7 = global$A.TypeError;

	var notARegexp = function (it) {
	  if (isRegExp$2(it)) {
	    throw TypeError$7("The method doesn't accept regular expressions");
	  } return it;
	};

	var wellKnownSymbol$8 = wellKnownSymbol$r;

	var MATCH$1 = wellKnownSymbol$8('match');

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

	var $$i = _export;
	var uncurryThis$m = functionUncurryThis;
	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var toLength$7 = toLength$9;
	var toString$b = toString$f;
	var notARegExp$1 = notARegexp;
	var requireObjectCoercible$6 = requireObjectCoercible$a;
	var correctIsRegExpLogic$1 = correctIsRegexpLogic;

	// eslint-disable-next-line es/no-string-prototype-startswith -- safe
	var un$StartsWith = uncurryThis$m(''.startsWith);
	var stringSlice$7 = uncurryThis$m(''.slice);
	var min$5 = Math.min;

	var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic$1('startsWith');
	// https://github.com/zloirock/core-js/pull/702
	var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor$1(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}();

	// `String.prototype.startsWith` method
	// https://tc39.es/ecma262/#sec-string.prototype.startswith
	$$i({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
	  startsWith: function startsWith(searchString /* , position = 0 */) {
	    var that = toString$b(requireObjectCoercible$6(this));
	    notARegExp$1(searchString);
	    var index = toLength$7(min$5(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = toString$b(searchString);
	    return un$StartsWith
	      ? un$StartsWith(that, search, index)
	      : stringSlice$7(that, index, index + search.length) === search;
	  }
	});

	var DESCRIPTORS$6 = descriptors;
	var FUNCTION_NAME_EXISTS = functionName.EXISTS;
	var uncurryThis$l = functionUncurryThis;
	var defineProperty$4 = objectDefineProperty.f;

	var FunctionPrototype = Function.prototype;
	var functionToString = uncurryThis$l(FunctionPrototype.toString);
	var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
	var regExpExec$2 = uncurryThis$l(nameRE.exec);
	var NAME$1 = 'name';

	// Function instances `.name` property
	// https://tc39.es/ecma262/#sec-function-instances-name
	if (DESCRIPTORS$6 && !FUNCTION_NAME_EXISTS) {
	  defineProperty$4(FunctionPrototype, NAME$1, {
	    configurable: true,
	    get: function () {
	      try {
	        return regExpExec$2(nameRE, functionToString(this))[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

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

	var $$h = _export;
	var DESCRIPTORS$5 = descriptors;
	var global$z = global$19;
	var uncurryThis$k = functionUncurryThis;
	var hasOwn$5 = hasOwnProperty_1;
	var isCallable$5 = isCallable$o;
	var isPrototypeOf$4 = objectIsPrototypeOf;
	var toString$a = toString$f;
	var defineProperty$3 = objectDefineProperty.f;
	var copyConstructorProperties = copyConstructorProperties$2;

	var NativeSymbol = global$z.Symbol;
	var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

	if (DESCRIPTORS$5 && isCallable$5(NativeSymbol) && (!('description' in SymbolPrototype) ||
	  // Safari 12 bug
	  NativeSymbol().description !== undefined
	)) {
	  var EmptyStringDescriptionStore = {};
	  // wrap Symbol constructor for correct work with undefined description
	  var SymbolWrapper = function Symbol() {
	    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString$a(arguments[0]);
	    var result = isPrototypeOf$4(SymbolPrototype, this)
	      ? new NativeSymbol(description)
	      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
	      : description === undefined ? NativeSymbol() : NativeSymbol(description);
	    if (description === '') EmptyStringDescriptionStore[result] = true;
	    return result;
	  };

	  copyConstructorProperties(SymbolWrapper, NativeSymbol);
	  SymbolWrapper.prototype = SymbolPrototype;
	  SymbolPrototype.constructor = SymbolWrapper;

	  var NATIVE_SYMBOL = String(NativeSymbol('test')) == 'Symbol(test)';
	  var symbolToString = uncurryThis$k(SymbolPrototype.toString);
	  var symbolValueOf = uncurryThis$k(SymbolPrototype.valueOf);
	  var regexp = /^Symbol\((.*)\)[^)]+$/;
	  var replace$4 = uncurryThis$k(''.replace);
	  var stringSlice$6 = uncurryThis$k(''.slice);

	  defineProperty$3(SymbolPrototype, 'description', {
	    configurable: true,
	    get: function description() {
	      var symbol = symbolValueOf(this);
	      var string = symbolToString(symbol);
	      if (hasOwn$5(EmptyStringDescriptionStore, symbol)) return '';
	      var desc = NATIVE_SYMBOL ? stringSlice$6(string, 7, -1) : replace$4(string, regexp, '$1');
	      return desc === '' ? undefined : desc;
	    }
	  });

	  $$h({ global: true, forced: true }, {
	    Symbol: SymbolWrapper
	  });
	}

	var defineWellKnownSymbol$2 = defineWellKnownSymbol$4;

	// `Symbol.iterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.iterator
	defineWellKnownSymbol$2('iterator');

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
	}

	var $$g = _export;
	var global$y = global$19;
	var isArray = isArray$4;
	var isConstructor$1 = isConstructor$4;
	var isObject$8 = isObject$m;
	var toAbsoluteIndex$4 = toAbsoluteIndex$7;
	var lengthOfArrayLike$8 = lengthOfArrayLike$f;
	var toIndexedObject$2 = toIndexedObject$c;
	var createProperty$1 = createProperty$6;
	var wellKnownSymbol$7 = wellKnownSymbol$r;
	var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;
	var un$Slice = arraySlice$8;

	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');

	var SPECIES$3 = wellKnownSymbol$7('species');
	var Array$4 = global$y.Array;
	var max$2 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	$$g({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject$2(this);
	    var length = lengthOfArrayLike$8(O);
	    var k = toAbsoluteIndex$4(start, length);
	    var fin = toAbsoluteIndex$4(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (isConstructor$1(Constructor) && (Constructor === Array$4 || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject$8(Constructor)) {
	        Constructor = Constructor[SPECIES$3];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array$4 || Constructor === undefined) {
	        return un$Slice(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array$4 : Constructor)(max$2(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$1(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var anObject$8 = anObject$j;

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags$1 = function () {
	  var that = anObject$8(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	var fails$l = fails$E;
	var global$x = global$19;

	// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	var $RegExp$2 = global$x.RegExp;

	var UNSUPPORTED_Y$3 = fails$l(function () {
	  var re = $RegExp$2('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	// UC Browser bug
	// https://github.com/zloirock/core-js/issues/1008
	var MISSED_STICKY$1 = UNSUPPORTED_Y$3 || fails$l(function () {
	  return !$RegExp$2('a', 'y').sticky;
	});

	var BROKEN_CARET = UNSUPPORTED_Y$3 || fails$l(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = $RegExp$2('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
	  BROKEN_CARET: BROKEN_CARET,
	  MISSED_STICKY: MISSED_STICKY$1,
	  UNSUPPORTED_Y: UNSUPPORTED_Y$3
	};

	var fails$k = fails$E;
	var global$w = global$19;

	// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
	var $RegExp$1 = global$w.RegExp;

	var regexpUnsupportedDotAll = fails$k(function () {
	  var re = $RegExp$1('.', 's');
	  return !(re.dotAll && re.exec('\n') && re.flags === 's');
	});

	var fails$j = fails$E;
	var global$v = global$19;

	// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
	var $RegExp = global$v.RegExp;

	var regexpUnsupportedNcg = fails$j(function () {
	  var re = $RegExp('(?<a>b)', 'g');
	  return re.exec('b').groups.a !== 'b' ||
	    'b'.replace(re, '$<a>c') !== 'bc';
	});

	/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
	/* eslint-disable regexp/no-useless-quantifier -- testing */
	var call$8 = functionCall;
	var uncurryThis$j = functionUncurryThis;
	var toString$9 = toString$f;
	var regexpFlags = regexpFlags$1;
	var stickyHelpers$2 = regexpStickyHelpers;
	var shared = shared$5.exports;
	var create$2 = objectCreate;
	var getInternalState$3 = internalState.get;
	var UNSUPPORTED_DOT_ALL$1 = regexpUnsupportedDotAll;
	var UNSUPPORTED_NCG$1 = regexpUnsupportedNcg;

	var nativeReplace = shared('native-string-replace', String.prototype.replace);
	var nativeExec = RegExp.prototype.exec;
	var patchedExec = nativeExec;
	var charAt$3 = uncurryThis$j(''.charAt);
	var indexOf = uncurryThis$j(''.indexOf);
	var replace$3 = uncurryThis$j(''.replace);
	var stringSlice$5 = uncurryThis$j(''.slice);

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  call$8(nativeExec, re1, 'a');
	  call$8(nativeExec, re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$2 = stickyHelpers$2.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2 || UNSUPPORTED_DOT_ALL$1 || UNSUPPORTED_NCG$1;

	if (PATCH) {
	  patchedExec = function exec(string) {
	    var re = this;
	    var state = getInternalState$3(re);
	    var str = toString$9(string);
	    var raw = state.raw;
	    var result, reCopy, lastIndex, match, i, object, group;

	    if (raw) {
	      raw.lastIndex = re.lastIndex;
	      result = call$8(patchedExec, raw, str);
	      re.lastIndex = raw.lastIndex;
	      return result;
	    }

	    var groups = state.groups;
	    var sticky = UNSUPPORTED_Y$2 && re.sticky;
	    var flags = call$8(regexpFlags, re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = replace$3(flags, 'y', '');
	      if (indexOf(flags, 'g') === -1) {
	        flags += 'g';
	      }

	      strCopy = stringSlice$5(str, re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$3(str, re.lastIndex - 1) !== '\n')) {
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

	    match = call$8(nativeExec, sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = stringSlice$5(match.input, charsAdded);
	        match[0] = stringSlice$5(match[0], charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      call$8(nativeReplace, match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    if (match && groups) {
	      match.groups = object = create$2(null);
	      for (i = 0; i < groups.length; i++) {
	        group = groups[i];
	        object[group[0]] = match[group[1]];
	      }
	    }

	    return match;
	  };
	}

	var regexpExec$3 = patchedExec;

	var $$f = _export;
	var exec$2 = regexpExec$3;

	// `RegExp.prototype.exec` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.exec
	$$f({ target: 'RegExp', proto: true, forced: /./.exec !== exec$2 }, {
	  exec: exec$2
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

	var global$u = global$19;

	var nativePromiseConstructor = global$u.Promise;

	var global$t = global$19;
	var isConstructor = isConstructor$4;
	var tryToString$1 = tryToString$5;

	var TypeError$6 = global$t.TypeError;

	// `Assert: IsConstructor(argument) is true`
	var aConstructor$3 = function (argument) {
	  if (isConstructor(argument)) return argument;
	  throw TypeError$6(tryToString$1(argument) + ' is not a constructor');
	};

	var anObject$7 = anObject$j;
	var aConstructor$2 = aConstructor$3;
	var wellKnownSymbol$6 = wellKnownSymbol$r;

	var SPECIES$2 = wellKnownSymbol$6('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-speciesconstructor
	var speciesConstructor$3 = function (O, defaultConstructor) {
	  var C = anObject$7(O).constructor;
	  var S;
	  return C === undefined || (S = anObject$7(C)[SPECIES$2]) == undefined ? defaultConstructor : aConstructor$2(S);
	};

	var userAgent$4 = engineUserAgent;

	var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent$4);

	var classof$3 = classofRaw$1;
	var global$s = global$19;

	var engineIsNode = classof$3(global$s.process) == 'process';

	var global$r = global$19;
	var apply$6 = functionApply;
	var bind$4 = functionBindContext;
	var isCallable$4 = isCallable$o;
	var hasOwn$4 = hasOwnProperty_1;
	var fails$i = fails$E;
	var html = html$2;
	var arraySlice$6 = arraySlice$8;
	var createElement = documentCreateElement$2;
	var IS_IOS$1 = engineIsIos;
	var IS_NODE$2 = engineIsNode;

	var set$2 = global$r.setImmediate;
	var clear = global$r.clearImmediate;
	var process$2 = global$r.process;
	var Dispatch = global$r.Dispatch;
	var Function$2 = global$r.Function;
	var MessageChannel = global$r.MessageChannel;
	var String$2 = global$r.String;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var location, defer, channel, port;

	try {
	  // Deno throws a ReferenceError on `location` access without `--location` flag
	  location = global$r.location;
	} catch (error) { /* empty */ }

	var run = function (id) {
	  if (hasOwn$4(queue, id)) {
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
	  global$r.postMessage(String$2(id), location.protocol + '//' + location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set$2 || !clear) {
	  set$2 = function setImmediate(fn) {
	    var args = arraySlice$6(arguments, 1);
	    queue[++counter] = function () {
	      apply$6(isCallable$4(fn) ? fn : Function$2(fn), undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (IS_NODE$2) {
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
	  } else if (MessageChannel && !IS_IOS$1) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = bind$4(port.postMessage, port);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (
	    global$r.addEventListener &&
	    isCallable$4(global$r.postMessage) &&
	    !global$r.importScripts &&
	    location && location.protocol !== 'file:' &&
	    !fails$i(post)
	  ) {
	    defer = post;
	    global$r.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in createElement('script')) {
	    defer = function (id) {
	      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
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

	var userAgent$3 = engineUserAgent;
	var global$q = global$19;

	var engineIsIosPebble = /ipad|iphone|ipod/i.test(userAgent$3) && global$q.Pebble !== undefined;

	var userAgent$2 = engineUserAgent;

	var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$2);

	var global$p = global$19;
	var bind$3 = functionBindContext;
	var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var macrotask = task$1.set;
	var IS_IOS = engineIsIos;
	var IS_IOS_PEBBLE = engineIsIosPebble;
	var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
	var IS_NODE$1 = engineIsNode;

	var MutationObserver = global$p.MutationObserver || global$p.WebKitMutationObserver;
	var document$2 = global$p.document;
	var process$1 = global$p.process;
	var Promise$1 = global$p.Promise;
	// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
	var queueMicrotaskDescriptor = getOwnPropertyDescriptor(global$p, 'queueMicrotask');
	var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

	var flush, head, last, notify$1, toggle, node, promise, then;

	// modern engines have queueMicrotask method
	if (!queueMicrotask) {
	  flush = function () {
	    var parent, fn;
	    if (IS_NODE$1 && (parent = process$1.domain)) parent.exit();
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
	  if (!IS_IOS && !IS_NODE$1 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
	    toggle = true;
	    node = document$2.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify$1 = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (!IS_IOS_PEBBLE && Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise$1.resolve(undefined);
	    // workaround of WebKit ~ iOS Safari 10.1 bug
	    promise.constructor = Promise$1;
	    then = bind$3(promise.then, promise);
	    notify$1 = function () {
	      then(flush);
	    };
	  // Node.js without promises
	  } else if (IS_NODE$1) {
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
	    // strange IE + webpack dev server bug - use .bind(global)
	    macrotask = bind$3(macrotask, global$p);
	    notify$1 = function () {
	      macrotask(flush);
	    };
	  }
	}

	var microtask$1 = queueMicrotask || function (fn) {
	  var task = { fn: fn, next: undefined };
	  if (last) last.next = task;
	  if (!head) {
	    head = task;
	    notify$1();
	  } last = task;
	};

	var newPromiseCapability$2 = {};

	var aCallable$5 = aCallable$9;

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aCallable$5(resolve);
	  this.reject = aCallable$5(reject);
	};

	// `NewPromiseCapability` abstract operation
	// https://tc39.es/ecma262/#sec-newpromisecapability
	newPromiseCapability$2.f = function (C) {
	  return new PromiseCapability(C);
	};

	var anObject$6 = anObject$j;
	var isObject$7 = isObject$m;
	var newPromiseCapability$1 = newPromiseCapability$2;

	var promiseResolve$1 = function (C, x) {
	  anObject$6(C);
	  if (isObject$7(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability$1.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var global$o = global$19;

	var hostReportErrors$1 = function (a, b) {
	  var console = global$o.console;
	  if (console && console.error) {
	    arguments.length == 1 ? console.error(a) : console.error(a, b);
	  }
	};

	var perform$1 = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};

	var engineIsBrowser = typeof window == 'object';

	var $$e = _export;
	var global$n = global$19;
	var getBuiltIn$1 = getBuiltIn$9;
	var call$7 = functionCall;
	var NativePromise = nativePromiseConstructor;
	var redefine$4 = redefine$c.exports;
	var redefineAll$1 = redefineAll$3;
	var setPrototypeOf$3 = objectSetPrototypeOf;
	var setToStringTag$3 = setToStringTag$8;
	var setSpecies$2 = setSpecies$4;
	var aCallable$4 = aCallable$9;
	var isCallable$3 = isCallable$o;
	var isObject$6 = isObject$m;
	var anInstance$2 = anInstance$5;
	var inspectSource = inspectSource$4;
	var iterate = iterate$3;
	var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$4;
	var speciesConstructor$2 = speciesConstructor$3;
	var task = task$1.set;
	var microtask = microtask$1;
	var promiseResolve = promiseResolve$1;
	var hostReportErrors = hostReportErrors$1;
	var newPromiseCapabilityModule = newPromiseCapability$2;
	var perform = perform$1;
	var InternalStateModule$2 = internalState;
	var isForced$1 = isForced_1;
	var wellKnownSymbol$5 = wellKnownSymbol$r;
	var IS_BROWSER = engineIsBrowser;
	var IS_NODE = engineIsNode;
	var V8_VERSION = engineV8Version;

	var SPECIES$1 = wellKnownSymbol$5('species');
	var PROMISE = 'Promise';

	var getInternalState$2 = InternalStateModule$2.getterFor(PROMISE);
	var setInternalState$2 = InternalStateModule$2.set;
	var getInternalPromiseState = InternalStateModule$2.getterFor(PROMISE);
	var NativePromisePrototype = NativePromise && NativePromise.prototype;
	var PromiseConstructor = NativePromise;
	var PromisePrototype = NativePromisePrototype;
	var TypeError$5 = global$n.TypeError;
	var document$1 = global$n.document;
	var process = global$n.process;
	var newPromiseCapability = newPromiseCapabilityModule.f;
	var newGenericPromiseCapability = newPromiseCapability;

	var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$n.dispatchEvent);
	var NATIVE_REJECTION_EVENT = isCallable$3(global$n.PromiseRejectionEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;
	var SUBCLASSING = false;

	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

	var FORCED$9 = isForced$1(PROMISE, function () {
	  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(PromiseConstructor);
	  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(PromiseConstructor);
	  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	  // We can't detect it synchronously, so just check versions
	  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (V8_VERSION >= 51 && /native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) return false;
	  // Detect correctness of subclassing with @@species support
	  var promise = new PromiseConstructor(function (resolve) { resolve(1); });
	  var FakePromise = function (exec) {
	    exec(function () { /* empty */ }, function () { /* empty */ });
	  };
	  var constructor = promise.constructor = {};
	  constructor[SPECIES$1] = FakePromise;
	  SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
	  if (!SUBCLASSING) return true;
	  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	  return !GLOBAL_CORE_JS_PROMISE && IS_BROWSER && !NATIVE_REJECTION_EVENT;
	});

	var INCORRECT_ITERATION = FORCED$9 || !checkCorrectnessOfIteration$1(function (iterable) {
	  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
	});

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject$6(it) && isCallable$3(then = it.then) ? then : false;
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
	            reject(TypeError$5('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            call$7(then, result, resolve, reject);
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
	    global$n.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (!NATIVE_REJECTION_EVENT && (handler = global$n['on' + name])) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (state) {
	  call$7(task, global$n, function () {
	    var promise = state.facade;
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE) {
	          process.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (state) {
	  call$7(task, global$n, function () {
	    var promise = state.facade;
	    if (IS_NODE) {
	      process.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind$2 = function (fn, state, unwrap) {
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
	    if (state.facade === value) throw TypeError$5("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          call$7(then, value,
	            bind$2(internalResolve, wrapper, state),
	            bind$2(internalReject, wrapper, state)
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
	if (FORCED$9) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance$2(this, PromisePrototype);
	    aCallable$4(executor);
	    call$7(Internal, this);
	    var state = getInternalState$2(this);
	    try {
	      executor(bind$2(internalResolve, state), bind$2(internalReject, state));
	    } catch (error) {
	      internalReject(state, error);
	    }
	  };
	  PromisePrototype = PromiseConstructor.prototype;
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  Internal = function Promise(executor) {
	    setInternalState$2(this, {
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
	  Internal.prototype = redefineAll$1(PromisePrototype, {
	    // `Promise.prototype.then` method
	    // https://tc39.es/ecma262/#sec-promise.prototype.then
	    then: function then(onFulfilled, onRejected) {
	      var state = getInternalPromiseState(this);
	      var reactions = state.reactions;
	      var reaction = newPromiseCapability(speciesConstructor$2(this, PromiseConstructor));
	      reaction.ok = isCallable$3(onFulfilled) ? onFulfilled : true;
	      reaction.fail = isCallable$3(onRejected) && onRejected;
	      reaction.domain = IS_NODE ? process.domain : undefined;
	      state.parent = true;
	      reactions[reactions.length] = reaction;
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
	    var state = getInternalState$2(promise);
	    this.promise = promise;
	    this.resolve = bind$2(internalResolve, state);
	    this.reject = bind$2(internalReject, state);
	  };
	  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };

	  if (isCallable$3(NativePromise) && NativePromisePrototype !== Object.prototype) {
	    nativeThen = NativePromisePrototype.then;

	    if (!SUBCLASSING) {
	      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
	      redefine$4(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
	        var that = this;
	        return new PromiseConstructor(function (resolve, reject) {
	          call$7(nativeThen, that, resolve, reject);
	        }).then(onFulfilled, onRejected);
	      // https://github.com/zloirock/core-js/issues/640
	      }, { unsafe: true });

	      // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
	      redefine$4(NativePromisePrototype, 'catch', PromisePrototype['catch'], { unsafe: true });
	    }

	    // make `.constructor === Promise` work for native promise-based APIs
	    try {
	      delete NativePromisePrototype.constructor;
	    } catch (error) { /* empty */ }

	    // make `instanceof Promise` work for native promise-based APIs
	    if (setPrototypeOf$3) {
	      setPrototypeOf$3(NativePromisePrototype, PromisePrototype);
	    }
	  }
	}

	$$e({ global: true, wrap: true, forced: FORCED$9 }, {
	  Promise: PromiseConstructor
	});

	setToStringTag$3(PromiseConstructor, PROMISE, false);
	setSpecies$2(PROMISE);

	PromiseWrapper = getBuiltIn$1(PROMISE);

	// statics
	$$e({ target: PROMISE, stat: true, forced: FORCED$9 }, {
	  // `Promise.reject` method
	  // https://tc39.es/ecma262/#sec-promise.reject
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    call$7(capability.reject, undefined, r);
	    return capability.promise;
	  }
	});

	$$e({ target: PROMISE, stat: true, forced: FORCED$9 }, {
	  // `Promise.resolve` method
	  // https://tc39.es/ecma262/#sec-promise.resolve
	  resolve: function resolve(x) {
	    return promiseResolve(this, x);
	  }
	});

	$$e({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
	  // `Promise.all` method
	  // https://tc39.es/ecma262/#sec-promise.all
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aCallable$4(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        remaining++;
	        call$7($promiseResolve, C, promise).then(function (value) {
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
	      var $promiseResolve = aCallable$4(C.resolve);
	      iterate(iterable, function (promise) {
	        call$7($promiseResolve, C, promise).then(capability.resolve, reject);
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

	var defineWellKnownSymbol$1 = defineWellKnownSymbol$4;

	// `Symbol.asyncIterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.asynciterator
	defineWellKnownSymbol$1('asyncIterator');

	var defineWellKnownSymbol = defineWellKnownSymbol$4;

	// `Symbol.toStringTag` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.tostringtag
	defineWellKnownSymbol('toStringTag');

	var global$m = global$19;
	var setToStringTag$2 = setToStringTag$8;

	// JSON[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-json-@@tostringtag
	setToStringTag$2(global$m.JSON, 'JSON', true);

	var setToStringTag$1 = setToStringTag$8;

	// Math[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-math-@@tostringtag
	setToStringTag$1(Math, 'Math', true);

	var $$d = _export;
	var fails$h = fails$E;
	var toObject$8 = toObject$g;
	var nativeGetPrototypeOf = objectGetPrototypeOf;
	var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

	var FAILS_ON_PRIMITIVES = fails$h(function () { nativeGetPrototypeOf(1); });

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	$$d({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !CORRECT_PROTOTYPE_GETTER }, {
	  getPrototypeOf: function getPrototypeOf(it) {
	    return nativeGetPrototypeOf(toObject$8(it));
	  }
	});

	var $$c = _export;
	var global$l = global$19;

	// `globalThis` object
	// https://tc39.es/ecma262/#sec-globalthis
	$$c({ global: true }, {
	  globalThis: global$l
	});

	var runtime = {exports: {}};

	(function (module) {
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
	    define(IteratorPrototype, iteratorSymbol, function () {
	      return this;
	    });
	    var getProto = Object.getPrototypeOf;
	    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

	    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	      // This environment has a native %IteratorPrototype%; use it instead
	      // of the polyfill.
	      IteratorPrototype = NativeIteratorPrototype;
	    }

	    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
	    GeneratorFunction.prototype = GeneratorFunctionPrototype;
	    define(Gp, "constructor", GeneratorFunctionPrototype);
	    define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
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
	    define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
	      return this;
	    });
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

	    define(Gp, iteratorSymbol, function () {
	      return this;
	    });
	    define(Gp, "toString", function () {
	      return "[object Generator]";
	    });

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
	    // in case runtime.js accidentally runs in strict mode, in modern engines
	    // we can explicitly access globalThis. In older engines we can escape
	    // strict mode using a global Function call. This could conceivably fail
	    // if a Content Security Policy forbids using Function, but in that case
	    // the proper solution is to fix the accidental strict mode problem. If
	    // you've misconfigured your bundler to force strict mode and applied a
	    // CSP to forbid Function, and you're not willing to fix either of those
	    // problems, please detail your unique predicament in a GitHub issue.
	    if ((typeof globalThis === "undefined" ? "undefined" : _typeof$2(globalThis)) === "object") {
	      globalThis.regeneratorRuntime = runtime;
	    } else {
	      Function("r", "regeneratorRuntime = r")(runtime);
	    }
	  }
	})(runtime);

	var regenerator = runtime.exports;

	var uncurryThis$i = functionUncurryThis;

	// `thisNumberValue` abstract operation
	// https://tc39.es/ecma262/#sec-thisnumbervalue
	var thisNumberValue$1 = uncurryThis$i(1.0.valueOf);

	var global$k = global$19;
	var toIntegerOrInfinity$7 = toIntegerOrInfinity$b;
	var toString$8 = toString$f;
	var requireObjectCoercible$5 = requireObjectCoercible$a;

	var RangeError$8 = global$k.RangeError;

	// `String.prototype.repeat` method implementation
	// https://tc39.es/ecma262/#sec-string.prototype.repeat
	var stringRepeat = function repeat(count) {
	  var str = toString$8(requireObjectCoercible$5(this));
	  var result = '';
	  var n = toIntegerOrInfinity$7(count);
	  if (n < 0 || n == Infinity) throw RangeError$8('Wrong number of repetitions');
	  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
	  return result;
	};

	var $$b = _export;
	var global$j = global$19;
	var uncurryThis$h = functionUncurryThis;
	var toIntegerOrInfinity$6 = toIntegerOrInfinity$b;
	var thisNumberValue = thisNumberValue$1;
	var $repeat = stringRepeat;
	var fails$g = fails$E;

	var RangeError$7 = global$j.RangeError;
	var String$1 = global$j.String;
	var floor$5 = Math.floor;
	var repeat$1 = uncurryThis$h($repeat);
	var stringSlice$4 = uncurryThis$h(''.slice);
	var un$ToFixed = uncurryThis$h(1.0.toFixed);

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
	    c2 = floor$5(c2 / 1e7);
	  }
	};

	var divide = function (data, n) {
	  var index = 6;
	  var c = 0;
	  while (--index >= 0) {
	    c += data[index];
	    data[index] = floor$5(c / n);
	    c = (c % n) * 1e7;
	  }
	};

	var dataToString = function (data) {
	  var index = 6;
	  var s = '';
	  while (--index >= 0) {
	    if (s !== '' || index === 0 || data[index] !== 0) {
	      var t = String$1(data[index]);
	      s = s === '' ? t : s + repeat$1('0', 7 - t.length) + t;
	    }
	  } return s;
	};

	var FORCED$8 = fails$g(function () {
	  return un$ToFixed(0.00008, 3) !== '0.000' ||
	    un$ToFixed(0.9, 0) !== '1' ||
	    un$ToFixed(1.255, 2) !== '1.25' ||
	    un$ToFixed(1000000000000000128.0, 0) !== '1000000000000000128';
	}) || !fails$g(function () {
	  // V8 ~ Android 4.3-
	  un$ToFixed({});
	});

	// `Number.prototype.toFixed` method
	// https://tc39.es/ecma262/#sec-number.prototype.tofixed
	$$b({ target: 'Number', proto: true, forced: FORCED$8 }, {
	  toFixed: function toFixed(fractionDigits) {
	    var number = thisNumberValue(this);
	    var fractDigits = toIntegerOrInfinity$6(fractionDigits);
	    var data = [0, 0, 0, 0, 0, 0];
	    var sign = '';
	    var result = '0';
	    var e, z, j, k;

	    if (fractDigits < 0 || fractDigits > 20) throw RangeError$7('Incorrect fraction digits');
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (number != number) return 'NaN';
	    if (number <= -1e21 || number >= 1e21) return String$1(number);
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
	        result = dataToString(data) + repeat$1('0', fractDigits);
	      }
	    }
	    if (fractDigits > 0) {
	      k = result.length;
	      result = sign + (k <= fractDigits
	        ? '0.' + repeat$1('0', fractDigits - k) + result
	        : stringSlice$4(result, 0, k - fractDigits) + '.' + stringSlice$4(result, k - fractDigits));
	    } else {
	      result = sign + result;
	    } return result;
	  }
	});

	var $$a = _export;
	var $find$1 = arrayIteration.find;
	var addToUnscopables$1 = addToUnscopables$3;

	var FIND = 'find';
	var SKIPS_HOLES = true;

	// Shouldn't skip holes
	if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

	// `Array.prototype.find` method
	// https://tc39.es/ecma262/#sec-array.prototype.find
	$$a({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables$1(FIND);

	var $$9 = _export;
	var global$i = global$19;
	var toAbsoluteIndex$3 = toAbsoluteIndex$7;
	var toIntegerOrInfinity$5 = toIntegerOrInfinity$b;
	var lengthOfArrayLike$7 = lengthOfArrayLike$f;
	var toObject$7 = toObject$g;
	var arraySpeciesCreate = arraySpeciesCreate$3;
	var createProperty = createProperty$6;
	var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

	var TypeError$4 = global$i.TypeError;
	var max$1 = Math.max;
	var min$4 = Math.min;
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

	// `Array.prototype.splice` method
	// https://tc39.es/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	$$9({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject$7(this);
	    var len = lengthOfArrayLike$7(O);
	    var actualStart = toAbsoluteIndex$3(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$4(max$1(toIntegerOrInfinity$5(deleteCount), 0), len - actualStart);
	    }
	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
	      throw TypeError$4(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
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

	/**
	 * Module variables.
	 * @private
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
	  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

	  if (_i == null) return;
	  var _arr = [];
	  var _n = true;
	  var _d = false;

	  var _s, _e;

	  try {
	    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
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

	var uncurryThis$g = functionUncurryThis;
	var redefine$3 = redefine$c.exports;
	var regexpExec$2 = regexpExec$3;
	var fails$f = fails$E;
	var wellKnownSymbol$4 = wellKnownSymbol$r;
	var createNonEnumerableProperty$4 = createNonEnumerableProperty$b;

	var SPECIES = wellKnownSymbol$4('species');
	var RegExpPrototype$3 = RegExp.prototype;

	var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
	  var SYMBOL = wellKnownSymbol$4(KEY);

	  var DELEGATES_TO_SYMBOL = !fails$f(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$f(function () {
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
	    FORCED
	  ) {
	    var uncurriedNativeRegExpMethod = uncurryThis$g(/./[SYMBOL]);
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      var uncurriedNativeMethod = uncurryThis$g(nativeMethod);
	      var $exec = regexp.exec;
	      if ($exec === regexpExec$2 || $exec === RegExpPrototype$3.exec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
	        }
	        return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
	      }
	      return { done: false };
	    });

	    redefine$3(String.prototype, KEY, methods[0]);
	    redefine$3(RegExpPrototype$3, SYMBOL, methods[1]);
	  }

	  if (SHAM) createNonEnumerableProperty$4(RegExpPrototype$3[SYMBOL], 'sham', true);
	};

	var charAt$2 = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.es/ecma262/#sec-advancestringindex
	var advanceStringIndex$3 = function (S, index, unicode) {
	  return index + (unicode ? charAt$2(S, index).length : 1);
	};

	var global$h = global$19;
	var call$6 = functionCall;
	var anObject$5 = anObject$j;
	var isCallable$2 = isCallable$o;
	var classof$2 = classofRaw$1;
	var regexpExec$1 = regexpExec$3;

	var TypeError$3 = global$h.TypeError;

	// `RegExpExec` abstract operation
	// https://tc39.es/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (isCallable$2(exec)) {
	    var result = call$6(exec, R, S);
	    if (result !== null) anObject$5(result);
	    return result;
	  }
	  if (classof$2(R) === 'RegExp') return call$6(regexpExec$1, R, S);
	  throw TypeError$3('RegExp#exec called on incompatible receiver');
	};

	var apply$5 = functionApply;
	var call$5 = functionCall;
	var uncurryThis$f = functionUncurryThis;
	var fixRegExpWellKnownSymbolLogic$2 = fixRegexpWellKnownSymbolLogic;
	var isRegExp$1 = isRegexp;
	var anObject$4 = anObject$j;
	var requireObjectCoercible$4 = requireObjectCoercible$a;
	var speciesConstructor$1 = speciesConstructor$3;
	var advanceStringIndex$2 = advanceStringIndex$3;
	var toLength$6 = toLength$9;
	var toString$7 = toString$f;
	var getMethod$2 = getMethod$6;
	var arraySlice$5 = arraySliceSimple;
	var callRegExpExec = regexpExecAbstract;
	var regexpExec = regexpExec$3;
	var stickyHelpers$1 = regexpStickyHelpers;
	var fails$e = fails$E;

	var UNSUPPORTED_Y$1 = stickyHelpers$1.UNSUPPORTED_Y;
	var MAX_UINT32 = 0xFFFFFFFF;
	var min$3 = Math.min;
	var $push = [].push;
	var exec$1 = uncurryThis$f(/./.exec);
	var push$3 = uncurryThis$f($push);
	var stringSlice$3 = uncurryThis$f(''.slice);

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$e(function () {
	  // eslint-disable-next-line regexp/no-empty-group -- required for testing
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	// @@split logic
	fixRegExpWellKnownSymbolLogic$2('split', function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    // eslint-disable-next-line regexp/no-empty-group -- required for testing
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = toString$7(requireObjectCoercible$4(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegExp$1(separator)) {
	        return call$5(nativeSplit, string, separator, lim);
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
	      while (match = call$5(regexpExec, separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          push$3(output, stringSlice$3(string, lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) apply$5($push, output, arraySlice$5(match, 1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !exec$1(separatorCopy, '')) push$3(output, '');
	      } else push$3(output, stringSlice$3(string, lastLastIndex));
	      return output.length > lim ? arraySlice$5(output, 0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : call$5(nativeSplit, this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.es/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible$4(this);
	      var splitter = separator == undefined ? undefined : getMethod$2(separator, SPLIT);
	      return splitter
	        ? call$5(splitter, separator, O, limit)
	        : call$5(internalSplit, toString$7(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (string, limit) {
	      var rx = anObject$4(this);
	      var S = toString$7(string);
	      var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);

	      if (res.done) return res.value;

	      var C = speciesConstructor$1(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (UNSUPPORTED_Y$1 ? 'g' : 'y');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(UNSUPPORTED_Y$1 ? '^(?:' + rx.source + ')' : rx, flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = UNSUPPORTED_Y$1 ? 0 : q;
	        var z = callRegExpExec(splitter, UNSUPPORTED_Y$1 ? stringSlice$3(S, q) : S);
	        var e;
	        if (
	          z === null ||
	          (e = min$3(toLength$6(splitter.lastIndex + (UNSUPPORTED_Y$1 ? q : 0)), S.length)) === p
	        ) {
	          q = advanceStringIndex$2(S, q, unicodeMatching);
	        } else {
	          push$3(A, stringSlice$3(S, p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            push$3(A, z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      push$3(A, stringSlice$3(S, p));
	      return A;
	    }
	  ];
	}, !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y$1);

	// a string of all valid unicode whitespaces
	var whitespaces$2 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
	  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var uncurryThis$e = functionUncurryThis;
	var requireObjectCoercible$3 = requireObjectCoercible$a;
	var toString$6 = toString$f;
	var whitespaces$1 = whitespaces$2;

	var replace$2 = uncurryThis$e(''.replace);
	var whitespace$1 = '[' + whitespaces$1 + ']';
	var ltrim = RegExp('^' + whitespace$1 + whitespace$1 + '*');
	var rtrim = RegExp(whitespace$1 + whitespace$1 + '*$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod$1 = function (TYPE) {
	  return function ($this) {
	    var string = toString$6(requireObjectCoercible$3($this));
	    if (TYPE & 1) string = replace$2(string, ltrim, '');
	    if (TYPE & 2) string = replace$2(string, rtrim, '');
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

	var PROPER_FUNCTION_NAME$3 = functionName.PROPER;
	var fails$d = fails$E;
	var whitespaces = whitespaces$2;

	var non = '\u200B\u0085\u180E';

	// check that a method works with the correct list
	// of whitespaces and has a correct name
	var stringTrimForced = function (METHOD_NAME) {
	  return fails$d(function () {
	    return !!whitespaces[METHOD_NAME]()
	      || non[METHOD_NAME]() !== non
	      || (PROPER_FUNCTION_NAME$3 && whitespaces[METHOD_NAME].name !== METHOD_NAME);
	  });
	};

	var $$8 = _export;
	var $trim = stringTrim.trim;
	var forcedStringTrimMethod$1 = stringTrimForced;

	// `String.prototype.trim` method
	// https://tc39.es/ecma262/#sec-string.prototype.trim
	$$8({ target: 'String', proto: true, forced: forcedStringTrimMethod$1('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	var uncurryThis$d = functionUncurryThis;
	var toObject$6 = toObject$g;

	var floor$4 = Math.floor;
	var charAt$1 = uncurryThis$d(''.charAt);
	var replace$1 = uncurryThis$d(''.replace);
	var stringSlice$2 = uncurryThis$d(''.slice);
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

	// `GetSubstitution` abstract operation
	// https://tc39.es/ecma262/#sec-getsubstitution
	var getSubstitution$1 = function (matched, str, position, captures, namedCaptures, replacement) {
	  var tailPos = position + matched.length;
	  var m = captures.length;
	  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	  if (namedCaptures !== undefined) {
	    namedCaptures = toObject$6(namedCaptures);
	    symbols = SUBSTITUTION_SYMBOLS;
	  }
	  return replace$1(replacement, symbols, function (match, ch) {
	    var capture;
	    switch (charAt$1(ch, 0)) {
	      case '$': return '$';
	      case '&': return matched;
	      case '`': return stringSlice$2(str, 0, position);
	      case "'": return stringSlice$2(str, tailPos);
	      case '<':
	        capture = namedCaptures[stringSlice$2(ch, 1, -1)];
	        break;
	      default: // \d\d?
	        var n = +ch;
	        if (n === 0) return match;
	        if (n > m) {
	          var f = floor$4(n / 10);
	          if (f === 0) return match;
	          if (f <= m) return captures[f - 1] === undefined ? charAt$1(ch, 1) : captures[f - 1] + charAt$1(ch, 1);
	          return match;
	        }
	        capture = captures[n - 1];
	    }
	    return capture === undefined ? '' : capture;
	  });
	};

	var apply$4 = functionApply;
	var call$4 = functionCall;
	var uncurryThis$c = functionUncurryThis;
	var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
	var fails$c = fails$E;
	var anObject$3 = anObject$j;
	var isCallable$1 = isCallable$o;
	var toIntegerOrInfinity$4 = toIntegerOrInfinity$b;
	var toLength$5 = toLength$9;
	var toString$5 = toString$f;
	var requireObjectCoercible$2 = requireObjectCoercible$a;
	var advanceStringIndex$1 = advanceStringIndex$3;
	var getMethod$1 = getMethod$6;
	var getSubstitution = getSubstitution$1;
	var regExpExec$1 = regexpExecAbstract;
	var wellKnownSymbol$3 = wellKnownSymbol$r;

	var REPLACE = wellKnownSymbol$3('replace');
	var max = Math.max;
	var min$2 = Math.min;
	var concat$2 = uncurryThis$c([].concat);
	var push$2 = uncurryThis$c([].push);
	var stringIndexOf$2 = uncurryThis$c(''.indexOf);
	var stringSlice$1 = uncurryThis$c(''.slice);

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$c(function () {
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
	  return ''.replace(re, '$<a>') !== '7';
	});

	// @@replace logic
	fixRegExpWellKnownSymbolLogic$1('replace', function (_, nativeReplace, maybeCallNative) {
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.es/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible$2(this);
	      var replacer = searchValue == undefined ? undefined : getMethod$1(searchValue, REPLACE);
	      return replacer
	        ? call$4(replacer, searchValue, O, replaceValue)
	        : call$4(nativeReplace, toString$5(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
	    function (string, replaceValue) {
	      var rx = anObject$3(this);
	      var S = toString$5(string);

	      if (
	        typeof replaceValue == 'string' &&
	        stringIndexOf$2(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
	        stringIndexOf$2(replaceValue, '$<') === -1
	      ) {
	        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
	        if (res.done) return res.value;
	      }

	      var functionalReplace = isCallable$1(replaceValue);
	      if (!functionalReplace) replaceValue = toString$5(replaceValue);

	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regExpExec$1(rx, S);
	        if (result === null) break;

	        push$2(results, result);
	        if (!global) break;

	        var matchStr = toString$5(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$5(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = toString$5(result[0]);
	        var position = max(min$2(toIntegerOrInfinity$4(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) push$2(captures, maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = concat$2([matched], captures, position, S);
	          if (namedCaptures !== undefined) push$2(replacerArgs, namedCaptures);
	          var replacement = toString$5(apply$4(replaceValue, undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += stringSlice$1(S, nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + stringSlice$1(S, nextSourcePosition);
	    }
	  ];
	}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

	var DESCRIPTORS$4 = descriptors;
	var global$g = global$19;
	var uncurryThis$b = functionUncurryThis;
	var isForced = isForced_1;
	var inheritIfRequired$1 = inheritIfRequired$3;
	var createNonEnumerableProperty$3 = createNonEnumerableProperty$b;
	var defineProperty$2 = objectDefineProperty.f;
	var getOwnPropertyNames$2 = objectGetOwnPropertyNames.f;
	var isPrototypeOf$3 = objectIsPrototypeOf;
	var isRegExp = isRegexp;
	var toString$4 = toString$f;
	var regExpFlags$2 = regexpFlags$1;
	var stickyHelpers = regexpStickyHelpers;
	var redefine$2 = redefine$c.exports;
	var fails$b = fails$E;
	var hasOwn$3 = hasOwnProperty_1;
	var enforceInternalState = internalState.enforce;
	var setSpecies$1 = setSpecies$4;
	var wellKnownSymbol$2 = wellKnownSymbol$r;
	var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
	var UNSUPPORTED_NCG = regexpUnsupportedNcg;

	var MATCH = wellKnownSymbol$2('match');
	var NativeRegExp = global$g.RegExp;
	var RegExpPrototype$2 = NativeRegExp.prototype;
	var SyntaxError$1 = global$g.SyntaxError;
	var getFlags$1 = uncurryThis$b(regExpFlags$2);
	var exec = uncurryThis$b(RegExpPrototype$2.exec);
	var charAt = uncurryThis$b(''.charAt);
	var replace = uncurryThis$b(''.replace);
	var stringIndexOf$1 = uncurryThis$b(''.indexOf);
	var stringSlice = uncurryThis$b(''.slice);
	// TODO: Use only propper RegExpIdentifierName
	var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
	var re1 = /a/g;
	var re2 = /a/g;

	// "new" should create a new object, old webkit bug
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;

	var MISSED_STICKY = stickyHelpers.MISSED_STICKY;
	var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;

	var BASE_FORCED = DESCRIPTORS$4 &&
	  (!CORRECT_NEW || MISSED_STICKY || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG || fails$b(function () {
	    re2[MATCH] = false;
	    // RegExp constructor can alter flags and IsRegExp works correct with @@match
	    return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
	  }));

	var handleDotAll = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var brackets = false;
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt(string, index);
	    if (chr === '\\') {
	      result += chr + charAt(string, ++index);
	      continue;
	    }
	    if (!brackets && chr === '.') {
	      result += '[\\s\\S]';
	    } else {
	      if (chr === '[') {
	        brackets = true;
	      } else if (chr === ']') {
	        brackets = false;
	      } result += chr;
	    }
	  } return result;
	};

	var handleNCG = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var named = [];
	  var names = {};
	  var brackets = false;
	  var ncg = false;
	  var groupid = 0;
	  var groupname = '';
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt(string, index);
	    if (chr === '\\') {
	      chr = chr + charAt(string, ++index);
	    } else if (chr === ']') {
	      brackets = false;
	    } else if (!brackets) switch (true) {
	      case chr === '[':
	        brackets = true;
	        break;
	      case chr === '(':
	        if (exec(IS_NCG, stringSlice(string, index + 1))) {
	          index += 2;
	          ncg = true;
	        }
	        result += chr;
	        groupid++;
	        continue;
	      case chr === '>' && ncg:
	        if (groupname === '' || hasOwn$3(names, groupname)) {
	          throw new SyntaxError$1('Invalid capture group name');
	        }
	        names[groupname] = true;
	        named[named.length] = [groupname, groupid];
	        ncg = false;
	        groupname = '';
	        continue;
	    }
	    if (ncg) groupname += chr;
	    else result += chr;
	  } return [result, named];
	};

	// `RegExp` constructor
	// https://tc39.es/ecma262/#sec-regexp-constructor
	if (isForced('RegExp', BASE_FORCED)) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = isPrototypeOf$3(RegExpPrototype$2, this);
	    var patternIsRegExp = isRegExp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var groups = [];
	    var rawPattern = pattern;
	    var rawFlags, dotAll, sticky, handled, result, state;

	    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
	      return pattern;
	    }

	    if (patternIsRegExp || isPrototypeOf$3(RegExpPrototype$2, pattern)) {
	      pattern = pattern.source;
	      if (flagsAreUndefined) flags = 'flags' in rawPattern ? rawPattern.flags : getFlags$1(rawPattern);
	    }

	    pattern = pattern === undefined ? '' : toString$4(pattern);
	    flags = flags === undefined ? '' : toString$4(flags);
	    rawPattern = pattern;

	    if (UNSUPPORTED_DOT_ALL && 'dotAll' in re1) {
	      dotAll = !!flags && stringIndexOf$1(flags, 's') > -1;
	      if (dotAll) flags = replace(flags, /s/g, '');
	    }

	    rawFlags = flags;

	    if (MISSED_STICKY && 'sticky' in re1) {
	      sticky = !!flags && stringIndexOf$1(flags, 'y') > -1;
	      if (sticky && UNSUPPORTED_Y) flags = replace(flags, /y/g, '');
	    }

	    if (UNSUPPORTED_NCG) {
	      handled = handleNCG(pattern);
	      pattern = handled[0];
	      groups = handled[1];
	    }

	    result = inheritIfRequired$1(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$2, RegExpWrapper);

	    if (dotAll || sticky || groups.length) {
	      state = enforceInternalState(result);
	      if (dotAll) {
	        state.dotAll = true;
	        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
	      }
	      if (sticky) state.sticky = true;
	      if (groups.length) state.groups = groups;
	    }

	    if (pattern !== rawPattern) try {
	      // fails in old engines, but we have no alternatives for unsupported regex syntax
	      createNonEnumerableProperty$3(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
	    } catch (error) { /* empty */ }

	    return result;
	  };

	  var proxy = function (key) {
	    key in RegExpWrapper || defineProperty$2(RegExpWrapper, key, {
	      configurable: true,
	      get: function () { return NativeRegExp[key]; },
	      set: function (it) { NativeRegExp[key] = it; }
	    });
	  };

	  for (var keys$1 = getOwnPropertyNames$2(NativeRegExp), index = 0; keys$1.length > index;) {
	    proxy(keys$1[index++]);
	  }

	  RegExpPrototype$2.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype$2;
	  redefine$2(global$g, 'RegExp', RegExpWrapper);
	}

	// https://tc39.es/ecma262/#sec-get-regexp-@@species
	setSpecies$1('RegExp');

	var uncurryThis$a = functionUncurryThis;
	var PROPER_FUNCTION_NAME$2 = functionName.PROPER;
	var redefine$1 = redefine$c.exports;
	var anObject$2 = anObject$j;
	var isPrototypeOf$2 = objectIsPrototypeOf;
	var $toString = toString$f;
	var fails$a = fails$E;
	var regExpFlags$1 = regexpFlags$1;

	var TO_STRING = 'toString';
	var RegExpPrototype$1 = RegExp.prototype;
	var n$ToString = RegExpPrototype$1[TO_STRING];
	var getFlags = uncurryThis$a(regExpFlags$1);

	var NOT_GENERIC = fails$a(function () { return n$ToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = PROPER_FUNCTION_NAME$2 && n$ToString.name != TO_STRING;

	// `RegExp.prototype.toString` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine$1(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject$2(this);
	    var p = $toString(R.source);
	    var rf = R.flags;
	    var f = $toString(rf === undefined && isPrototypeOf$2(RegExpPrototype$1, R) && !('flags' in RegExpPrototype$1) ? getFlags(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	/**
	 * @param typeMap [Object] Map of MIME type -> Array[extensions]
	 * @param ...
	 */


	function Mime$1() {
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


	Mime$1.prototype.define = function (typeMap, force) {
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


	Mime$1.prototype.getType = function (path) {
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


	Mime$1.prototype.getExtension = function (type) {
	  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
	  return type && this._extensions[type.toLowerCase()] || null;
	};

	var Mime_1 = Mime$1;

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
	  "application/ecmascript": ["es", "ecma"],
	  "application/emma+xml": ["emma"],
	  "application/emotionml+xml": ["emotionml"],
	  "application/epub+zip": ["epub"],
	  "application/exi": ["exi"],
	  "application/express": ["exp"],
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
	  "application/patch-ops-error+xml": ["xer"],
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
	  "application/trig": ["trig"],
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
	  "model/step+xml": ["stpx"],
	  "model/step+zip": ["stpz"],
	  "model/step-xml+zip": ["stpxz"],
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

	var Mime = Mime_1;
	var lite = new Mime(standard);

	var call$3 = functionCall;
	var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
	var anObject$1 = anObject$j;
	var toLength$4 = toLength$9;
	var toString$3 = toString$f;
	var requireObjectCoercible$1 = requireObjectCoercible$a;
	var getMethod = getMethod$6;
	var advanceStringIndex = advanceStringIndex$3;
	var regExpExec = regexpExecAbstract;

	// @@match logic
	fixRegExpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.es/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = requireObjectCoercible$1(this);
	      var matcher = regexp == undefined ? undefined : getMethod(regexp, MATCH);
	      return matcher ? call$3(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString$3(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
	    function (string) {
	      var rx = anObject$1(this);
	      var S = toString$3(string);
	      var res = maybeCallNative(nativeMatch, rx, S);

	      if (res.done) return res.value;

	      if (!rx.global) return regExpExec(rx, S);

	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regExpExec(rx, S)) !== null) {
	        var matchStr = toString$3(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength$4(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var DESCRIPTORS$3 = descriptors;
	var objectDefinePropertyModule = objectDefineProperty;
	var regExpFlags = regexpFlags$1;
	var fails$9 = fails$E;

	var RegExpPrototype = RegExp.prototype;

	var FORCED$7 = DESCRIPTORS$3 && fails$9(function () {
	  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	  return Object.getOwnPropertyDescriptor(RegExpPrototype, 'flags').get.call({ dotAll: true, sticky: true }) !== 'sy';
	});

	// `RegExp.prototype.flags` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	if (FORCED$7) objectDefinePropertyModule.f(RegExpPrototype, 'flags', {
	  configurable: true,
	  get: regExpFlags
	});

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

	var path$1 = {
	  basename: basename
	};

	var utils$3 = {};

	function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

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
	var constants$2 = {
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

	(function (exports) {

	  var REGEX_BACKSLASH = constants$2.REGEX_BACKSLASH,
	      REGEX_REMOVE_BACKSLASH = constants$2.REGEX_REMOVE_BACKSLASH,
	      REGEX_SPECIAL_CHARS = constants$2.REGEX_SPECIAL_CHARS,
	      REGEX_SPECIAL_CHARS_GLOBAL = constants$2.REGEX_SPECIAL_CHARS_GLOBAL;

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
	})(utils$3);

	var utils$2 = utils$3;
	var CHAR_ASTERISK = constants$2.CHAR_ASTERISK,
	    CHAR_AT = constants$2.CHAR_AT,
	    CHAR_BACKWARD_SLASH = constants$2.CHAR_BACKWARD_SLASH,
	    CHAR_COMMA = constants$2.CHAR_COMMA,
	    CHAR_DOT = constants$2.CHAR_DOT,
	    CHAR_EXCLAMATION_MARK = constants$2.CHAR_EXCLAMATION_MARK,
	    CHAR_FORWARD_SLASH = constants$2.CHAR_FORWARD_SLASH,
	    CHAR_LEFT_CURLY_BRACE = constants$2.CHAR_LEFT_CURLY_BRACE,
	    CHAR_LEFT_PARENTHESES = constants$2.CHAR_LEFT_PARENTHESES,
	    CHAR_LEFT_SQUARE_BRACKET = constants$2.CHAR_LEFT_SQUARE_BRACKET,
	    CHAR_PLUS = constants$2.CHAR_PLUS,
	    CHAR_QUESTION_MARK = constants$2.CHAR_QUESTION_MARK,
	    CHAR_RIGHT_CURLY_BRACE = constants$2.CHAR_RIGHT_CURLY_BRACE,
	    CHAR_RIGHT_PARENTHESES = constants$2.CHAR_RIGHT_PARENTHESES,
	    CHAR_RIGHT_SQUARE_BRACKET = constants$2.CHAR_RIGHT_SQUARE_BRACKET;

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
	 * `glob` (the actual pattern), `negated` (true if the path starts with `!` but not
	 * with `!(`) and `negatedExtglob` (true if the path starts with `!(`).
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


	var scan$1 = function scan(input, options) {
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
	  var negatedExtglob = false;
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

	        if (code === CHAR_EXCLAMATION_MARK && index === start) {
	          negatedExtglob = true;
	        }

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
	          break;
	        }
	      }

	      if (scanToEnd === true) {
	        continue;
	      }

	      break;
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
	    if (glob) glob = utils$2.removeBackslashes(glob);

	    if (base && backslashes === true) {
	      base = utils$2.removeBackslashes(base);
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
	    negated: negated,
	    negatedExtglob: negatedExtglob
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

	var scan_1 = scan$1;

	var arraySlice$4 = arraySliceSimple;

	var floor$3 = Math.floor;

	var mergeSort = function (array, comparefn) {
	  var length = array.length;
	  var middle = floor$3(length / 2);
	  return length < 8 ? insertionSort(array, comparefn) : merge(
	    array,
	    mergeSort(arraySlice$4(array, 0, middle), comparefn),
	    mergeSort(arraySlice$4(array, middle), comparefn),
	    comparefn
	  );
	};

	var insertionSort = function (array, comparefn) {
	  var length = array.length;
	  var i = 1;
	  var element, j;

	  while (i < length) {
	    j = i;
	    element = array[i];
	    while (j && comparefn(array[j - 1], element) > 0) {
	      array[j] = array[--j];
	    }
	    if (j !== i++) array[j] = element;
	  } return array;
	};

	var merge = function (array, left, right, comparefn) {
	  var llength = left.length;
	  var rlength = right.length;
	  var lindex = 0;
	  var rindex = 0;

	  while (lindex < llength || rindex < rlength) {
	    array[lindex + rindex] = (lindex < llength && rindex < rlength)
	      ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
	      : lindex < llength ? left[lindex++] : right[rindex++];
	  } return array;
	};

	var arraySort = mergeSort;

	var userAgent$1 = engineUserAgent;

	var firefox = userAgent$1.match(/firefox\/(\d+)/i);

	var engineFfVersion = !!firefox && +firefox[1];

	var UA = engineUserAgent;

	var engineIsIeOrEdge = /MSIE|Trident/.test(UA);

	var userAgent = engineUserAgent;

	var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);

	var engineWebkitVersion = !!webkit && +webkit[1];

	var $$7 = _export;
	var uncurryThis$9 = functionUncurryThis;
	var aCallable$3 = aCallable$9;
	var toObject$5 = toObject$g;
	var lengthOfArrayLike$6 = lengthOfArrayLike$f;
	var toString$2 = toString$f;
	var fails$8 = fails$E;
	var internalSort$1 = arraySort;
	var arrayMethodIsStrict$2 = arrayMethodIsStrict$4;
	var FF$1 = engineFfVersion;
	var IE_OR_EDGE$1 = engineIsIeOrEdge;
	var V8$1 = engineV8Version;
	var WEBKIT$1 = engineWebkitVersion;

	var test = [];
	var un$Sort$1 = uncurryThis$9(test.sort);
	var push$1 = uncurryThis$9(test.push);

	// IE8-
	var FAILS_ON_UNDEFINED = fails$8(function () {
	  test.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails$8(function () {
	  test.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD$2 = arrayMethodIsStrict$2('sort');

	var STABLE_SORT$1 = !fails$8(function () {
	  // feature detection can be too slow, so check engines versions
	  if (V8$1) return V8$1 < 70;
	  if (FF$1 && FF$1 > 3) return;
	  if (IE_OR_EDGE$1) return true;
	  if (WEBKIT$1) return WEBKIT$1 < 603;

	  var result = '';
	  var code, chr, value, index;

	  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
	  for (code = 65; code < 76; code++) {
	    chr = String.fromCharCode(code);

	    switch (code) {
	      case 66: case 69: case 70: case 72: value = 3; break;
	      case 68: case 71: value = 4; break;
	      default: value = 2;
	    }

	    for (index = 0; index < 47; index++) {
	      test.push({ k: chr + index, v: value });
	    }
	  }

	  test.sort(function (a, b) { return b.v - a.v; });

	  for (index = 0; index < test.length; index++) {
	    chr = test[index].k.charAt(0);
	    if (result.charAt(result.length - 1) !== chr) result += chr;
	  }

	  return result !== 'DGBEFHACIJK';
	});

	var FORCED$6 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$2 || !STABLE_SORT$1;

	var getSortCompare$1 = function (comparefn) {
	  return function (x, y) {
	    if (y === undefined) return -1;
	    if (x === undefined) return 1;
	    if (comparefn !== undefined) return +comparefn(x, y) || 0;
	    return toString$2(x) > toString$2(y) ? 1 : -1;
	  };
	};

	// `Array.prototype.sort` method
	// https://tc39.es/ecma262/#sec-array.prototype.sort
	$$7({ target: 'Array', proto: true, forced: FORCED$6 }, {
	  sort: function sort(comparefn) {
	    if (comparefn !== undefined) aCallable$3(comparefn);

	    var array = toObject$5(this);

	    if (STABLE_SORT$1) return comparefn === undefined ? un$Sort$1(array) : un$Sort$1(array, comparefn);

	    var items = [];
	    var arrayLength = lengthOfArrayLike$6(array);
	    var itemsLength, index;

	    for (index = 0; index < arrayLength; index++) {
	      if (index in array) push$1(items, array[index]);
	    }

	    internalSort$1(items, getSortCompare$1(comparefn));

	    itemsLength = items.length;
	    index = 0;

	    while (index < itemsLength) array[index] = items[index++];
	    while (index < arrayLength) delete array[index++];

	    return array;
	  }
	});

	var $$6 = _export;
	var uncurryThis$8 = functionUncurryThis;
	var IndexedObject$1 = indexedObject;
	var toIndexedObject$1 = toIndexedObject$c;
	var arrayMethodIsStrict$1 = arrayMethodIsStrict$4;

	var un$Join = uncurryThis$8([].join);

	var ES3_STRINGS = IndexedObject$1 != Object;
	var STRICT_METHOD$1 = arrayMethodIsStrict$1('join', ',');

	// `Array.prototype.join` method
	// https://tc39.es/ecma262/#sec-array.prototype.join
	$$6({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$1 }, {
	  join: function join(separator) {
	    return un$Join(toIndexedObject$1(this), separator === undefined ? ',' : separator);
	  }
	});

	var $$5 = _export;
	var $includes$1 = arrayIncludes.includes;
	var addToUnscopables = addToUnscopables$3;

	// `Array.prototype.includes` method
	// https://tc39.es/ecma262/#sec-array.prototype.includes
	$$5({ target: 'Array', proto: true }, {
	  includes: function includes(el /* , fromIndex = 0 */) {
	    return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('includes');

	var $$4 = _export;
	var uncurryThis$7 = functionUncurryThis;
	var notARegExp = notARegexp;
	var requireObjectCoercible = requireObjectCoercible$a;
	var toString$1 = toString$f;
	var correctIsRegExpLogic = correctIsRegexpLogic;

	var stringIndexOf = uncurryThis$7(''.indexOf);

	// `String.prototype.includes` method
	// https://tc39.es/ecma262/#sec-string.prototype.includes
	$$4({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
	  includes: function includes(searchString /* , position = 0 */) {
	    return !!~stringIndexOf(
	      toString$1(requireObjectCoercible(this)),
	      toString$1(notARegExp(searchString)),
	      arguments.length > 1 ? arguments[1] : undefined
	    );
	  }
	});

	var $$3 = _export;
	var repeat = stringRepeat;

	// `String.prototype.repeat` method
	// https://tc39.es/ecma262/#sec-string.prototype.repeat
	$$3({ target: 'String', proto: true }, {
	  repeat: repeat
	});

	function _createForOfIteratorHelper$1(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

	function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

	var constants$1 = constants$2;
	var utils$1 = utils$3;
	/**
	 * Constants
	 */

	var MAX_LENGTH = constants$1.MAX_LENGTH,
	    POSIX_REGEX_SOURCE = constants$1.POSIX_REGEX_SOURCE,
	    REGEX_NON_SPECIAL_CHARS = constants$1.REGEX_NON_SPECIAL_CHARS,
	    REGEX_SPECIAL_CHARS_BACKREF = constants$1.REGEX_SPECIAL_CHARS_BACKREF,
	    REPLACEMENTS = constants$1.REPLACEMENTS;
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
	      return utils$1.escapeRegex(v);
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
	  var PLATFORM_CHARS = constants$1.globChars();
	  var EXTGLOB_CHARS = constants$1.extglobChars(PLATFORM_CHARS);
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
	  input = utils$1.removePrefix(input, state);
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
	    return input[++state.index] || '';
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

	    if (extglobs.length && tok.type !== 'paren') {
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
	    var rest;

	    if (token.type === 'negate') {
	      var extglobStar = star;

	      if (token.inner && token.inner.length > 1 && token.inner.includes('/')) {
	        extglobStar = globstar(opts);
	      }

	      if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
	        output = token.close = ")$))".concat(extglobStar);
	      }

	      if (token.inner.includes('*') && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
	        output = token.close = ")".concat(rest, ")").concat(extglobStar, ")");
	      }

	      if (token.prev.type === 'bos') {
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

	    state.output = utils$1.wrapOutput(output, state, options);
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
	        value = advance();
	      } else {
	        value += advance();
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
	      value = utils$1.escapeRegex(value);
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

	      if (opts.literalBrackets === false || utils$1.hasRegexChars(prevValue)) {
	        continue;
	      }

	      var escaped = utils$1.escapeRegex(prev.value);
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
	    state.output = utils$1.escapeLast(state.output, '[');
	    decrement('brackets');
	  }

	  while (state.parens > 0) {
	    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', ')'));
	    state.output = utils$1.escapeLast(state.output, '(');
	    decrement('parens');
	  }

	  while (state.braces > 0) {
	    if (opts.strictBrackets === true) throw new SyntaxError(syntaxError('closing', '}'));
	    state.output = utils$1.escapeLast(state.output, '{');
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

	  var _constants$globChars = constants$1.globChars(),
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

	  var output = utils$1.removePrefix(input, state);
	  var source = create(output);

	  if (source && opts.strictSlashes !== true) {
	    source += "".concat(SLASH_LITERAL, "?");
	  }

	  return source;
	};

	var parse_1 = parse$1;

	function ownKeys$3(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$3(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$3(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

	var path = path$1;
	var scan = scan_1;
	var parse = parse_1;
	var utils = utils$3;
	var constants = constants$2;

	var isObject$5 = function isObject(val) {
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

	  var isState = isObject$5(glob) && glob.tokens && glob.input;

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
	  return parse(pattern, _objectSpread$3(_objectSpread$3({}, options), {}, {
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
	  return scan(input, options);
	};
	/**
	 * Compile a regular expression from the `state` object returned by the
	 * [parse()](#parse) method.
	 *
	 * @param {Object} `state`
	 * @param {Object} `options`
	 * @param {Boolean} `returnOutput` Intended for implementors, this argument allows you to return the raw output from the parser.
	 * @param {Boolean} `returnState` Adds the state to a `state` property on the returned regex. Useful for implementors and debugging.
	 * @return {RegExp}
	 * @api public
	 */


	picomatch$1.compileRe = function (state, options) {
	  var returnOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	  var returnState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	  if (returnOutput === true) {
	    return state.output;
	  }

	  var opts = options || {};
	  var prepend = opts.contains ? '' : '^';
	  var append = opts.contains ? '' : '$';
	  var source = "".concat(prepend, "(?:").concat(state.output, ")").concat(append);

	  if (state && state.negated === true) {
	    source = "^(?!".concat(source, ").*$");
	  }

	  var regex = picomatch$1.toRegex(source, options);

	  if (returnState === true) {
	    regex.state = state;
	  }

	  return regex;
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
	 * @param {Boolean} `returnOutput` Implementors may use this argument to return the compiled output, instead of a regular expression. This is not exposed on the options to prevent end-users from mutating the result.
	 * @param {Boolean} `returnState` Implementors may use this argument to return the state from the parsed glob with the returned regular expression.
	 * @return {RegExp} Returns a regex created from the given pattern.
	 * @api public
	 */


	picomatch$1.makeRe = function (input) {
	  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var returnOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	  var returnState = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	  if (!input || typeof input !== 'string') {
	    throw new TypeError('Expected a non-empty string');
	  }

	  var parsed = {
	    negated: false,
	    fastpaths: true
	  };

	  if (options.fastpaths !== false && (input[0] === '.' || input[0] === '*')) {
	    parsed.output = parse.fastpaths(input, options);
	  }

	  if (!parsed.output) {
	    parsed = parse(input, options);
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

	function _asyncIterator$1(iterable) { var method, async, sync, retry = 2; if (typeof Symbol !== "undefined") { async = Symbol.asyncIterator; sync = Symbol.iterator; } while (retry--) { if (async && (method = iterable[async]) != null) { return method.call(iterable); } if (sync && (method = iterable[sync]) != null) { return new AsyncFromSyncIterator$1(method.call(iterable)); } async = "@@asyncIterator"; sync = "@@iterator"; } throw new TypeError("Object is not async iterable"); }

	function AsyncFromSyncIterator$1(s) { AsyncFromSyncIterator$1 = function AsyncFromSyncIterator(s) { this.s = s; this.n = s.next; }; AsyncFromSyncIterator$1.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, return: function _return(value) { var ret = this.s.return; if (ret === undefined) { return Promise.resolve({ value: value, done: true }); } return AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments)); }, throw: function _throw(value) { var thr = this.s.return; if (thr === undefined) return Promise.reject(value); return AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments)); } }; function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) { return Promise.reject(new TypeError(r + " is not an object.")); } var done = r.done; return Promise.resolve(r.value).then(function (value) { return { value: value, done: done }; }); } return new AsyncFromSyncIterator$1(s); }

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
	    var result, _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, entry, file, entriesFromDirectory, _files;

	    return regenerator.wrap(function _callee3$(_context3) {
	      while (1) {
	        switch (_context3.prev = _context3.next) {
	          case 0:
	            result = [];
	            _iteratorAbruptCompletion = false;
	            _didIteratorError = false;
	            _context3.prev = 3;
	            _iterator = _asyncIterator$1(entries);

	          case 5:
	            _context3.next = 7;
	            return _iterator.next();

	          case 7:
	            if (!(_iteratorAbruptCompletion = !(_step = _context3.sent).done)) {
	              _context3.next = 27;
	              break;
	            }

	            entry = _step.value;

	            if (!entry.isFile) {
	              _context3.next = 16;
	              break;
	            }

	            _context3.next = 12;
	            return getFileFromFileEntry(entry);

	          case 12:
	            file = _context3.sent;
	            result.push(file);
	            _context3.next = 24;
	            break;

	          case 16:
	            if (!entry.isDirectory) {
	              _context3.next = 24;
	              break;
	            }

	            _context3.next = 19;
	            return getEntriesFromDirectory(entry);

	          case 19:
	            entriesFromDirectory = _context3.sent;
	            _context3.next = 22;
	            return getFilesFromFileSystemEntries(entriesFromDirectory);

	          case 22:
	            _files = _context3.sent;

	            _files.forEach(function (file) {
	              return result.push(file);
	            });

	          case 24:
	            _iteratorAbruptCompletion = false;
	            _context3.next = 5;
	            break;

	          case 27:
	            _context3.next = 33;
	            break;

	          case 29:
	            _context3.prev = 29;
	            _context3.t0 = _context3["catch"](3);
	            _didIteratorError = true;
	            _iteratorError = _context3.t0;

	          case 33:
	            _context3.prev = 33;
	            _context3.prev = 34;

	            if (!(_iteratorAbruptCompletion && _iterator.return != null)) {
	              _context3.next = 38;
	              break;
	            }

	            _context3.next = 38;
	            return _iterator.return();

	          case 38:
	            _context3.prev = 38;

	            if (!_didIteratorError) {
	              _context3.next = 41;
	              break;
	            }

	            throw _iteratorError;

	          case 41:
	            return _context3.finish(38);

	          case 42:
	            return _context3.finish(33);

	          case 43:
	            return _context3.abrupt("return", result);

	          case 44:
	          case "end":
	            return _context3.stop();
	        }
	      }
	    }, _callee3, null, [[3, 29, 33, 43], [34,, 38, 42]]);
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

	var global$f = global$19;
	var uncurryThis$6 = functionUncurryThis;
	var aCallable$2 = aCallable$9;
	var isObject$4 = isObject$m;
	var hasOwn$2 = hasOwnProperty_1;
	var arraySlice$3 = arraySlice$8;

	var Function$1 = global$f.Function;
	var concat$1 = uncurryThis$6([].concat);
	var join$1 = uncurryThis$6([].join);
	var factories = {};

	var construct = function (C, argsLength, args) {
	  if (!hasOwn$2(factories, argsLength)) {
	    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    factories[argsLength] = Function$1('C,a', 'return new C(' + join$1(list, ',') + ')');
	  } return factories[argsLength](C, args);
	};

	// `Function.prototype.bind` method implementation
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	var functionBind = Function$1.bind || function bind(that /* , ...args */) {
	  var F = aCallable$2(this);
	  var Prototype = F.prototype;
	  var partArgs = arraySlice$3(arguments, 1);
	  var boundFunction = function bound(/* args... */) {
	    var args = concat$1(partArgs, arraySlice$3(arguments));
	    return this instanceof boundFunction ? construct(F, args.length, args) : F.apply(that, args);
	  };
	  if (isObject$4(Prototype)) boundFunction.prototype = Prototype;
	  return boundFunction;
	};

	var $$2 = _export;
	var getBuiltIn = getBuiltIn$9;
	var apply$3 = functionApply;
	var bind$1 = functionBind;
	var aConstructor$1 = aConstructor$3;
	var anObject = anObject$j;
	var isObject$3 = isObject$m;
	var create$1 = objectCreate;
	var fails$7 = fails$E;

	var nativeConstruct = getBuiltIn('Reflect', 'construct');
	var ObjectPrototype$2 = Object.prototype;
	var push = [].push;

	// `Reflect.construct` method
	// https://tc39.es/ecma262/#sec-reflect.construct
	// MS Edge supports only 2 arguments and argumentsList argument is optional
	// FF Nightly sets third argument as `new.target`, but does not create `this` from it
	var NEW_TARGET_BUG = fails$7(function () {
	  function F() { /* empty */ }
	  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
	});

	var ARGS_BUG = !fails$7(function () {
	  nativeConstruct(function () { /* empty */ });
	});

	var FORCED$5 = NEW_TARGET_BUG || ARGS_BUG;

	$$2({ target: 'Reflect', stat: true, forced: FORCED$5, sham: FORCED$5 }, {
	  construct: function construct(Target, args /* , newTarget */) {
	    aConstructor$1(Target);
	    anObject(args);
	    var newTarget = arguments.length < 3 ? Target : aConstructor$1(arguments[2]);
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
	      apply$3(push, $args, args);
	      return new (apply$3(bind$1, Target, $args))();
	    }
	    // with altered newTarget, not support built-in constructors
	    var proto = newTarget.prototype;
	    var instance = create$1(isObject$3(proto) ? proto : ObjectPrototype$2);
	    var result = apply$3(Target, instance, args);
	    return isObject$3(result) ? result : instance;
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
	  } else if (call !== void 0) {
	    throw new TypeError("Derived constructors may only return object or undefined");
	  }

	  return _assertThisInitialized$2(self);
	}

	function _getPrototypeOf$2(o) {
	  _getPrototypeOf$2 = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf$2(o);
	}

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

	var urlJoin = {exports: {}};

	(function (module) {
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
	})(urlJoin);

	var urljoin = urlJoin.exports;

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
	  var url = urljoin(endpoint, uploadIdEnc, "?key=".concat(filename));
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
	  var url = urljoin(endpoint, uploadIdEnc, "complete", "?key=".concat(filename));
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
	  var url = urljoin(endpoint, uploadId, "".concat(number), "?key=".concat(filename));
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

	var typedArrayConstructor = {exports: {}};

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var arrayBufferNative = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';

	var NATIVE_ARRAY_BUFFER$1 = arrayBufferNative;
	var DESCRIPTORS$2 = descriptors;
	var global$e = global$19;
	var isCallable = isCallable$o;
	var isObject$2 = isObject$m;
	var hasOwn$1 = hasOwnProperty_1;
	var classof$1 = classof$c;
	var tryToString = tryToString$5;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$b;
	var redefine = redefine$c.exports;
	var defineProperty$1 = objectDefineProperty.f;
	var isPrototypeOf$1 = objectIsPrototypeOf;
	var getPrototypeOf$1 = objectGetPrototypeOf;
	var setPrototypeOf$2 = objectSetPrototypeOf;
	var wellKnownSymbol$1 = wellKnownSymbol$r;
	var uid = uid$5;

	var Int8Array$3 = global$e.Int8Array;
	var Int8ArrayPrototype = Int8Array$3 && Int8Array$3.prototype;
	var Uint8ClampedArray = global$e.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
	var TypedArray$1 = Int8Array$3 && getPrototypeOf$1(Int8Array$3);
	var TypedArrayPrototype$1 = Int8ArrayPrototype && getPrototypeOf$1(Int8ArrayPrototype);
	var ObjectPrototype$1 = Object.prototype;
	var TypeError$2 = global$e.TypeError;

	var TO_STRING_TAG = wellKnownSymbol$1('toStringTag');
	var TYPED_ARRAY_TAG$1 = uid('TYPED_ARRAY_TAG');
	var TYPED_ARRAY_CONSTRUCTOR$2 = uid('TYPED_ARRAY_CONSTRUCTOR');
	// Fixing native typed arrays in Opera Presto crashes the browser, see #595
	var NATIVE_ARRAY_BUFFER_VIEWS$2 = NATIVE_ARRAY_BUFFER$1 && !!setPrototypeOf$2 && classof$1(global$e.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQIRED = false;
	var NAME, Constructor, Prototype;

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
	  if (!isObject$2(it)) return false;
	  var klass = classof$1(it);
	  return klass === 'DataView'
	    || hasOwn$1(TypedArrayConstructorsList, klass)
	    || hasOwn$1(BigIntArrayConstructorsList, klass);
	};

	var isTypedArray$1 = function (it) {
	  if (!isObject$2(it)) return false;
	  var klass = classof$1(it);
	  return hasOwn$1(TypedArrayConstructorsList, klass)
	    || hasOwn$1(BigIntArrayConstructorsList, klass);
	};

	var aTypedArray$m = function (it) {
	  if (isTypedArray$1(it)) return it;
	  throw TypeError$2('Target is not a typed array');
	};

	var aTypedArrayConstructor$3 = function (C) {
	  if (isCallable(C) && (!setPrototypeOf$2 || isPrototypeOf$1(TypedArray$1, C))) return C;
	  throw TypeError$2(tryToString(C) + ' is not a typed array constructor');
	};

	var exportTypedArrayMethod$n = function (KEY, property, forced) {
	  if (!DESCRIPTORS$2) return;
	  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
	    var TypedArrayConstructor = global$e[ARRAY];
	    if (TypedArrayConstructor && hasOwn$1(TypedArrayConstructor.prototype, KEY)) try {
	      delete TypedArrayConstructor.prototype[KEY];
	    } catch (error) { /* empty */ }
	  }
	  if (!TypedArrayPrototype$1[KEY] || forced) {
	    redefine(TypedArrayPrototype$1, KEY, forced ? property
	      : NATIVE_ARRAY_BUFFER_VIEWS$2 && Int8ArrayPrototype[KEY] || property);
	  }
	};

	var exportTypedArrayStaticMethod$1 = function (KEY, property, forced) {
	  var ARRAY, TypedArrayConstructor;
	  if (!DESCRIPTORS$2) return;
	  if (setPrototypeOf$2) {
	    if (forced) for (ARRAY in TypedArrayConstructorsList) {
	      TypedArrayConstructor = global$e[ARRAY];
	      if (TypedArrayConstructor && hasOwn$1(TypedArrayConstructor, KEY)) try {
	        delete TypedArrayConstructor[KEY];
	      } catch (error) { /* empty */ }
	    }
	    if (!TypedArray$1[KEY] || forced) {
	      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
	      try {
	        return redefine(TypedArray$1, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$2 && TypedArray$1[KEY] || property);
	      } catch (error) { /* empty */ }
	    } else return;
	  }
	  for (ARRAY in TypedArrayConstructorsList) {
	    TypedArrayConstructor = global$e[ARRAY];
	    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
	      redefine(TypedArrayConstructor, KEY, property);
	    }
	  }
	};

	for (NAME in TypedArrayConstructorsList) {
	  Constructor = global$e[NAME];
	  Prototype = Constructor && Constructor.prototype;
	  if (Prototype) createNonEnumerableProperty$2(Prototype, TYPED_ARRAY_CONSTRUCTOR$2, Constructor);
	  else NATIVE_ARRAY_BUFFER_VIEWS$2 = false;
	}

	for (NAME in BigIntArrayConstructorsList) {
	  Constructor = global$e[NAME];
	  Prototype = Constructor && Constructor.prototype;
	  if (Prototype) createNonEnumerableProperty$2(Prototype, TYPED_ARRAY_CONSTRUCTOR$2, Constructor);
	}

	// WebKit bug - typed arrays constructors prototype is Object.prototype
	if (!NATIVE_ARRAY_BUFFER_VIEWS$2 || !isCallable(TypedArray$1) || TypedArray$1 === Function.prototype) {
	  // eslint-disable-next-line no-shadow -- safe
	  TypedArray$1 = function TypedArray() {
	    throw TypeError$2('Incorrect invocation');
	  };
	  if (NATIVE_ARRAY_BUFFER_VIEWS$2) for (NAME in TypedArrayConstructorsList) {
	    if (global$e[NAME]) setPrototypeOf$2(global$e[NAME], TypedArray$1);
	  }
	}

	if (!NATIVE_ARRAY_BUFFER_VIEWS$2 || !TypedArrayPrototype$1 || TypedArrayPrototype$1 === ObjectPrototype$1) {
	  TypedArrayPrototype$1 = TypedArray$1.prototype;
	  if (NATIVE_ARRAY_BUFFER_VIEWS$2) for (NAME in TypedArrayConstructorsList) {
	    if (global$e[NAME]) setPrototypeOf$2(global$e[NAME].prototype, TypedArrayPrototype$1);
	  }
	}

	// WebKit bug - one more object in Uint8ClampedArray prototype chain
	if (NATIVE_ARRAY_BUFFER_VIEWS$2 && getPrototypeOf$1(Uint8ClampedArrayPrototype) !== TypedArrayPrototype$1) {
	  setPrototypeOf$2(Uint8ClampedArrayPrototype, TypedArrayPrototype$1);
	}

	if (DESCRIPTORS$2 && !hasOwn$1(TypedArrayPrototype$1, TO_STRING_TAG)) {
	  TYPED_ARRAY_TAG_REQIRED = true;
	  defineProperty$1(TypedArrayPrototype$1, TO_STRING_TAG, { get: function () {
	    return isObject$2(this) ? this[TYPED_ARRAY_TAG$1] : undefined;
	  } });
	  for (NAME in TypedArrayConstructorsList) if (global$e[NAME]) {
	    createNonEnumerableProperty$2(global$e[NAME], TYPED_ARRAY_TAG$1, NAME);
	  }
	}

	var arrayBufferViewCore = {
	  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$2,
	  TYPED_ARRAY_CONSTRUCTOR: TYPED_ARRAY_CONSTRUCTOR$2,
	  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG$1,
	  aTypedArray: aTypedArray$m,
	  aTypedArrayConstructor: aTypedArrayConstructor$3,
	  exportTypedArrayMethod: exportTypedArrayMethod$n,
	  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$1,
	  isView: isView,
	  isTypedArray: isTypedArray$1,
	  TypedArray: TypedArray$1,
	  TypedArrayPrototype: TypedArrayPrototype$1
	};

	/* eslint-disable no-new -- required for testing */

	var global$d = global$19;
	var fails$6 = fails$E;
	var checkCorrectnessOfIteration = checkCorrectnessOfIteration$4;
	var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

	var ArrayBuffer$2 = global$d.ArrayBuffer;
	var Int8Array$2 = global$d.Int8Array;

	var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails$6(function () {
	  Int8Array$2(1);
	}) || !fails$6(function () {
	  new Int8Array$2(-1);
	}) || !checkCorrectnessOfIteration(function (iterable) {
	  new Int8Array$2();
	  new Int8Array$2(null);
	  new Int8Array$2(1.5);
	  new Int8Array$2(iterable);
	}, true) || fails$6(function () {
	  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
	  return new Int8Array$2(new ArrayBuffer$2(2), 1, undefined).length !== 1;
	});

	var global$c = global$19;
	var toIntegerOrInfinity$3 = toIntegerOrInfinity$b;
	var toLength$3 = toLength$9;

	var RangeError$6 = global$c.RangeError;

	// `ToIndex` abstract operation
	// https://tc39.es/ecma262/#sec-toindex
	var toIndex$2 = function (it) {
	  if (it === undefined) return 0;
	  var number = toIntegerOrInfinity$3(it);
	  var length = toLength$3(number);
	  if (number !== length) throw RangeError$6('Wrong length or index');
	  return length;
	};

	// IEEE754 conversions based on https://github.com/feross/ieee754
	var global$b = global$19;

	var Array$3 = global$b.Array;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor$2 = Math.floor;
	var log$1 = Math.log;
	var LN2 = Math.LN2;

	var pack = function (number, mantissaLength, bytes) {
	  var buffer = Array$3(bytes);
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
	    exponent = floor$2(log$1(number) / LN2);
	    c = pow(2, -exponent);
	    if (number * c < 1) {
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
	  while (mantissaLength >= 8) {
	    buffer[index++] = mantissa & 255;
	    mantissa /= 256;
	    mantissaLength -= 8;
	  }
	  exponent = exponent << mantissaLength | mantissa;
	  exponentLength += mantissaLength;
	  while (exponentLength > 0) {
	    buffer[index++] = exponent & 255;
	    exponent /= 256;
	    exponentLength -= 8;
	  }
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
	  while (nBits > 0) {
	    exponent = exponent * 256 + buffer[index--];
	    nBits -= 8;
	  }
	  mantissa = exponent & (1 << -nBits) - 1;
	  exponent >>= -nBits;
	  nBits += mantissaLength;
	  while (nBits > 0) {
	    mantissa = mantissa * 256 + buffer[index--];
	    nBits -= 8;
	  }
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

	var toObject$4 = toObject$g;
	var toAbsoluteIndex$2 = toAbsoluteIndex$7;
	var lengthOfArrayLike$5 = lengthOfArrayLike$f;

	// `Array.prototype.fill` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.fill
	var arrayFill$1 = function fill(value /* , start = 0, end = @length */) {
	  var O = toObject$4(this);
	  var length = lengthOfArrayLike$5(O);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex$2(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex$2(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};

	var global$a = global$19;
	var uncurryThis$5 = functionUncurryThis;
	var DESCRIPTORS$1 = descriptors;
	var NATIVE_ARRAY_BUFFER = arrayBufferNative;
	var FunctionName = functionName;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$b;
	var redefineAll = redefineAll$3;
	var fails$5 = fails$E;
	var anInstance$1 = anInstance$5;
	var toIntegerOrInfinity$2 = toIntegerOrInfinity$b;
	var toLength$2 = toLength$9;
	var toIndex$1 = toIndex$2;
	var IEEE754 = ieee754;
	var getPrototypeOf = objectGetPrototypeOf;
	var setPrototypeOf$1 = objectSetPrototypeOf;
	var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
	var defineProperty = objectDefineProperty.f;
	var arrayFill = arrayFill$1;
	var arraySlice$2 = arraySliceSimple;
	var setToStringTag = setToStringTag$8;
	var InternalStateModule$1 = internalState;

	var PROPER_FUNCTION_NAME$1 = FunctionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
	var getInternalState$1 = InternalStateModule$1.get;
	var setInternalState$1 = InternalStateModule$1.set;
	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE = 'prototype';
	var WRONG_LENGTH$1 = 'Wrong length';
	var WRONG_INDEX = 'Wrong index';
	var NativeArrayBuffer = global$a[ARRAY_BUFFER];
	var $ArrayBuffer = NativeArrayBuffer;
	var ArrayBufferPrototype$1 = $ArrayBuffer && $ArrayBuffer[PROTOTYPE];
	var $DataView = global$a[DATA_VIEW];
	var DataViewPrototype = $DataView && $DataView[PROTOTYPE];
	var ObjectPrototype = Object.prototype;
	var Array$2 = global$a.Array;
	var RangeError$5 = global$a.RangeError;
	var fill = uncurryThis$5(arrayFill);
	var reverse = uncurryThis$5([].reverse);

	var packIEEE754 = IEEE754.pack;
	var unpackIEEE754 = IEEE754.unpack;

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

	var addGetter$1 = function (Constructor, key) {
	  defineProperty(Constructor[PROTOTYPE], key, { get: function () { return getInternalState$1(this)[key]; } });
	};

	var get = function (view, count, index, isLittleEndian) {
	  var intIndex = toIndex$1(index);
	  var store = getInternalState$1(view);
	  if (intIndex + count > store.byteLength) throw RangeError$5(WRONG_INDEX);
	  var bytes = getInternalState$1(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = arraySlice$2(bytes, start, start + count);
	  return isLittleEndian ? pack : reverse(pack);
	};

	var set$1 = function (view, count, index, conversion, value, isLittleEndian) {
	  var intIndex = toIndex$1(index);
	  var store = getInternalState$1(view);
	  if (intIndex + count > store.byteLength) throw RangeError$5(WRONG_INDEX);
	  var bytes = getInternalState$1(store.buffer).bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = conversion(+value);
	  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
	};

	if (!NATIVE_ARRAY_BUFFER) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    anInstance$1(this, ArrayBufferPrototype$1);
	    var byteLength = toIndex$1(length);
	    setInternalState$1(this, {
	      bytes: fill(Array$2(byteLength), 0),
	      byteLength: byteLength
	    });
	    if (!DESCRIPTORS$1) this.byteLength = byteLength;
	  };

	  ArrayBufferPrototype$1 = $ArrayBuffer[PROTOTYPE];

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    anInstance$1(this, DataViewPrototype);
	    anInstance$1(buffer, ArrayBufferPrototype$1);
	    var bufferLength = getInternalState$1(buffer).byteLength;
	    var offset = toIntegerOrInfinity$2(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw RangeError$5('Wrong offset');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength$2(byteLength);
	    if (offset + byteLength > bufferLength) throw RangeError$5(WRONG_LENGTH$1);
	    setInternalState$1(this, {
	      buffer: buffer,
	      byteLength: byteLength,
	      byteOffset: offset
	    });
	    if (!DESCRIPTORS$1) {
	      this.buffer = buffer;
	      this.byteLength = byteLength;
	      this.byteOffset = offset;
	    }
	  };

	  DataViewPrototype = $DataView[PROTOTYPE];

	  if (DESCRIPTORS$1) {
	    addGetter$1($ArrayBuffer, 'byteLength');
	    addGetter$1($DataView, 'buffer');
	    addGetter$1($DataView, 'byteLength');
	    addGetter$1($DataView, 'byteOffset');
	  }

	  redefineAll(DataViewPrototype, {
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
	  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME$1 && NativeArrayBuffer.name !== ARRAY_BUFFER;
	  /* eslint-disable no-new -- required for testing */
	  if (!fails$5(function () {
	    NativeArrayBuffer(1);
	  }) || !fails$5(function () {
	    new NativeArrayBuffer(-1);
	  }) || fails$5(function () {
	    new NativeArrayBuffer();
	    new NativeArrayBuffer(1.5);
	    new NativeArrayBuffer(NaN);
	    return INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
	  })) {
	  /* eslint-enable no-new -- required for testing */
	    $ArrayBuffer = function ArrayBuffer(length) {
	      anInstance$1(this, ArrayBufferPrototype$1);
	      return new NativeArrayBuffer(toIndex$1(length));
	    };

	    $ArrayBuffer[PROTOTYPE] = ArrayBufferPrototype$1;

	    for (var keys = getOwnPropertyNames$1(NativeArrayBuffer), j = 0, key$1; keys.length > j;) {
	      if (!((key$1 = keys[j++]) in $ArrayBuffer)) {
	        createNonEnumerableProperty$1($ArrayBuffer, key$1, NativeArrayBuffer[key$1]);
	      }
	    }

	    ArrayBufferPrototype$1.constructor = $ArrayBuffer;
	  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
	    createNonEnumerableProperty$1(NativeArrayBuffer, 'name', ARRAY_BUFFER);
	  }

	  // WebKit bug - the same parent prototype for typed arrays and data view
	  if (setPrototypeOf$1 && getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
	    setPrototypeOf$1(DataViewPrototype, ObjectPrototype);
	  }

	  // iOS Safari 7.x bug
	  var testView = new $DataView(new $ArrayBuffer(2));
	  var $setInt8 = uncurryThis$5(DataViewPrototype.setInt8);
	  testView.setInt8(0, 2147483648);
	  testView.setInt8(1, 2147483649);
	  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll(DataViewPrototype, {
	    setInt8: function setInt8(byteOffset, value) {
	      $setInt8(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      $setInt8(this, byteOffset, value << 24 >> 24);
	    }
	  }, { unsafe: true });
	}

	setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	setToStringTag($DataView, DATA_VIEW);

	var arrayBuffer = {
	  ArrayBuffer: $ArrayBuffer,
	  DataView: $DataView
	};

	var isObject$1 = isObject$m;

	var floor$1 = Math.floor;

	// `IsIntegralNumber` abstract operation
	// https://tc39.es/ecma262/#sec-isintegralnumber
	// eslint-disable-next-line es/no-number-isinteger -- safe
	var isIntegralNumber$1 = Number.isInteger || function isInteger(it) {
	  return !isObject$1(it) && isFinite(it) && floor$1(it) === it;
	};

	var global$9 = global$19;
	var toIntegerOrInfinity$1 = toIntegerOrInfinity$b;

	var RangeError$4 = global$9.RangeError;

	var toPositiveInteger$1 = function (it) {
	  var result = toIntegerOrInfinity$1(it);
	  if (result < 0) throw RangeError$4("The argument can't be less than 0");
	  return result;
	};

	var global$8 = global$19;
	var toPositiveInteger = toPositiveInteger$1;

	var RangeError$3 = global$8.RangeError;

	var toOffset$2 = function (it, BYTES) {
	  var offset = toPositiveInteger(it);
	  if (offset % BYTES) throw RangeError$3('Wrong offset');
	  return offset;
	};

	var bind = functionBindContext;
	var call$2 = functionCall;
	var aConstructor = aConstructor$3;
	var toObject$3 = toObject$g;
	var lengthOfArrayLike$4 = lengthOfArrayLike$f;
	var getIterator = getIterator$3;
	var getIteratorMethod = getIteratorMethod$4;
	var isArrayIteratorMethod = isArrayIteratorMethod$3;
	var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;

	var typedArrayFrom$2 = function from(source /* , mapfn, thisArg */) {
	  var C = aConstructor(this);
	  var O = toObject$3(source);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var i, length, result, step, iterator, next;
	  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    O = [];
	    while (!(step = call$2(next, iterator)).done) {
	      O.push(step.value);
	    }
	  }
	  if (mapping && argumentsLength > 2) {
	    mapfn = bind(mapfn, arguments[2]);
	  }
	  length = lengthOfArrayLike$4(O);
	  result = new (aTypedArrayConstructor$2(C))(length);
	  for (i = 0; length > i; i++) {
	    result[i] = mapping ? mapfn(O[i], i) : O[i];
	  }
	  return result;
	};

	var $$1 = _export;
	var global$7 = global$19;
	var call$1 = functionCall;
	var DESCRIPTORS = descriptors;
	var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1 = typedArrayConstructorsRequireWrappers;
	var ArrayBufferViewCore$n = arrayBufferViewCore;
	var ArrayBufferModule = arrayBuffer;
	var anInstance = anInstance$5;
	var createPropertyDescriptor = createPropertyDescriptor$6;
	var createNonEnumerableProperty = createNonEnumerableProperty$b;
	var isIntegralNumber = isIntegralNumber$1;
	var toLength$1 = toLength$9;
	var toIndex = toIndex$2;
	var toOffset$1 = toOffset$2;
	var toPropertyKey = toPropertyKey$5;
	var hasOwn = hasOwnProperty_1;
	var classof = classof$c;
	var isObject = isObject$m;
	var isSymbol = isSymbol$4;
	var create = objectCreate;
	var isPrototypeOf = objectIsPrototypeOf;
	var setPrototypeOf = objectSetPrototypeOf;
	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var typedArrayFrom$1 = typedArrayFrom$2;
	var forEach = arrayIteration.forEach;
	var setSpecies = setSpecies$4;
	var definePropertyModule = objectDefineProperty;
	var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
	var InternalStateModule = internalState;
	var inheritIfRequired = inheritIfRequired$3;

	var getInternalState = InternalStateModule.get;
	var setInternalState = InternalStateModule.set;
	var nativeDefineProperty = definePropertyModule.f;
	var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	var round = Math.round;
	var RangeError$2 = global$7.RangeError;
	var ArrayBuffer$1 = ArrayBufferModule.ArrayBuffer;
	var ArrayBufferPrototype = ArrayBuffer$1.prototype;
	var DataView$1 = ArrayBufferModule.DataView;
	var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore$n.NATIVE_ARRAY_BUFFER_VIEWS;
	var TYPED_ARRAY_CONSTRUCTOR$1 = ArrayBufferViewCore$n.TYPED_ARRAY_CONSTRUCTOR;
	var TYPED_ARRAY_TAG = ArrayBufferViewCore$n.TYPED_ARRAY_TAG;
	var TypedArray = ArrayBufferViewCore$n.TypedArray;
	var TypedArrayPrototype = ArrayBufferViewCore$n.TypedArrayPrototype;
	var aTypedArrayConstructor$1 = ArrayBufferViewCore$n.aTypedArrayConstructor;
	var isTypedArray = ArrayBufferViewCore$n.isTypedArray;
	var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	var WRONG_LENGTH = 'Wrong length';

	var fromList = function (C, list) {
	  aTypedArrayConstructor$1(C);
	  var index = 0;
	  var length = list.length;
	  var result = new C(length);
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
	  return isPrototypeOf(ArrayBufferPrototype, it) || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
	};

	var isTypedArrayIndex = function (target, key) {
	  return isTypedArray(target)
	    && !isSymbol(key)
	    && key in target
	    && isIntegralNumber(+key)
	    && key >= 0;
	};

	var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
	  key = toPropertyKey(key);
	  return isTypedArrayIndex(target, key)
	    ? createPropertyDescriptor(2, target[key])
	    : nativeGetOwnPropertyDescriptor(target, key);
	};

	var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
	  key = toPropertyKey(key);
	  if (isTypedArrayIndex(target, key)
	    && isObject(descriptor)
	    && hasOwn(descriptor, 'value')
	    && !hasOwn(descriptor, 'get')
	    && !hasOwn(descriptor, 'set')
	    // TODO: add validation descriptor w/o calling accessors
	    && !descriptor.configurable
	    && (!hasOwn(descriptor, 'writable') || descriptor.writable)
	    && (!hasOwn(descriptor, 'enumerable') || descriptor.enumerable)
	  ) {
	    target[key] = descriptor.value;
	    return target;
	  } return nativeDefineProperty(target, key, descriptor);
	};

	if (DESCRIPTORS) {
	  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	    getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
	    definePropertyModule.f = wrappedDefineProperty;
	    addGetter(TypedArrayPrototype, 'buffer');
	    addGetter(TypedArrayPrototype, 'byteOffset');
	    addGetter(TypedArrayPrototype, 'byteLength');
	    addGetter(TypedArrayPrototype, 'length');
	  }

	  $$1({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
	    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
	    defineProperty: wrappedDefineProperty
	  });

	  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
	    var BYTES = TYPE.match(/\d+$/)[0] / 8;
	    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + TYPE;
	    var SETTER = 'set' + TYPE;
	    var NativeTypedArrayConstructor = global$7[CONSTRUCTOR_NAME];
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
	        anInstance(that, TypedArrayConstructorPrototype);
	        var index = 0;
	        var byteOffset = 0;
	        var buffer, byteLength, length;
	        if (!isObject(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new ArrayBuffer$1(byteLength);
	        } else if (isArrayBuffer(data)) {
	          buffer = data;
	          byteOffset = toOffset$1(offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw RangeError$2(WRONG_LENGTH);
	            byteLength = $len - byteOffset;
	            if (byteLength < 0) throw RangeError$2(WRONG_LENGTH);
	          } else {
	            byteLength = toLength$1($length) * BYTES;
	            if (byteLength + byteOffset > $len) throw RangeError$2(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (isTypedArray(data)) {
	          return fromList(TypedArrayConstructor, data);
	        } else {
	          return call$1(typedArrayFrom$1, TypedArrayConstructor, data);
	        }
	        setInternalState(that, {
	          buffer: buffer,
	          byteOffset: byteOffset,
	          byteLength: byteLength,
	          length: length,
	          view: new DataView$1(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });

	      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
	      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create(TypedArrayPrototype);
	    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1) {
	      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
	        anInstance(dummy, TypedArrayConstructorPrototype);
	        return inheritIfRequired(function () {
	          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
	          if (isArrayBuffer(data)) return $length !== undefined
	            ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES), $length)
	            : typedArrayOffset !== undefined
	              ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES))
	              : new NativeTypedArrayConstructor(data);
	          if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
	          return call$1(typedArrayFrom$1, TypedArrayConstructor, data);
	        }(), dummy, TypedArrayConstructor);
	      });

	      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
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

	    createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_CONSTRUCTOR$1, TypedArrayConstructor);

	    if (TYPED_ARRAY_TAG) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
	    }

	    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

	    $$1({
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
	} else typedArrayConstructor.exports = function () { /* empty */ };

	var createTypedArrayConstructor = typedArrayConstructor.exports;

	// `Uint8Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Uint8', function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});

	var toObject$2 = toObject$g;
	var toAbsoluteIndex$1 = toAbsoluteIndex$7;
	var lengthOfArrayLike$3 = lengthOfArrayLike$f;

	var min$1 = Math.min;

	// `Array.prototype.copyWithin` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.copywithin
	// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
	var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
	  var O = toObject$2(this);
	  var len = lengthOfArrayLike$3(O);
	  var to = toAbsoluteIndex$1(target, len);
	  var from = toAbsoluteIndex$1(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = min$1((end === undefined ? len : toAbsoluteIndex$1(end, len)) - from, len - to);
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

	var uncurryThis$4 = functionUncurryThis;
	var ArrayBufferViewCore$m = arrayBufferViewCore;
	var $ArrayCopyWithin = arrayCopyWithin;

	var u$ArrayCopyWithin = uncurryThis$4($ArrayCopyWithin);
	var aTypedArray$l = ArrayBufferViewCore$m.aTypedArray;
	var exportTypedArrayMethod$m = ArrayBufferViewCore$m.exportTypedArrayMethod;

	// `%TypedArray%.prototype.copyWithin` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
	exportTypedArrayMethod$m('copyWithin', function copyWithin(target, start /* , end */) {
	  return u$ArrayCopyWithin(aTypedArray$l(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	});

	var ArrayBufferViewCore$l = arrayBufferViewCore;
	var $every = arrayIteration.every;

	var aTypedArray$k = ArrayBufferViewCore$l.aTypedArray;
	var exportTypedArrayMethod$l = ArrayBufferViewCore$l.exportTypedArrayMethod;

	// `%TypedArray%.prototype.every` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
	exportTypedArrayMethod$l('every', function every(callbackfn /* , thisArg */) {
	  return $every(aTypedArray$k(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$k = arrayBufferViewCore;
	var call = functionCall;
	var $fill = arrayFill$1;

	var aTypedArray$j = ArrayBufferViewCore$k.aTypedArray;
	var exportTypedArrayMethod$k = ArrayBufferViewCore$k.exportTypedArrayMethod;

	// `%TypedArray%.prototype.fill` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
	exportTypedArrayMethod$k('fill', function fill(value /* , start, end */) {
	  var length = arguments.length;
	  return call(
	    $fill,
	    aTypedArray$j(this),
	    value,
	    length > 1 ? arguments[1] : undefined,
	    length > 2 ? arguments[2] : undefined
	  );
	});

	var arrayFromConstructorAndList$1 = function (Constructor, list) {
	  var index = 0;
	  var length = list.length;
	  var result = new Constructor(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	};

	var ArrayBufferViewCore$j = arrayBufferViewCore;
	var speciesConstructor = speciesConstructor$3;

	var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore$j.TYPED_ARRAY_CONSTRUCTOR;
	var aTypedArrayConstructor = ArrayBufferViewCore$j.aTypedArrayConstructor;

	// a part of `TypedArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#typedarray-species-create
	var typedArraySpeciesConstructor$4 = function (originalArray) {
	  return aTypedArrayConstructor(speciesConstructor(originalArray, originalArray[TYPED_ARRAY_CONSTRUCTOR]));
	};

	var arrayFromConstructorAndList = arrayFromConstructorAndList$1;
	var typedArraySpeciesConstructor$3 = typedArraySpeciesConstructor$4;

	var typedArrayFromSpeciesAndList = function (instance, list) {
	  return arrayFromConstructorAndList(typedArraySpeciesConstructor$3(instance), list);
	};

	var ArrayBufferViewCore$i = arrayBufferViewCore;
	var $filter = arrayIteration.filter;
	var fromSpeciesAndList = typedArrayFromSpeciesAndList;

	var aTypedArray$i = ArrayBufferViewCore$i.aTypedArray;
	var exportTypedArrayMethod$j = ArrayBufferViewCore$i.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filter` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
	exportTypedArrayMethod$j('filter', function filter(callbackfn /* , thisArg */) {
	  var list = $filter(aTypedArray$i(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return fromSpeciesAndList(this, list);
	});

	var ArrayBufferViewCore$h = arrayBufferViewCore;
	var $find = arrayIteration.find;

	var aTypedArray$h = ArrayBufferViewCore$h.aTypedArray;
	var exportTypedArrayMethod$i = ArrayBufferViewCore$h.exportTypedArrayMethod;

	// `%TypedArray%.prototype.find` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
	exportTypedArrayMethod$i('find', function find(predicate /* , thisArg */) {
	  return $find(aTypedArray$h(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$g = arrayBufferViewCore;
	var $findIndex = arrayIteration.findIndex;

	var aTypedArray$g = ArrayBufferViewCore$g.aTypedArray;
	var exportTypedArrayMethod$h = ArrayBufferViewCore$g.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findIndex` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
	exportTypedArrayMethod$h('findIndex', function findIndex(predicate /* , thisArg */) {
	  return $findIndex(aTypedArray$g(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$f = arrayBufferViewCore;
	var $forEach = arrayIteration.forEach;

	var aTypedArray$f = ArrayBufferViewCore$f.aTypedArray;
	var exportTypedArrayMethod$g = ArrayBufferViewCore$f.exportTypedArrayMethod;

	// `%TypedArray%.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
	exportTypedArrayMethod$g('forEach', function forEach(callbackfn /* , thisArg */) {
	  $forEach(aTypedArray$f(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$e = arrayBufferViewCore;
	var $includes = arrayIncludes.includes;

	var aTypedArray$e = ArrayBufferViewCore$e.aTypedArray;
	var exportTypedArrayMethod$f = ArrayBufferViewCore$e.exportTypedArrayMethod;

	// `%TypedArray%.prototype.includes` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
	exportTypedArrayMethod$f('includes', function includes(searchElement /* , fromIndex */) {
	  return $includes(aTypedArray$e(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$d = arrayBufferViewCore;
	var $indexOf = arrayIncludes.indexOf;

	var aTypedArray$d = ArrayBufferViewCore$d.aTypedArray;
	var exportTypedArrayMethod$e = ArrayBufferViewCore$d.exportTypedArrayMethod;

	// `%TypedArray%.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
	exportTypedArrayMethod$e('indexOf', function indexOf(searchElement /* , fromIndex */) {
	  return $indexOf(aTypedArray$d(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});

	var global$6 = global$19;
	var uncurryThis$3 = functionUncurryThis;
	var PROPER_FUNCTION_NAME = functionName.PROPER;
	var ArrayBufferViewCore$c = arrayBufferViewCore;
	var ArrayIterators = es_array_iterator;
	var wellKnownSymbol = wellKnownSymbol$r;

	var ITERATOR = wellKnownSymbol('iterator');
	var Uint8Array$2 = global$6.Uint8Array;
	var arrayValues = uncurryThis$3(ArrayIterators.values);
	var arrayKeys = uncurryThis$3(ArrayIterators.keys);
	var arrayEntries = uncurryThis$3(ArrayIterators.entries);
	var aTypedArray$c = ArrayBufferViewCore$c.aTypedArray;
	var exportTypedArrayMethod$d = ArrayBufferViewCore$c.exportTypedArrayMethod;
	var nativeTypedArrayIterator = Uint8Array$2 && Uint8Array$2.prototype[ITERATOR];

	var PROPER_ARRAY_VALUES_NAME = !!nativeTypedArrayIterator && nativeTypedArrayIterator.name === 'values';

	var typedArrayValues = function values() {
	  return arrayValues(aTypedArray$c(this));
	};

	// `%TypedArray%.prototype.entries` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
	exportTypedArrayMethod$d('entries', function entries() {
	  return arrayEntries(aTypedArray$c(this));
	});
	// `%TypedArray%.prototype.keys` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
	exportTypedArrayMethod$d('keys', function keys() {
	  return arrayKeys(aTypedArray$c(this));
	});
	// `%TypedArray%.prototype.values` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
	exportTypedArrayMethod$d('values', typedArrayValues, PROPER_FUNCTION_NAME && !PROPER_ARRAY_VALUES_NAME);
	// `%TypedArray%.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
	exportTypedArrayMethod$d(ITERATOR, typedArrayValues, PROPER_FUNCTION_NAME && !PROPER_ARRAY_VALUES_NAME);

	var ArrayBufferViewCore$b = arrayBufferViewCore;
	var uncurryThis$2 = functionUncurryThis;

	var aTypedArray$b = ArrayBufferViewCore$b.aTypedArray;
	var exportTypedArrayMethod$c = ArrayBufferViewCore$b.exportTypedArrayMethod;
	var $join = uncurryThis$2([].join);

	// `%TypedArray%.prototype.join` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
	exportTypedArrayMethod$c('join', function join(separator) {
	  return $join(aTypedArray$b(this), separator);
	});

	/* eslint-disable es/no-array-prototype-lastindexof -- safe */
	var apply$2 = functionApply;
	var toIndexedObject = toIndexedObject$c;
	var toIntegerOrInfinity = toIntegerOrInfinity$b;
	var lengthOfArrayLike$2 = lengthOfArrayLike$f;
	var arrayMethodIsStrict = arrayMethodIsStrict$4;

	var min = Math.min;
	var $lastIndexOf$1 = [].lastIndexOf;
	var NEGATIVE_ZERO = !!$lastIndexOf$1 && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
	var FORCED$4 = NEGATIVE_ZERO || !STRICT_METHOD;

	// `Array.prototype.lastIndexOf` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
	var arrayLastIndexOf = FORCED$4 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO) return apply$2($lastIndexOf$1, this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = lengthOfArrayLike$2(O);
	  var index = length - 1;
	  if (arguments.length > 1) index = min(index, toIntegerOrInfinity(arguments[1]));
	  if (index < 0) index = length + index;
	  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
	  return -1;
	} : $lastIndexOf$1;

	var ArrayBufferViewCore$a = arrayBufferViewCore;
	var apply$1 = functionApply;
	var $lastIndexOf = arrayLastIndexOf;

	var aTypedArray$a = ArrayBufferViewCore$a.aTypedArray;
	var exportTypedArrayMethod$b = ArrayBufferViewCore$a.exportTypedArrayMethod;

	// `%TypedArray%.prototype.lastIndexOf` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
	exportTypedArrayMethod$b('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
	  var length = arguments.length;
	  return apply$1($lastIndexOf, aTypedArray$a(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
	});

	var ArrayBufferViewCore$9 = arrayBufferViewCore;
	var $map = arrayIteration.map;
	var typedArraySpeciesConstructor$2 = typedArraySpeciesConstructor$4;

	var aTypedArray$9 = ArrayBufferViewCore$9.aTypedArray;
	var exportTypedArrayMethod$a = ArrayBufferViewCore$9.exportTypedArrayMethod;

	// `%TypedArray%.prototype.map` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
	exportTypedArrayMethod$a('map', function map(mapfn /* , thisArg */) {
	  return $map(aTypedArray$9(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
	    return new (typedArraySpeciesConstructor$2(O))(length);
	  });
	});

	var global$5 = global$19;
	var aCallable$1 = aCallable$9;
	var toObject$1 = toObject$g;
	var IndexedObject = indexedObject;
	var lengthOfArrayLike$1 = lengthOfArrayLike$f;

	var TypeError$1 = global$5.TypeError;

	// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    aCallable$1(callbackfn);
	    var O = toObject$1(that);
	    var self = IndexedObject(O);
	    var length = lengthOfArrayLike$1(O);
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
	        throw TypeError$1('Reduce of empty array with no initial value');
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

	var ArrayBufferViewCore$8 = arrayBufferViewCore;
	var $reduce = arrayReduce.left;

	var aTypedArray$8 = ArrayBufferViewCore$8.aTypedArray;
	var exportTypedArrayMethod$9 = ArrayBufferViewCore$8.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
	exportTypedArrayMethod$9('reduce', function reduce(callbackfn /* , initialValue */) {
	  var length = arguments.length;
	  return $reduce(aTypedArray$8(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$7 = arrayBufferViewCore;
	var $reduceRight = arrayReduce.right;

	var aTypedArray$7 = ArrayBufferViewCore$7.aTypedArray;
	var exportTypedArrayMethod$8 = ArrayBufferViewCore$7.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduceRicht` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
	exportTypedArrayMethod$8('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
	  var length = arguments.length;
	  return $reduceRight(aTypedArray$7(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
	});

	var ArrayBufferViewCore$6 = arrayBufferViewCore;

	var aTypedArray$6 = ArrayBufferViewCore$6.aTypedArray;
	var exportTypedArrayMethod$7 = ArrayBufferViewCore$6.exportTypedArrayMethod;
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

	var global$4 = global$19;
	var ArrayBufferViewCore$5 = arrayBufferViewCore;
	var lengthOfArrayLike = lengthOfArrayLike$f;
	var toOffset = toOffset$2;
	var toObject = toObject$g;
	var fails$4 = fails$E;

	var RangeError$1 = global$4.RangeError;
	var aTypedArray$5 = ArrayBufferViewCore$5.aTypedArray;
	var exportTypedArrayMethod$6 = ArrayBufferViewCore$5.exportTypedArrayMethod;

	var FORCED$3 = fails$4(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  new Int8Array(1).set({});
	});

	// `%TypedArray%.prototype.set` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
	exportTypedArrayMethod$6('set', function set(arrayLike /* , offset */) {
	  aTypedArray$5(this);
	  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
	  var length = this.length;
	  var src = toObject(arrayLike);
	  var len = lengthOfArrayLike(src);
	  var index = 0;
	  if (len + offset > length) throw RangeError$1('Wrong length');
	  while (index < len) this[offset + index] = src[index++];
	}, FORCED$3);

	var ArrayBufferViewCore$4 = arrayBufferViewCore;
	var typedArraySpeciesConstructor$1 = typedArraySpeciesConstructor$4;
	var fails$3 = fails$E;
	var arraySlice$1 = arraySlice$8;

	var aTypedArray$4 = ArrayBufferViewCore$4.aTypedArray;
	var exportTypedArrayMethod$5 = ArrayBufferViewCore$4.exportTypedArrayMethod;

	var FORCED$2 = fails$3(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  new Int8Array(1).slice();
	});

	// `%TypedArray%.prototype.slice` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
	exportTypedArrayMethod$5('slice', function slice(start, end) {
	  var list = arraySlice$1(aTypedArray$4(this), start, end);
	  var C = typedArraySpeciesConstructor$1(this);
	  var index = 0;
	  var length = list.length;
	  var result = new C(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	}, FORCED$2);

	var ArrayBufferViewCore$3 = arrayBufferViewCore;
	var $some = arrayIteration.some;

	var aTypedArray$3 = ArrayBufferViewCore$3.aTypedArray;
	var exportTypedArrayMethod$4 = ArrayBufferViewCore$3.exportTypedArrayMethod;

	// `%TypedArray%.prototype.some` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
	exportTypedArrayMethod$4('some', function some(callbackfn /* , thisArg */) {
	  return $some(aTypedArray$3(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});

	var global$3 = global$19;
	var uncurryThis$1 = functionUncurryThis;
	var fails$2 = fails$E;
	var aCallable = aCallable$9;
	var internalSort = arraySort;
	var ArrayBufferViewCore$2 = arrayBufferViewCore;
	var FF = engineFfVersion;
	var IE_OR_EDGE = engineIsIeOrEdge;
	var V8 = engineV8Version;
	var WEBKIT = engineWebkitVersion;

	var Array$1 = global$3.Array;
	var aTypedArray$2 = ArrayBufferViewCore$2.aTypedArray;
	var exportTypedArrayMethod$3 = ArrayBufferViewCore$2.exportTypedArrayMethod;
	var Uint16Array = global$3.Uint16Array;
	var un$Sort = Uint16Array && uncurryThis$1(Uint16Array.prototype.sort);

	// WebKit
	var ACCEPT_INCORRECT_ARGUMENTS = !!un$Sort && !(fails$2(function () {
	  un$Sort(new Uint16Array(2), null);
	}) && fails$2(function () {
	  un$Sort(new Uint16Array(2), {});
	}));

	var STABLE_SORT = !!un$Sort && !fails$2(function () {
	  // feature detection can be too slow, so check engines versions
	  if (V8) return V8 < 74;
	  if (FF) return FF < 67;
	  if (IE_OR_EDGE) return true;
	  if (WEBKIT) return WEBKIT < 602;

	  var array = new Uint16Array(516);
	  var expected = Array$1(516);
	  var index, mod;

	  for (index = 0; index < 516; index++) {
	    mod = index % 4;
	    array[index] = 515 - index;
	    expected[index] = index - 2 * mod + 3;
	  }

	  un$Sort(array, function (a, b) {
	    return (a / 4 | 0) - (b / 4 | 0);
	  });

	  for (index = 0; index < 516; index++) {
	    if (array[index] !== expected[index]) return true;
	  }
	});

	var getSortCompare = function (comparefn) {
	  return function (x, y) {
	    if (comparefn !== undefined) return +comparefn(x, y) || 0;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (y !== y) return -1;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (x !== x) return 1;
	    if (x === 0 && y === 0) return 1 / x > 0 && 1 / y < 0 ? 1 : -1;
	    return x > y;
	  };
	};

	// `%TypedArray%.prototype.sort` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
	exportTypedArrayMethod$3('sort', function sort(comparefn) {
	  if (comparefn !== undefined) aCallable(comparefn);
	  if (STABLE_SORT) return un$Sort(this, comparefn);

	  return internalSort(aTypedArray$2(this), getSortCompare(comparefn));
	}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);

	var ArrayBufferViewCore$1 = arrayBufferViewCore;
	var toLength = toLength$9;
	var toAbsoluteIndex = toAbsoluteIndex$7;
	var typedArraySpeciesConstructor = typedArraySpeciesConstructor$4;

	var aTypedArray$1 = ArrayBufferViewCore$1.aTypedArray;
	var exportTypedArrayMethod$2 = ArrayBufferViewCore$1.exportTypedArrayMethod;

	// `%TypedArray%.prototype.subarray` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
	exportTypedArrayMethod$2('subarray', function subarray(begin, end) {
	  var O = aTypedArray$1(this);
	  var length = O.length;
	  var beginIndex = toAbsoluteIndex(begin, length);
	  var C = typedArraySpeciesConstructor(O);
	  return new C(
	    O.buffer,
	    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
	    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
	  );
	});

	var global$2 = global$19;
	var apply = functionApply;
	var ArrayBufferViewCore = arrayBufferViewCore;
	var fails$1 = fails$E;
	var arraySlice = arraySlice$8;

	var Int8Array$1 = global$2.Int8Array;
	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod$1 = ArrayBufferViewCore.exportTypedArrayMethod;
	var $toLocaleString = [].toLocaleString;

	// iOS Safari 6.x fails here
	var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails$1(function () {
	  $toLocaleString.call(new Int8Array$1(1));
	});

	var FORCED$1 = fails$1(function () {
	  return [1, 2].toLocaleString() != new Int8Array$1([1, 2]).toLocaleString();
	}) || !fails$1(function () {
	  Int8Array$1.prototype.toLocaleString.call([1, 2]);
	});

	// `%TypedArray%.prototype.toLocaleString` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
	exportTypedArrayMethod$1('toLocaleString', function toLocaleString() {
	  return apply(
	    $toLocaleString,
	    TO_LOCALE_STRING_BUG ? arraySlice(aTypedArray(this)) : aTypedArray(this),
	    arraySlice(arguments)
	  );
	}, FORCED$1);

	var exportTypedArrayMethod = arrayBufferViewCore.exportTypedArrayMethod;
	var fails = fails$E;
	var global$1 = global$19;
	var uncurryThis = functionUncurryThis;

	var Uint8Array$1 = global$1.Uint8Array;
	var Uint8ArrayPrototype = Uint8Array$1 && Uint8Array$1.prototype || {};
	var arrayToString = [].toString;
	var join = uncurryThis([].join);

	if (fails(function () { arrayToString.call({}); })) {
	  arrayToString = function toString() {
	    return join(this);
	  };
	}

	var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

	// `%TypedArray%.prototype.toString` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
	exportTypedArrayMethod('toString', arrayToString, IS_NOT_ARRAY_METHOD);

	var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = typedArrayConstructorsRequireWrappers;
	var exportTypedArrayStaticMethod = arrayBufferViewCore.exportTypedArrayStaticMethod;
	var typedArrayFrom = typedArrayFrom$2;

	// `%TypedArray%.from` method
	// https://tc39.es/ecma262/#sec-%typedarray%.from
	exportTypedArrayStaticMethod('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);

	var base64 = {exports: {}};

	(function (module, exports) {

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
	})(base64);

	var $ = _export;
	var $trimStart = stringTrim.start;
	var forcedStringTrimMethod = stringTrimForced;

	var FORCED = forcedStringTrimMethod('trimStart');

	var trimStart = FORCED ? function trimStart() {
	  return $trimStart(this);
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	} : ''.trimStart;

	// `String.prototype.{ trimStart, trimLeft }` methods
	// https://tc39.es/ecma262/#sec-string.prototype.trimstart
	// https://tc39.es/ecma262/#String.prototype.trimleft
	$({ target: 'String', proto: true, name: 'trimStart', forced: FORCED }, {
	  trimStart: trimStart,
	  trimLeft: trimStart
	});

	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */


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

	var querystringify$1 = {};

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


	querystringify$1.stringify = querystringify;
	querystringify$1.parse = querystring;

	var required = requiresPort,
	    qs = querystringify$1,
	    slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//,
	    protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i,
	    windowsDriveLetter = /^[a-zA-Z]:/,
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
	function sanitize(address, url) {
	  // Sanitize what is left of the address
	  return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
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
	 * Check whether a protocol scheme is special.
	 *
	 * @param {String} The protocol scheme of the URL
	 * @return {Boolean} `true` if the protocol scheme is special, else `false`
	 * @private
	 */


	function isSpecial(scheme) {
	  return scheme === 'file:' || scheme === 'ftp:' || scheme === 'http:' || scheme === 'https:' || scheme === 'ws:' || scheme === 'wss:';
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
	 * @param {Object} location
	 * @return {ProtocolExtract} Extracted information.
	 * @private
	 */


	function extractProtocol(address, location) {
	  address = trimLeft(address);
	  location = location || {};
	  var match = protocolre.exec(address);
	  var protocol = match[1] ? match[1].toLowerCase() : '';
	  var forwardSlashes = !!match[2];
	  var otherSlashes = !!match[3];
	  var slashesCount = 0;
	  var rest;

	  if (forwardSlashes) {
	    if (otherSlashes) {
	      rest = match[2] + match[3] + match[4];
	      slashesCount = match[2].length + match[3].length;
	    } else {
	      rest = match[2] + match[4];
	      slashesCount = match[2].length;
	    }
	  } else {
	    if (otherSlashes) {
	      rest = match[3] + match[4];
	      slashesCount = match[3].length;
	    } else {
	      rest = match[4];
	    }
	  }

	  if (protocol === 'file:') {
	    if (slashesCount >= 2) {
	      rest = rest.slice(2);
	    }
	  } else if (isSpecial(protocol)) {
	    rest = match[4];
	  } else if (protocol) {
	    if (forwardSlashes) {
	      rest = rest.slice(2);
	    }
	  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
	    rest = match[4];
	  }

	  return {
	    protocol: protocol,
	    slashes: forwardSlashes || isSpecial(protocol),
	    slashesCount: slashesCount,
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

	  if (parser && 'function' !== typeof parser) parser = qs.parse;
	  location = lolcation(location); //
	  // Extract protocol information before running the instructions.
	  //

	  extracted = extractProtocol(address || '', location);
	  relative = !extracted.protocol && !extracted.slashes;
	  url.slashes = extracted.slashes || relative && location.slashes;
	  url.protocol = extracted.protocol || location.protocol || '';
	  address = extracted.rest; //
	  // When the authority component is absent the URL starts with a path
	  // component.
	  //

	  if (extracted.protocol === 'file:' && (extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) || !extracted.slashes && (extracted.protocol || extracted.slashesCount < 2 || !isSpecial(url.protocol))) {
	    instructions[3] = [/(.*)/, 'pathname'];
	  }

	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];

	    if (typeof instruction === 'function') {
	      address = instruction(address, url);
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


	  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
	    url.pathname = '/' + url.pathname;
	  } //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //


	  if (!required(url.port, url.protocol)) {
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

	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host ? url.protocol + '//' + url.host : 'null'; //
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
	        value = (fn || qs.parse)(value);
	      }

	      url[part] = value;
	      break;

	    case 'port':
	      url[part] = value;

	      if (!required(value, url.protocol)) {
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

	  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host ? url.protocol + '//' + url.host : 'null';
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
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
	  var query,
	      url = this,
	      protocol = url.protocol;
	  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';
	  var result = protocol + (url.slashes || isSpecial(url.protocol) ? '//' : '');

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
	Url.qs = qs;
	var urlParse = Url;

	var collection = collection$2;
	var collectionStrong = collectionStrong$2;

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
	      var requestId = req.getHeader('X-Request-ID') || 'n/a';
	      var method = req.getMethod();
	      var url = req.getURL();
	      var status = res ? res.getStatus() : 'n/a';
	      var body = res ? res.getBody() || '' : 'n/a';
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
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0,
	        v = c == 'x' ? r : r & 0x3 | 0x8;
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


	    if ('resume' in options) {
	      console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.'); // eslint-disable-line no-console
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
	        this._emitError(new Error('tus: no file or stream to upload provided'));

	        return;
	      }

	      if (!this.options.endpoint && !this.options.uploadUrl) {
	        this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));

	        return;
	      }

	      var retryDelays = this.options.retryDelays;

	      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
	        this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));

	        return;
	      }

	      if (this.options.parallelUploads > 1) {
	        // Test which options are incompatible with parallel uploads.
	        ['uploadUrl', 'uploadSize', 'uploadLengthDeferred'].forEach(function (optionName) {
	          if (_this2.options[optionName]) {
	            _this2._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
	          }
	        });
	      }

	      this.options.fingerprint(file, this.options).then(function (fingerprint) {

	        _this2._fingerprint = fingerprint;

	        if (_this2._source) {
	          return _this2._source;
	        }

	        return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
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
	                'Upload-Concat': 'partial'
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
	        req = _this3._openRequest('POST', _this3.options.endpoint);
	        req.setHeader('Upload-Concat', "final;".concat(_this3._parallelUploadUrls.join(' '))); // Add metadata if values have been added

	        var metadata = encodeMetadata(_this3.options.metadata);

	        if (metadata !== '') {
	          req.setHeader('Upload-Metadata', metadata);
	        }

	        return _this3._sendRequest(req, null);
	      }).then(function (res) {
	        if (!inStatusCategory(res.getStatus(), 200)) {
	          _this3._emitHttpError(req, res, 'tus: unexpected response while creating upload');

	          return;
	        }

	        var location = res.getHeader('Location');

	        if (location == null) {
	          _this3._emitHttpError(req, res, 'tus: invalid or missing Location header');

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
	          this._emitError(new Error('tus: cannot convert `uploadSize` option into a number'));

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
	    value: function abort(shouldTerminate) {
	      var _this4 = this; // Count the number of arguments to see if a callback is being provided in the old style required by tus-js-client 1.x, then throw an error if it is.
	      // `arguments` is a JavaScript built-in variable that contains all of the function's arguments.


	      if (arguments.length > 1 && typeof arguments[1] === 'function') {
	        throw new Error('tus: the abort function does not accept a callback since v2 anymore; please use the returned Promise instead');
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

	      if (typeof this.options.onError === 'function') {
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

	      if (typeof this.options.onSuccess === 'function') {
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
	      if (typeof this.options.onProgress === 'function') {
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
	      if (typeof this.options.onChunkComplete === 'function') {
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
	        this._emitError(new Error('tus: unable to create upload because no endpoint is provided'));

	        return;
	      }

	      var req = this._openRequest('POST', this.options.endpoint);

	      if (this.options.uploadLengthDeferred) {
	        req.setHeader('Upload-Defer-Length', 1);
	      } else {
	        req.setHeader('Upload-Length', this._size);
	      } // Add metadata if values have been added


	      var metadata = encodeMetadata(this.options.metadata);

	      if (metadata !== '') {
	        req.setHeader('Upload-Metadata', metadata);
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
	          _this6._emitHttpError(req, res, 'tus: unexpected response while creating upload');

	          return;
	        }

	        var location = res.getHeader('Location');

	        if (location == null) {
	          _this6._emitHttpError(req, res, 'tus: invalid or missing Location header');

	          return;
	        }

	        _this6.url = resolveUrl(_this6.options.endpoint, location);
	        log("Created upload at ".concat(_this6.url));

	        if (typeof _this6.options._onUploadUrlAvailable === 'function') {
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
	        _this6._emitHttpError(req, null, 'tus: failed to create upload', err);
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

	      var req = this._openRequest('HEAD', this.url);

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
	            _this7._emitHttpError(req, res, 'tus: upload is currently locked; retry later');

	            return;
	          }

	          if (!_this7.options.endpoint) {
	            // Don't attempt to create a new upload if no endpoint is provided.
	            _this7._emitHttpError(req, res, 'tus: unable to resume upload (new upload cannot be created without an endpoint)');

	            return;
	          } // Try to create a new upload


	          _this7.url = null;

	          _this7._createUpload();

	          return;
	        }

	        var offset = parseInt(res.getHeader('Upload-Offset'), 10);

	        if (isNaN(offset)) {
	          _this7._emitHttpError(req, res, 'tus: invalid or missing offset value');

	          return;
	        }

	        var length = parseInt(res.getHeader('Upload-Length'), 10);

	        if (isNaN(length) && !_this7.options.uploadLengthDeferred) {
	          _this7._emitHttpError(req, res, 'tus: invalid or missing length value');

	          return;
	        }

	        if (typeof _this7.options._onUploadUrlAvailable === 'function') {
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
	        _this7._emitHttpError(req, null, 'tus: failed to resume upload', err);
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
	        req = this._openRequest('POST', this.url);
	        req.setHeader('X-HTTP-Method-Override', 'PATCH');
	      } else {
	        req = this._openRequest('PATCH', this.url);
	      }

	      req.setHeader('Upload-Offset', this._offset);

	      var promise = this._addChunkToRequest(req);

	      promise.then(function (res) {
	        if (!inStatusCategory(res.getStatus(), 200)) {
	          _this8._emitHttpError(req, res, 'tus: unexpected response while uploading chunk');

	          return;
	        }

	        _this8._handleUploadResponse(req, res);
	      })["catch"](function (err) {
	        // Don't emit an error if the upload was aborted manually
	        if (_this8._aborted) {
	          return;
	        }

	        _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset ".concat(_this8._offset), err);
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
	      req.setHeader('Content-Type', 'application/offset+octet-stream'); // The specified chunkSize may be Infinity or the calcluated end position
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
	          req.setHeader('Upload-Length', _this9._size);
	        }

	        if (value === null) {
	          return _this9._sendRequest(req);
	        }

	        _this9._emitProgress(_this9._offset, _this9._size);

	        return _this9._sendRequest(req, value);
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
	      var offset = parseInt(res.getHeader('Upload-Offset'), 10);

	      if (isNaN(offset)) {
	        this._emitHttpError(req, res, 'tus: invalid or missing offset value');

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
	    value: function terminate(url, options) {
	      // Count the number of arguments to see if a callback is being provided as the last
	      // argument in the old style required by tus-js-client 1.x, then throw an error if it is.
	      // `arguments` is a JavaScript built-in variable that contains all of the function's arguments.
	      if (arguments.length > 1 && typeof arguments[arguments.length - 1] === 'function') {
	        throw new Error('tus: the terminate function does not accept a callback since v2 anymore; please use the returned Promise instead');
	      } // Note that in order for the trick above to work, a default value cannot be set for `options`,
	      // so the check below replaces the old default `{}`.


	      if (options === undefined) {
	        options = {};
	      }

	      var req = openRequest('DELETE', url, options);
	      return sendRequest(req, null, options).then(function (res) {
	        // A 204 response indicates a successfull request
	        if (res.getStatus() === 204) {
	          return;
	        }

	        throw new DetailedError('tus: unexpected response while terminating upload', null, req, res);
	      })["catch"](function (err) {
	        if (!(err instanceof DetailedError)) {
	          err = new DetailedError('tus: failed to terminate upload', err, req, null);
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
	    encoded.push("".concat(key, " ").concat(base64.exports.Base64.encode(metadata[key])));
	  }

	  return encoded.join(',');
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
	  req.setHeader('Tus-Resumable', '1.0.0');
	  var headers = options.headers || {};

	  for (var name in headers) {
	    req.setHeader(name, headers[name]);
	  }

	  if (options.addRequestId) {
	    var requestId = uuid();
	    req.setHeader('X-Request-ID', requestId);
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
	  var onBeforeRequestPromise = typeof options.onBeforeRequest === 'function' ? Promise.resolve(options.onBeforeRequest(req)) : Promise.resolve();
	  return onBeforeRequestPromise.then(function () {
	    return req.send(body).then(function (res) {
	      var onAfterResponsePromise = typeof options.onAfterResponse === 'function' ? Promise.resolve(options.onAfterResponse(req, res)) : Promise.resolve();
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

	  if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.onLine === false) {
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

	  if (options && typeof options.onShouldRetry === 'function') {
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
	  hasStorage = 'localStorage' in window; // Attempt to store and read entries from the local storage to detect Private
	  // Mode on Safari on iOS (see #49)

	  var key = 'tusSupport';
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
	      var results = this._findEntries('tus::');

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
	      return 'XHRHttpStack';
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
	      if (!('upload' in this._xhr)) {
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
	  return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
	};

	/**
	 * uriToBlob resolves a URI to a Blob object. This is used for
	 * React Native to retrieve a file (identified by a file://
	 * URI) as a blob.
	 */
	function uriToBlob(uri) {
	  return new Promise(function (resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.responseType = 'blob';

	    xhr.onload = function () {
	      var blob = xhr.response;
	      resolve(blob);
	    };

	    xhr.onerror = function (err) {
	      reject(err);
	    };

	    xhr.open('GET', uri);
	    xhr.send();
	  });
	}

	var isCordova = function isCordova() {
	  return typeof window != 'undefined' && (typeof window.PhoneGap != 'undefined' || typeof window.Cordova != 'undefined' || typeof window.cordova != 'undefined');
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

	  throw new Error('Unknown data type');
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
	      if (isReactNative() && input && typeof input.uri !== 'undefined') {
	        return uriToBlob(input.uri).then(function (blob) {
	          return new FileSource(blob);
	        })["catch"](function (err) {
	          throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(err));
	        });
	      } // Since we emulate the Blob type in our tests (not all target browsers
	      // support it), we cannot use `instanceof` for testing whether the input value
	      // can be handled. Instead, we simply check is the slice() function and the
	      // size property are available.


	      if (typeof input.slice === 'function' && typeof input.size !== 'undefined') {
	        return Promise.resolve(new FileSource(input));
	      }

	      if (typeof input.read === 'function') {
	        chunkSize = +chunkSize;

	        if (!isFinite(chunkSize)) {
	          return Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option'));
	        }

	        return Promise.resolve(new StreamSource(input, chunkSize));
	      }

	      return Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment'));
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

	  return Promise.resolve(['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
	}

	function reactNativeFingerprint(file, options) {
	  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
	  return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
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
	    hash &= hash; // Convert to 32bit integer
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

	function _asyncIterator(iterable) { var method, async, sync, retry = 2; if (typeof Symbol !== "undefined") { async = Symbol.asyncIterator; sync = Symbol.iterator; } while (retry--) { if (async && (method = iterable[async]) != null) { return method.call(iterable); } if (sync && (method = iterable[sync]) != null) { return new AsyncFromSyncIterator(method.call(iterable)); } async = "@@asyncIterator"; sync = "@@iterator"; } throw new TypeError("Object is not async iterable"); }

	function AsyncFromSyncIterator(s) { AsyncFromSyncIterator = function AsyncFromSyncIterator(s) { this.s = s; this.n = s.next; }; AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, return: function _return(value) { var ret = this.s.return; if (ret === undefined) { return Promise.resolve({ value: value, done: true }); } return AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments)); }, throw: function _throw(value) { var thr = this.s.return; if (thr === undefined) return Promise.reject(value); return AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments)); } }; function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) { return Promise.reject(new TypeError(r + " is not an object.")); } var done = r.done; return Promise.resolve(r.value).then(function (value) { return { value: value, done: done }; }); } return new AsyncFromSyncIterator(s); }

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
	        var _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, file;

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

	                _iteratorAbruptCompletion = false;
	                _didIteratorError = false;
	                _context.prev = 5;
	                _iterator = _asyncIterator(files);

	              case 7:
	                _context.next = 9;
	                return _iterator.next();

	              case 9:
	                if (!(_iteratorAbruptCompletion = !(_step = _context.sent).done)) {
	                  _context.next = 16;
	                  break;
	                }

	                file = _step.value;
	                _context.next = 13;
	                return _this.uploadFile(file);

	              case 13:
	                _iteratorAbruptCompletion = false;
	                _context.next = 7;
	                break;

	              case 16:
	                _context.next = 22;
	                break;

	              case 18:
	                _context.prev = 18;
	                _context.t0 = _context["catch"](5);
	                _didIteratorError = true;
	                _iteratorError = _context.t0;

	              case 22:
	                _context.prev = 22;
	                _context.prev = 23;

	                if (!(_iteratorAbruptCompletion && _iterator.return != null)) {
	                  _context.next = 27;
	                  break;
	                }

	                _context.next = 27;
	                return _iterator.return();

	              case 27:
	                _context.prev = 27;

	                if (!_didIteratorError) {
	                  _context.next = 30;
	                  break;
	                }

	                throw _iteratorError;

	              case 30:
	                return _context.finish(27);

	              case 31:
	                return _context.finish(22);

	              case 32:
	                _this.checkDropHint();

	              case 33:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, null, [[5, 18, 22, 32], [23,, 27, 31]]);
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

	      var placeholdersInfo = this.uploads.map(function (upload) {
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

	  var getInitialFiles = function getInitialFiles(fieldName) {
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
	    var initial = getInitialFiles(fieldName);
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

	function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

	function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty$2(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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
	window.autoInitFileForms = autoInitFileForms; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

	window.initFormSet = initFormSet; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

	window.initUploadFields = initUploadFields; // eslint-disable-line  @typescript-eslint/no-unsafe-member-access

})();
//# sourceMappingURL=file_form.debug.js.map
