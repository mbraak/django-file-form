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

    const {
      formatBytes
    } = window.djangoFileForm;

    const CustomFileInfo = ({
      upload
    }) => {
      const handleDescriptionChange = e => {
        upload.setMetadata({
          description: e.target.value
        });
      };

      return createFragment([createVNode(1, "span", null, upload.name, 0), createVNode(1, "span", "dff-filesize", formatBytes(upload.getSize(), 2), 0), createVNode(64, "input", "dff-description", null, 1, {
        "onInput": handleDescriptionChange,
        "value": upload?.metadata?.description
      })], 4);
    };

    initUploadFields(document.getElementById("example-form"), {
      CustomFileInfo,
      prefix: "example",
      retryDelays: [],
      skipRequired: true,
      supportDropArea: true
    });

}());
