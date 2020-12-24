(function () {
    'use strict';

    var isArray = Array.isArray;

    function isStringOrNumber(o) {
      var type = typeof o;
      return type === 'string' || type === 'number';
    }

    function isNullOrUndef(o) {
      return o === void 0 || o === null;
    }

    function isInvalid(o) {
      return o === null || o === false || o === true || o === void 0;
    }

    function isFunction(o) {
      return typeof o === 'function';
    }

    function isString(o) {
      return typeof o === 'string';
    }

    function isNumber(o) {
      return typeof o === 'number';
    }

    function isNull(o) {
      return o === null;
    }
    // Its used for comparison so we cant inline it into shared


    var EMPTY_OBJ = {};
    var options = {
      componentComparator: null,
      createVNode: null,
      renderComplete: null
    };

    var keyPrefix = '$';

    function V(childFlags, children, className, flags, key, props, ref, type) {
      this.childFlags = childFlags;
      this.children = children;
      this.className = className;
      this.dom = null;
      this.flags = flags;
      this.key = key === void 0 ? null : key;
      this.props = props === void 0 ? null : props;
      this.ref = ref === void 0 ? null : ref;
      this.type = type;
    }

    function createVNode(flags, type, className, children, childFlags, props, key, ref) {
      var childFlag = childFlags === void 0 ? 1
      /* HasInvalidChildren */
      : childFlags;
      var vNode = new V(childFlag, children, className, flags, key, props, ref, type);

      if (options.createVNode) {
        options.createVNode(vNode);
      }

      if (childFlag === 0
      /* UnknownChildren */
      ) {
          normalizeChildren(vNode, vNode.children);
        }

      return vNode;
    }

    function createTextVNode(text, key) {
      return new V(1
      /* HasInvalidChildren */
      , isNullOrUndef(text) || text === true || text === false ? '' : text, null, 16
      /* Text */
      , key, null, null, null);
    }

    function createFragment(children, childFlags, key) {
      var fragment = createVNode(8192
      /* Fragment */
      , 8192
      /* Fragment */
      , null, children, childFlags, null, key, null);

      switch (fragment.childFlags) {
        case 1
        /* HasInvalidChildren */
        :
          fragment.children = createVoidVNode();
          fragment.childFlags = 2
          /* HasVNodeChildren */
          ;
          break;

        case 16
        /* HasTextChildren */
        :
          fragment.children = [createTextVNode(children)];
          fragment.childFlags = 4
          /* HasNonKeyedChildren */
          ;
          break;
      }

      return fragment;
    }
    /*
     * Fragment is different than normal vNode,
     * because when it needs to be cloned we need to clone its children too
     * But not normalize, because otherwise those possibly get KEY and re-mount
     */


    function cloneFragment(vNodeToClone) {
      var oldChildren = vNodeToClone.children;
      var childFlags = vNodeToClone.childFlags;
      return createFragment(childFlags === 2
      /* HasVNodeChildren */
      ? directClone(oldChildren) : oldChildren.map(directClone), childFlags, vNodeToClone.key);
    }

    function directClone(vNodeToClone) {
      var flags = vNodeToClone.flags & -16385
      /* ClearInUse */
      ;
      var props = vNodeToClone.props;

      if (flags & 14
      /* Component */
      ) {
          if (!isNull(props)) {
            var propsToClone = props;
            props = {};

            for (var key in propsToClone) {
              props[key] = propsToClone[key];
            }
          }
        }

      if ((flags & 8192
      /* Fragment */
      ) === 0) {
        return new V(vNodeToClone.childFlags, vNodeToClone.children, vNodeToClone.className, flags, vNodeToClone.key, props, vNodeToClone.ref, vNodeToClone.type);
      }

      return cloneFragment(vNodeToClone);
    }

    function createVoidVNode() {
      return createTextVNode('', null);
    }

    function _normalizeVNodes(nodes, result, index, currentKey) {
      for (var len = nodes.length; index < len; index++) {
        var n = nodes[index];

        if (!isInvalid(n)) {
          var newKey = currentKey + keyPrefix + index;

          if (isArray(n)) {
            _normalizeVNodes(n, result, 0, newKey);
          } else {
            if (isStringOrNumber(n)) {
              n = createTextVNode(n, newKey);
            } else {
              var oldKey = n.key;
              var isPrefixedKey = isString(oldKey) && oldKey[0] === keyPrefix;

              if (n.flags & 81920
              /* InUseOrNormalized */
              || isPrefixedKey) {
                n = directClone(n);
              }

              n.flags |= 65536
              /* Normalized */
              ;

              if (!isPrefixedKey) {
                if (isNull(oldKey)) {
                  n.key = newKey;
                } else {
                  n.key = currentKey + oldKey;
                }
              } else if (oldKey.substring(0, currentKey.length) !== currentKey) {
                n.key = currentKey + oldKey;
              }
            }

            result.push(n);
          }
        }
      }
    }

    function normalizeChildren(vNode, children) {
      var newChildren;
      var newChildFlags = 1
      /* HasInvalidChildren */
      ; // Don't change children to match strict equal (===) true in patching

      if (isInvalid(children)) {
        newChildren = children;
      } else if (isStringOrNumber(children)) {
        newChildFlags = 16
        /* HasTextChildren */
        ;
        newChildren = children;
      } else if (isArray(children)) {
        var len = children.length;

        for (var i = 0; i < len; ++i) {
          var n = children[i];

          if (isInvalid(n) || isArray(n)) {
            newChildren = newChildren || children.slice(0, i);

            _normalizeVNodes(children, newChildren, i, '');

            break;
          } else if (isStringOrNumber(n)) {
            newChildren = newChildren || children.slice(0, i);
            newChildren.push(createTextVNode(n, keyPrefix + i));
          } else {
            var key = n.key;
            var needsCloning = (n.flags & 81920
            /* InUseOrNormalized */
            ) > 0;
            var isNullKey = isNull(key);
            var isPrefixed = isString(key) && key[0] === keyPrefix;

            if (needsCloning || isNullKey || isPrefixed) {
              newChildren = newChildren || children.slice(0, i);

              if (needsCloning || isPrefixed) {
                n = directClone(n);
              }

              if (isNullKey || isPrefixed) {
                n.key = keyPrefix + i;
              }

              newChildren.push(n);
            } else if (newChildren) {
              newChildren.push(n);
            }

            n.flags |= 65536
            /* Normalized */
            ;
          }
        }

        newChildren = newChildren || children;

        if (newChildren.length === 0) {
          newChildFlags = 1
          /* HasInvalidChildren */
          ;
        } else {
          newChildFlags = 8
          /* HasKeyedChildren */
          ;
        }
      } else {
        newChildren = children;
        newChildren.flags |= 65536
        /* Normalized */
        ;

        if (children.flags & 81920
        /* InUseOrNormalized */
        ) {
            newChildren = directClone(children);
          }

        newChildFlags = 2
        /* HasVNodeChildren */
        ;
      }

      vNode.children = newChildren;
      vNode.childFlags = newChildFlags;
      return vNode;
    }

    function triggerEventListener(props, methodName, e) {
      if (props[methodName]) {
        var listener = props[methodName];

        if (listener.event) {
          listener.event(listener.data, e);
        } else {
          listener(e);
        }
      } else {
        var nativeListenerName = methodName.toLowerCase();

        if (props[nativeListenerName]) {
          props[nativeListenerName](e);
        }
      }
    }

    function createWrappedFunction(methodName, applyValue) {
      var fnMethod = function (e) {
        var vNode = this.$V; // If vNode is gone by the time event fires, no-op

        if (!vNode) {
          return;
        }

        var props = vNode.props || EMPTY_OBJ;
        var dom = vNode.dom;

        if (isString(methodName)) {
          triggerEventListener(props, methodName, e);
        } else {
          for (var i = 0; i < methodName.length; ++i) {
            triggerEventListener(props, methodName[i], e);
          }
        }

        if (isFunction(applyValue)) {
          var newVNode = this.$V;
          var newProps = newVNode.props || EMPTY_OBJ;
          applyValue(newProps, dom, false, newVNode);
        }
      };

      Object.defineProperty(fnMethod, 'wrapped', {
        configurable: false,
        enumerable: false,
        value: true,
        writable: false
      });
      return fnMethod;
    }

    function isCheckedType(type) {
      return type === 'checkbox' || type === 'radio';
    }

    var onTextInputChange = createWrappedFunction('onInput', applyValueInput);
    var wrappedOnChange = createWrappedFunction(['onClick', 'onChange'], applyValueInput);

    function applyValueInput(nextPropsOrEmpty, dom) {
      var type = nextPropsOrEmpty.type;
      var value = nextPropsOrEmpty.value;
      var checked = nextPropsOrEmpty.checked;
      var multiple = nextPropsOrEmpty.multiple;
      var defaultValue = nextPropsOrEmpty.defaultValue;
      var hasValue = !isNullOrUndef(value);

      if (type && type !== dom.type) {
        dom.setAttribute('type', type);
      }

      if (!isNullOrUndef(multiple) && multiple !== dom.multiple) {
        dom.multiple = multiple;
      }

      if (!isNullOrUndef(defaultValue) && !hasValue) {
        dom.defaultValue = defaultValue + '';
      }

      if (isCheckedType(type)) {
        if (hasValue) {
          dom.value = value;
        }

        if (!isNullOrUndef(checked)) {
          dom.checked = checked;
        }
      } else {
        if (hasValue && dom.value !== value) {
          dom.defaultValue = value;
          dom.value = value;
        } else if (!isNullOrUndef(checked)) {
          dom.checked = checked;
        }
      }
    }

    function updateChildOptions(vNode, value) {
      if (vNode.type === 'option') {
        updateChildOption(vNode, value);
      } else {
        var children = vNode.children;
        var flags = vNode.flags;

        if (flags & 4
        /* ComponentClass */
        ) {
            updateChildOptions(children.$LI, value);
          } else if (flags & 8
        /* ComponentFunction */
        ) {
            updateChildOptions(children, value);
          } else if (vNode.childFlags === 2
        /* HasVNodeChildren */
        ) {
            updateChildOptions(children, value);
          } else if (vNode.childFlags & 12
        /* MultipleChildren */
        ) {
            for (var i = 0, len = children.length; i < len; ++i) {
              updateChildOptions(children[i], value);
            }
          }
      }
    }

    function updateChildOption(vNode, value) {
      var props = vNode.props || EMPTY_OBJ;
      var dom = vNode.dom; // we do this as multiple may have changed

      dom.value = props.value;

      if (props.value === value || isArray(value) && value.indexOf(props.value) !== -1) {
        dom.selected = true;
      } else if (!isNullOrUndef(value) || !isNullOrUndef(props.selected)) {
        dom.selected = props.selected || false;
      }
    }

    var onSelectChange = createWrappedFunction('onChange', applyValueSelect);

    function applyValueSelect(nextPropsOrEmpty, dom, mounting, vNode) {
      var multiplePropInBoolean = Boolean(nextPropsOrEmpty.multiple);

      if (!isNullOrUndef(nextPropsOrEmpty.multiple) && multiplePropInBoolean !== dom.multiple) {
        dom.multiple = multiplePropInBoolean;
      }

      var index = nextPropsOrEmpty.selectedIndex;

      if (index === -1) {
        dom.selectedIndex = -1;
      }

      var childFlags = vNode.childFlags;

      if (childFlags !== 1
      /* HasInvalidChildren */
      ) {
          var value = nextPropsOrEmpty.value;

          if (isNumber(index) && index > -1 && dom.options[index]) {
            value = dom.options[index].value;
          }

          if (mounting && isNullOrUndef(value)) {
            value = nextPropsOrEmpty.defaultValue;
          }

          updateChildOptions(vNode, value);
        }
    }

    var onTextareaInputChange = createWrappedFunction('onInput', applyValueTextArea);
    var wrappedOnChange$1 = createWrappedFunction('onChange');

    function applyValueTextArea(nextPropsOrEmpty, dom, mounting) {
      var value = nextPropsOrEmpty.value;
      var domValue = dom.value;

      if (isNullOrUndef(value)) {
        if (mounting) {
          var defaultValue = nextPropsOrEmpty.defaultValue;

          if (!isNullOrUndef(defaultValue) && defaultValue !== domValue) {
            dom.defaultValue = defaultValue;
            dom.value = defaultValue;
          }
        }
      } else if (domValue !== value) {
        /* There is value so keep it controlled */
        dom.defaultValue = value;
        dom.value = value;
      }
    }

    var hasDocumentAvailable = typeof document !== 'undefined';

    if (hasDocumentAvailable) {
      /*
       * Defining $EV and $V properties on Node.prototype
       * fixes v8 "wrong map" de-optimization
       */
      if (window.Node) {
        Node.prototype.$EV = null;
        Node.prototype.$V = null;
      }
    }
    var nextTick = typeof Promise !== 'undefined' ? Promise.resolve().then.bind(Promise.resolve()) : function (a) {
      window.setTimeout(a, 0);
    };

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var eventemitter3 = createCommonjsModule(function (module) {

      var has = Object.prototype.hasOwnProperty,
          prefix = '~';
      /**
       * Constructor to create a storage for our `EE` objects.
       * An `Events` instance is a plain object whose properties are event names.
       *
       * @constructor
       * @private
       */

      function Events() {} //
      // We try to not inherit from `Object.prototype`. In some engines creating an
      // instance in this way is faster than calling `Object.create(null)` directly.
      // If `Object.create(null)` is not supported we prefix the event names with a
      // character to make sure that the built-in object properties are not
      // overridden or used as an attack vector.
      //


      if (Object.create) {
        Events.prototype = Object.create(null); //
        // This hack is needed because the `__proto__` property is still inherited in
        // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
        //

        if (!new Events().__proto__) prefix = false;
      }
      /**
       * Representation of a single event listener.
       *
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
       * @constructor
       * @private
       */


      function EE(fn, context, once) {
        this.fn = fn;
        this.context = context;
        this.once = once || false;
      }
      /**
       * Add a listener for a given event.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} context The context to invoke the listener with.
       * @param {Boolean} once Specify if the listener is a one-time listener.
       * @returns {EventEmitter}
       * @private
       */


      function addListener(emitter, event, fn, context, once) {
        if (typeof fn !== 'function') {
          throw new TypeError('The listener must be a function');
        }

        var listener = new EE(fn, context || emitter, once),
            evt = prefix ? prefix + event : event;
        if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
        return emitter;
      }
      /**
       * Clear event by name.
       *
       * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
       * @param {(String|Symbol)} evt The Event name.
       * @private
       */


      function clearEvent(emitter, evt) {
        if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
      }
      /**
       * Minimal `EventEmitter` interface that is molded against the Node.js
       * `EventEmitter` interface.
       *
       * @constructor
       * @public
       */


      function EventEmitter() {
        this._events = new Events();
        this._eventsCount = 0;
      }
      /**
       * Return an array listing the events for which the emitter has registered
       * listeners.
       *
       * @returns {Array}
       * @public
       */


      EventEmitter.prototype.eventNames = function eventNames() {
        var names = [],
            events,
            name;
        if (this._eventsCount === 0) return names;

        for (name in events = this._events) {
          if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
        }

        if (Object.getOwnPropertySymbols) {
          return names.concat(Object.getOwnPropertySymbols(events));
        }

        return names;
      };
      /**
       * Return the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Array} The registered listeners.
       * @public
       */


      EventEmitter.prototype.listeners = function listeners(event) {
        var evt = prefix ? prefix + event : event,
            handlers = this._events[evt];
        if (!handlers) return [];
        if (handlers.fn) return [handlers.fn];

        for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
          ee[i] = handlers[i].fn;
        }

        return ee;
      };
      /**
       * Return the number of listeners listening to a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Number} The number of listeners.
       * @public
       */


      EventEmitter.prototype.listenerCount = function listenerCount(event) {
        var evt = prefix ? prefix + event : event,
            listeners = this._events[evt];
        if (!listeners) return 0;
        if (listeners.fn) return 1;
        return listeners.length;
      };
      /**
       * Calls each of the listeners registered for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @returns {Boolean} `true` if the event had listeners, else `false`.
       * @public
       */


      EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return false;
        var listeners = this._events[evt],
            len = arguments.length,
            args,
            i;

        if (listeners.fn) {
          if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

          switch (len) {
            case 1:
              return listeners.fn.call(listeners.context), true;

            case 2:
              return listeners.fn.call(listeners.context, a1), true;

            case 3:
              return listeners.fn.call(listeners.context, a1, a2), true;

            case 4:
              return listeners.fn.call(listeners.context, a1, a2, a3), true;

            case 5:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;

            case 6:
              return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
          }

          for (i = 1, args = new Array(len - 1); i < len; i++) {
            args[i - 1] = arguments[i];
          }

          listeners.fn.apply(listeners.context, args);
        } else {
          var length = listeners.length,
              j;

          for (i = 0; i < length; i++) {
            if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

            switch (len) {
              case 1:
                listeners[i].fn.call(listeners[i].context);
                break;

              case 2:
                listeners[i].fn.call(listeners[i].context, a1);
                break;

              case 3:
                listeners[i].fn.call(listeners[i].context, a1, a2);
                break;

              case 4:
                listeners[i].fn.call(listeners[i].context, a1, a2, a3);
                break;

              default:
                if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
                listeners[i].fn.apply(listeners[i].context, args);
            }
          }
        }

        return true;
      };
      /**
       * Add a listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.on = function on(event, fn, context) {
        return addListener(this, event, fn, context, false);
      };
      /**
       * Add a one-time listener for a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn The listener function.
       * @param {*} [context=this] The context to invoke the listener with.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.once = function once(event, fn, context) {
        return addListener(this, event, fn, context, true);
      };
      /**
       * Remove the listeners of a given event.
       *
       * @param {(String|Symbol)} event The event name.
       * @param {Function} fn Only remove the listeners that match this function.
       * @param {*} context Only remove the listeners that have this context.
       * @param {Boolean} once Only remove one-time listeners.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
        var evt = prefix ? prefix + event : event;
        if (!this._events[evt]) return this;

        if (!fn) {
          clearEvent(this, evt);
          return this;
        }

        var listeners = this._events[evt];

        if (listeners.fn) {
          if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
            clearEvent(this, evt);
          }
        } else {
          for (var i = 0, events = [], length = listeners.length; i < length; i++) {
            if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
              events.push(listeners[i]);
            }
          } //
          // Reset the array, or remove it completely if we have no more listeners.
          //


          if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
        }

        return this;
      };
      /**
       * Remove all listeners, or those of the specified event.
       *
       * @param {(String|Symbol)} [event] The event name.
       * @returns {EventEmitter} `this`.
       * @public
       */


      EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
        var evt;

        if (event) {
          evt = prefix ? prefix + event : event;
          if (this._events[evt]) clearEvent(this, evt);
        } else {
          this._events = new Events();
          this._eventsCount = 0;
        }

        return this;
      }; //
      // Alias methods names because people roll like that.
      //


      EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
      EventEmitter.prototype.addListener = EventEmitter.prototype.on; //
      // Expose the prefix.
      //

      EventEmitter.prefixed = prefix; //
      // Allow `EventEmitter` to be imported as module namespace.
      //

      EventEmitter.EventEmitter = EventEmitter; //
      // Expose the module.
      //

      {
        module.exports = EventEmitter;
      }
    });

    const {
      formatBytes
    } = window.djangoFileForm;
    const eventEmitter = new eventemitter3();
    eventEmitter.on("addUpload", ({
      element,
      fieldName,
      fileName,
      metaDataField,
      upload
    }) => {
      const descriptionChanged = evt => {
        const metaData = JSON.parse(metaDataField.value);
        const inputValue = evt.target.value;
        metaData[fileName] = {
          description: inputValue
        };
        metaDataField.value = JSON.stringify(metaData);
      };

      if (!metaDataField || !metaDataField.value) {
        return;
      }

      const metadata = JSON.parse(metaDataField.value); // add a widget

      const descElem = document.createElement("input");
      descElem.value = metadata[fileName] ? metadata[fileName]["description"] : "";
      descElem.className = "dff-description";
      descElem.addEventListener("change", descriptionChanged);
      element.insertBefore(descElem, element.firstElementChild.nextElementSibling);
    });
    eventEmitter.on("removeUpload", ({
      element,
      fieldName,
      fileName,
      metaDataField,
      upload
    }) => {// do not need to update hidden data since returned metadata will be ignored
    });

    const CustomFileInfo = ({
      upload
    }) => createFragment([createVNode(1, "span", null, upload.name, 0), createVNode(1, "span", "dff-filesize", formatBytes(upload.getSize(), 2), 0)], 4);

    initUploadFields(document.getElementById("example-form"), {
      CustomFileInfo,
      eventEmitter,
      prefix: "example",
      retryDelays: [],
      skipRequired: true,
      supportDropArea: true
    });

}());
