
if (!Object.create) {
    Object.create = function(proto, props) {
        if (typeof props !== "undefined") {
            throw "The multiple-argument version of Object.create is not provided by this browser and cannot be shimmed.";
        }
        function ctor() { }
        ctor.prototype = proto;
        return new ctor();
    };
}

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function() {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
	WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
		var target = this;

		registry.unshift([target, type, listener, function (event) {
			event.currentTarget = target;
			event.preventDefault = function () { event.returnValue = false };
			event.stopPropagation = function () { event.cancelBubble = true };
			event.target = event.srcElement || target;

			listener.call(target, event);
		}]);

		this.attachEvent("on" + type, registry[0][3]);
	};

	WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
		for (var index = 0, register; register = registry[index]; ++index) {
			if (register[0] == this && register[1] == type && register[2] == listener) {
				return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
			}
		}
	};

	WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
		return this.fireEvent("on" + eventObject.type, eventObject);
	};
})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);

if (!Array.prototype.forEach) {

  Array.prototype.forEach = function(callback, thisArg) {

    var T, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeErrorexception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {

      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

//https://github.com/timruffles/ios-html5-drag-drop-shim
(function(doc) {

  log = noop; // noOp, remove this line to enable debugging

  var coordinateSystemForElementFromPoint;

  function main(config) {
    config = config || {};

    coordinateSystemForElementFromPoint = navigator.userAgent.match(/OS [1-4](?:_\d+)+ like Mac/) ? "page" : "client";

    var div = doc.createElement('div');
    var dragDiv = 'draggable' in div;
    var evts = 'ondragstart' in div && 'ondrop' in div;

    var needsPatch = !(dragDiv || evts) || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    log((needsPatch ? "" : "not ") + "patching html5 drag drop");

    if(!needsPatch) {
        return;
    }

    if(!config.enableEnterLeave) {
      DragDrop.prototype.synthesizeEnterLeave = noop;
    }

    doc.addEventListener("touchstart", touchstart);
  }

  function DragDrop(event, el) {

    this.dragData = {};
    this.dragDataTypes = [];
    this.dragImage = null;
    this.dragImageTransform = null;
    this.dragImageWebKitTransform = null;
    this.el = el || event.target;

    log("dragstart");

    this.dispatchDragStart();
    this.createDragImage();

    this.listen();

  }

  DragDrop.prototype = {
    listen: function() {
      var move = onEvt(doc, "touchmove", this.move, this);
      var end = onEvt(doc, "touchend", ontouchend, this);
      var cancel = onEvt(doc, "touchcancel", cleanup, this);

      function ontouchend(event) {
        this.dragend(event, event.target);
        cleanup.call(this);
      }
      function cleanup() {
        log("cleanup");
        this.dragDataTypes = [];
        if (this.dragImage !== null) {
          this.dragImage.parentNode.removeChild(this.dragImage);
          this.dragImage = null;
          this.dragImageTransform = null;
          this.dragImageWebKitTransform = null;
        }
        this.el = this.dragData = null;
        return [move, end, cancel].forEach(function(handler) {
          return handler.off();
        });
      }
    },
    move: function(event) {
      var pageXs = [], pageYs = [];
      [].forEach.call(event.changedTouches, function(touch) {
        pageXs.push(touch.pageX);
        pageYs.push(touch.pageY);
      });

      var x = average(pageXs) - (parseInt(this.dragImage.offsetWidth, 10) / 2);
      var y = average(pageYs) - (parseInt(this.dragImage.offsetHeight, 10) / 2);
      this.translateDragImage(x, y);

      this.synthesizeEnterLeave(event);
    },
    // We use translate instead of top/left because of sub-pixel rendering and for the hope of better performance
    // http://www.paulirish.com/2012/why-moving-elements-with-translate-is-better-than-posabs-topleft/
    translateDragImage: function(x, y) {
      var translate = " translate(" + x + "px," + y + "px)";

      if (this.dragImageWebKitTransform !== null) {
        this.dragImage.style["-webkit-transform"] = this.dragImageWebKitTransform + translate;
      }
      if (this.dragImageTransform !== null) {
        this.dragImage.style.transform = this.dragImageTransform + translate;
      }
    },
    synthesizeEnterLeave: function(event) {
      var target = elementFromTouchEvent(this.el,event)
      if (target != this.lastEnter) {
        if (this.lastEnter) {
          this.dispatchLeave(event);
        }
        this.lastEnter = target;
        if (this.lastEnter) {
          this.dispatchEnter(event);
        }
      }
      if (this.lastEnter) {
        this.dispatchOver(event);
      }
    },
    dragend: function(event) {

      // we'll dispatch drop if there's a target, then dragEnd.
      // drop comes first http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html#drag-and-drop-processing-model
      log("dragend");

      if (this.lastEnter) {
        this.dispatchLeave(event);
      }

      var target = elementFromTouchEvent(this.el,event)
      if (target) {
        log("found drop target " + target.tagName);
        this.dispatchDrop(target, event);
      } else {
        log("no drop target");
      }

      var dragendEvt = doc.createEvent("Event");
      dragendEvt.initEvent("dragend", true, true);
      this.el.dispatchEvent(dragendEvt);
    },
    dispatchDrop: function(target, event) {
      var dropEvt = doc.createEvent("Event");
      dropEvt.initEvent("drop", true, true);

      var touch = event.changedTouches[0];
      var x = touch[coordinateSystemForElementFromPoint + 'X'];
      var y = touch[coordinateSystemForElementFromPoint + 'Y'];
      dropEvt.offsetX = x - target.x;
      dropEvt.offsetY = y - target.y;

      dropEvt.dataTransfer = {
        types: this.dragDataTypes,
        getData: function(type) {
          return this.dragData[type];
        }.bind(this)
      };
      dropEvt.preventDefault = function() {
         // https://www.w3.org/Bugs/Public/show_bug.cgi?id=14638 - if we don't cancel it, we'll snap back
      }.bind(this);

      once(doc, "drop", function() {
        log("drop event not canceled");
      },this);

      target.dispatchEvent(dropEvt);
    },
    dispatchEnter: function(event) {

      var enterEvt = doc.createEvent("Event");
      enterEvt.initEvent("dragenter", true, true);
      enterEvt.dataTransfer = {
        types: this.dragDataTypes,
        getData: function(type) {
          return this.dragData[type];
        }.bind(this)
      };

      var touch = event.changedTouches[0];
      enterEvt.pageX = touch.pageX;
      enterEvt.pageY = touch.pageY;

      this.lastEnter.dispatchEvent(enterEvt);
    },
    dispatchOver: function(event) {

      var overEvt = doc.createEvent("Event");
      overEvt.initEvent("dragover", true, true);
      overEvt.dataTransfer = {
        types: this.dragDataTypes,
        getData: function(type) {
          return this.dragData[type];
        }.bind(this)
      };

      var touch = event.changedTouches[0];
      overEvt.pageX = touch.pageX;
      overEvt.pageY = touch.pageY;

      this.lastEnter.dispatchEvent(overEvt);
    },
    dispatchLeave: function(event) {

      var leaveEvt = doc.createEvent("Event");
      leaveEvt.initEvent("dragleave", true, true);
      leaveEvt.dataTransfer = {
        types: this.dragDataTypes,
        getData: function(type) {
          return this.dragData[type];
        }.bind(this)
      };

      var touch = event.changedTouches[0];
      leaveEvt.pageX = touch.pageX;
      leaveEvt.pageY = touch.pageY;

      this.lastEnter.dispatchEvent(leaveEvt);
      this.lastEnter = null;
    },
    dispatchDragStart: function() {
      var evt = doc.createEvent("Event");
      evt.initEvent("dragstart", true, true);
      evt.dataTransfer = {
        setData: function(type, val) {
          this.dragData[type] = val;
          if (this.dragDataTypes.indexOf(type) == -1) {
            this.dragDataTypes[this.dragDataTypes.length] = type;
          }
          return val;
        }.bind(this),
        dropEffect: "move"
      };
      this.el.dispatchEvent(evt);
    },
    createDragImage: function() {
      this.dragImage = this.el.cloneNode(true);

      duplicateStyle(this.el, this.dragImage);

      this.dragImage.style.opacity = "0.5";
      this.dragImage.style.position = "absolute";
      this.dragImage.style.left = "0px";
      this.dragImage.style.top = "0px";
      this.dragImage.style.zIndex = "999999";


      var transform = this.dragImage.style.transform;
      if (typeof transform !== "undefined") {
        this.dragImageTransform = "";
        if (transform != "none") {
          this.dragImageTransform = transform.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
        }
      }

      var webkitTransform = this.dragImage.style["-webkit-transform"];
      if (typeof webkitTransform !== "undefined") {
        this.dragImageWebKitTransform = "";
        if (webkitTransform != "none") {
          this.dragImageWebKitTransform = webkitTransform.replace(/translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g, '');
        }
      }

      this.translateDragImage(-9999, -9999);

      doc.body.appendChild(this.dragImage);
    }
  };

  // event listeners
  function touchstart(evt) {
    var el = evt.target;
    do {
      if (el.draggable === true) {
        // If draggable isn't explicitly set for anchors, then simulate a click event.
        // Otherwise plain old vanilla links will stop working.
        // https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Touch_events#Handling_clicks
        if (!el.hasAttribute("draggable") && el.tagName.toLowerCase() == "a") {
          var clickEvt = document.createEvent("MouseEvents");
          clickEvt.initMouseEvent("click", true, true, el.ownerDocument.defaultView, 1,
            evt.screenX, evt.screenY, evt.clientX, evt.clientY,
            evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, 0, null);
          el.dispatchEvent(clickEvt);
          log("Simulating click to anchor");
        }
        evt.preventDefault();
        new DragDrop(evt,el);
      }
    } while((el = el.parentNode) && el !== doc.body);
  }

  // DOM helpers
  function elementFromTouchEvent(el,event) {
    var touch = event.changedTouches[0];
    var target = doc.elementFromPoint(
      touch[coordinateSystemForElementFromPoint + "X"],
      touch[coordinateSystemForElementFromPoint + "Y"]
    );
    return target;
  }

  function onEvt(el, event, handler, context) {
    if(context) {
      handler = handler.bind(context);
    }
    el.addEventListener(event, handler);
    return {
      off: function() {
        return el.removeEventListener(event, handler);
      }
    };
  }

  function once(el, event, handler, context) {
    if(context) {
      handler = handler.bind(context);
    }
    function listener(evt) {
      handler(evt);
      return el.removeEventListener(event,listener);
    }
    return el.addEventListener(event,listener);
  }

  // duplicateStyle expects dstNode to be a clone of srcNode
  function duplicateStyle(srcNode, dstNode) {
    // Is this node an element?
    if (srcNode.nodeType == 1) {
      // Remove any potential conflict attributes
      dstNode.removeAttribute("id");
      dstNode.removeAttribute("class");
      dstNode.removeAttribute("style");
      dstNode.removeAttribute("draggable");

      // Clone the style
      var cs = window.getComputedStyle(srcNode);
      for (var i = 0; i < cs.length; i++) {
        var csName = cs[i];
        dstNode.style.setProperty(csName, cs.getPropertyValue(csName), cs.getPropertyPriority(csName));
      }

      // Pointer events as none makes the drag image transparent to document.elementFromPoint()
      dstNode.style.pointerEvents = "none";
    }

    // Do the same for the children
    if (srcNode.hasChildNodes()) {
      for (var j = 0; j < srcNode.childNodes.length; j++) {
        duplicateStyle(srcNode.childNodes[j], dstNode.childNodes[j]);
      }
    }
  }

  // general helpers
  function log(msg) {
    console.log(msg);
  }

  function average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((function(s, v) {
      return v + s;
    }), 0) / arr.length;
  }

  function noop() {}

  main(window.iosDragDropShim);


})(document);


/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.3.0
 */

(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        console.error(e);
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// refactored by Yannick Albert

// MIT license
(function(window) {
    var equestAnimationFrame = 'equestAnimationFrame',
        requestAnimationFrame = 'r' + equestAnimationFrame,

        ancelAnimationFrame = 'ancelAnimationFrame',
        cancelAnimationFrame = 'c' + ancelAnimationFrame,

        expectedTime = 0,
        vendors = ['moz', 'ms', 'o', 'webkit'],
        vendor;

    while(!window[requestAnimationFrame] && (vendor = vendors.pop())) {
        window[requestAnimationFrame] = window[vendor + 'R' + equestAnimationFrame];
        window[cancelAnimationFrame] = window[vendor + 'C' + ancelAnimationFrame] || window[vendor + 'CancelR' + equestAnimationFrame];
    }

    if(!window[requestAnimationFrame]) {
        window[requestAnimationFrame] = function(callback) {
            var currentTime = new Date().getTime(),
                adjustedDelay = 16 - (currentTime - expectedTime),
                delay = adjustedDelay > 0 ? adjustedDelay : 0;

            expectedTime = currentTime + delay;

            return setTimeout(function() {
                callback(expectedTime);
            }, delay);
        };

        window[cancelAnimationFrame] = clearTimeout;
    }
}(this));

//https://gist.github.com/jonathantneal/3062955
this.Element && function(ElementPrototype) {
  ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
  ElementPrototype.mozMatchesSelector ||
  ElementPrototype.msMatchesSelector ||
  ElementPrototype.oMatchesSelector ||
  ElementPrototype.webkitMatchesSelector ||
  function (selector) {
    var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;

    while (nodes[++i] && nodes[i] != node);

    return !!nodes[i];
  }
}(Element.prototype);


// EventListener | MIT/GPL2 | github.com/jonathantneal/EventListener
this.Element && Element.prototype.attachEvent && !Element.prototype.addEventListener && (function () {
  function addToPrototype(name, method) {
    Window.prototype[name] = HTMLDocument.prototype[name] = Element.prototype[name] = method;
  }

  // add
  addToPrototype("addEventListener", function (type, listener) {
    var
    target = this,
    listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
    typeListeners = listeners[type] = listeners[type] || [];

    // if no events exist, attach the listener
    if (!typeListeners.length) {
      target.attachEvent("on" + type, typeListeners.event = function (event) {
        var documentElement = target.document && target.document.documentElement || target.documentElement || { scrollLeft: 0, scrollTop: 0 };

        // polyfill w3c properties and methods
        event.currentTarget = target;
        event.pageX = event.clientX + documentElement.scrollLeft;
        event.pageY = event.clientY + documentElement.scrollTop;
        event.preventDefault = function () { event.returnValue = false };
        event.relatedTarget = event.fromElement || null;
        event.stopImmediatePropagation = function () { immediatePropagation = false; event.cancelBubble = true };
        event.stopPropagation = function () { event.cancelBubble = true };
        event.relatedTarget = event.fromElement || null;
        event.target = event.srcElement || target;
        event.timeStamp = +new Date;

        // create an cached list of the master events list (to protect this loop from breaking when an event is removed)
        for (var i = 0, typeListenersCache = [].concat(typeListeners), typeListenerCache, immediatePropagation = true; immediatePropagation && (typeListenerCache = typeListenersCache[i]); ++i) {
          // check to see if the cached event still exists in the master events list
          for (var ii = 0, typeListener; typeListener = typeListeners[ii]; ++ii) {
            if (typeListener == typeListenerCache) {
              typeListener.call(target, event);

              break;
            }
          }
        }
      });
    }

    // add the event to the master event list
    typeListeners.push(listener);
  });

  // remove
  addToPrototype("removeEventListener", function (type, listener) {
    var
    target = this,
    listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
    typeListeners = listeners[type] = listeners[type] || [];

    // remove the newest matching event from the master event list
    for (var i = typeListeners.length - 1, typeListener; typeListener = typeListeners[i]; --i) {
      if (typeListener == listener) {
        typeListeners.splice(i, 1);

        break;
      }
    }

    // if no events exist, detach the listener
    if (!typeListeners.length && typeListeners.event) {
      target.detachEvent("on" + type, typeListeners.event);
    }
  });

  // dispatch
  addToPrototype("dispatchEvent", function (eventObject) {
    var
    target = this,
    type = eventObject.type,
    listeners = target.addEventListener.listeners = target.addEventListener.listeners || {},
    typeListeners = listeners[type] = listeners[type] || [];

    try {
      return target.fireEvent("on" + type, eventObject);
    } catch (error) {
      if (typeListeners.event) {
        typeListeners.event(eventObject);
      }

      return;
    }
  });

  // CustomEvent
  Object.defineProperty(Window.prototype, "CustomEvent", {
    get: function () {
      var self = this;

      return function CustomEvent(type, detail) {
        detail = detail || {};
        var event = self.document.createEventObject(), key;

        event.type = type;
        event.returnValue = !detail.cancelable;
        event.cancelBubble = !detail.bubbles;

        for (key in detail) {
          event[key] = detail[key];
        }

        return event;
      };
    }
  });

  // ready
  function ready(event) {
    if (ready.interval && document.body) {
      ready.interval = clearInterval(ready.interval);

      document.dispatchEvent(new CustomEvent("DOMContentLoaded"));
    }
  }

  ready.interval = setInterval(ready, 1);

  window.addEventListener("load", ready);
})();
;/*!

 handlebars v4.0.5

Copyright (C) 2011-2015 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Handlebars"] = factory();
	else
		root["Handlebars"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(1)['default'];

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;

	var _handlebarsBase = __webpack_require__(3);

	var base = _interopRequireWildcard(_handlebarsBase);

	// Each of these augment the Handlebars object. No need to setup here.
	// (This is done to easily share code between commonjs and browse envs)

	var _handlebarsSafeString = __webpack_require__(17);

	var _handlebarsSafeString2 = _interopRequireDefault(_handlebarsSafeString);

	var _handlebarsException = __webpack_require__(5);

	var _handlebarsException2 = _interopRequireDefault(_handlebarsException);

	var _handlebarsUtils = __webpack_require__(4);

	var Utils = _interopRequireWildcard(_handlebarsUtils);

	var _handlebarsRuntime = __webpack_require__(18);

	var runtime = _interopRequireWildcard(_handlebarsRuntime);

	var _handlebarsNoConflict = __webpack_require__(19);

	var _handlebarsNoConflict2 = _interopRequireDefault(_handlebarsNoConflict);

	// For compatibility and usage outside of module systems, make the Handlebars object a namespace
	function create() {
	  var hb = new base.HandlebarsEnvironment();

	  Utils.extend(hb, base);
	  hb.SafeString = _handlebarsSafeString2['default'];
	  hb.Exception = _handlebarsException2['default'];
	  hb.Utils = Utils;
	  hb.escapeExpression = Utils.escapeExpression;

	  hb.VM = runtime;
	  hb.template = function (spec) {
	    return runtime.template(spec, hb);
	  };

	  return hb;
	}

	var inst = create();
	inst.create = create;

	_handlebarsNoConflict2['default'](inst);

	inst['default'] = inst;

	exports['default'] = inst;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  if (obj && obj.__esModule) {
	    return obj;
	  } else {
	    var newObj = {};

	    if (obj != null) {
	      for (var key in obj) {
	        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
	      }
	    }

	    newObj["default"] = obj;
	    return newObj;
	  }
	};

	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};

	exports.__esModule = true;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;
	exports.HandlebarsEnvironment = HandlebarsEnvironment;

	var _utils = __webpack_require__(4);

	var _exception = __webpack_require__(5);

	var _exception2 = _interopRequireDefault(_exception);

	var _helpers = __webpack_require__(6);

	var _decorators = __webpack_require__(14);

	var _logger = __webpack_require__(16);

	var _logger2 = _interopRequireDefault(_logger);

	var VERSION = '4.0.5';
	exports.VERSION = VERSION;
	var COMPILER_REVISION = 7;

	exports.COMPILER_REVISION = COMPILER_REVISION;
	var REVISION_CHANGES = {
	  1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
	  2: '== 1.0.0-rc.3',
	  3: '== 1.0.0-rc.4',
	  4: '== 1.x.x',
	  5: '== 2.0.0-alpha.x',
	  6: '>= 2.0.0-beta.1',
	  7: '>= 4.0.0'
	};

	exports.REVISION_CHANGES = REVISION_CHANGES;
	var objectType = '[object Object]';

	function HandlebarsEnvironment(helpers, partials, decorators) {
	  this.helpers = helpers || {};
	  this.partials = partials || {};
	  this.decorators = decorators || {};

	  _helpers.registerDefaultHelpers(this);
	  _decorators.registerDefaultDecorators(this);
	}

	HandlebarsEnvironment.prototype = {
	  constructor: HandlebarsEnvironment,

	  logger: _logger2['default'],
	  log: _logger2['default'].log,

	  registerHelper: function registerHelper(name, fn) {
	    if (_utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple helpers');
	      }
	      _utils.extend(this.helpers, name);
	    } else {
	      this.helpers[name] = fn;
	    }
	  },
	  unregisterHelper: function unregisterHelper(name) {
	    delete this.helpers[name];
	  },

	  registerPartial: function registerPartial(name, partial) {
	    if (_utils.toString.call(name) === objectType) {
	      _utils.extend(this.partials, name);
	    } else {
	      if (typeof partial === 'undefined') {
	        throw new _exception2['default']('Attempting to register a partial called "' + name + '" as undefined');
	      }
	      this.partials[name] = partial;
	    }
	  },
	  unregisterPartial: function unregisterPartial(name) {
	    delete this.partials[name];
	  },

	  registerDecorator: function registerDecorator(name, fn) {
	    if (_utils.toString.call(name) === objectType) {
	      if (fn) {
	        throw new _exception2['default']('Arg not supported with multiple decorators');
	      }
	      _utils.extend(this.decorators, name);
	    } else {
	      this.decorators[name] = fn;
	    }
	  },
	  unregisterDecorator: function unregisterDecorator(name) {
	    delete this.decorators[name];
	  }
	};

	var log = _logger2['default'].log;

	exports.log = log;
	exports.createFrame = _utils.createFrame;
	exports.logger = _logger2['default'];

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.extend = extend;
	exports.indexOf = indexOf;
	exports.escapeExpression = escapeExpression;
	exports.isEmpty = isEmpty;
	exports.createFrame = createFrame;
	exports.blockParams = blockParams;
	exports.appendContextPath = appendContextPath;
	var escape = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;',
	  '=': '&#x3D;'
	};

	var badChars = /[&<>"'`=]/g,
	    possible = /[&<>"'`=]/;

	function escapeChar(chr) {
	  return escape[chr];
	}

	function extend(obj /* , ...source */) {
	  for (var i = 1; i < arguments.length; i++) {
	    for (var key in arguments[i]) {
	      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
	        obj[key] = arguments[i][key];
	      }
	    }
	  }

	  return obj;
	}

	var toString = Object.prototype.toString;

	exports.toString = toString;
	// Sourced from lodash
	// https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
	/* eslint-disable func-style */
	var isFunction = function isFunction(value) {
	  return typeof value === 'function';
	};
	// fallback for older versions of Chrome and Safari
	/* istanbul ignore next */
	if (isFunction(/x/)) {
	  exports.isFunction = isFunction = function (value) {
	    return typeof value === 'function' && toString.call(value) === '[object Function]';
	  };
	}
	exports.isFunction = isFunction;

	/* eslint-enable func-style */

	/* istanbul ignore next */
	var isArray = Array.isArray || function (value) {
	  return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
	};

	exports.isArray = isArray;
	// Older IE versions do not directly support indexOf so we must implement our own, sadly.

	function indexOf(array, value) {
	  for (var i = 0, len = array.length; i < len; i++) {
	    if (array[i] === value) {
	      return i;
	    }
	  }
	  return -1;
	}

	function escapeExpression(string) {
	  if (typeof string !== 'string') {
	    // don't escape SafeStrings, since they're already safe
	    if (string && string.toHTML) {
	      return string.toHTML();
	    } else if (string == null) {
	      return '';
	    } else if (!string) {
	      return string + '';
	    }

	    // Force a string conversion as this will be done by the append regardless and
	    // the regex test will do this transparently behind the scenes, causing issues if
	    // an object's to string has escaped characters in it.
	    string = '' + string;
	  }

	  if (!possible.test(string)) {
	    return string;
	  }
	  return string.replace(badChars, escapeChar);
	}

	function isEmpty(value) {
	  if (!value && value !== 0) {
	    return true;
	  } else if (isArray(value) && value.length === 0) {
	    return true;
	  } else {
	    return false;
	  }
	}

	function createFrame(object) {
	  var frame = extend({}, object);
	  frame._parent = object;
	  return frame;
	}

	function blockParams(params, ids) {
	  params.path = ids;
	  return params;
	}

	function appendContextPath(contextPath, id) {
	  return (contextPath ? contextPath + '.' : '') + id;
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

	function Exception(message, node) {
	  var loc = node && node.loc,
	      line = undefined,
	      column = undefined;
	  if (loc) {
	    line = loc.start.line;
	    column = loc.start.column;

	    message += ' - ' + line + ':' + column;
	  }

	  var tmp = Error.prototype.constructor.call(this, message);

	  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
	  for (var idx = 0; idx < errorProps.length; idx++) {
	    this[errorProps[idx]] = tmp[errorProps[idx]];
	  }

	  /* istanbul ignore else */
	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, Exception);
	  }

	  if (loc) {
	    this.lineNumber = line;
	    this.column = column;
	  }
	}

	Exception.prototype = new Error();

	exports['default'] = Exception;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;
	exports.registerDefaultHelpers = registerDefaultHelpers;

	var _helpersBlockHelperMissing = __webpack_require__(7);

	var _helpersBlockHelperMissing2 = _interopRequireDefault(_helpersBlockHelperMissing);

	var _helpersEach = __webpack_require__(8);

	var _helpersEach2 = _interopRequireDefault(_helpersEach);

	var _helpersHelperMissing = __webpack_require__(9);

	var _helpersHelperMissing2 = _interopRequireDefault(_helpersHelperMissing);

	var _helpersIf = __webpack_require__(10);

	var _helpersIf2 = _interopRequireDefault(_helpersIf);

	var _helpersLog = __webpack_require__(11);

	var _helpersLog2 = _interopRequireDefault(_helpersLog);

	var _helpersLookup = __webpack_require__(12);

	var _helpersLookup2 = _interopRequireDefault(_helpersLookup);

	var _helpersWith = __webpack_require__(13);

	var _helpersWith2 = _interopRequireDefault(_helpersWith);

	function registerDefaultHelpers(instance) {
	  _helpersBlockHelperMissing2['default'](instance);
	  _helpersEach2['default'](instance);
	  _helpersHelperMissing2['default'](instance);
	  _helpersIf2['default'](instance);
	  _helpersLog2['default'](instance);
	  _helpersLookup2['default'](instance);
	  _helpersWith2['default'](instance);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(4);

	exports['default'] = function (instance) {
	  instance.registerHelper('blockHelperMissing', function (context, options) {
	    var inverse = options.inverse,
	        fn = options.fn;

	    if (context === true) {
	      return fn(this);
	    } else if (context === false || context == null) {
	      return inverse(this);
	    } else if (_utils.isArray(context)) {
	      if (context.length > 0) {
	        if (options.ids) {
	          options.ids = [options.name];
	        }

	        return instance.helpers.each(context, options);
	      } else {
	        return inverse(this);
	      }
	    } else {
	      if (options.data && options.ids) {
	        var data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.name);
	        options = { data: data };
	      }

	      return fn(context, options);
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;

	var _utils = __webpack_require__(4);

	var _exception = __webpack_require__(5);

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('each', function (context, options) {
	    if (!options) {
	      throw new _exception2['default']('Must pass iterator to #each');
	    }

	    var fn = options.fn,
	        inverse = options.inverse,
	        i = 0,
	        ret = '',
	        data = undefined,
	        contextPath = undefined;

	    if (options.data && options.ids) {
	      contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
	    }

	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    if (options.data) {
	      data = _utils.createFrame(options.data);
	    }

	    function execIteration(field, index, last) {
	      if (data) {
	        data.key = field;
	        data.index = index;
	        data.first = index === 0;
	        data.last = !!last;

	        if (contextPath) {
	          data.contextPath = contextPath + field;
	        }
	      }

	      ret = ret + fn(context[field], {
	        data: data,
	        blockParams: _utils.blockParams([context[field], field], [contextPath + field, null])
	      });
	    }

	    if (context && typeof context === 'object') {
	      if (_utils.isArray(context)) {
	        for (var j = context.length; i < j; i++) {
	          if (i in context) {
	            execIteration(i, i, i === context.length - 1);
	          }
	        }
	      } else {
	        var priorKey = undefined;

	        for (var key in context) {
	          if (context.hasOwnProperty(key)) {
	            // We're running the iterations one step out of sync so we can detect
	            // the last iteration without have to scan the object twice and create
	            // an itermediate keys array.
	            if (priorKey !== undefined) {
	              execIteration(priorKey, i - 1);
	            }
	            priorKey = key;
	            i++;
	          }
	        }
	        if (priorKey !== undefined) {
	          execIteration(priorKey, i - 1, true);
	        }
	      }
	    }

	    if (i === 0) {
	      ret = inverse(this);
	    }

	    return ret;
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;

	var _exception = __webpack_require__(5);

	var _exception2 = _interopRequireDefault(_exception);

	exports['default'] = function (instance) {
	  instance.registerHelper('helperMissing', function () /* [args, ]options */{
	    if (arguments.length === 1) {
	      // A missing field in a {{foo}} construct.
	      return undefined;
	    } else {
	      // Someone is actually trying to call something, blow up.
	      throw new _exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(4);

	exports['default'] = function (instance) {
	  instance.registerHelper('if', function (conditional, options) {
	    if (_utils.isFunction(conditional)) {
	      conditional = conditional.call(this);
	    }

	    // Default behavior is to render the positive path if the value is truthy and not empty.
	    // The `includeZero` option may be set to treat the condtional as purely not empty based on the
	    // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
	    if (!options.hash.includeZero && !conditional || _utils.isEmpty(conditional)) {
	      return options.inverse(this);
	    } else {
	      return options.fn(this);
	    }
	  });

	  instance.registerHelper('unless', function (conditional, options) {
	    return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('log', function () /* message, options */{
	    var args = [undefined],
	        options = arguments[arguments.length - 1];
	    for (var i = 0; i < arguments.length - 1; i++) {
	      args.push(arguments[i]);
	    }

	    var level = 1;
	    if (options.hash.level != null) {
	      level = options.hash.level;
	    } else if (options.data && options.data.level != null) {
	      level = options.data.level;
	    }
	    args[0] = level;

	    instance.log.apply(instance, args);
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;

	exports['default'] = function (instance) {
	  instance.registerHelper('lookup', function (obj, field) {
	    return obj && obj[field];
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(4);

	exports['default'] = function (instance) {
	  instance.registerHelper('with', function (context, options) {
	    if (_utils.isFunction(context)) {
	      context = context.call(this);
	    }

	    var fn = options.fn;

	    if (!_utils.isEmpty(context)) {
	      var data = options.data;
	      if (options.data && options.ids) {
	        data = _utils.createFrame(options.data);
	        data.contextPath = _utils.appendContextPath(options.data.contextPath, options.ids[0]);
	      }

	      return fn(context, {
	        data: data,
	        blockParams: _utils.blockParams([context], [data && data.contextPath])
	      });
	    } else {
	      return options.inverse(this);
	    }
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;
	exports.registerDefaultDecorators = registerDefaultDecorators;

	var _decoratorsInline = __webpack_require__(15);

	var _decoratorsInline2 = _interopRequireDefault(_decoratorsInline);

	function registerDefaultDecorators(instance) {
	  _decoratorsInline2['default'](instance);
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(4);

	exports['default'] = function (instance) {
	  instance.registerDecorator('inline', function (fn, props, container, options) {
	    var ret = fn;
	    if (!props.partials) {
	      props.partials = {};
	      ret = function (context, options) {
	        // Create a new partials stack frame prior to exec.
	        var original = container.partials;
	        container.partials = _utils.extend({}, original, props.partials);
	        var ret = fn(context, options);
	        container.partials = original;
	        return ret;
	      };
	    }

	    props.partials[options.args[0]] = options.fn;

	    return ret;
	  });
	};

	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _utils = __webpack_require__(4);

	var logger = {
	  methodMap: ['debug', 'info', 'warn', 'error'],
	  level: 'info',

	  // Maps a given level value to the `methodMap` indexes above.
	  lookupLevel: function lookupLevel(level) {
	    if (typeof level === 'string') {
	      var levelMap = _utils.indexOf(logger.methodMap, level.toLowerCase());
	      if (levelMap >= 0) {
	        level = levelMap;
	      } else {
	        level = parseInt(level, 10);
	      }
	    }

	    return level;
	  },

	  // Can be overridden in the host environment
	  log: function log(level) {
	    level = logger.lookupLevel(level);

	    if (typeof console !== 'undefined' && logger.lookupLevel(logger.level) <= level) {
	      var method = logger.methodMap[level];
	      if (!console[method]) {
	        // eslint-disable-line no-console
	        method = 'log';
	      }

	      for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        message[_key - 1] = arguments[_key];
	      }

	      console[method].apply(console, message); // eslint-disable-line no-console
	    }
	  }
	};

	exports['default'] = logger;
	module.exports = exports['default'];

/***/ },
/* 17 */
/***/ function(module, exports) {

	// Build out our basic SafeString type
	'use strict';

	exports.__esModule = true;
	function SafeString(string) {
	  this.string = string;
	}

	SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
	  return '' + this.string;
	};

	exports['default'] = SafeString;
	module.exports = exports['default'];

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _interopRequireWildcard = __webpack_require__(1)['default'];

	var _interopRequireDefault = __webpack_require__(2)['default'];

	exports.__esModule = true;
	exports.checkRevision = checkRevision;
	exports.template = template;
	exports.wrapProgram = wrapProgram;
	exports.resolvePartial = resolvePartial;
	exports.invokePartial = invokePartial;
	exports.noop = noop;

	var _utils = __webpack_require__(4);

	var Utils = _interopRequireWildcard(_utils);

	var _exception = __webpack_require__(5);

	var _exception2 = _interopRequireDefault(_exception);

	var _base = __webpack_require__(3);

	function checkRevision(compilerInfo) {
	  var compilerRevision = compilerInfo && compilerInfo[0] || 1,
	      currentRevision = _base.COMPILER_REVISION;

	  if (compilerRevision !== currentRevision) {
	    if (compilerRevision < currentRevision) {
	      var runtimeVersions = _base.REVISION_CHANGES[currentRevision],
	          compilerVersions = _base.REVISION_CHANGES[compilerRevision];
	      throw new _exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
	    } else {
	      // Use the embedded version info since the runtime doesn't know about this revision yet
	      throw new _exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
	    }
	  }
	}

	function template(templateSpec, env) {
	  /* istanbul ignore next */
	  if (!env) {
	    throw new _exception2['default']('No environment passed to template');
	  }
	  if (!templateSpec || !templateSpec.main) {
	    throw new _exception2['default']('Unknown template object: ' + typeof templateSpec);
	  }

	  templateSpec.main.decorator = templateSpec.main_d;

	  // Note: Using env.VM references rather than local var references throughout this section to allow
	  // for external users to override these as psuedo-supported APIs.
	  env.VM.checkRevision(templateSpec.compiler);

	  function invokePartialWrapper(partial, context, options) {
	    if (options.hash) {
	      context = Utils.extend({}, context, options.hash);
	      if (options.ids) {
	        options.ids[0] = true;
	      }
	    }

	    partial = env.VM.resolvePartial.call(this, partial, context, options);
	    var result = env.VM.invokePartial.call(this, partial, context, options);

	    if (result == null && env.compile) {
	      options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
	      result = options.partials[options.name](context, options);
	    }
	    if (result != null) {
	      if (options.indent) {
	        var lines = result.split('\n');
	        for (var i = 0, l = lines.length; i < l; i++) {
	          if (!lines[i] && i + 1 === l) {
	            break;
	          }

	          lines[i] = options.indent + lines[i];
	        }
	        result = lines.join('\n');
	      }
	      return result;
	    } else {
	      throw new _exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
	    }
	  }

	  // Just add water
	  var container = {
	    strict: function strict(obj, name) {
	      if (!(name in obj)) {
	        throw new _exception2['default']('"' + name + '" not defined in ' + obj);
	      }
	      return obj[name];
	    },
	    lookup: function lookup(depths, name) {
	      var len = depths.length;
	      for (var i = 0; i < len; i++) {
	        if (depths[i] && depths[i][name] != null) {
	          return depths[i][name];
	        }
	      }
	    },
	    lambda: function lambda(current, context) {
	      return typeof current === 'function' ? current.call(context) : current;
	    },

	    escapeExpression: Utils.escapeExpression,
	    invokePartial: invokePartialWrapper,

	    fn: function fn(i) {
	      var ret = templateSpec[i];
	      ret.decorator = templateSpec[i + '_d'];
	      return ret;
	    },

	    programs: [],
	    program: function program(i, data, declaredBlockParams, blockParams, depths) {
	      var programWrapper = this.programs[i],
	          fn = this.fn(i);
	      if (data || depths || blockParams || declaredBlockParams) {
	        programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
	      } else if (!programWrapper) {
	        programWrapper = this.programs[i] = wrapProgram(this, i, fn);
	      }
	      return programWrapper;
	    },

	    data: function data(value, depth) {
	      while (value && depth--) {
	        value = value._parent;
	      }
	      return value;
	    },
	    merge: function merge(param, common) {
	      var obj = param || common;

	      if (param && common && param !== common) {
	        obj = Utils.extend({}, common, param);
	      }

	      return obj;
	    },

	    noop: env.VM.noop,
	    compilerInfo: templateSpec.compiler
	  };

	  function ret(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var data = options.data;

	    ret._setup(options);
	    if (!options.partial && templateSpec.useData) {
	      data = initData(context, data);
	    }
	    var depths = undefined,
	        blockParams = templateSpec.useBlockParams ? [] : undefined;
	    if (templateSpec.useDepths) {
	      if (options.depths) {
	        depths = context !== options.depths[0] ? [context].concat(options.depths) : options.depths;
	      } else {
	        depths = [context];
	      }
	    }

	    function main(context /*, options*/) {
	      return '' + templateSpec.main(container, context, container.helpers, container.partials, data, blockParams, depths);
	    }
	    main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams);
	    return main(context, options);
	  }
	  ret.isTop = true;

	  ret._setup = function (options) {
	    if (!options.partial) {
	      container.helpers = container.merge(options.helpers, env.helpers);

	      if (templateSpec.usePartial) {
	        container.partials = container.merge(options.partials, env.partials);
	      }
	      if (templateSpec.usePartial || templateSpec.useDecorators) {
	        container.decorators = container.merge(options.decorators, env.decorators);
	      }
	    } else {
	      container.helpers = options.helpers;
	      container.partials = options.partials;
	      container.decorators = options.decorators;
	    }
	  };

	  ret._child = function (i, data, blockParams, depths) {
	    if (templateSpec.useBlockParams && !blockParams) {
	      throw new _exception2['default']('must pass block params');
	    }
	    if (templateSpec.useDepths && !depths) {
	      throw new _exception2['default']('must pass parent depths');
	    }

	    return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
	  };
	  return ret;
	}

	function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
	  function prog(context) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    var currentDepths = depths;
	    if (depths && context !== depths[0]) {
	      currentDepths = [context].concat(depths);
	    }

	    return fn(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), currentDepths);
	  }

	  prog = executeDecorators(fn, prog, container, depths, data, blockParams);

	  prog.program = i;
	  prog.depth = depths ? depths.length : 0;
	  prog.blockParams = declaredBlockParams || 0;
	  return prog;
	}

	function resolvePartial(partial, context, options) {
	  if (!partial) {
	    if (options.name === '@partial-block') {
	      partial = options.data['partial-block'];
	    } else {
	      partial = options.partials[options.name];
	    }
	  } else if (!partial.call && !options.name) {
	    // This is a dynamic partial that returned a string
	    options.name = partial;
	    partial = options.partials[partial];
	  }
	  return partial;
	}

	function invokePartial(partial, context, options) {
	  options.partial = true;
	  if (options.ids) {
	    options.data.contextPath = options.ids[0] || options.data.contextPath;
	  }

	  var partialBlock = undefined;
	  if (options.fn && options.fn !== noop) {
	    options.data = _base.createFrame(options.data);
	    partialBlock = options.data['partial-block'] = options.fn;

	    if (partialBlock.partials) {
	      options.partials = Utils.extend({}, options.partials, partialBlock.partials);
	    }
	  }

	  if (partial === undefined && partialBlock) {
	    partial = partialBlock;
	  }

	  if (partial === undefined) {
	    throw new _exception2['default']('The partial ' + options.name + ' could not be found');
	  } else if (partial instanceof Function) {
	    return partial(context, options);
	  }
	}

	function noop() {
	  return '';
	}

	function initData(context, data) {
	  if (!data || !('root' in data)) {
	    data = data ? _base.createFrame(data) : {};
	    data.root = context;
	  }
	  return data;
	}

	function executeDecorators(fn, prog, container, depths, data, blockParams) {
	  if (fn.decorator) {
	    var props = {};
	    prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams, depths);
	    Utils.extend(prog, props);
	  }
	  return prog;
	}

/***/ },
/* 19 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/* global window */
	'use strict';

	exports.__esModule = true;

	exports['default'] = function (Handlebars) {
	  /* istanbul ignore next */
	  var root = typeof global !== 'undefined' ? global : window,
	      $Handlebars = root.Handlebars;
	  /* istanbul ignore next */
	  Handlebars.noConflict = function () {
	    if (root.Handlebars === Handlebars) {
	      root.Handlebars = $Handlebars;
	    }
	    return Handlebars;
	  };
	};

	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])
});
;;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){

	function login(username,password,siteid){
		siteid=siteid || root.mura.siteid;

		return new Promise(function(resolve,reject) {
			root.mura.ajax({
					async:true,
					type:'post',
					url:root.mura.apiEndpoint,
					data:{
						siteid:siteid,
						username:username,
						password:password,
						method:'login'
					},
					success:function(resp){
						resolve(resp.data);
					}
			});
		});

	}


	function logout(siteid){
		siteid=siteid || root.mura.siteid;

		return new Promise(function(resolve,reject) {
			root.mura.ajax({
					async:true,
					type:'post',
					url:root.mura.apiEndpoint,
					data:{
						siteid:siteid,
						method:'logout'
					},
					success:function(resp){
						resolve(resp.data);
					}
			});
		});

	}

	function escapeHTML(str) {
	    var div = document.createElement('div');
	    div.appendChild(document.createTextNode(str));
	    return div.innerHTML;
	};

	// UNSAFE with unsafe strings; only use on previously-escaped ones!
	function unescapeHTML(escapedStr) {
	    var div = document.createElement('div');
	    div.innerHTML = escapedStr;
	    var child = div.childNodes[0];
	    return child ? child.nodeValue : '';
	};

	function renderFilename(filename,params){

		var query = [];
		params = params || {};
		params.filename= params.filename || '';
		params.siteid= params.siteid || root.mura.siteid;

	    for (var key in params) {
	    	if(key != 'entityname' && key != 'filename' && key != 'siteid' && key != 'method'){
	        	query.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
	    	}
	    }

		return new Promise(function(resolve,reject) {
			root.mura.ajax({
					async:true,
					type:'get',
					url:root.mura.apiEndpoint + params.siteid + '/content/_path/' + filename + '?' + query.join('&'),
					success:function(resp){
						if(typeof resolve == 'function'){
							var item=new root.mura.Entity();
							item.set(resp.data);
							resolve(item);
						}
					}
			});
		});

	}
	function getEntity(entityname,siteid){
		if(typeof entityname == 'string'){
			var properties={entityname:entityname};
			properties.siteid = siteid || root.mura.siteid;
		} else {
			properties=entityname;
			properties.entityname=properties.entityname || 'content';
			properties.siteid=properties.siteid || root.mura.siteid;
		}

		if(root.mura.entities[properties.entityname]){
			return new root.mura.entities[properties.entityname](properties);
		} else {
			return new root.mura.Entity(properties);
		}
	}

	function getFeed(entityname){
		return new root.mura.Feed(mura.siteid,entityname);
	}

	function findQuery(params){

		params=params || {};
		params.entityname=params.entityname || 'content';
		params.siteid=params.siteid || mura.siteid;
		params.method=params.method || 'findQuery';

		return new Promise(function(resolve,reject) {

			root.mura.ajax({
					type:'get',
					url:root.mura.apiEndpoint,
					data:params,
					success:function(resp){
							var collection=new root.mura.EntityCollection(resp.data)

							if(typeof resolve == 'function'){
								resolve(collection);
							}
						}
			});
		});
	}

	function evalScripts(el) {
	    if(typeof el=='string'){
	    	el=parseHTML(el);
	    }

	    var scripts = [];
	    var ret = el.childNodes;

	    for ( var i = 0; ret[i]; i++ ) {
	      if ( scripts && nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
	            scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
	        } else if(ret[i].nodeType==1 || ret[i].nodeType==9 || ret[i].nodeType==11){
	        	evalScripts(ret[i]);
	        }
	    }

	    for(script in scripts){
	      evalScript(scripts[script]);
	    }
	}

	function nodeName( el, name ) {
	    return el.nodeName && el.nodeName.toUpperCase() === name.toUpperCase();
	}

  	function evalScript(el) {
	    var data = ( el.text || el.textContent || el.innerHTML || "" );

	    var head = document.getElementsByTagName("head")[0] || document.documentElement,
	    script = document.createElement("script");
	    script.type = "text/javascript";
	    //script.appendChild( document.createTextNode( data ) );
		script.text=data;
	    head.insertBefore( script, head.firstChild );
	    head.removeChild( script );

	    if ( el.parentNode ) {
	        el.parentNode.removeChild( el );
	    }
	}

	function changeElementType(el, to) {
		var newEl = document.createElement(to);

		// Try to copy attributes across
		for (var i = 0, a = el.attributes, n = a.length; i < n; ++i)
		el.setAttribute(a[i].name, a[i].value);

		// Try to move children across
		while (el.hasChildNodes())
		newEl.appendChild(el.firstChild);

		// Replace the old element with the new one
		el.parentNode.replaceChild(newEl, el);

		// Return the new element, for good measure.
		return newEl;
	}

	function ready(fn) {
	    if(document.readyState != 'loading'){
	      //IE set the readyState to interative too early
	      setTimeout(fn,1);
	    } else {
	      document.addEventListener('DOMContentLoaded',function(){
	        fn();
	      });
	    }
	  }

	function get(url,data){
		return new Promise(function(resolve, reject) {
			return ajax({
					type:'get',
					url:url,
					data:data,
					success:function(resp){
						resolve(resp);
					},
					error:function(resp){
						reject(resp);
					}
				}
			);
 		});

	}

	function post(url,data){
		return new Promise(function(resolve, reject) {
			return ajax({
					type:'post',
					url:url,
					data:data,
					success:function(resp){
						resolve(resp);
					},
					error:function(resp){
						reject(resp);
					}
				}
			);
 		});

	}

	function isXDomainRequest(url){
		function getHostName(url) {
		    var match = url.match(/:\/\/([0-9]?\.)?(.[^/:]+)/i);
		    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		    	return match[2];
		    } else {
		        return null;
		    }
		}


		function getDomain(url) {
		    var hostName = getHostName(url);
		    var domain = hostName;

		    if (hostName != null) {
		        var parts = hostName.split('.').reverse();

		        if (parts != null && parts.length > 1) {
		            domain = parts[1] + '.' + parts[0];

		            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
		              domain = parts[2] + '.' + domain;
		            }
		        }
		    }

		    return domain;
		}

		var requestDomain=getDomain(url);

		return (requestDomain && requestDomain != location.host);

	}

	function ajax(params){

		//params=params || {};

		if(!('type' in params)){
			params.type='GET';
		}

		if(!('success' in params)){
			params.success=function(){};
		}

		if(!('error' in params)){
			params.error=function(){};
		}

		if(!('data' in params)){
			params.data={};
		}

		params.data=mura.deepExtend({},params.data);

		for(var p in params.data){
			if(typeof params.data[p] == 'object'){
				params.data[p]=JSON.stringify(params.data[p]);
			}
		}

		if(!('xhrFields' in params)){
			params.xhrFields={ withCredentials: true };
		}

		if(!('crossDomain' in params)){
			params.crossDomain=true;
		}

		if(!('async' in params)){
			params.async=true;
		}

		if(!('headers' in params)){
			params.headers={};
		}

		var request = new XMLHttpRequest();

		if(params.crossDomain){
			if (!("withCredentials" in request)
				&& typeof XDomainRequest != "undefined" && isXDomainRequest(params.url)) {
			    // Check if the XMLHttpRequest object has a "withCredentials" property.
			    // "withCredentials" only exists on XMLHTTPRequest2 objects.
			    // Otherwise, check if XDomainRequest.
			    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.

				request =new XDomainRequest();

			}
		}

		request.onreadystatechange = function() {
			if(request.readyState == 4) {
   	 		  	//IE9 doesn't appear to return the request status
   	      		if(typeof request.status == 'undefined' || (request.status >= 200 && request.status < 400)) {

					try{
   	 			    	var data = JSON.parse(request.responseText);
   	 			    } catch(e){
   	 			    	var data = request.responseText;
   	 			    }

   	 			    params.success(data,request);
   	 			} else {
   	 			   	params.error(request);
   	 			}
			}
		}

		if(params.type.toLowerCase()=='post'){
			request.open(params.type.toUpperCase(), params.url, params.async);

			for(var p in params.xhrFields){
				if(p in request){
					request[p]=params.xhrFields[p];
				}
			}

			for(var h in params.headers){
				request.setRequestHeader(p,params.headers[h]);
			}

			//if(params.data.constructor.name == 'FormData'){
			if(typeof FormData != 'undefined' && params.data instanceof FormData){
				request.send(params.data);
			} else {
				request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
				var query = [];

			    for (var key in params.data) {
			        query.push($escape(key) + '=' + $escape(params.data[key]));
			    }

			    query=query.join('&');

				setTimeout(function () {
				   request.send(query);
				 }, 0);
			}
		} else {
			if(params.url.indexOf('?') == -1){
				params.url += '?';
			}

			var query = [];

		    for (var key in params.data) {
		        query.push($escape(key) + '=' + $escape(params.data[key]));
		    }

		    query=query.join('&');

			request.open(params.type.toUpperCase(), params.url + '&' +  query, params.async);

			for(var p in params.xhrFields){
				if(p in request){
					request[p]=params.xhrFields[p];
				}
			}

			for(var h in params.headers){
				request.setRequestHeader(p,params.headers[h]);
			}

			setTimeout(function () {
			   request.send();
			 }, 0);
		}

	}

	function generateOauthToken(grant_type,client_id,client_secret){
		return new Promise(function(resolve,reject) {
			get(mura.apiEndpoint.replace('/json/','/rest/') + 'oauth/token?grant_type=' + encodeURIComponent(grant_type) + '&client_id=' + encodeURIComponent(client_id) + '&client_secret=' + encodeURIComponent(client_secret)).then(function(resp){
				if(resp.data != 'undefined'){
					resolve(resp.data);
				} else {
					if(typeof reject=='function'){
						reject(resp);
					}
				}
			})
		});
	}

	function each(selector,fn){
		select(selector).each(fn);
	}

	function on(el,eventName,fn){
		if(eventName=='ready'){
			mura.ready(fn);
		} else {
			if(typeof el.addEventListener == 'function'){
				el.addEventListener(
					eventName,
					function(event){
						fn.call(el,event);
					},
					true
				);
			}
		}
	}

	function trigger(el, eventName, eventDetail) {
      	var eventClass = "";

      	switch (eventName) {
          	case "click":
          	case "mousedown":
          	case "mouseup":
              	eventClass = "MouseEvents";
              	break;

          	case "focus":
          	case "change":
          	case "blur":
          	case "select":
              	eventClass = "HTMLEvents";
              	break;

          default:
              	eventClass = "Event";
              	break;
       	}

      	var bubbles=eventName == "change" ? false : true;

		if(document.createEvent){
	    	var event = document.createEvent(eventClass);
	    	event.initEvent(eventName, bubbles, true);
	    	event.synthetic = true;
			el.dispatchEvent(event);

		} else {
			try{
				document.fireEvent("on" + eventName);
			} catch(e){
				console.warn("Event failed to fire due to legacy browser: on" + eventName);
			}
		}


  	};

	function off(el,eventName,fn){
		el.removeEventListener(eventName,fn);
	}

	function parseSelection(selector){
		if(typeof selector == 'object' && Array.isArray(selector)){
			var selection=selector;
		} else if(typeof selector== 'string'){
			var selection=nodeListToArray(document.querySelectorAll(selector));
		} else {
			if((typeof StaticNodeList != 'undefined' && selector instanceof StaticNodeList) || selector instanceof NodeList || selector instanceof HTMLCollection){
				var selection=nodeListToArray(selector);
			} else {
				var selection=[selector];
			}
		}

		if(typeof selection.length == 'undefined'){
			selection=[];
		}

		return selection;
	}

	function isEmptyObject(obj){
		return (typeof obj != 'object' || Object.keys(obj).length == 0);
	}

	function filter(selector,fn){
		return select(parseSelection(selector)).filter(fn);
	}

	function nodeListToArray(nodeList){
		var arr = [];
		for(var i = nodeList.length; i--; arr.unshift(nodeList[i]));
		return arr;
	}

	function select(selector){
		return new root.mura.DOMSelection(parseSelection(selector),selector);
	}

	function parseHTML(str) {
	  var tmp = document.implementation.createHTMLDocument();
	  tmp.body.innerHTML = str;
	  return tmp.body.children;
	};

	function getData(el){
		var data = {};
		Array.prototype.forEach.call(el.attributes, function(attr) {
		    if (/^data-/.test(attr.name)) {
		        data[attr.name.substr(5)] = parseString(attr.value);
		    }
		});

		return data;
	}

	function getProps(el){
		var data = {};
		Array.prototype.forEach.call(el.attributes, function(attr) {
		    if (/^data-/.test(attr.name)) {
		        data[attr.name.substr(5)] = parseString(attr.value);
		    }
		});

		return data;
	}


	function isNumeric(val) {
		return Number(parseFloat(val)) == val;
	}

	function parseString(val){
		if(typeof val == 'string'){
			var lcaseVal=val.toLowerCase();

			if(lcaseVal=='false'){
				return false;
			} else if (lcaseVal=='true'){
				return true;
			} else {
				if(isNumeric(val)){
					var numVal=parseFloat(val);
					if(numVal==0 || !isNaN(1/numVal)){
						return numVal;
					}
				}

				try {
			        var jsonVal=JSON.parse(val);
			        return jsonVal;
			    } catch (e) {
			        return val;
			    }

			}
		} else {
			return val;
		}

	}

	function getAttributes(el){
		var data = {};
		Array.prototype.forEach.call(el.attributes, function(attr) {
		       data[attr.name] = attr.value;
		});

		return data;
	}

	function formToObject(form) {
	    var field, s = {};
	    if (typeof form == 'object' && form.nodeName == "FORM") {
	        var len = form.elements.length;
	        for (i=0; i<len; i++) {
	            field = form.elements[i];
	            if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
	                if (field.type == 'select-multiple') {
	                    for (j=form.elements[i].options.length-1; j>=0; j--) {
	                        if(field.options[j].selected)
	                            s[s.name] = field.options[j].value;
	                    }
	                } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
	                    s[field.name ] =field.value;
	                }
	            }
	        }
	    }
	    return s;
	}

	//http://youmightnotneedjquery.com/
	function extend(out) {
	  	out = out || {};

	  	for (var i = 1; i < arguments.length; i++) {
		    if (!arguments[i])
		      continue;

		    for (var key in arguments[i]) {
		      if (typeof arguments[i].hasOwnProperty != 'undefined' && arguments[i].hasOwnProperty(key))
		        out[key] = arguments[i][key];
		    }
	  	}

	  	return out;
	};

	function deepExtend(out) {
		out = out || {};

		for (var i = 1; i < arguments.length; i++) {
		    var obj = arguments[i];

		    if (!obj)
	      	continue;

		    for (var key in obj) {

		        if (typeof arguments[i].hasOwnProperty != 'undefined' && arguments[i].hasOwnProperty(key)) {
		        	if(Array.isArray(obj[key])){
		       			out[key]=obj[key].slice(0);
			        } else if (typeof obj[key] === 'object') {
			          	out[key]=deepExtend({}, obj[key]);
			        } else {
			          	out[key] = obj[key];
			        }
		      	}
		    }
		}

	  	return out;
	}

	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return unescape(c.substring(nameEQ.length,c.length));
		}
		return "";
	}

	function eraseCookie(name) {
		createCookie(name,"",-1);
	}

	function $escape(value){
		if(typeof encodeURIComponent != 'undefined'){
			return encodeURIComponent(value)
		} else {
			return escape(value).replace(
	       	 	new RegExp( "\\+", "g" ),
	        	"%2B"
	        ).replace(/[\x00-\x1F\x7F-\x9F]/g, "");
		}
	}

	function $unescape(value){
		return unescape(value);
	}

	//deprecated
	function addLoadEvent(func) {
		 var oldonload = root.onload;
		 if (typeof root.onload != 'function') {
			root.onload = func;
		 } else {
			root.onload = function() {
			 oldonload();
			 func();
			}
		 }
	}

	function noSpam(user,domain) {
		locationstring = "mailto:" + user + "@" + domain;
		root.location = locationstring;
	}

	function createUUID() {
	    var s = [], itoh = '0123456789ABCDEF';

	    // Make array of random hex digits. The UUID only has 32 digits in it, but we
	    // allocate an extra items to make room for the '-'s we'll be inserting.
	    for (var i = 0; i < 35; i++) s[i] = Math.floor(Math.random()*0x10);

	    // Conform to RFC-4122, section 4.4
	    s[14] = 4;  // Set 4 high bits of time_high field to version
	    s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence

	    // Convert to hex chars
	    for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];

	    // Insert '-'s
	    s[8] = s[13] = s[18] = '-';

	    return s.join('');
	 }

	function setHTMLEditor(el) {

		function initEditor(){
			var instance=root.CKEDITOR.instances[el.getAttribute('id')];
			var conf={height:200,width:'70%'};

			if(el.getAttribute('data-editorconfig')){
				extend(conf,el.getAttribute('data-editorconfig'));
			}

			if (instance) {
				instance.destroy();
				CKEDITOR.remove(instance);
			}

			root.CKEDITOR.replace( el.getAttribute('id'),getHTMLEditorConfig(conf),htmlEditorOnComplete);
		}

		function htmlEditorOnComplete( editorInstance ) {
			//var instance=jQuery(editorInstance).ckeditorGet();
			//instance.resetDirty();
			editorInstance.resetDirty();
			var totalIntances=root.CKEDITOR.instances;
			//CKFinder.setupCKEditor( instance, { basePath : context + '/requirements/ckfinder/', rememberLastFolder : false } ) ;
		}

		function getHTMLEditorConfig(customConfig) {
			var attrname='';
			var htmlEditorConfig={
				toolbar:'htmlEditor',
				customConfig : 'config.js.cfm'
				}

			if(typeof(customConfig)== 'object'){
				extend(htmlEditorConfig,customConfig);
			}

			return htmlEditorConfig;
		}

		loader().loadjs(
			root.mura.requirementspath + '/ckeditor/ckeditor.js'
			,
			function(){
				initEditor();
			}
		);

	}

	var pressed_keys='';

	var loginCheck=function(key){

		if(key==27){
			pressed_keys = key.toString();

		} else if(key == 76){
			pressed_keys = pressed_keys + "" + key.toString();
		}

		if (key !=27  && key !=76) {
		pressed_keys = "";
		}

		if (pressed_keys != "") {

			var aux = pressed_keys;
			var lu='';
			var ru='';

			if (aux.indexOf('2776') != -1 && location.search.indexOf("display=login") == -1) {

				if(typeof(root.mura.loginURL) != "undefined"){
					lu=root.mura.loginURL;
				} else if(typeof(root.mura.loginurl) != "undefined"){
					lu=root.mura.loginurl;
				} else{
					lu="?display=login";
				}

				if(typeof(root.mura.returnURL) != "undefined"){
					ru=root.mura.returnURL;
				} else if(typeof(root.mura.returnurl) != "undefined"){
					ru=root.mura.returnURL;
				} else{
					ru=location.href;
				}
				pressed_keys = "";

				lu = new String(lu);
				if(lu.indexOf('?') != -1){
					location.href=lu + "&returnUrl=" + encodeURIComponent(ru);
				} else {
					location.href=lu + "?returnUrl=" + encodeURIComponent(ru);
				}
			}
		}
	}

	function isInteger(s){
		var i;
			for (i = 0; i < s.length; i++){
					// Check that current character is number.
					var c = s.charAt(i);
					if (((c < "0") || (c > "9"))) return false;
			}
			// All characters are numbers.
			return true;
	}

	function createDate(str){

		var valueArray = str.split("/");

		var mon = valueArray[0];
		var dt = valueArray[1];
		var yr = valueArray[2];

		var date = new Date(yr, mon-1, dt);

		if(!isNaN(date.getMonth())){
			return date;
		} else {
			return new Date();
		}

	}

	function dateToString(date){
		var mon   = date.getMonth()+1;
		var dt  = date.getDate();
		var yr   = date.getFullYear();

		if(mon < 10){ mon="0" + mon;}
		if(dt < 10){ dt="0" + dt;}


		return mon + "/" + dt + "/20" + new String(yr).substring(2,4);
	}


	function stripCharsInBag(s, bag){
		var i;
			var returnString = "";
			// Search through string's characters one by one.
			// If character is not in bag, append to returnString.
			for (i = 0; i < s.length; i++){
					var c = s.charAt(i);
					if (bag.indexOf(c) == -1) returnString += c;
			}
			return returnString;
	}

	function daysInFebruary(year){
		// February has 29 days in any year evenly divisible by four,
			// EXCEPT for centurial years which are not also divisible by 400.
			return (((year % 4 == 0) && ( (!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28 );
	}

	function DaysArray(n) {
		for (var i = 1; i <= n; i++) {
			this[i] = 31
			if (i==4 || i==6 || i==9 || i==11) {this[i] = 30}
			if (i==2) {this[i] = 29}
		 }
		 return this
	}

	function isDate(dtStr,fldName){
		var daysInMonth = DaysArray(12);
		var dtArray= dtStr.split(root.mura.dtCh);

		if (dtArray.length != 3){
			//alert("The date format for the "+fldName+" field should be : short")
			return false
		}
		var strMonth=dtArray[root.mura.dtFormat[0]];
		var strDay=dtArray[root.mura.dtFormat[1]];
		var strYear=dtArray[root.mura.dtFormat[2]];

		/*
		if(strYear.length == 2){
			strYear="20" + strYear;
		}
		*/
		strYr=strYear;

		if (strDay.charAt(0)=="0" && strDay.length>1) strDay=strDay.substring(1)
		if (strMonth.charAt(0)=="0" && strMonth.length>1) strMonth=strMonth.substring(1)
		for (var i = 1; i <= 3; i++) {
			if (strYr.charAt(0)=="0" && strYr.length>1) strYr=strYr.substring(1)
		}

		month=parseInt(strMonth)
		day=parseInt(strDay)
		year=parseInt(strYr)

		if (month<1 || month>12){
			//alert("Please enter a valid month in the "+fldName+" field")
			return false
		}
		if (day<1 || day>31 || (month==2 && day>daysInFebruary(year)) || day > daysInMonth[month]){
			//alert("Please enter a valid day  in the "+fldName+" field")
			return false
		}
		if (strYear.length != 4 || year==0 || year<root.mura.minYear || year>root.mura.maxYear){
			//alert("Please enter a valid 4 digit year between "+root.mura.minYear+" and "+root.mura.maxYear +" in the "+fldName+" field")
			return false
		}
		if (isInteger(stripCharsInBag(dtStr, root.mura.dtCh))==false){
			//alert("Please enter a valid date in the "+fldName+" field")
			return false
		}

		return true;
	}

	function isEmail(cur){
		var string1=cur
		if (string1.indexOf("@") == -1 || string1.indexOf(".") == -1){
			return false;
		}else{
			return true;
		}
	}

	function initShadowBox(el){
	    if(mura(el).find('[data-rel^="shadowbox"],[rel^="shadowbox"]').length){

	      loader().load(
	        [
	          	mura.assetpath +'/css/shadowbox.min.css',
				mura.assetpath +'/js/external/shadowbox/shadowbox.js'
	        ],
	        function(){
				mura('#shadowbox_overlay,#shadowbox_container').remove();
				if(root.Shadowbox){
					root.Shadowbox.init();
				}
			}
	      );
	  	}
	}

	function validateForm(frm,customaction) {

		function getValidationFieldName(theField){
			if(theField.getAttribute('data-label')!=undefined){
				return theField.getAttribute('data-label');
			}else if(theField.getAttribute('label')!=undefined){
				return theField.getAttribute('label');
			}else{
				return theField.getAttribute('name');
			}
		}

		function getValidationIsRequired(theField){
			if(theField.getAttribute('data-required')!=undefined){
				return (theField.getAttribute('data-required').toLowerCase() =='true');
			}else if(theField.getAttribute('required')!=undefined){
				return (theField.getAttribute('required').toLowerCase() =='true');
			}else{
				return false;
			}
		}

		function getValidationMessage(theField, defaultMessage){
			if(theField.getAttribute('data-message') != undefined){
				return theField.getAttribute('data-message');
			} else if(theField.getAttribute('message') != undefined){
				return theField.getAttribute('message') ;
			} else {
				return getValidationFieldName(theField).toUpperCase() + defaultMessage;
			}
		}

		function getValidationType(theField){
			if(theField.getAttribute('data-validate')!=undefined){
				return theField.getAttribute('data-validate').toUpperCase();
			}else if(theField.getAttribute('validate')!=undefined){
				return theField.getAttribute('validate').toUpperCase();
			}else{
				return '';
			}
		}

		function hasValidationMatchField(theField){
			if(theField.getAttribute('data-matchfield')!=undefined && theField.getAttribute('data-matchfield') != ''){
				return true;
			}else if(theField.getAttribute('matchfield')!=undefined && theField.getAttribute('matchfield') != ''){
				return true;
			}else{
				return false;
			}
		}

		function getValidationMatchField(theField){
			if(theField.getAttribute('data-matchfield')!=undefined){
				return theField.getAttribute('data-matchfield');
			}else if(theField.getAttribute('matchfield')!=undefined){
				return theField.getAttribute('matchfield');
			}else{
				return '';
			}
		}

		function hasValidationRegex(theField){
			if(theField.value != undefined){
				if(theField.getAttribute('data-regex')!=undefined && theField.getAttribute('data-regex') != ''){
					return true;
				}else if(theField.getAttribute('regex')!=undefined && theField.getAttribute('regex') != ''){
					return true;
				}
			}else{
				return false;
			}
		}

		function getValidationRegex(theField){
			if(theField.getAttribute('data-regex')!=undefined){
				return theField.getAttribute('data-regex');
			}else if(theField.getAttribute('regex')!=undefined){
				return theField.getAttribute('regex');
			}else{
				return '';
			}
		}

		var theForm=frm;
		var errors="";
		var setFocus=0;
		var started=false;
		var startAt;
		var firstErrorNode;
		var validationType='';
		var validations={properties:{}};
		var frmInputs = theForm.getElementsByTagName("input");
		var rules=new Array();
		var data={};
		var $customaction=customaction;

		for (var f=0; f < frmInputs.length; f++) {
		 var theField=frmInputs[f];
		 validationType=getValidationType(theField).toUpperCase();

			rules=new Array();

			if(theField.style.display==""){
				if(getValidationIsRequired(theField))
					{
						rules.push({
							required: true,
							message: getValidationMessage(theField,' is required.')
						});


					}
				if(validationType != ''){

					if(validationType=='EMAIL' && theField.value != '')
					{
						rules.push({
							dataType: 'EMAIL',
							message: getValidationMessage(theField,' must be a valid email address.')
						});


					}

					else if(validationType=='NUMERIC' && theField.value != '')
					{
						rules.push({
							dataType: 'NUMERIC',
							message: getValidationMessage(theField,' must be numeric.')
						});

					}

					else if(validationType=='REGEX' && theField.value !='' && hasValidationRegex(theField))
					{
						rules.push({
							regex: getValidationRegex(theField),
							message: getValidationMessage(theField,' is not valid.')
						});

					}

					else if(validationType=='MATCH'
							&& hasValidationMatchField(theField) && theField.value != theForm[getValidationMatchField(theField)].value)
					{
						rules.push({
							eq: theForm[getValidationMatchField(theField)].value,
							message: getValidationMessage(theField, ' must match' + getValidationMatchField(theField) + '.' )
						});

					}

					else if(validationType=='DATE' && theField.value != '')
					{
						rules.push({
							dataType: 'DATE',
							message: getValidationMessage(theField, ' must be a valid date [MM/DD/YYYY].' )
						});

					}
				}

				if(rules.length){
					validations.properties[theField.getAttribute('name')]=rules;
					data[theField.getAttribute('name')]=theField.value;
				}
			}
		}
		var frmTextareas = theForm.getElementsByTagName("textarea");
		for (f=0; f < frmTextareas.length; f++) {


				theField=frmTextareas[f];
				validationType=getValidationType(theField);

				rules=new Array();

				if(theField.style.display=="" && getValidationIsRequired(theField))
				{
					rules.push({
						required: true,
						message: getValidationMessage(theField, ' is required.' )
					});

				}

				else if(validationType != ''){
					if(validationType=='REGEX' && theField.value !='' && hasValidationRegex(theField))
					{
						rules.push({
							regex: getValidationRegex(theField),
							message: getValidationMessage(theField, ' is not valid.' )
						});

					}
				}

				if(rules.length){
					validations.properties[theField.getAttribute('name')]=rules;
					data[theField.getAttribute('name')]=theField.value;
				}
		}

		var frmSelects = theForm.getElementsByTagName("select");
		for (f=0; f < frmSelects.length; f++) {
				theField=frmSelects[f];
				validationType=getValidationType(theField);

				rules=new Array();

				if(theField.style.display=="" && getValidationIsRequired(theField))
				{
					rules.push({
						required: true,
						message: getValidationMessage(theField, ' is required.' )
					});
				}

				if(rules.length){
					validations.properties[theField.getAttribute('name')]=rules;
					data[theField.getAttribute('name')]=theField.value;
				}
		}

		try{
			//alert(JSON.stringify(validations));
			//console.log(data);
			//console.log(validations);
			ajax(
				{
					type: 'post',
					url: root.mura.apiEndpoint + '?method=validate',
					data: {
							data: encodeURIComponent(JSON.stringify(data)),
							validations: encodeURIComponent(JSON.stringify(validations)),
							version: 4
						},
					success: function(resp) {

						data=resp.data;

						if(Object.keys(data).length === 0){
							if(typeof $customaction == 'function'){
								$customaction(theForm);
								return false;
							} else {
								document.createElement('form').submit.call(theForm);
							}
						} else {
							var msg='';
							for(var e in data){
								msg=msg + data[e] + '\n';
							}

							alert(msg);
						}
					},
					error: function(resp) {

						alert(JSON.stringify(resp));
					}

				}
			);
		}
		catch(err){
			console.log(err);
		}

		return false;

	}

	function setLowerCaseKeys(obj) {
		for(var key in obj){
			 if (key !== key.toLowerCase()) { // might already be in its lower case version
						obj[key.toLowerCase()] = obj[key] // swap the value to a new lower case key
						delete obj[key] // delete the old key
				}
				if(typeof obj[key.toLowerCase()] == 'object'){
					setLowerCaseKeys(obj[key.toLowerCase()]);
				}
		}

		return (obj);
	}

	function isScrolledIntoView(el) {
		if(!root || root.innerHeight){
			true;
		}

		try{
		    var elemTop = el.getBoundingClientRect().top;
		    var elemBottom = el.getBoundingClientRect().bottom;
		} catch(e){
			return true;
		}

		var isVisible = elemTop < root.innerHeight && elemBottom >= 0;
		return isVisible;

	}

	function loader(){return root.mura.ljs;}

	var layoutmanagertoolbar='<div class="frontEndToolsModal mura"><span class="mura-edit-icon"></span></div>';

	function processMarkup(scope){

		if(!(scope instanceof root.mura.DOMSelection)){
			scope=select(scope);
		}

		var self=scope;

		function find(selector){
			return scope.find(selector);
		}

		var processors=[

			function(){
				find('.mura-object[data-async="true"], .mura-object[data-render="client"], .mura-async-object').each(function(){
					processObject(this,true);
				});
			},

			function(){
				find(".htmlEditor").each(function(el){
					setHTMLEditor(this);
				});
			},

			function(){
				if(find(".cffp_applied  .cffp_mm .cffp_kp").length){
					var fileref=document.createElement('script')
				        fileref.setAttribute("type","text/javascript")
				        fileref.setAttribute("src", root.mura.requirementspath + '/cfformprotect/js/cffp.js')

					document.getElementsByTagName("head")[0].appendChild(fileref)
				}
			},

			function(){
				if(find(".g-recaptcha" ).length){
					var fileref=document.createElement('script')
				        fileref.setAttribute("type","text/javascript")
				        fileref.setAttribute("src", "https://www.google.com/recaptcha/api.js?onload=checkForReCaptcha&render=explicit")

					document.getElementsByTagName("head")[0].appendChild(fileref)

				}

				if(find(".g-recaptcha-container" ).length){
					loader().loadjs(
						"https://www.google.com/recaptcha/api.js?onload=checkForReCaptcha&render=explicit",
						function(){
							find(".g-recaptcha-container" ).each(function(el){
								var self=el;
								var checkForReCaptcha=function()
									{
									   if (typeof grecaptcha == 'object' && self)
									   {
									   	//console.log(self)
									     self.setAttribute(
											'data-widgetid',
										 	grecaptcha.render(self.getAttribute('id'), {
									          'sitekey' : self.getAttribute('data-sitekey'),
									          'theme' : self.getAttribute('data-theme'),
									          'type' : self.getAttribute('data-type')
									        })
										);
									   }
									   else
									   {
									      root.setTimeout(function(){checkForReCaptcha();},10);
									   }
									}

								checkForReCaptcha();

							});
						}
					);

				}
			},

			function(){
				if(typeof resizeEditableObject == 'function' ){

					scope.closest('.editableObject').each(function(){
						resizeEditableObject(this);
					});

					find(".editableObject").each(function(){
						resizeEditableObject(this);
					});

				}
			},

			function(){

				if(typeof openFrontEndToolsModal == 'function' ){
					find(".frontEndToolsModal").on(
						'click',
						function(event){
							event.preventDefault();
							openFrontEndToolsModal(this);
						}
					);
				}


				if(root.muraInlineEditor && root.muraInlineEditor.checkforImageCroppers){
					find("img").each(function(){
						 root.muraInlineEditor.checkforImageCroppers(this);
					});

				}

			},

			function(){
				initShadowBox(scope.node);
			},

			function(){
				if(typeof urlparams.muraadminpreview != 'undefined'){
					find("a").each(function() {
						var h=this.getAttribute('href');
						if(typeof h =='string' && h.indexOf('muraadminpreview')==-1){
							h=h + (h.indexOf('?') != -1 ? "&muraadminpreview&mobileformat=" + root.mura.mobileformat : "?muraadminpreview&muraadminpreview&mobileformat=" + root.mura.mobileformat);
							this.setAttribute('href',h);
						}
					});
				}
			}
		];

		for(var h=0;h<processors.length;h++){
			processors[h]();
		}
	}

	function addEventHandler(eventName,fn){
		if(typeof eventName == 'object'){
			for(var h in eventName){
				on(document,h,eventName[h]);
			}
		} else {
			on(document,eventName,fn);
		}
	}


	function submitForm(frm,obj){
		frm=(frm.node) ? frm.node : frm;

	    if(obj){
	      obj=(obj.node) ? obj : mura(obj);
	    } else {
	      obj=mura(frm).closest('.mura-async-object');
	    }

		if(!obj.length){
			mura(frm).trigger('formSubmit',formToObject(frm));
			frm.submit();
		}

		if(typeof FormData != 'undefined' && frm.getAttribute('enctype')=='multipart/form-data'){

				var data=new FormData(frm);
				var checkdata=setLowerCaseKeys(formToObject(frm));
				var keys=deepExtend(setLowerCaseKeys(obj.data()),urlparams,{siteid:root.mura.siteid,contentid:root.mura.contentid,contenthistid:root.mura.contenthistid,nocache:1});

				for(var k in keys){
					if(!(k in checkdata)){
						data.append(k,keys[k]);
					}
				}

				if('objectparams' in checkdata){
					data.append('objectparams2', encodeURIComponent(JSON.stringify(obj.data('objectparams'))));
				}

				if('nocache' in checkdata){
					data.append('nocache',1);
				}

				if(data.object=='container' && data.content){
					delete data.content;
				}

				var postconfig={
							url:  root.mura.apiEndpoint + '?method=processAsyncObject',
							type: 'POST',
							data: data,
							success:function(resp){handleResponse(obj,resp);}
						}

			} else {
				var data=deepExtend(setLowerCaseKeys(obj.data()),urlparams,setLowerCaseKeys(formToObject(frm)),{siteid:root.mura.siteid,contentid:root.mura.contentid,contenthistid:root.mura.contenthistid,nocache:1});

				if(data.object=='container' && data.content){
					delete data.content;
				}

				if(!('g-recaptcha-response' in data) && document.querySelectorAll("#g-recaptcha-response").length){
					data['g-recaptcha-response']=document.getElementById('recaptcha-response').value;
				}

				if('objectparams' in data){
					data['objectparams']= encodeURIComponent(JSON.stringify(data['objectparams']));
				}

				var postconfig={
							url: root.mura.apiEndpoint + '?method=processAsyncObject',
							type: 'POST',
							data: data,
							success:function(resp){handleResponse(obj,resp);}
						}
			}

			var self=obj.node;
			self.prevInnerHTML=self.innerHTML;
			self.prevData=obj.data();
			self.innerHTML=root.mura.preloaderMarkup;

			mura(frm).trigger('formSubmit',data);

			ajax(postconfig);
	}

	function resetAsyncObject(el){
		var self=mura(el);

		self.removeClass('mura-active');
		self.removeAttr('data-perm');
		self.removeAttr('draggable');

		if(self.data('object')=='container'){
			self.find('.mura-object:not([data-object="container"])').html('');
			self.find('.frontEndToolsModal').remove();

			self.find('.mura-object').each(function(){
				var self=mura(this);
				self.removeClass('mura-active');
				self.removeAttr('data-perm');
				self.removeAttr('data-inited');
				self.removeAttr('draggable');
			});

			self.find('.mura-object[data-object="container"]').each(function(){
				var self=mura(this);
				var content=self.children('div.mura-object-content');

				if(content.length){
					self.data('content',content.html());
				}

				content.html('');
			});

			self.find('.mura-object-meta').html('');
			var content=self.children('div.mura-object-content');

			if(content.length){
				self.data('content',content.html());
			}
		}

		self.html('');
	}

	function processAsyncObject(el){
		obj=mura(el);
		if(obj.data('async')===null){
			obj.data('async',true);
		}
		return processObject(obj);
	}

	function wireUpObject(obj,response){

		function validateFormAjax(frm) {
			validateForm(frm,
				function(frm){
					submitForm(frm,obj);
				}
			);

			return false;

		}

		obj=(obj.node) ? obj : mura(obj);
		var self=obj.node;

		if(obj.data('class')){
			var classes=obj.data('class');

			if(typeof classes != 'array'){
				var classes=classes.split(' ');
			}

			for(var c=0;c<classes.length;c++){
				if(!obj.hasClass(classes[c])){
					obj.addClass(classes[c]);
				}
			}
		}

		obj.data('inited',true);

		if(obj.data('cssclass')){
			var classes=obj.data('cssclass');

			if(typeof classes != 'array'){
				var classes=classes.split(' ');
			}

			for(var c in classes){
				if(!obj.hasClass(classes[c])){
					obj.addClass(classes[c]);
				}
			}
		}

		if(response){
			if(typeof response == 'string'){
				obj.html(trim(response));
			} else if (typeof response.html =='string' && response.render!='client'){
				obj.html(trim(response.html));
			} else {
				if(obj.data('object')=='container'){
					var context=deepExtend(obj.data(),response);
					context.targetEl=obj.node;
					obj.prepend(mura.templates.meta(context));
				} else {
					var template=obj.data('clienttemplate') || obj.data('object');

						var context=deepExtend(obj.data(),response);

						if(typeof context.async != 'undefined'){
							obj.data('async',context.async);
						}

						if(typeof context.render != 'undefined'){
							obj.data('render',context.render);
						}

						if(typeof context.rendertemplate != 'undefined'){
							obj.data('rendertemplate',context.rendertemplate);
						}

						if(typeof mura.render[template] == 'function'){
							context.html='';
							obj.html(mura.templates.content(context));
							obj.prepend(mura.templates.meta(context));
							context.targetEl=obj.children('.mura-object-content').node;
							mura.render[template](context);

						} else if(typeof mura.templates[template] == 'function'){
							context.html=mura.templates[template](context);
							obj.html(mura.templates.content(context));
							obj.prepend(mura.templates.meta(context));
						}	else {
							console.log('Missing Client Template for:');
							console.log(obj.data());
						}
				}
			}
		} else {
			var context=obj.data();

			if(obj.data('object')=='container'){
				obj.prepend(mura.templates.meta(context));
			} else {
				var template=obj.data('clienttemplate') || obj.data('object');

				if(typeof mura.render[template] == 'function'){
					context.html='';
					obj.html(mura.templates.content(context));
					obj.prepend(mura.templates.meta(context));
					context.targetEl=obj.children('.mura-object-content').node;
					mura.render[template](context);
				} else if(typeof mura.templates[template] == 'function'){
					context.html=mura.templates[template](context);
					obj.html(mura.templates.content(context));
					obj.prepend(mura.templates.meta(context));
				} else {
					console.log('Missing Client Template for:');
					console.log(obj.data());
				}
			}
		}

		//obj.hide().show();

		if(mura.layoutmanager && mura.editing){
			if(obj.hasClass('mura-body-object') || obj.data('object')=='folder' || obj.data('object')=='gallery' || obj.data('object')=='calendar'){
				obj.children('.frontEndToolsModal').remove();
				obj.prepend(layoutmanagertoolbar);
				muraInlineEditor.setAnchorSaveChecks(obj.node);

				obj
				.addClass('mura-active')
				.hover(
					function(e){
						//e.stopPropagation();
						mura('.mura-active-target').removeClass('mura-active-target');
						mura(this).addClass('mura-active-target');
					},
					function(e){
						//e.stopPropagation();
						mura(this).removeClass('mura-active-target');
					}
				);
			} else {
				if(mura.type == 'Variation'){
					var objectData=obj.data();
					if(root.muraInlineEditor && (root.muraInlineEditor.objectHasConfigurator(objectData) || root.muraInlineEditor.objectHasEditor(objectData))){
						obj.children('.frontEndToolsModal').remove();
						obj.prepend(layoutmanagertoolbar);
						muraInlineEditor.setAnchorSaveChecks(obj.node);

						obj
							.addClass('mura-active')
							.hover(
								function(e){
									//e.stopPropagation();
									mura('.mura-active-target').removeClass('mura-active-target');
									mura(this).addClass('mura-active-target');
								},
								function(e){
									//e.stopPropagation();
									mura(this).removeClass('mura-active-target');
								}
							);

						mura.initDraggableObject(self);
					}
				} else {
					var region=mura(self).closest(".mura-region-local");
					if(region && region.length ){
						if(region.data('perm')){
							var objectData=obj.data();

							if(root.muraInlineEditor && (root.muraInlineEditor.objectHasConfigurator(objectData) || root.muraInlineEditor.objectHasEditor(objectData))){
								obj.children('.frontEndToolsModal').remove();
								obj.prepend(layoutmanagertoolbar);
								muraInlineEditor.setAnchorSaveChecks(obj.node);

								obj
									.addClass('mura-active')
									.hover(
										function(e){
											//e.stopPropagation();
											mura('.mura-active-target').removeClass('mura-active-target');
											mura(this).addClass('mura-active-target');
										},
										function(e){
											//e.stopPropagation();
											mura(this).removeClass('mura-active-target');
										}
									);

								mura.initDraggableObject(self);
							}
						}
					}
				}
			}
		}

		obj.hide().show();

		processMarkup(obj.node);

		obj.find('a[href="javascript:history.back();"]').each(function(){
			mura(this).off("click").on("click",function(e){
				if(self.prevInnerHTML){
					e.preventDefault();
					wireUpObject(obj,self.prevInnerHTML);

					if(self.prevData){
				 		for(var p in self.prevData){
				 			select('[name="' + p + '"]').val(self.prevData[p]);
				 		}
				 	}
					self.prevInnerHTML=false;
					self.prevData=false;
				}
			});
		});

		each(self.getElementsByTagName('FORM'),function(el,i){
			if(!el.onsubmit){
				el.onsubmit=function(){return validateFormAjax(this);};
			}
		});

		if(obj.data('nextnid')){
			obj.find('.mura-next-n a').each(function(){
				mura(this).on('click',function(e){
					e.preventDefault();
					var a=this.getAttribute('href').split('?');
					if(a.length==2){
						root.location.hash=a[1];
					}

				});
			})
		}

		obj.trigger('asyncObjectRendered');

	}

	function handleResponse(obj,resp){

		obj=(obj.node) ? obj : mura(obj);

		if(typeof resp.data.redirect != 'undefined'){
			if(resp.data.redirect && resp.data.redirect != location.href){
				location.href=resp.data.redirect;
			} else {
				location.reload(true);
			}
		} else if(resp.data.apiEndpoint){
			ajax({
		        type:"POST",
		        xhrFields:{ withCredentials: true },
		        crossDomain:true,
		        url:resp.data.apiEndpoint,
		        data:resp.data,
		        success:function(data){
		        	if(typeof data=='string'){
		        		wireUpObject(obj,data);
		        	} else if (typeof data=='object' && 'html' in data) {
		        		wireUpObject(obj,data.html);
		        	} else if (typeof data=='object' && 'data' in data && 'html' in data.data) {
		        		wireUpObject(obj,data.data.html);
		        	} else {
		        		wireUpObject(obj,data.data);
		        	}
		        }
	   		});
		} else {
			wireUpObject(obj,resp.data);
		}
	}

	function processObject(el,queue){

		var obj=(el.node) ? el : mura(el);
		el =el.node || el;
		var self=el;

		queue=(queue==null) ? false : queue;


		if(document.createEvent && queue && !isScrolledIntoView(el)){
			setTimeout(function(){processObject(el,true)},10);
			return;
		}


		return new Promise(function(resolve,reject) {

			if(!self.getAttribute('data-instanceid')){
				self.setAttribute('data-instanceid',createUUID());
			}

			if(obj.data('async')){
				obj.addClass("mura-async-object");
			}

			if(obj.data('object')=='container'){

				obj.html(mura.templates.content(obj.data()));

				obj.find('.mura-object').each(function(){
					this.setAttribute('data-instanceid',createUUID());
				});

			}

			var data=deepExtend(setLowerCaseKeys(getData(self)),urlparams,{siteid:root.mura.siteid,contentid:root.mura.contentid,contenthistid:root.mura.contenthistid});

			delete data.inited;

			if(obj.data('contentid')){
				data.contentid=self.getAttribute('data-contentid');
			}

			if(obj.data('contenthistid')){
				data.contenthistid=self.getAttribute('data-contenthistid');
			}

			if('objectparams' in data){
				data['objectparams']= encodeURIComponent(JSON.stringify(data['objectparams']));
			}

			delete data.params;

			if(obj.data('object')=='container'){
				wireUpObject(obj);
				if(typeof resolve == 'function'){
					resolve(obj);
				}
			} else {
				if(!obj.data('async') && obj.data('render')=='client'){
					wireUpObject(obj);
					if(typeof resolve == 'function'){
						resolve(obj);
					}
				} else {
					//console.log(data);
					self.innerHTML=root.mura.preloaderMarkup;
					ajax({
						url:root.mura.apiEndpoint + '?method=processAsyncObject',
						type:'get',
						data:data,
						success:function(resp){
							handleResponse(obj,resp);
							if(typeof resolve == 'function'){
								resolve(obj);
							}
						}
					});
				}

			}
		});

	}

	var hashparams={};
	var urlparams={};

	function handleHashChange(){

		var hash=root.location.hash;

		if(hash){
			hash=hash.substring(1);
		}

		if(hash){
			hashparams=getQueryStringParams(hash);
			if(hashparams.nextnid){
				mura('.mura-async-object[data-nextnid="' + hashparams.nextnid +'"]').each(function(){
					mura(this).data(hashparams);
					processAsyncObject(this);
				});
			} else if(hashparams.objectid){
				mura('.mura-async-object[data-objectid="' + hashparams.objectid +'"]').each(function(){
					mura(this).data(hashparams);
					processAsyncObject(this);
				});
			}
		}
	}

	function trim(str) {
	    return str.replace(/^\s+|\s+$/gm,'');
	}


	function extendClass (baseClass,subClass){
		var muraObject=function(){
			this.init.apply(this,arguments);
		}

		muraObject.prototype = Object.create(baseClass.prototype);
		muraObject.prototype.constructor = muraObject;

		root.mura.extend(muraObject.prototype,subClass);

		return muraObject;
	}

	function getQueryStringParams(queryString) {
	    var params = {};
	    var e,
	        a = /\+/g,  // Regex for replacing addition symbol with a space
	        r = /([^&;=]+)=?([^&;]*)/g,
	        d = function (s) { return decodeURIComponent(s.replace(a, " ")); };

	        if(queryString.substring(0,1)=='?'){
	        	var q=queryString.substring(1);
	        } else {
	        	var q=queryString;
	        }


	    while (e = r.exec(q))
	       params[d(e[1]).toLowerCase()] = d(e[2]);

	    return params;
	}

	function getHREFParams(href) {
	    var a=href.split('?');

	    if(a.length==2){
	    	return getQueryStringParams(a[1]);
	    } else {
	    	return {};
	    }
	}

	function inArray(elem, array, i) {
	    var len;
	    if ( array ) {
	        if ( array.indexOf ) {
	            return array.indexOf.call( array, elem, i );
	        }
	        len = array.length;
	        i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;
	        for ( ; i < len; i++ ) {
	            // Skip accessing in sparse arrays
	            if ( i in array && array[ i ] === elem ) {
	                return i;
	            }
	        }
	    }
	    return -1;
	}

	function getURLParams() {
		return getQueryStringParams(root.location.search);
	}

	//http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	function hashCode(s){
		var hash = 0, strlen = s.length, i, c;

		if ( strlen === 0 ) {
			return hash;
		}
		for ( i = 0; i < strlen; i++ ) {
			c = s.charCodeAt( i );
			hash = ((hash<<5)-hash)+c;
			hash = hash & hash; // Convert to 32bit integer
		}
		return (hash >>> 0);
	}

	function init(config){
		if(!config.context){
			config.context='';
		}

		if(!config.assetpath){
			config.assetpath=config.context + "/" + config.siteid;
		}

		if(!config.apiEndpoint){
			config.apiEndpoint=config.context + '/index.cfm/_api/json/v1/' + config.siteid + '/';
		}

		if(!config.pluginspath){
			config.pluginspath=config.context + '/plugins';
		}

		if(!config.requirementspath){
			config.requirementspath=config.context + '/requirements';
		}

		if(!config.jslib){
			config.jslib='jquery';
		}

		if(!config.perm){
			config.perm='none';
		}

		if(typeof config.layoutmanager == 'undefined'){
			config.layoutmanager=false;
		}

		if(typeof config.mobileformat == 'undefined'){
			config.mobileformat=false;
		}

		if(typeof config.rootdocumentdomain != 'undefined' && config.rootdocumentdomain != ''){
			root.document.domain=config.rootdocumentdomain;
		}

		mura.editing;

		extend(root.mura,config);

		mura(function(){

			var hash=root.location.hash;

			if(hash){
				hash=hash.substring(1);
			}

			hashparams=setLowerCaseKeys(getQueryStringParams(hash));
			urlparams=setLowerCaseKeys(getQueryStringParams(root.location.search));

			if(hashparams.nextnid){
				mura('.mura-async-object[data-nextnid="' + hashparams.nextnid +'"]').each(function(){
					mura(this).data(hashparams);
				});
			} else if(hashparams.objectid){
				mura('.mura-async-object[data-nextnid="' + hashparams.objectid +'"]').each(function(){
					mura(this).data(hashparams);
				});
			}

			mura(root).on('hashchange',handleHashChange);

			processMarkup(document);

			mura(document)
			.on("keydown", function(event){
				loginCheck(event.which);
			});

			/*
			mura.addEventHandler(
				{
					asyncObjectRendered:function(event){
						alert(this.innerHTML);
					}
				}
			);

			mura('#my-id').addDisplayObject('objectname',{..});

			mura.login('userame','password')
				.then(function(data){
					alert(data.success);
				});

			mura.logout())
				.then(function(data){
					alert('you have logged out!');
				});

			mura.renderFilename('')
				.then(function(item){
					alert(item.get('title'));
				});

			mura.getEntity('content').loadBy('contentid','00000000000000000000000000000000001')
				.then(function(item){
					alert(item.get('title'));
				});

			mura.getEntity('content').loadBy('contentid','00000000000000000000000000000000001')
				.then(function(item){
					item.get('kids').then(function(kids){
						alert(kids.get('items').length);
					});
				});

			mura.getEntity('content').loadBy('contentid','1C2AD93E-E39C-C758-A005942E1399F4D6')
				.then(function(item){
					item.get('parent').then(function(parent){
						alert(parent.get('title'));
					});
				});

			mura.getEntity('content').
				.set('parentid''1C2AD93E-E39C-C758-A005942E1399F4D6')
				.set('approved',1)
				.set('title','test 5')
				.save()
				.then(function(item){
					alert(item.get('title'));
				});

			mura.getEntity('content').
				.set(
					{
						parentid:'1C2AD93E-E39C-C758-A005942E1399F4D6',
						approved:1,
						title:'test 5'
					}
				.save()
				.then(
					function(item){
						alert(item.get('title'));
					});

			mura.findQuery({
					entityname:'content',
					title:'Home'
				})
				.then(function(collection){
					alert(collection.item(0).get('title'));
				});
			*/

			mura(document).trigger('muraReady');

		});

	    return root.mura
	}

	extend(root,{
		mura:extend(
			function(selector){
				if(typeof selector == 'function'){
					mura.ready(selector);
					return this;
				} else {
					return select(selector);
				}
			},
			{
			rb:{},
			generateOAuthToken:generateOauthToken,
			entities:{},
			submitForm:submitForm,
			escapeHTML:escapeHTML,
			unescapeHTML:unescapeHTML,
			processObject:processObject,
			processAsyncObject:processAsyncObject,
			resetAsyncObject:resetAsyncObject,
			setLowerCaseKeys:setLowerCaseKeys,
			noSpam:noSpam,
			addLoadEvent:addLoadEvent,
			loader:loader,
			addEventHandler:addEventHandler,
			trigger:trigger,
			ready:ready,
			on:on,
			off:off,
			extend:extend,
			inArray:inArray,
			isNumeric:isNumeric,
			post:post,
			get:get,
			deepExtend:deepExtend,
			ajax:ajax,
			changeElementType:changeElementType,
			each:each,
			parseHTML:parseHTML,
			getData:getData,
			getProps:getProps,
			isEmptyObject:isEmptyObject,
			evalScripts:evalScripts,
			validateForm:validateForm,
			escape:$escape,
			unescape:$unescape,
			getBean:getEntity,
			getEntity:getEntity,
			renderFilename:renderFilename,
			findQuery:findQuery,
			getFeed:getFeed,
			login:login,
			logout:logout,
			extendClass:extendClass,
			init:init,
			formToObject:formToObject,
			createUUID:createUUID,
			processMarkup:processMarkup,
			layoutmanagertoolbar:layoutmanagertoolbar,
			parseString:parseString,
			createCookie:createCookie,
			readCookie:readCookie,
			trim:trim,
			hashCode:hashCode
			}
		),
		//these are here for legacy support
		validateForm:validateForm,
		setHTMLEditor:setHTMLEditor,
		createCookie:createCookie,
		readCookie:readCookie,
		addLoadEvent:addLoadEvent,
		noSpam:noSpam,
		initMura:init
	});

	root.m=root.m || root.mura;

	//for some reason this can't be added via extend
	root.validateForm=validateForm;


})(this);
;//https://github.com/malko/l.js
;(function(root){
/*
* script for js/css parallel loading with dependancies management
* @author Jonathan Gotti < jgotti at jgotti dot net >
* @licence dual licence mit / gpl
* @since 2012-04-12
* @todo add prefetching using text/cache for js files
* @changelog
*            - 2014-06-26 - bugfix in css loaded check when hashbang is used
*            - 2014-05-25 - fallback support rewrite + null id bug correction + minification work
*            - 2014-05-21 - add cdn fallback support with hashbang url
*            - 2014-05-22 - add support for relative paths for stylesheets in checkLoaded
*            - 2014-05-21 - add support for relative paths for scripts in checkLoaded
*            - 2013-01-25 - add parrallel loading inside single load call
*            - 2012-06-29 - some minifier optimisations
*            - 2012-04-20 - now sharp part of url will be used as tag id
*                         - add options for checking already loaded scripts at load time
*            - 2012-04-19 - add addAliases method
* @note coding style is implied by the target usage of this script not my habbits
*/
	/** gEval credits goes to my javascript idol John Resig, this is a simplified jQuery.globalEval */
	var gEval = function(js){ ( root.execScript || function(js){ root[ "eval" ].call(root,js);} )(js); }
		, isA =  function(a,b){ return a instanceof (b || Array);}
		//-- some minifier optimisation
		, D = document
		, getElementsByTagName = 'getElementsByTagName'
		, length = 'length'
		, readyState = 'readyState'
		, onreadystatechange = 'onreadystatechange'
		//-- get the current script tag for further evaluation of it's eventual content
		, scripts = D[getElementsByTagName]("script")
		, scriptTag = scripts[scripts[length]-1]
		, script  = scriptTag.innerHTML.replace(/^\s+|\s+$/g,'')
	;
	//avoid multiple inclusion to override current loader but allow tag content evaluation

	if( ! root.mura.ljs ){
		var checkLoaded = scriptTag.src.match(/checkLoaded/)?1:0
			//-- keep trace of header as we will make multiple access to it
			,header  = D[getElementsByTagName]("head")[0] || D.documentElement
			, urlParse = function(url){
				var parts={}; // u => url, i => id, f = fallback
				parts.u = url.replace(/#(=)?([^#]*)?/g,function(m,a,b){ parts[a?'f':'i'] = b; return '';});
				return parts;
			}
			,appendElmt = function(type,attrs,cb){
				var e = D.createElement(type), i;
				if( cb ){ //-- this is not intended to be used for link
					if(e[readyState]){
						e[onreadystatechange] = function(){
							if (e[readyState] === "loaded" || e[readyState] === "complete"){
								e[onreadystatechange] = null;
								cb();
							}
						};
					}else{
						e.onload = cb;
					}
				}
				for( i in attrs ){ attrs[i] && (e[i]=attrs[i]); }
				header.appendChild(e);
				// return e; // unused at this time so drop it
			}
			,load = function(url,cb){
				if( this.aliases && this.aliases[url] ){
					var args = this.aliases[url].slice(0);
					isA(args) || (args=[args]);
					cb && args.push(cb);
					return this.load.apply(this,args);
				}
				if( isA(url) ){ // parallelized request
					for( var l=url[length]; l--;){
						this.load(url[l]);
					}
					cb && url.push(cb); // relaunch the dependancie queue
					return this.load.apply(this,url);
				}
				if( url.match(/\.css\b/) ){
					return this.loadcss(url,cb);
				}
				return this.loadjs(url,cb);
			}
			,loaded = {}  // will handle already loaded urls
			,loader  = {
				aliases:{}
				,loadjs: function(url,attrs,cb){
					if(typeof url == 'object'){
						if(Array.isArray(url)){
							return loader.load.apply(this, arguments);
						} else if(typeof attrs === 'function'){
							cb=attrs;
							attrs={};
							url=attrs.href
						} else if (typeof attrs=='string' || (typeof attrs=='object' && Array.isArray(attrs))) {
							return loader.load.apply(this, arguments);
						} else {
							attrs=url;
							url=attrs.href;
							cb=undefined;
						}
					} else if (typeof attrs=='function' ) {
						cb = attrs;
						attrs = {};
					} else if (typeof attrs=='string' || (typeof attrs=='object' && Array.isArray(attrs))) {
						return loader.load.apply(this, arguments);
					}
					if(typeof attrs==='undefined'){
						attrs={};
					}

					var parts = urlParse(url);
					var partToAttrs=[['i','id'],['f','fallback'],['u','src']];

					for(var i=0;i<partToAttrs.length;i++){
						var part=partToAttrs[i];
						if(!(part[1] in attrs) && (part[0] in parts)){
							attrs[part[1]]=parts[part[0]];
						}
					}

					if(typeof attrs.type === 'undefined'){
						attrs.type='text/javascript';
					}

					var finalAttrs={};

					for(var a in attrs){
						if(a != 'fallback'){
							finalAttrs[a]=attrs[a];
						}
					}

					finalAttrs.onerror=function(error){
						if( attrs.fallback ){
							var c = error.currentTarget;
							c.parentNode.removeChild(c);
							finalAttrs.src=attrs.fallback;
							appendElmt('script',attrs,cb);
						}
					};


					if( loaded[finalAttrs.src] === true ){ // already loaded exec cb if any
						cb && cb();
						return this;
					} else if( loaded[finalAttrs.src]!== undefined ){ // already asked for loading we append callback if any else return
						if( cb ){
							loaded[finalAttrs.src] = (function(ocb,cb){ return function(){ ocb && ocb(); cb && cb(); }; })(loaded[finalAttrs.src],cb);
						}
						return this;
					}
					// first time we ask this script
					loaded[finalAttrs.src] = (function(cb){ return function(){loaded[finalAttrs.src]=true; cb && cb();};})(cb);
					cb = function(){ loaded[url](); };
					appendElmt('script',finalAttrs,cb);
					return this;
				}
				,loadcss: function(url,attrs,cb){

					if(typeof url == 'object'){
						if(Array.isArray(url)){
							return loader.load.apply(this, arguments);
						} else if(typeof attrs === 'function'){
							cb=attrs;
							attrs=url;
							url=attrs.href
						} else if (typeof attrs=='string' || (typeof attrs=='object' && Array.isArray(attrs))) {
							return loader.load.apply(this, arguments);
						} else {
							attrs=url;
							url=attrs.href;
							cb=undefined;
						}
					} else if (typeof attrs=='function' ) {
						cb = attrs;
						attrs = {};
					} else if (typeof attrs=='string' || (typeof attrs=='object' && Array.isArray(attrs))) {
						return loader.load.apply(this, arguments);
					}

					var parts = urlParse(url);
					parts={type:'text/css',rel:'stylesheet',href:url,id:parts.i}

					if(typeof attrs !=='undefined'){
						for(var a in attrs){
							parts[a]=attrs[a];
						}
					}

					loaded[parts.href] || appendElmt('link',parts);
					loaded[parts.href] = true;
					cb && cb();
					return this;
				}
				,load: function(){
					var argv=arguments,argc = argv[length];
					if( argc === 1 && isA(argv[0],Function) ){
						argv[0]();
						return this;
					}
					load.call(this,argv[0], argc <= 1 ? undefined : function(){ loader.load.apply(loader,[].slice.call(argv,1));} );
					return this;
				}
				,addAliases:function(aliases){
					for(var i in aliases ){
						this.aliases[i]= isA(aliases[i]) ? aliases[i].slice(0) : aliases[i];
					}
					return this;
				}
			}
		;

		if( checkLoaded ){
			var i,l,links,url;
			for(i=0,l=scripts[length];i<l;i++){
				(url = scripts[i].getAttribute('src')) && (loaded[url.replace(/#.*$/,'')] = true);
			}
			links = D[getElementsByTagName]('link');
			for(i=0,l=links[length];i<l;i++){
				(links[i].rel==='stylesheet' || links[i].type==='text/css') && (loaded[links[i].getAttribute('href').replace(/#.*$/,'')]=true);
			}
		}
		//export ljs
		root.mura.ljs = loader;
		// eval inside tag code if any
	}
	script && gEval(script);
})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */
;(function(root){
	function Core(){
		this.init.apply(this,arguments);
		return this;
	}

	Core.prototype={
		init:function(){
		}
	};

	Core.extend=function(properties){
		var self=this;
		return root.mura.extend(root.mura.extendClass(self,properties),{extend:self.extend});
	};

	root.mura.Core=Core;

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){
	root.mura.Cache=root.mura.Core.extend({
		init:function(){
			this.cache={};
		},
        getKey:function(keyName){
            return root.mura.hashCode(keyName);
        },

        get:function(keyName,keyValue){
            var key=this.getKey(keyName);

			if(typeof this.core[key] != 'undefined'){
				return this.core[key].keyValue;
			} else if (typeof keyValue != 'undefined') {
				this.set(keyName,keyValue,key);
				return this.core[key].keyValue;
			} else {
				return;
			}
		},

		set:function(keyName,keyValue,key){
            key=key || this.getKey(keyName);
		    this.cache[key]={name:keyName,value:keyValue};
			return keyValue;
		},

		has:function(keyName){
			return typeof this.cache[getKey(keyName)] != 'undefined';
		},

		getAll:function(){
			return this.cache;
		},

        purgeAll:function(){
            this.cache={};
			return this;
		},

        purge:function(keyName){
            var key=this.getKey(keyName)
            if( typeof this.cache[key] != 'undefined')
            delete this.cache[key];
			return this;
		}

	});

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){
	root.mura.DOMSelection=root.mura.Core.extend({
		init:function(selection,origSelector){
			this.selection=selection;
			this.origSelector=origSelector;

			if(this.selection.length && this.selection[0]){
				this.parentNode=this.selection[0].parentNode;
				this.childNodes=this.selection[0].childNodes;
				this.node=selection[0];
				this.length=this.selection.length;
			} else {
				this.parentNode=null;
				this.childNodes=null;
				this.node=null;
				this.length=0;
			}
		},

		get:function(index){
			return this.selection[index];
		},

		ajax:function(data){
			return root.mura.ajax(data);
		},

		select:function(selector){
			return root.mura(selector);
		},

		each:function(fn){
			this.selection.forEach( function(el,idx,array){
				fn.call(el,el,idx,array);
			});
			return this;
		},

		filter:function(fn){
			return root.mura(this.selection.filter( function(el,idx,array){
				return fn.call(el,el,idx,array);
			}));
		},

		map:function(fn){
			return root.mura(this.selection.map( function(el,idx,array){
				return fn.call(el,el,idx,array);
			}));
		},

		isNumeric:function(val){
			return isNumeric(this.selection[0]);
		},

		on:function(eventName,selector,fn){
			if(typeof selector == 'function'){
				fn=selector;
				selector='';
			}

			if(eventName=='ready'){
				if(document.readyState != 'loading'){
					var self=this;

					setTimeout(
						function(){
							self.each(function(){
								if(selector){
									mura(this).find(selector).each(function(){
										fn.call(this);
									});
								} else {
									fn.call(this);
								}
							});
						},
						1
					);

					return this;

				} else {
					eventName='DOMContentLoaded';
				}
			}

			this.each(function(){
				if(typeof this.addEventListener == 'function'){
					var self=this;
					
					this.addEventListener(
						eventName,
						function(event){
							if(selector){
								mura(self).find(selector).each(function(){
									fn.call(this,event);
								});
							} else {
								fn.call(self,event);
							}

						},
						true
					);
				}
			});

			return this;
		},

		hover:function(handlerIn,handlerOut){
			this.on('mouseover',handlerIn);
			this.on('mouseout',handlerOut);
			this.on('touchstart',handlerIn);
			this.on('touchend',handlerOut);
			return this;
		},


		click:function(fn){
			this.on('click',fn);
			return this;
		},

		submit:function(fn){
			if(fn){
				this.on('submit',fn);
			} else {
				this.each(function(el){
					if(typeof el.submit == 'function'){
						root.mura.submitForm(el);
					}
				});
			}

			return this;
		},

		ready:function(fn){
			this.on('ready',fn);
			return this;
		},

		off:function(eventName,fn){
			this.each(function(el,idx,array){
				if(typeof eventName != 'undefined'){
					if(typeof fn != 'undefined'){
						el.removeEventListener(eventName,fn);
					} else {
						el[eventName]=null;
					}
				} else {
					var elClone = el.cloneNode(true);
					el.parentNode.replaceChild(elClone, el);
					array[idx]=elClone;

				}

			});
			return this;
		},

		unbind:function(eventName,fn){
			this.off(eventName,fn);
			return this;
		},

		bind:function(eventName,fn){
			this.on(eventName,fn);
			return this;
		},

		trigger:function(eventName,eventDetail){
			eventDetails=eventDetail || {};

			this.each(function(el){
				root.mura.trigger(el,eventName,eventDetail);
			});
			return this;
		},

		parent:function(){
			if(!this.selection.length){
				return this;
			}
			return root.mura(this.selection[0].parentNode);
		},

		children:function(selector){
			if(!this.selection.length){
				return this;
			}

			if(this.selection[0].hasChildNodes()){
				var children=root.mura(this.selection[0].childNodes);

				if(typeof selector == 'string'){
					var filterFn=function(){return (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) && this.matchesSelector(selector);};
				} else {
					var filterFn=function(){ return this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9;};
				}

				return children.filter(filterFn);
			} else {
				return root.mura([]);
			}

		},

		find:function(selector){
			if(this.selection.length){
				var removeId=false;

				if(this.selection[0].nodeType=='1' || this.selection[0].nodeType=='11'){
					var result=this.selection[0].querySelectorAll(selector);
				} else if(this.selection[0].nodeType=='9'){
					var result=root.document.querySelectorAll(selector);
				} else {
					var result=[];
				}
				return root.mura(result);
			} else {
				return root.mura([]);
			}
		},

		selector:function() {
			var pathes = [];
			var path, node = root.mura(this.selection[0]);

			while (node.length) {
				var realNode = node.get(0), name = realNode.localName;
				if (!name) { break; }

				if(!node.data('hastempid') && node.attr('id') && node.attr('id') != 'mura-variation-el'){
			   		name='#' + node.attr('id');
					path = name + (path ? ' > ' + path : '');
					break;
				} else {

				    name = name.toLowerCase();
				    var parent = node.parent();
				    var sameTagSiblings = parent.children(name);

				    if (sameTagSiblings.length > 1)
				    {
				        allSiblings = parent.children();
				        var index = allSiblings.index(realNode) +1;

				        if (index > 0) {
				            name += ':nth-child(' + index + ')';
				        }
				    }

				    path = name + (path ? ' > ' + path : '');
					node = parent;
				}

			}

			pathes.push(path);

		    return pathes.join(',');
		},

		siblings:function(selector){
			if(!this.selection.length){
				return this;
			}
			var el=this.selection[0];

			if(el.hasChildNodes()){
				var silbings=root.mura(this.selection[0].childNodes);

				if(typeof selector == 'string'){
					var filterFn=function(){return (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) && this.matchesSelector(selector);};
				} else {
					var filterFn=function(){return this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9;};
				}

				return silbings.filter(filterFn);
			} else {
				return root.mura([]);
			}
		},

		item:function(idx){
			return this.selection[idx];
		},

		index:function(el){
			return this.selection.indexOf(el);
		},

		closest:function(selector) {
			if(!this.selection.length){
				return null;
			}

		    var el = this.selection[0];

		    for( var parent = el ; parent !== null  && parent.matchesSelector && !parent.matchesSelector(selector) ; parent = el.parentElement ){ el = parent; };

		    if(parent){
		    	 return root.mura(parent)
		    } else {
		    	 return root.mura([]);
		    }

		},

		append:function(el) {
			this.each(function(){
				if(typeof el == 'string'){
					this.insertAdjacentHTML('beforeend', el);
				} else {
					this.appendChild(el);
				}
			});
			return this;
		},

		appendMuraObject:function(data) {
		    var el=createElement('div');
		    el.setAttribute('class','mura-async-object');

			for(var a in data){
				el.setAttribute('data-' + a,data[a]);
			}

			this.append(el);

			root.mura.processAsyncObject(this.node);

			return el;
		},

		prepend:function(el) {
			this.each(function(){
				if(typeof el == 'string'){
					this.insertAdjacentHTML('afterbegin', el);
				} else {
					this.insertBefore(el,this.firstChild);
				}
			});
			return this;
		},

		before:function(el) {
			this.each(function(){
				if(typeof el == 'string'){
					this.insertAdjacentHTML('beforebegin', el);
				} else {
					this.parent.insertBefore(el,this);
				}
			});
			return this;
		},

		after:function(el) {
			this.each(function(){
				if(typeof el == 'string'){
					this.insertAdjacentHTML('afterend', el);
				} else {
					this.parent.insertBefore(el,this.parent.firstChild);
				}
			});
			return this;
		},

		prependMuraObject:function(data) {
		    var el=createElement('div');
		    el.setAttribute('class','mura-async-object');

			for(var a in data){
				el.setAttribute('data-' + a,data[a]);
			}

			this.prepend(el);

			root.mura.processAsyncObject(el);

			return el;
		},

		hide:function(){
			this.each(function(el){
				el.style.display = 'none';
			});
			return this;
		},

		show:function(){
			this.each(function(el){
				el.style.display = '';
			});
			return this;
		},

		remove:function(){
			this.each(function(el){
				el.parentNode.removeChild(el);
			});
			return this;
		},

		addClass:function(className){
			this.each(function(el){
				if (el.classList){
				  el.classList.add(className);
				} else {
				  el.className += ' ' + className;
				}
			});
			return this;
		},

		hasClass:function(className){
			return this.is("." + className);
		},

		removeClass:function(className){
			this.each(function(el){
				if (el.classList){
				  el.classList.remove(className);
				} else if (el.className) {
				  el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
				}
			});
			return this;
		},

		toggleClass:function(className){
			this.each(function(el){
				if (el.classList) {
				  el.classList.toggle(className);
				} else {
				  var classes = el.className.split(' ');
				  var existingIndex = classes.indexOf(className);

				  if (existingIndex >= 0)
				    classes.splice(existingIndex, 1);
				  else
				    classes.push(className);

				  el.className = classes.join(' ');
				}
			});
			return this;
		},

		after:function(el){
			this.each(function(){
				if(type)
				this.insertAdjacentHTML('afterend', el);
			});
			return this;
		},

		before:function(el){
			this.each(function(){
				this.insertAdjacentHTML('beforebegin', el);
			});
			return this;
		},

		empty:function(){
			this.each(function(el){
				el.innerHTML = '';
			});
			return this;
		},

		evalScripts:function(){
			if(!this.selection.length){
				return this;
			}

			this.each(function(el){
				root.mura.evalScripts(el);
			});

			return this;

		},

		html:function(htmlString){
			if(typeof htmlString != 'undefined'){
				this.each(function(el){
					el.innerHTML=htmlString;
					root.mura.evalScripts(el);
				});
				return this;
			} else {
				if(!this.selection.length){
					return '';
				}
				return this.selection[0].innerHTML;
			}
		},

		css:function(ruleName,value){
			if(!this.selection.length){
				return this;
			}

			if(typeof ruleName == 'undefined' && typeof value == 'undefined'){
				try{
					return root.getComputedStyle(this.selection[0]);
				} catch(e){
					return {};
				}
			} else if (typeof ruleName == 'object'){
				this.each(function(el){
					try{
						for(var p in ruleName){
							el.style[p]=ruleName[p];
						}
					} catch(e){}
				});
			} else if(typeof value != 'undefined'){
				this.each(function(el){
					try{
						el.style[ruleName]=value;
					} catch(e){}
				});
				return this;
			} else{
				try{
					return root.getComputedStyle(this.selection[0])[ruleName];
				} catch(e){}
			}
		},

		text:function(textString){
			if(typeof textString == 'undefined'){
				this.each(function(el){
					el.textContent=textString;
				});
				return this;
			} else {
				return this.selection[0].textContent;
			}
		},

		is:function(selector){
			if(!this.selection.length){
				return false;
			}
			return this.selection[0].matchesSelector && this.selection[0].matchesSelector(selector);
		},

		offsetParent:function(){
			if(!this.selection.length){
				return this;
			}
			var el=this.selection[0];
			return el.offsetParent || el;
		},

		outerHeight:function(withMargin){
			if(!this.selection.length){
				return this;
			}
			if(typeof withMargin == 'undefined'){
				function outerHeight(el) {
				  var height = el.offsetHeight;
				  var style = root.getComputedStyle(el);

				  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
				  return height;
				}

				return outerHeight(this.selection[0]);
			} else {
				return this.selection[0].offsetHeight;
			}
		},

		height:function(height) {
		 	if(!this.selection.length){
				return this;
			}

			if(typeof width != 'undefined'){
				if(!isNaN(height)){
					height += 'px';
				}
				this.css('height',height);
				return this;
			}

			var el=this.selection[0];
			//var type=el.constructor.name.toLowerCase();

			if(el === root){
				return root.innerHeight
			} else if(el === document){
				var body = document.body;
		    	var html = document.documentElement;
				return  Math.max( body.scrollHeight, body.offsetHeight,
		                       html.clientHeight, html.scrollHeight, html.offsetHeight )
			}

			var styles = root.getComputedStyle(el);
			var margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);

			return Math.ceil(el.offsetHeight + margin);
		},

		width:function(width) {
		  	if(!this.selection.length){
				return this;
			}

			if(typeof width != 'undefined'){
				if(!isNaN(width)){
					width += 'px';
				}
				this.css('width',width);
				return this;
			}

			var el=this.selection[0];
			//var type=el.constructor.name.toLowerCase();

			if(el === root){
				return root.innerWidth
			} else if(el === document){
				var body = document.body;
		    	var html = document.documentElement;
				return  Math.max( body.scrollWidth, body.offsetWidth,
		                       html.clientWidth, html.scrolWidth, html.offsetWidth )
			}

		  	return root.getComputedStyle(el).width;
		},

		offset:function(){
			if(!this.selection.length){
				return this;
			}
			var el=this.selection[0];
			var rect = el.getBoundingClientRect()

			return {
			  top: rect.top + document.body.scrollTop,
			  left: rect.left + document.body.scrollLeft
			};
		},

		scrollTop:function() {
		  	return document.body.scrollTop;
		},

		offset:function(attributeName,value){
			if(!this.selection.length){
				return this;
			}
			var box = this.selection[0].getBoundingClientRect();
			return {
			  top: box.top  + ( root.pageYOffset || document.scrollTop )  - ( document.clientTop  || 0 ),
			  left: box.left + ( root.pageXOffset || document.scrollLeft ) - ( document.clientLeft || 0 )
			};
		},

		removeAttr:function(attributeName){
			if(!this.selection.length){
				return this;
			}

			this.each(function(el){
				if(el && typeof el.removeAttribute == 'function'){
					el.removeAttribute(attributeName);
				}

			});
			return this;

		},

		changeElementType:function(type){
			if(!this.selection.length){
				return this;
			}

			this.each(function(el){
				root.mura.changeElementType(el,type)

			});
			return this;

		},

        val:function(value){
			if(!this.selection.length){
				return this;
			}

			if(typeof value != 'undefined'){
				this.each(function(el){
					if(el.tagName=='radio'){
						if(el.value==value){
							el.checked=true;
						} else {
							el.checked=false;
						}
					} else {
						el.value=value;
					}

				});
				return this;

			} else {
				if(Object.prototype.hasOwnProperty.call(this.selection[0],'value') || typeof this.selection[0].value != 'undefined'){
					return this.selection[0].value;
				} else {
					return '';
				}
			}
		},

		attr:function(attributeName,value){
			if(!this.selection.length){
				return this;
			}

			if(typeof value == 'undefined' && typeof attributeName == 'undefined'){
				return root.mura.getAttributes(this.selection[0]);
			} else if (typeof attributeName == 'object'){
				this.each(function(el){
					if(el.setAttribute){
						for(var p in attributeName){
							el.setAttribute(p,attributeName[p]);
						}
					}
				});
				return this;
			} else if(typeof value != 'undefined'){
				this.each(function(el){
					if(el.setAttribute){
						el.setAttribute(attributeName,value);
					}
				});
				return this;

			} else {
				if(this.selection[0] && this.selection[0].getAttribute){
					return this.selection[0].getAttribute(attributeName);
				} else {
					return undefined;
				}

			}
		},

		data:function(attributeName,value){
			if(!this.selection.length){
				return this;
			}
			if(typeof value == 'undefined' && typeof attributeName == 'undefined'){
				return root.mura.getData(this.selection[0]);
			} else if (typeof attributeName == 'object'){
				this.each(function(el){
					for(var p in attributeName){
						el.setAttribute("data-" + p,attributeName[p]);
					}
				});
				return this;

			} else if(typeof value != 'undefined'){
				this.each(function(el){
					el.setAttribute("data-" + attributeName,value);
				});
				return this;
			} else if (this.selection[0] && this.selection[0].getAttribute) {
				return root.mura.parseString(this.selection[0].getAttribute("data-" + attributeName));
			} else {
				return undefined;
			}
		},

		prop:function(attributeName,value){
			if(!this.selection.length){
				return this;
			}
			if(typeof value == 'undefined' && typeof attributeName == 'undefined'){
				return root.mura.getProps(this.selection[0]);
			} else if (typeof attributeName == 'object'){
				this.each(function(el){
					for(var p in attributeName){
						el.setAttribute(p,attributeName[p]);
					}
				});
				return this;

			} else if(typeof value != 'undefined'){
				this.each(function(el){
					el.setAttribute(attributeName,value);
				});
				return this;
			} else {
				return root.mura.parseString(this.selection[0].getAttribute(attributeName));
			}
		},

		fadeOut:function(){
		  	this.each(function(el){
			  el.style.opacity = 1;

			  (function fade() {
			    if ((el.style.opacity -= .1) < 0) {
			      el.style.display = "none";
			    } else {
			      requestAnimationFrame(fade);
			    }
			  })();
			});

			return this;
		},

		fadeIn:function(display){
		  this.each(function(el){
			  el.style.opacity = 0;
			  el.style.display = display || "block";

			  (function fade() {
			    var val = parseFloat(el.style.opacity);
			    if (!((val += .1) > 1)) {
			      el.style.opacity = val;
			      requestAnimationFrame(fade);
			    }
			  })();
		  });

		  return this;
		},

		toggle:function(){
		 	this.each(function(el){
				 if(typeof el.style.display == 'undefined' || el.style.display==''){
				 	el.style.display='none';
				 } else {
				 	el.style.display='';
				 }
		  	});
		  	return this;
		}
	});

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){
	root.mura.Entity=root.mura.Core.extend({
		init:function(properties){
			properties=properties || {};
			properties.entityname = properties.entityname || 'content';
			properties.siteid = properties.siteid || root.mura.siteid;
			this.set(properties);

			if(typeof this.properties.isnew == 'undefined'){
				this.properties.isnew=1;
			}

			if(this.properties.isnew){
				this.set('isdirty',true);
			} else {
				this.set('isdirty',false);
			}

			if(typeof this.properties.isdeleted == 'undefined'){
				this.properties.isdeleted=false;
			}

			this.cachePut();
		},

		get:function(propertyName,defaultValue){
			if(typeof this.properties.links != 'undefined'
				&& typeof this.properties.links[propertyName] != 'undefined'){
				var self=this;

				if(typeof this.properties[propertyName] != 'undefined'){

					return new Promise(function(resolve,reject) {
						if('items' in self.properties[propertyName]){
							var returnObj = new root.mura.EntityCollection(self.properties[propertyName]);
						} else {
							if(root.mura.entities[self.properties[propertyName].entityname]){
								var returnObj = new root.mura.entities[self.properties[propertyName].entityname](obj.properties[propertyName]);
							} else {
								var returnObj = new root.mura.Entity(self.properties[propertyName]);
							}
						}

						if(typeof resolve == 'function'){
							resolve(returnObj);
						}
					});

				} else {
					if(typeof defaultValue == 'object'){
						var params=defaultValue;
					} else {
						var params={};
					}
					return new Promise(function(resolve,reject) {

						root.mura.ajax({
							type:'get',
							url:self.properties.links[propertyName],
							params:params,
							success:function(resp){

								if('items' in resp.data){
									var returnObj = new root.mura.EntityCollection(resp.data);
								} else {
									if(root.mura.entities[obj.entityname]){
										var returnObj = new root.mura.entities[obj.entityname](obj);
									} else {
										var returnObj = new root.mura.Entity(resp.data);
									}
								}

								//Dont cache it there are custom params
								if(mura.isEmptyObject(params)){
									self.set(propertyName,resp.data);
								}

								if(typeof resolve == 'function'){
									resolve(returnObj);
								}
							},
							error:reject
						});
					});
				}

			} else if(typeof this.properties[propertyName] != 'undefined'){
				return this.properties[propertyName];
			} else if (typeof defaultValue != 'undefined') {
				this.properties[propertyName]=defaultValue;
				return this.properties[propertyName];

			} else {
				return '';
			}
		},

		set:function(propertyName,propertyValue){

			if(typeof propertyName == 'object'){
				this.properties=root.mura.deepExtend(this.properties,propertyName);
				this.set('isdirty',true);
			} else if(typeof this.properties[propertyName] == 'undefined' || this.properties[propertyName] != propertyValue){
				this.properties[propertyName]=propertyValue;
				this.set('isdirty',true);
			}

			return this;

		},

		has:function(propertyName){
			return typeof this.properties[propertyName] != 'undefined' || (typeof this.properties.links != 'undefined' && typeof this.properties.links[propertyName] != 'undefined');
		},

		getAll:function(){
			return this.properties;
		},

		load:function(){
			return this.loadBy('id',this.get('id'));
		},

		'new':function(params){

			return new Promise(function(resolve,reject){
				params=root.mura.extend(
					{
						entityname:self.get('entityname'),
						method:'findQuery',
						siteid:self.get('siteid')
					},
					params
				);

				root.mura.findNew(params).then(function(collection){

					if(collection.get('items').length){
						self.set(collection.get('items')[0].getAll());
					}
					if(typeof resolve == 'function'){
						resolve(self);
					}
				});
			});
		},

		loadBy:function(propertyName,propertyValue,params){

			propertyName=propertyName || 'id';
			propertyValue=propertyValue || this.get(propertyName);

			var self=this;

			if(propertyName =='id'){
				var cachedValue = root.mura.datacache.get(propertyValue);

				if(cachedValue){
					this.set(cachedValue);
					return new Promise(function(resolve,reject){
						resolve(self);
					});
				}
			}

			return new Promise(function(resolve,reject){
				params=root.mura.extend(
					{
						entityname:self.get('entityname'),
						method:'findQuery',
						siteid:self.get('siteid')
					},
					params
				);

				params[propertyName]=propertyValue;

				root.mura.findQuery(params).then(function(collection){

					if(collection.get('items').length){
						self.set(collection.get('items')[0].getAll());
					}
					if(typeof resolve == 'function'){
						resolve(self);
					}
				});
			});
		},

		validate:function(fields){
			fields=fields || '';

			var self=this;
			var data=mura.deepExtend({},self.getAll());

			data.fields=fields;

			return new Promise(function(resolve,reject) {

				root.mura.ajax({
					type: 'post',
					url: root.mura.apiEndpoint + '?method=validate',
					data: {
							data: root.mura.escape(data),
							validations: '{}',
							version: 4
						},
					success:function(resp){
						if(resp.data != 'undefined'){
								self.set('errors',resp.data)
						} else {
							self.set('errors',resp.error);
						}

						if(typeof resolve == 'function'){
							resolve(self);
						}
					}
				});
			});

		},
		hasErrors:function(){
			var errors=this.get('errors',{});
			return (typeof errors=='string' && errors !='') || (typeof errors=='object' && !root.mura.isEmptyObject(errors));
		},
		getErrors:function(){
			return this.get('errors',{});
		},
		save:function(){
			var self=this;

			if(!this.get('isdirty')){
				return new Promise(function(resolve,reject) {
					if(typeof resolve == 'function'){
						resolve(self);
					}
				});
			}

			if(!this.get('id')){
				return new Promise(function(resolve,reject) {
					var temp=root.mura.deepExtend({},self.getAll());

					root.mura.ajax({
						type:'get',
						url:root.mura.apiEndpoint + self.get('entityname') + '/new' ,
						success:function(resp){
							self.set(resp.data);
							self.set(temp);
							self.set('id',resp.data.id);
							self.set('isdirty',true);
							self.cachePut();
							self.save().then(resolve,reject);
						}
					});
				});

			} else {
				return new Promise(function(resolve,reject) {

					var context=self.get('id');

					root.mura.ajax({
						type:'post',
						url:root.mura.apiEndpoint + '?method=generateCSRFTokens',
						data:{
							siteid:self.get('siteid'),
							context:context
						},
						success:function(resp){
							root.mura.ajax({
									type:'post',
									url:root.mura.apiEndpoint + '?method=save',
									data:root.mura.extend(self.getAll(),{'csrf_token':resp.data.csrf_token,'csrf_token_expires':resp.data.csrf_token_expires}),
									success:function(resp){
										if(resp.data != 'undefined'){
											self.set(resp.data)
											self.set('isdirty',false);
											if(self.get('saveErrors') || root.mura.isEmptyObject(self.getErrors())){
												if(typeof resolve == 'function'){
													resolve(self);
												}
											} else {
												if(typeof reject == 'function'){
													reject(self);
												}
											}

										} else {
											self.set('errors',resp.error);
											if(typeof reject == 'function'){
												reject(self);
											}
										}
									}
							});
						}
					});

				});

			}

		},

		'delete':function(){

			var self=this;

			return new Promise(function(resolve,reject) {
				root.mura.ajax({
					type:'get',
					url:root.mura.apiEndpoint + '?method=generateCSRFTokens',
					data:{
						siteid:self.get('siteid'),
						context:self.get('id')
					},
					success:function(resp){
						root.mura.ajax({
							type:'post',
							url:root.mura.apiEndpoint + '?method=delete',
							data:{
								siteid:self.get('siteid'),
								id:self.get('id'),
								entityname:self.get('entityname'),
								'csrf_token':resp.data.csrf_token,
								'csrf_token_expires':resp.data.csrf_token_expires
							},
							success:function(){
								self.set('isdeleted',true);
								self.cachePurge();
								if(typeof resolve == 'function'){
									resolve(self);
								}
							}
						});
					}
				});
			});

		},

		getFeed:function(){
			var siteid=get('siteid') || mura.siteid;
			return new root.mura.Feed(this.get('entityName'));
		},

		cachePurge:function(){
			root.mura.datacache.purge(this.get('id'));
			return this;
		},

		cachePut:function(){
			if(!this.get('isnew')){
				root.mura.datacache.set(this.get('id'),this);
			}
			return this;
		}

	});

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){
	root.mura.EntityCollection=root.mura.Entity.extend({
		init:function(properties){
			properties=properties || {};
			this.set(properties);

			var self=this;

			if(Array.isArray(self.get('items'))){
				self.set('items',self.get('items').map(function(obj){
					if(root.mura.entities[obj.entityname]){
						return new root.mura.entities[obj.entityname](obj);
					} else {
						return new root.mura.Entity(obj);
					}
				}));
			}

			return this;
		},

		item:function(idx){
			return this.properties.items[idx];
		},

		index:function(item){
			return this.properties.items.indexOf(item);
		},

		getAll:function(){
			var self=this;

			return mura.extend(
				{},
				self.properties,
				{
					items:self.map(function(obj){
						return obj.getAll();
					})
				}
			);

		},

		each:function(fn){
			this.properties.items.forEach( function(item,idx){
				fn.call(item,item,idx);
			});
			return this;
		},

		sort:function(fn){
			this.properties.items.sort(fn);
		},

		filter:function(fn){
			var collection=new root.mura.EntityCollection(this.properties);
			return collection.set('items',collection.get('items').filter( function(item,idx){
				return fn.call(item,item,idx);
			}));
		},

		map:function(fn){
			var collection=new root.mura.EntityCollection(this.properties);
			return collection.set('items',collection.get('items').map( function(item,idx){
				return fn.call(item,item,idx);
			}));
		}
	});
})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){
	root.mura.Feed=root.mura.Core.extend({
		init:function(siteid,entityname){
            this.queryString= entityname + '/?';
			this.propIndex=0;
			this.entityname=entityname;
            return this;
		},
		fields:function(fields){
            this.queryString+='&fields=' + encodeURIComponent(fields);
            return this;
        },
        where:function(property){
            if(property){
                return this.andProp(property);
            }
            return this;
        },
        prop:function(property){
            return this.andProp(property);
        },
        andProp:function(property){
            this.queryString+='&' + encodeURIComponent(property) + '[' + this.propIndex + ']=';
			this.propIndex++;
            return this;
        },
        orProp:function(property){
            this.queryString+='&or[' + this.propIndex + ']&';
			this.propIndex++;
			this.queryString+= encodeURIComponent(property) + '[' + this.propIndex + ']=';
			this.propIndex++;
			return this;
        },
        isEQ:function(criteria){
            this.queryString+=encodeURIComponent(criteria);
			return this;
        },
        isNEQ:function(criteria){
            this.queryString+='neq^' + encodeURIComponent(criteria);
			return this;
        },
        isLT:function(criteria){
            this.queryString+='lt^' + encodeURIComponent(criteria);
			return this;
        },
        isLTE:function(criteria){
            this.queryString+='lte^' + encodeURIComponent(criteria);
			return this;
        },
        isGT:function(criteria){
            this.queryString+='gt^' + encodeURIComponent(criteria);
			return this;
        },
        isGTE:function(criteria){
            this.queryString+='gte^' + encodeURIComponent(criteria);
			return this;
        },
        isIn:function(criteria){
            this.queryString+='in^' + encodeURIComponent(criteria);
			return this;
        },
        isNotIn:function(criteria){
            this.queryString+='notin^' + encodeURIComponent(criteria);
			return this;
        },
        contains:function(criteria){
            this.queryString+='contains^' + encodeURIComponent(criteria);
			return this;
        },
		beginsWith:function(criteria){
            this.queryString+='begins^' + encodeURIComponent(criteria);
			return this;
        },
		endsWith:function(criteria){
            this.queryString+='ends^' + encodeURIComponent(criteria);
			return this;
        },
        openGrouping:function(criteria){
            this.queryString+='&openGrouping';
			return this;
        },
        andOpenGrouping:function(criteria){
            this.queryString+='&andOpenGrouping';
			return this;
        },
        closeGrouping:function(criteria){
            this.queryString+='&closeGrouping:';
			return this;
        },
		sort:function(property,direction){
			direction=direction || 'asc';
			if(direction == 'desc'){
				this.queryString+='&sort[' + this.propIndex + ']=-' + encodeURIComponent(property);
			} else {
				this.queryString+='&sort[' + this.propIndex + ']=+' + encodeURIComponent(property);
			}
			this.propIndex++;
            return this;
        },
		itemsPerPage:function(itemsPerPage){
            this.queryString+='&itemsPerPage=' + encodeURIComponent(itemsPerPage);
			return this;
        },
		maxItems:function(maxItems){
            this.queryString+='&maxItems=' + encodeURIComponent(maxItems);
			return this;
        },
		innerJoin:function(relatedEntity){
            this.queryString+='&innerJoin[' + this.propIndex + ']=' + encodeURIComponent(relatedEntity);
			this.propIndex++;
            return this;
        },
		leftJoin:function(relatedEntity){
            this.queryString+='&leftJoin[' + this.propIndex + ']=' + encodeURIComponent(relatedEntity);
			this.propIndex++;
            return this;
        },
        getQuery:function(){
            var self=this;

            return new Promise(function(resolve,reject) {
				root.mura.ajax({
					type:'get',
					url:root.mura.apiEndpoint + self.queryString,
					success:function(resp){

						var returnObj = new root.mura.EntityCollection(resp.data);

						if(typeof resolve == 'function'){
							resolve(returnObj);
						}
					},
					error:reject
				});
			});
        }
    });

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */
(function(root){
	root.mura.render={};
	root.mura.render['form']=function(context) {
		new root.mura.FormUI( context ).render();
	}
})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */
(function(root){
root.mura.templates=root.mura.templates || {};
root.mura.templates['meta']=function(context){

	if(context.label){
		return '<div class="mura-object-meta"><h3>' + mura.escapeHTML(context.label) + '</h3></div>';
	} else {
	    return '';
	}
}
root.mura.templates['content']=function(context){
	context.html=context.html || context.content || context.source || '';

  	return '<div class="mura-object-content">' + context.html + '</div>';
}
root.mura.templates['text']=function(context){
	context=context || {};
	context.source=context.source || '<p>This object has not been configured.</p>';
 	return context.source;
}
root.mura.templates['embed']=function(context){
	context=context || {};
	context.source=context.source || '<p>This object has not been configured.</p>';
 	return context.source;
}
})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){

	root.mura.UI=root.mura.Core.extend({

		context:{},

		render:function(){
			mura(this.context.targetEl).html(mura.templates[context.object](this.context));
			return this;
		},

		init:function(){
			if(arguments.length){
				this.context=arguments[0];
			}
			this.registerHelpers();

			return this;
		},

		registerHelpers:function(){

		}
	});

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */

;(function(root){

	root.mura.FormUI=root.mura.UI.extend({
		context:{},
		ormform: false,
		formJSON:{},
		data:{},
		columns:[],
		currentpage: 0,
		entity: {},
		fields:{},
		filters: {},
		datasets: [],
		sortfield: '',
		sortdir: '',
		properties: {},
		rendered: {},
		renderqueue: 0,
		//templateList: ['file','error','textblock','checkbox','checkbox_static','dropdown','dropdown_static','radio','radio_static','nested','textarea','textfield','form','paging','list','table','view','hidden','section'],
		formInit: false,
		responsemessage: "",

		init:function(properties){

			properties || {};

			this.context = properties;

			if(this.context.mode == undefined)
				this.context.mode = 'form';

			this.registerHelpers();
		},

		render:function(){
			var ident = "mura-form-" + this.context.objectid;

			this.context.formEl = "#" + ident;

			this.context.html = "<div id='"+ident+"'></div>";

			mura(this.context.targetEl).html( this.context.html );

			if (this.context.view == 'form') {
				this.getForm();
			}
			else {
				this.getList();
			}
			return this;
		},

		getTemplates:function() {

			var self = this;

			if (self.context.view == 'form') {
				self.loadForm();
			} else {
				self.loadList();
			}

			/*
			if(root.mura.templatesLoaded.length){
				var temp = root.mura.templateList.pop();

				root.mura.ajax(
					{
						url:root.mura.assetpath + '/includes/display_objects/form/templates/' + temp + '.hb',
						type:'get',
						xhrFields:{ withCredentials: false },
						success:function(data) {
							root.mura.templates[temp] = root.mura.Handlebars.compile(data);
							if(!root.mura.templateList.length) {
								if (self.context.view == 'form') {
									self.loadForm();
								} else {
									self.loadList();
								}
							} else {
								self.getTemplates();
							}
						}
					}
				);

			}
			*/
		},

		getPageFieldList:function(){
				var page=this.currentpage;
				var fields = self.formJSON.form.pages[page];
				var result=[];

				for(var f=0;f < fields.length;f++){
					console.log("add: " + self.formJSON.form.fields[fields[f]].name);
					result.push(self.formJSON.form.fields[fields[f]].name);
				}

				console.log(result);

				return result.join(',');
		},

		renderField:function(fieldtype,field) {
			var self = this;
			var templates = root.mura.templates;
			var template = fieldtype;

			if( field.datasetid != "" && self.isormform)
				field.options = self.formJSON.datasets[field.datasetid].options;
			else if(field.datasetid != "") {
				field.dataset = self.formJSON.datasets[field.datasetid];
			}

			self.setDefault( fieldtype,field );

			if (fieldtype == "nested") {
				var context = {};
				context.objectid = field.formid;
				context.paging = 'single';
				context.mode = 'nested';
				context.master = this;

				var nestedForm = new mura.FormUI( context );
				var holder = mura('<div id="nested-'+field.formid+'"></div>');

				mura(".field-container-" + self.context.objectid,self.context.formEl).append(holder);

				context.formEl = holder;
				nestedForm.getForm();

				var html = root.mura.templates[template](field);
				mura(".field-container-" + self.context.objectid,self.context.formEl).append(html);
			}
			else {
				if(fieldtype == "checkbox") {
					if(self.ormform) {
						field.selected = [];

						var ds = self.formJSON.datasets[field.datasetid];

						for (var i in ds.datarecords) {
							if(ds.datarecords[i].selected && ds.datarecords[i].selected == 1)
								field.selected.push(i);
						}

						field.selected = field.selected.join(",");
					}
					else {
						template = template + "_static";
					}
				}
				else if(fieldtype == "dropdown") {
					if(!self.ormform) {
						template = template + "_static";
					}
				}
				else if(fieldtype == "radio") {
					if(!self.ormform) {
						template = template + "_static";
					}
				}

				var html = root.mura.templates[template](field);

				mura(".field-container-" + self.context.objectid,self.context.formEl).append(html);
			}

		},

		setDefault:function(fieldtype,field) {
			var self = this;

			switch( fieldtype ) {
				case "textfield":
				case "textarea":
					field.value = self.data[field.name];
				 break;
				case "checkbox":

					var ds = self.formJSON.datasets[field.datasetid];

					for(var i=0;i<ds.datarecords.length;i++) {
						if (self.ormform) {
							var sourceid = ds.source + "id";

							ds.datarecords[i].selected = 0;
							ds.datarecords[i].isselected = 0;

							if(self.data[field.name].items && self.data[field.name].items.length) {
								for(var x = 0;x < self.data[field.name].items.length;x++) {
									if (ds.datarecords[i].id == self.data[field.name].items[x][sourceid]) {
										ds.datarecords[i].isselected = 1;
										ds.datarecords[i].selected = 1;
									}
								}
							}
						}
						else {
							if (self.data[field.name] && ds.datarecords[i].value && self.data[field.name].indexOf(ds.datarecords[i].value) > -1) {
								ds.datarecords[i].isselected = 1;
								ds.datarecords[i].selected = 1;
							}
							else {
								ds.datarecords[i].selected = 0;
								ds.datarecords[i].isselected = 0;
							}
						}
					}

				break;
				case "radio":
				case "dropdown":
					var ds = self.formJSON.datasets[field.datasetid];
					for(var i=0;i<ds.datarecords.length;i++) {
						if(self.ormform) {
							if(ds.datarecords[i].id == self.data[field.name+'id']) {
								ds.datarecords[i].isselected = 1;
								field.selected = self.data[field.name+'id'];
							}
							else {
								ds.datarecords[i].selected = 0;
								ds.datarecords[i].isselected = 0;
							}
						}
						else {
							 if(ds.datarecords[i].value == self.data[field.name]) {
								ds.datarecords[i].isselected = 1;
								field.selected = self.data[field.name];
							}
							else {
								ds.datarecords[i].isselected = 0;
							}
						}
					}
				 break;
			}
		},

		renderData:function() {
			var self = this;

			if(self.datasets.length == 0){
				if (self.renderqueue == 0) {
					self.renderForm();
				}
				return;
			}

			var dataset = self.formJSON.datasets[self.datasets.pop()];

			if(dataset.sourcetype && dataset.sourcetype != 'muraorm'){
				self.renderData();
				return;
			}

			if(dataset.sourcetype=='muraorm'){
				dataset.options = [];
				self.renderqueue++;

				root.mura.getFeed( dataset.source )
					.getQuery()
					.then( function(collection) {
						collection.each(function(item) {
							var itemid = item.get('id');
							dataset.datarecordorder.push( itemid );
							dataset.datarecords[itemid] = item.getAll();
							dataset.datarecords[itemid]['value'] = itemid;
							dataset.datarecords[itemid]['datarecordid'] = itemid;
							dataset.datarecords[itemid]['datasetid'] = dataset.datasetid;
							dataset.datarecords[itemid]['isselected'] = 0;
							dataset.options.push( dataset.datarecords[itemid] );
						});

					})
					.then(function() {
						self.renderqueue--;
						self.renderData();
						if (self.renderqueue == 0) {
							self.renderForm();
						}
					});
			} else {
				if (self.renderqueue == 0) {
					self.renderForm();
				}
			}
		},

		renderForm: function( ) {
			var self = this;

			console.log("render form: " + self.currentpage);

			mura(".field-container-" + self.context.objectid,self.context.formEl).empty();

			if(!self.formInit) {
				self.initForm();
			}

			var fields = self.formJSON.form.pages[self.currentpage];

			for(var i = 0;i < fields.length;i++) {
				var field =  self.formJSON.form.fields[fields[i]];
				if( field.fieldtype.fieldtype != undefined && field.fieldtype.fieldtype != "") {
					self.renderField(field.fieldtype.fieldtype,field);
				}
			}

			if(self.ishuman && self.currentpage==(self.formJSON.form.pages.length-1)){
				mura(".field-container-" + self.context.objectid,self.context.formEl).append(self.ishuman);
			}

			if (self.context.mode == 'form') {
				self.renderPaging();
			}

			mura.processMarkup(".field-container-" + self.context.objectid,self.context.formEl);

		},

		renderPaging:function() {
			var self = this;
			var submitlabel=(typeof self.formJSON.form.formattributes.submitlabel != 'undefined' && self.formJSON.form.formattributes.submitlabel) ? self.formJSON.form.formattributes.submitlabel : 'Submit';

			mura(".error-container-" + self.context.objectid,self.context.formEl).empty();

			mura(".paging-container-" + self.context.objectid,self.context.formEl).empty();

			if(self.formJSON.form.pages.length == 1) {
				mura(".paging-container-" + self.context.objectid,self.context.formEl).append(root.mura.templates['paging']({page:self.currentpage+1,label:submitlabel,"class":"form-submit"}));
			}
			else {
				if(self.currentpage == 0) {
					mura(".paging-container-" + self.context.objectid,self.context.formEl).append(root.mura.templates['paging']({page:1,label:"Next","class":"form-nav"}));
				} else {
					mura(".paging-container-" + self.context.objectid,self.context.formEl).append(root.mura.templates['paging']({page:self.currentpage-1,label:"Back","class":'form-nav'}));

					if(self.currentpage+1 < self.formJSON.form.pages.length) {
						mura(".paging-container-" + self.context.objectid,self.context.formEl).append(root.mura.templates['paging']({page:self.currentpage+1,label:"Next","class":'form-nav'}));
					}
					else {
						mura(".paging-container-" + self.context.objectid,self.context.formEl).append(root.mura.templates['paging']({page:self.currentpage+1,label:submitlabel,"class":'form-submit  btn-primary'}));
					}
				}

				if(self.backlink != undefined && self.backlink.length)
					mura(".paging-container-" + self.context.objectid,self.context.formEl).append(root.mura.templates['paging']({page:self.currentpage+1,label:"Cancel","class":'form-cancel btn-primary pull-right'}));
			}

			mura(".form-submit",self.context.formEl).click( function() {
				self.submitForm();
			});
			mura(".form-cancel",self.context.formEl).click( function() {
				self.getTableData( self.backlink );
			});


			var formNavHandler=function() {
				self.setDataValues();

				var button = this;

				if(self.ormform) {
					root.mura.getEntity(self.entity)
					.set(
						self.data
					)
					.validate(self.getPageFieldList())
					.then(
						function( entity ) {
							if(entity.hasErrors()){
								self.showErrors( entity.properties.errors );
							} else {
								self.currentpage = mura(button).data('page');
								self.renderForm();
							}
						}
					);
				} else {
					var data=mura.deepExtend({}, self.data, self.context);
	                data.validateform=true;
					data.formid=data.objectid;
					data.siteid=data.siteid || mura.siteid;
					data.fields=self.getPageFieldList();

	                root.mura.post(
                        root.mura.apiEndpoint + '?method=processAsyncObject',
                        data)
                        .then(function(resp){
                            if(typeof resp.data.errors == 'object' && !mura.isEmptyObject(resp.data.errors)){
                                self.showErrors( resp.data.errors );
                            } else if(typeof resp.data.redirect != 'undefined') {
								if(resp.data.redirect && resp.data.redirect != location.href){
									location.href=resp.data.redirect;
								} else {
									location.reload(true);
								}
							} else {
								self.currentpage = mura(button).data('page');
                                self.renderForm();
                            }
                        }
						);
				}

				/*
				}
				else {
					console.log('oops!');
				}
				*/
			};

			mura(".form-nav",self.context.formEl).off('click',formNavHandler).on('click',formNavHandler);
		},

		setDataValues: function() {
			var self = this;
			var multi = {};
			var item = {};
			var valid = [];

			mura(".field-container-" + self.context.objectid + " input, .field-container-" + self.context.objectid + " select, .field-container-" + self.context.objectid + " textarea").each( function() {

				if( mura(this).is('[type="checkbox"]')) {
					if ( multi[mura(this).attr('name')] == undefined )
						multi[mura(this).attr('name')] = [];

					if( this.checked ) {
						if (self.ormform) {
							item = {};
							item['id'] = root.mura.createUUID();
							item[self.entity + 'id'] = self.data.id;
							item[mura(this).attr('source') + 'id'] = mura(this).val();
							item['key'] = mura(this).val();

							multi[mura(this).attr('name')].push(item);
						}
						else {
							multi[mura(this).attr('name')].push(mura(this).val());
						}
					}
				}
				else if( mura(this).is('[type="radio"]')) {
					if( this.checked ) {
						self.data[ mura(this).attr('name') ] = mura(this).val();
						valid[ mura(this).attr('name') ] = self.data[name];
					}
				}
				else {
					self.data[ mura(this).attr('name') ] = mura(this).val();
					valid[ mura(this).attr('name') ] = self.data[mura(this).attr('name')];
				}
			});

			for(var i in multi) {
				if(self.ormform) {
					self.data[ i ].cascade = "replace";
					self.data[ i ].items = multi[ i ];
					valid[ i ] = self.data[i];
				}
				else {
					self.data[ i ] = multi[i].join(",");
					valid[ i ] = multi[i].join(",");
				}
			}

			return valid;

		},

		validate: function( entity,fields ) {
			return true;
		},

		getForm: function( entityid,backlink ) {
			var self = this;
			var formJSON = {};
			var entityName = '';

			if(entityid != undefined){
				self.entityid = entityid;
			} else {
				delete self.entityid;
			}

			if(backlink != undefined){
				self.backlink = backlink;
			} else {
				delete self.backlink;
			}

			/*
			if(root.mura.templateList.length) {
				self.getTemplates( entityid );
			}
			else {
			*/
				self.loadForm();
			//}
		},

		loadForm: function( data ) {
			var self = this;

						console.log('a');
						console.log(self.formJSON);


			root.mura.get(
					root.mura.apiEndpoint + '/content/' + self.context.objectid
					 + '?fields=body,title,filename,responsemessage&ishuman=true'
					).then(function(data) {
					 	formJSON = JSON.parse( data.data.body );

						// old forms
						if(!formJSON.form.pages) {
							formJSON.form.pages = [];
							formJSON.form.pages[0] = formJSON.form.fieldorder;
							formJSON.form.fieldorder = [];
						}

						entityName = data.data.filename.replace(/\W+/g, "");
						self.entity = entityName;
					 	self.formJSON = formJSON;
					 	self.fields = formJSON.form.fields;
					 	self.responsemessage = data.data.responsemessage;
						self.ishuman=data.data.ishuman;

						if (formJSON.form.formattributes && formJSON.form.formattributes.muraormentities == 1) {
							self.ormform = true;
						}

						for(var i=0;i < self.formJSON.datasets;i++){
							self.datasets.push(i);
						}

						if(self.ormform) {
						 	self.entity = entityName;

						 	if(self.entityid == undefined) {
								root.mura.get(
									root.mura.apiEndpoint +'/'+ entityName + '/new?expand=all&ishuman=true'
								).then(function(resp) {
									self.data = resp.data;
									self.renderData();
								});
						 	}
						 	else {
								root.mura.get(
									root.mura.apiEndpoint  + '/'+ entityName + '/' + self.entityid + '?expand=all&ishuman=true'
								).then(function(resp) {
									self.data = resp.data;
									self.renderData();
								});
							}
						}
						else {
							self.renderData();
						}
					 }
				);
		},

		initForm: function() {
			var self = this;
			mura(self.context.formEl).empty();

			if(self.context.mode != undefined && self.context.mode == 'nested') {
				var html = root.mura.templates['nested'](self.context);
			}
			else {
				var html = root.mura.templates['form'](self.context);
			}

			mura(self.context.formEl).append(html);

			self.currentpage = 0;
			self.formInit=true;
		},

		submitForm: function() {

			var self = this;
			var valid = self.setDataValues();
			mura(".error-container-" + self.context.objectid,self.context.formEl).empty();

			delete self.data.isNew;

			mura(self.context.formEl)
				.find('form')
				.trigger('formSubmit');

			if(self.ormform) {
				console.log('a!');
				root.mura.getEntity(self.entity)
				.set(
					self.data
				)
				.save()
				.then(
					function( entity ) {
						if(self.backlink != undefined) {
							self.getTableData( self.location );
							return;
						}

						if(typeof resp.data.redirect != 'undefined'){
							if(resp.data.redirect && resp.data.redirect != location.href){
								location.href=resp.data.redirect;
							} else {
								location.reload(true);
							}
						} else {
							mura(self.context.formEl).html( resp.data.responsemessage );
						}
					},
					function( entity ) {
						self.showErrors( entity.properties.errors );
					}
				);
			}
			else {
				console.log('b!');
				var data=mura.deepExtend({},self.context,self.data);
				data.saveform=true;
				data.formid=data.objectid;
				data.siteid=data.siteid || mura.siteid;

                root.mura.post(
                        root.mura.apiEndpoint + '?method=processAsyncObject',
                        data)
                        .then(function(resp){
                            if(typeof resp.data.errors == 'object' && !mura.isEmptyObject(resp.data.errors )){
								self.showErrors( resp.data.errors );
							} else if(typeof resp.data.redirect != 'undefined'){
								if(resp.data.redirect && resp.data.redirect != location.href){
									location.href=resp.data.redirect;
								} else {
									location.reload(true);
								}
                            } else {
								mura(self.context.formEl).html( resp.data.responsemessage );
							}
                        });

			}

		},

		showErrors: function( errors ) {
			var self = this;

			console.log(errors);

			var errorData = {};

			/*
			for(var i in self.fields) {
				var field = self.fields[i];

				if( errors[ field.name ] ) {
					var error = {};
					error.message = field.validatemessage && field.validatemessage.length ? field.validatemessage : errors[field.name];
					error.field = field.name;
					error.label = field.label;
					errorData[field.name] = error;
				}

			}
			*/

			for(var e in errors) {
				if( typeof self.fields[e] != 'undefined' ) {
					var field = self.fields[e]
					var error = {};
					error.message = field.validatemessage && field.validatemessage.length ? field.validatemessage : errors[field.name];
					error.field = field.name;
					error.label = field.label;
					errorData[e] = error;
				} else {
					var error = {};
					error.message = errors[e];
					error.field = '';
					error.label = '';
					errorData[e] = error;
				}
			}

			var html = root.mura.templates['error'](errorData);
			console.log(errorData);

			mura(self.context.formEl).find('.g-recaptcha-container').each(function(el){
				grecaptcha.reset(el.getAttribute('data-widgetid'));
			});

			mura(".error-container-" + self.context.objectid,self.context.formEl).html(html);
		},


// lists
		getList: function() {
			var self = this;

			var entityName = '';

			/*
			if(root.mura.templateList.length) {
				self.getTemplates();
			}
			else {
			*/
				self.loadList();
			//}
		},

		filterResults: function() {
			var self = this;
			var before = "";
			var after = "";

			self.filters.filterby = mura("#results-filterby",self.context.formEl).val();
			self.filters.filterkey = mura("#results-keywords",self.context.formEl).val();

			if( mura("#date1",self.context.formEl).length ) {
				if(mura("#date1",self.context.formEl).val().length) {
					self.filters.from = mura("#date1",self.context.formEl).val() + " " + mura("#hour1",self.context.formEl).val() + ":00:00";
					self.filters.fromhour = mura("#hour1",self.context.formEl).val();
					self.filters.fromdate = mura("#date1",self.context.formEl).val();
				}
				else {
					self.filters.from = "";
					self.filters.fromhour = 0;
					self.filters.fromdate = "";
				}

				if(mura("#date2",self.context.formEl).val().length) {
					self.filters.to = mura("#date2",self.context.formEl).val() + " " + mura("#hour2",self.context.formEl).val() + ":00:00";
					self.filters.tohour = mura("#hour2",self.context.formEl).val();
					self.filters.todate = mura("#date2",self.context.formEl).val();
				}
				else {
					self.filters.to = "";
					self.filters.tohour = 0;
					self.filters.todate = "";
				}
			}

			self.getTableData();
		},

		downloadResults: function() {
			var self = this;

			self.filterResults();

		},


		loadList: function() {
			var self = this;

			root.mura.get(
				root.mura.apiEndpoint + '/content/' + self.context.objectid
				 + '?fields=body,title,filename,responsemessage'
				).then(function(data) {
				 	formJSON = JSON.parse( data.data.body );
					entityName = data.data.filename.replace(/\W+/g, "");
					self.entity = entityName;
				 	self.formJSON = formJSON;

					if (formJSON.form.formattributes && formJSON.form.formattributes.muraormentities == 1) {
						self.ormform = true;
					}
					else {
						mura(self.context.formEl).append("Unsupported for pre-Mura 7.0 MuraORM Forms.");
						return;
					}

					self.getTableData();
			});
		},

		getTableData: function( navlink ) {
			var self = this;

			root.mura.get(
				root.mura.apiEndpoint  + self.entity + '/listviewdescriptor'
			).then(function(resp) {
					self.columns = resp.data;
				root.mura.get(
					root.mura.apiEndpoint + self.entity + '/propertydescriptor/'
				).then(function(resp) {
					self.properties = self.cleanProps(resp.data);
					if( navlink == undefined) {
						navlink = root.mura.apiEndpoint + self.entity + '?sort=' + self.sortdir + self.sortfield;
						var fields = [];
						for(var i = 0;i < self.columns.length;i++) {
							fields.push(self.columns[i].column);
						}
						navlink = navlink + "&fields=" + fields.join(",");

						if (self.filters.filterkey && self.filters.filterkey != '') {
							navlink = navlink + "&" + self.filters.filterby + "=contains^" + self.filters.filterkey;
						}

						if (self.filters.from && self.filters.from != '') {
							navlink = navlink + "&created[1]=gte^" + self.filters.from;
						}
						if (self.filters.to && self.filters.to != '') {
							navlink = navlink + "&created[2]=lte^" + self.filters.to;
						}
					}

					root.mura.get(
						navlink
					).then(function(resp) {
						self.data = resp.data;
						self.location = self.data.links.self;

						var tableData = {rows:self.data,columns:self.columns,properties:self.properties,filters:self.filters};
						self.renderTable( tableData );
					});

				});
			});

		},

		renderTable: function( tableData ) {
			var self = this;

			var html = root.mura.templates['table'](tableData);
			mura(self.context.formEl).html( html );

			if (self.context.view == 'list') {
				mura("#date-filters",self.context.formEl).empty();
				mura("#btn-results-download",self.context.formEl).remove();
			}
			else {
				if (self.context.render == undefined) {
					mura(".datepicker", self.context.formEl).datepicker();
				}

				mura("#btn-results-download",self.context.formEl).click( function() {
					self.downloadResults();
				});
			}

			mura("#btn-results-search",self.context.formEl).click( function() {
				self.filterResults();
			});


			mura(".data-edit",self.context.formEl).click( function() {
				self.renderCRUD( mura(this).attr('data-value'),mura(this).attr('data-pos'));
			});
			mura(".data-view",self.context.formEl).click( function() {
				self.loadOverview(mura(this).attr('data-value'),mura(this).attr('data-pos'));
			});
			mura(".data-nav",self.context.formEl).click( function() {
				self.getTableData( mura(this).attr('data-value') );
			});

			mura(".data-sort").click( function() {

				var sortfield = mura(this).attr('data-value');

				if(sortfield == self.sortfield && self.sortdir == '')
					self.sortdir = '-';
				else
					self.sortdir = '';

				self.sortfield = mura(this).attr('data-value');
				self.getTableData();

			});
		},


		loadOverview: function(itemid,pos) {
			var self = this;

			root.mura.get(
				root.mura.apiEndpoint + entityName + '/' + itemid + '?expand=all'
				).then(function(resp) {
					self.item = resp.data;

					self.renderOverview();
			});
		},

		renderOverview: function() {
			var self = this;

			console.log('ia');
			console.log(self.item);

			mura(self.context.formEl).empty();

			var html = root.mura.templates['view'](self.item);
			mura(self.context.formEl).append(html);

			mura(".nav-back",self.context.formEl).click( function() {
				self.getTableData( self.location );
			});
		},

		renderCRUD: function( itemid,pos ) {
			var self = this;

			self.formInit = 0;
			self.initForm();

			self.getForm(itemid,self.data.links.self);
		},

		cleanProps: function( props ) {
			var propsOrdered = {};
			var propsRet = {};
			var ct = 100000;

			delete props.isnew;
			delete props.created;
			delete props.lastUpdate;
			delete props.errors;
			delete props.saveErrors;
			delete props.instance;
			delete props.instanceid;
			delete props.frommuracache;
			delete props[self.entity + "id"];

			for(var i in props) {
				if( props[i].orderno != undefined) {
					propsOrdered[props[i].orderno] = props[i];
				}
				else {
					propsOrdered[ct++] = props[i];
				}
			}

			Object.keys(propsOrdered)
				.sort()
					.forEach(function(v, i) {
					propsRet[v] = propsOrdered[v];
			});

			return propsRet;
		},

		registerHelpers: function() {
			var self = this;

			root.mura.Handlebars.registerHelper('eachColRow',function(row, columns, options) {
				var ret = "";
				for(var i = 0;i < columns.length;i++) {
					ret = ret + options.fn(row[columns[i].column]);
				}
				return ret;
			});

			root.mura.Handlebars.registerHelper('eachProp',function(data, options) {
				var ret = "";
				var obj = {};

				for(var i in self.properties) {
					obj.displayName = self.properties[i].displayName;
					if( self.properties[i].fieldtype == "one-to-one" ) {
						obj.displayValue = data[ self.properties[i].cfc ].val;
					}
					else
						obj.displayValue = data[ self.properties[i].column ];

					ret = ret + options.fn(obj);
				}
				return ret;
			});

			root.mura.Handlebars.registerHelper('eachKey',function(properties, by, options) {
				var ret = "";
				var item = "";
				for(var i in properties) {
					item = properties[i];

					if(item.column == by)
						item.selected = "Selected";

					if(item.rendertype == 'textfield')
						ret = ret + options.fn(item);
				}

				return ret;
			});

			root.mura.Handlebars.registerHelper('eachHour',function(hour, options) {
				var ret = "";
				var h = 0;
				var val = "";

				for(var i = 0;i < 24;i++) {

					if(i == 0 ) {
						val = {label:"12 AM",num:i};
					}
					else if(i <12 ) {
						h = i;
						val = {label:h + " AM",num:i};
					}
					else if(i == 12 ) {
						h = i;
						val = {label:h + " PM",num:i};
					}
					else {
						h = i-12;
						val = {label:h + " PM",num:i};
					}

					if(hour == i)
						val.selected = "selected";

					ret = ret + options.fn(val);
				}
				return ret;
			});

			root.mura.Handlebars.registerHelper('eachColButton',function(row, options) {
				var ret = "";

				row.label='View';
				row.type='data-view';

				// only do view if there are more properties than columns
				if( Object.keys(self.properties).length > self.columns.length) {
					ret = ret + options.fn(row);
				}

				if( self.context.view == 'edit') {
					row.label='Edit';
					row.type='data-edit';

					ret = ret + options.fn(row);
				}

				return ret;
			});

			root.mura.Handlebars.registerHelper('eachCheck',function(checks, selected, options) {
				var ret = "";

				for(var i = 0;i < checks.length;i++) {
					if( selected.indexOf( checks[i].id ) > -1 )
						checks[i].isselected = 1;
					else
					 	checks[i].isselected = 0;

					ret = ret + options.fn(checks[i]);
				}
				return ret;
			});

			root.mura.Handlebars.registerHelper('eachStatic',function(dataset, options) {
				var ret = "";

				for(var i = 0;i < dataset.datarecordorder.length;i++) {
					ret = ret + options.fn(dataset.datarecords[dataset.datarecordorder[i]]);
				}
				return ret;
			});

			root.mura.Handlebars.registerHelper('inputWrapperClass',function() {
				var escapeExpression=root.mura.Handlebars.escapeExpression;
				var returnString='mura-control-group';

				if(this.wrappercssclass){
					returnString += ' ' + escapeExpression(this.wrappercssclass);
				}

				if(this.isrequired){
					returnString += ' req';
				}

				return returnString;
			});

			root.mura.Handlebars.registerHelper('formClass',function() {
				var escapeExpression=root.mura.Handlebars.escapeExpression;
				var returnString='mura-form';

				if(this.class){
					returnString += ' ' + escapeExpression(this.class);
				}

				return returnString;
			});

			root.mura.Handlebars.registerHelper('commonInputAttributes',function() {
				//id, class, title, size
				var escapeExpression=root.mura.Handlebars.escapeExpression;
				var returnString='name="' + escapeExpression(this.name) + '"';

				if(this.cssid){
					returnString += ' id="' + escapeExpression(this.cssid) + '"';
				} else {
					returnString += ' id="field-' + escapeExpression(this.name) + '"';
				}

				if(this.cssclass){
					returnString += ' class="' + escapeExpression(this.cssclass) + '"';
				}

				if(this.tooltip){
					returnString += ' title="' + escapeExpression(this.tooltip) + '"';
				}

				if(this.size){
					returnString += ' size="' + escapeExpression(this.size) + '"';
				}

				return returnString;
			});

		}





	});

})(this);
;/* This file is part of Mura CMS.

	Mura CMS is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, Version 2 of the License.

	Mura CMS is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with Mura CMS.  If not, see <http://www.gnu.org/licenses/>.

	Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
	Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

	However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
	or libraries that are released under the GNU Lesser General Public License version 2.1.

	In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
	independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
	Mura CMS under the license of your choice, provided that you follow these specific guidelines:

	Your custom code

	• Must not alter any default objects in the Mura CMS database and
	• May not alter the default display of the Mura CMS logo within Mura CMS and
	• Must not alter any files in the following directories.

	 /admin/
	 /tasks/
	 /config/
	 /requirements/mura/
	 /Application.cfc
	 /index.cfm
	 /MuraProxy.cfc

	You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
	under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
	requires distribution of source code.

	For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
	modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
	version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS. */
;(function(root){
    root.mura.datacache=new root.mura.Cache();
    root.mura.Handlebars=Handlebars.create();
    root.mura.templatesLoaded=false;
    Handlebars.noConflict();
})(this);
;this["mura"] = this["mura"] || {};
this["mura"]["templates"] = this["mura"]["templates"] || {};

this["mura"]["templates"]["checkbox"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "				<label class=\"checkbox\">\r\n				<input source=\""
    + alias2(alias1(((stack1 = (depths[1] != null ? depths[1].dataset : depths[1])) != null ? stack1.source : stack1), depth0))
    + "\" type=\"checkbox\" name=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\" id=\"field-"
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" id=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "-"
    + alias2(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias3,(depth0 != null ? depth0.isselected : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "/>\r\n				"
    + alias2(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "checked='checked'";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n		<div class=\"mura-checkbox-group\">\r\n			<div class=\"mura-group-label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\r\n"
    + ((stack1 = (helpers.eachCheck || (depth0 && depth0.eachCheck) || alias2).call(alias1,((stack1 = (depth0 != null ? depth0.dataset : depth0)) != null ? stack1.options : stack1),(depth0 != null ? depth0.selected : depth0),{"name":"eachCheck","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</div>\r\n	</div>\r\n";
},"useData":true,"useDepths":true});

this["mura"]["templates"]["checkbox_static"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing, alias5="function";

  return "				<label class=\"checkbox\">\r\n				<input type=\"checkbox\" name=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\" id=\"field-"
    + alias2(((helper = (helper = helpers.datarecordid || (depth0 != null ? depth0.datarecordid : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"datarecordid","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias2(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" id=\""
    + alias2(alias1((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\" "
    + ((stack1 = helpers["if"].call(alias3,(depth0 != null ? depth0.isselected : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias3,(depth0 != null ? depth0.selected : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "/>\r\n				"
    + alias2(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias4),(typeof helper === alias5 ? helper.call(alias3,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return " checked='checked'";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n		<div class=\"mura-checkbox-group\">\r\n			<div class=\"mura-group-label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\r\n"
    + ((stack1 = (helpers.eachStatic || (depth0 && depth0.eachStatic) || alias2).call(alias1,(depth0 != null ? depth0.dataset : depth0),{"name":"eachStatic","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</div>\r\n	</div>\r\n";
},"useData":true,"useDepths":true});

this["mura"]["templates"]["dropdown"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "					<option data-isother=\""
    + alias4(((helper = (helper = helpers.isother || (depth0 != null ? depth0.isother : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"isother","hash":{},"data":data}) : helper)))
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isselected : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "selected='selected'";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\n		<label for=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</label>\n			<select "
    + ((stack1 = ((helper = (helper = helpers.commonInputAttributes || (depth0 != null ? depth0.commonInputAttributes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"commonInputAttributes","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + ">\n"
    + ((stack1 = helpers.each.call(alias1,((stack1 = (depth0 != null ? depth0.dataset : depth0)) != null ? stack1.options : stack1),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "			</select>\n	</div>\n";
},"useData":true});

this["mura"]["templates"]["dropdown_static"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return "			<div class=\"mura-group-label\">"
    + container.escapeExpression(((helper = (helper = helpers.summary || (depth0 != null ? depth0.summary : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"summary","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "				<option data-isother=\""
    + alias4(((helper = (helper = helpers.isother || (depth0 != null ? depth0.isother : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"isother","hash":{},"data":data}) : helper)))
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.datarecordid || (depth0 != null ? depth0.datarecordid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"datarecordid","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isselected : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "selected='selected'";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\n		<label for=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</label>\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.summary : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		<select "
    + ((stack1 = ((helper = (helper = helpers.commonInputAttributes || (depth0 != null ? depth0.commonInputAttributes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"commonInputAttributes","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + ">\n"
    + ((stack1 = (helpers.eachStatic || (depth0 && depth0.eachStatic) || alias2).call(alias1,(depth0 != null ? depth0.dataset : depth0),{"name":"eachStatic","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</select>\n	</div>\n";
},"useData":true});

this["mura"]["templates"]["error"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\"mura-alert mura-danger\" data-field=\""
    + alias4(((helper = (helper = helpers.field || (depth0 != null ? depth0.field : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"field","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.label : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + alias4(((helper = (helper = helpers.message || (depth0 != null ? depth0.message : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"message","hash":{},"data":data}) : helper)))
    + "</div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"label","hash":{},"data":data}) : helper)))
    + ": ";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "");
},"useData":true});

this["mura"]["templates"]["file"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n	<label for=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</label>\r\n	<input type=\"file\" "
    + ((stack1 = ((helper = (helper = helpers.commonInputAttributes || (depth0 != null ? depth0.commonInputAttributes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"commonInputAttributes","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "/>\r\n</div>\r\n";
},"useData":true});

this["mura"]["templates"]["form"] = this.mura.Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<form id=\"frm"
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\" class=\""
    + ((stack1 = ((helper = (helper = helpers.formClass || (depth0 != null ? depth0.formClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"formClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" novalidate=\"novalidate\" enctype='multipart/form-data'>\n<div class=\"error-container-"
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\">\n</div>\n<div class=\"field-container-"
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\">\n</div>\n<div class=\"paging-container-"
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\">\n</div>\n	<input type=\"hidden\" name=\"formid\" class=\""
    + alias4(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\" value=\"1025\">\n</form>\n";
},"useData":true});

this["mura"]["templates"]["hidden"] = this.mura.Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<input type=\"hidden\" name=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = ((helper = (helper = helpers.commonInputAttributes || (depth0 != null ? depth0.commonInputAttributes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"commonInputAttributes","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + " value=\""
    + alias4(((helper = (helper = helpers.defaultvalue || (depth0 != null ? depth0.defaultvalue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"defaultvalue","hash":{},"data":data}) : helper)))
    + "\" />			\n";
},"useData":true});

this["mura"]["templates"]["list"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "					<option value=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<form>\n	<div class=\"mura-control-group\">\n		<label for=\"beanList\">Choose Entity:</label>	\n		<div class=\"form-group-select\">\n			<select type=\"text\" name=\"bean\" id=\"select-bean-value\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},depth0,{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "			</select>\n		</div>\n	</div>\n	<div class=\"mura-control-group\">\n		<button type=\"button\" id=\"select-bean\">Go</button>\n	</div>\n</form>";
},"useData":true});

this["mura"]["templates"]["nested"] = this.mura.Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"field-container-"
    + container.escapeExpression(((helper = (helper = helpers.objectid || (depth0 != null ? depth0.objectid : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"objectid","hash":{},"data":data}) : helper)))
    + "\">\r\n\r\n</div>\r\n";
},"useData":true});

this["mura"]["templates"]["paging"] = this.mura.Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<button class=\""
    + alias4(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"class","hash":{},"data":data}) : helper)))
    + "\" type=\"button\" data-page=\""
    + alias4(((helper = (helper = helpers.page || (depth0 != null ? depth0.page : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"page","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</button> ";
},"useData":true});

this["mura"]["templates"]["radio"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "				<label for=\""
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\" class=\"radio\">\n				<input type=\"radio\" name=\""
    + alias4(container.lambda((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "id\" id=\"field-"
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isselected : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "/>\n				"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "checked='checked'";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\n		<div class=\"mura-radio-group\">\n			<div class=\"mura-group-label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n"
    + ((stack1 = helpers.each.call(alias1,((stack1 = (depth0 != null ? depth0.dataset : depth0)) != null ? stack1.options : stack1),{"name":"each","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</div>\n	</div>\n";
},"useData":true,"useDepths":true});

this["mura"]["templates"]["radio_static"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "				<label for=\""
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "\" class=\"radio\">\n				<input type=\"radio\" name=\""
    + alias4(container.lambda((depths[1] != null ? depths[1].name : depths[1]), depth0))
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.datarecordid || (depth0 != null ? depth0.datarecordid : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"datarecordid","hash":{},"data":data}) : helper)))
    + "\" value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\"  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isselected : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "/>\n				"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</label>\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "checked='checked'";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\n		<div class=\"mura-radio-group\">\n			<div class=\"mura-group-label\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>\n"
    + ((stack1 = (helpers.eachStatic || (depth0 && depth0.eachStatic) || alias2).call(alias1,(depth0 != null ? depth0.dataset : depth0),{"name":"eachStatic","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</div>\n	</div>\n";
},"useData":true,"useDepths":true});

this["mura"]["templates"]["section"] = this.mura.Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n<div class=\"mura-section\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</div>\r\n<div class=\"mura-divide\"></div>\r\n</div>";
},"useData":true});

this["mura"]["templates"]["table"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<option value=\""
    + alias4(((helper = (helper = helpers.num || (depth0 != null ? depth0.num : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"num","hash":{},"data":data}) : helper)))
    + "\" "
    + alias4(((helper = (helper = helpers.selected || (depth0 != null ? depth0.selected : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"selected","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</option>";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "					<option value=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\" "
    + alias4(((helper = (helper = helpers.selected || (depth0 != null ? depth0.selected : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"selected","hash":{},"data":data}) : helper)))
    + ">"
    + alias4(((helper = (helper = helpers.displayName || (depth0 != null ? depth0.displayName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayName","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<th class='data-sort' data-value='"
    + alias4(((helper = (helper = helpers.column || (depth0 != null ? depth0.column : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"column","hash":{},"data":data}) : helper)))
    + "'>"
    + alias4(((helper = (helper = helpers.displayName || (depth0 != null ? depth0.displayName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayName","hash":{},"data":data}) : helper)))
    + "</th>\n";
},"7":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing;

  return "			<tr class=\"even\">\n"
    + ((stack1 = (helpers.eachColRow || (depth0 && depth0.eachColRow) || alias2).call(alias1,depth0,(depths[1] != null ? depths[1].columns : depths[1]),{"name":"eachColRow","hash":{},"fn":container.program(8, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "				<td>\n"
    + ((stack1 = (helpers.eachColButton || (depth0 && depth0.eachColButton) || alias2).call(alias1,depth0,{"name":"eachColButton","hash":{},"fn":container.program(10, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "				</td>\n			</tr>\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "					<td>"
    + container.escapeExpression(container.lambda(depth0, depth0))
    + "</td>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "				<button type=\"button\" class=\""
    + alias4(((helper = (helper = helpers.type || (depth0 != null ? depth0.type : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data}) : helper)))
    + "\" data-value=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" data-pos=\""
    + alias4(((helper = (helper = helpers.index || (data && data.index)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + "</button>\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "				<button class='data-nav' data-value=\""
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.first : stack1), depth0))
    + "\">First</button>\n";
},"14":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "				<button class='data-nav' data-value=\""
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.previous : stack1), depth0))
    + "\">Prev</button>\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "				<button class='data-nav' data-value=\""
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.next : stack1), depth0))
    + "\">Next</button>\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "				<button class='data-nav' data-value=\""
    + container.escapeExpression(container.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.last : stack1), depth0))
    + "\">Last</button>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, alias1=container.lambda, alias2=container.escapeExpression, alias3=depth0 != null ? depth0 : {}, alias4=helpers.helperMissing;

  return "	<div class=\"mura-control-group\">\n		<div id=\"filter-results-container\">\n			<div id=\"date-filters\">\n				<div class=\"control-group\">\n				  <label>From</label>\n				  <div class=\"controls\">\n				  	<input type=\"text\" class=\"datepicker mura-date\" id=\"date1\" name=\"date1\" validate=\"date\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.filters : depth0)) != null ? stack1.fromdate : stack1), depth0))
    + "\">\n				  	<select id=\"hour1\" name=\"hour1\" class=\"mura-date\">"
    + ((stack1 = (helpers.eachHour || (depth0 && depth0.eachHour) || alias4).call(alias3,((stack1 = (depth0 != null ? depth0.filters : depth0)) != null ? stack1.fromhour : stack1),{"name":"eachHour","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select></select>\n					</div>\n				</div>\n			\n				<div class=\"control-group\">\n				  <label>To</label>\n				  <div class=\"controls\">\n				  	<input type=\"text\" class=\"datepicker mura-date\" id=\"date2\" name=\"date2\" validate=\"date\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.filters : depth0)) != null ? stack1.todate : stack1), depth0))
    + "\">\n				  	<select id=\"hour2\" name=\"hour2\"  class=\"mura-date\">"
    + ((stack1 = (helpers.eachHour || (depth0 && depth0.eachHour) || alias4).call(alias3,((stack1 = (depth0 != null ? depth0.filters : depth0)) != null ? stack1.tohour : stack1),{"name":"eachHour","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</select></select>\n				   </select>\n					</div>\n				</div>\n			</div>\n					\n			<div class=\"control-group\">\n				<label>Keywords</label>\n				<div class=\"controls\">\n					<select name=\"filterBy\" class=\"mura-date\" id=\"results-filterby\">\n"
    + ((stack1 = (helpers.eachKey || (depth0 && depth0.eachKey) || alias4).call(alias3,(depth0 != null ? depth0.properties : depth0),((stack1 = (depth0 != null ? depth0.filters : depth0)) != null ? stack1.filterby : stack1),{"name":"eachKey","hash":{},"fn":container.program(3, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "					</select>\n					<input type=\"text\" class=\"mura-half\" name=\"keywords\" id=\"results-keywords\" value=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.filters : depth0)) != null ? stack1.filterkey : stack1), depth0))
    + "\">\n				</div>\n			</div>\n			<div class=\"form-actions\">\n				<button type=\"button\" class=\"btn\" id=\"btn-results-search\" ><i class=\"mi-bar-chart\"></i> View Data</button>\n				<button type=\"button\" class=\"btn\"  id=\"btn-results-download\" ><i class=\"mi-download\"></i> Download</button>\n			</div>\n		</div>\n	<div>\n\n	<ul class=\"metadata\">\n		<li>Page:\n			<strong>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.pageindex : stack1), depth0))
    + " of "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.totalpages : stack1), depth0))
    + "</strong>\n		</li>\n		<li>Total Records:\n			<strong>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.totalitems : stack1), depth0))
    + "</strong>\n		</li>\n	</ul>\n\n	<table style=\"width: 100%\" class=\"table\">\n		<thead>\n		<tr>\n"
    + ((stack1 = helpers.each.call(alias3,(depth0 != null ? depth0.columns : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "			<th></th>\n		</tr>\n		</thead>\n		<tbody>\n"
    + ((stack1 = helpers.each.call(alias3,((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.items : stack1),{"name":"each","hash":{},"fn":container.program(7, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "		</tbody>\n		<tfoot>\n		<tr>\n			<td>\n"
    + ((stack1 = helpers["if"].call(alias3,((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.first : stack1),{"name":"if","hash":{},"fn":container.program(12, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias3,((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.previous : stack1),{"name":"if","hash":{},"fn":container.program(14, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias3,((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.next : stack1),{"name":"if","hash":{},"fn":container.program(16, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers["if"].call(alias3,((stack1 = ((stack1 = (depth0 != null ? depth0.rows : depth0)) != null ? stack1.links : stack1)) != null ? stack1.last : stack1),{"name":"if","hash":{},"fn":container.program(18, data, 0, blockParams, depths),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "			</td>\n		</tfoot>\n	</table>\n</div>";
},"useData":true,"useDepths":true});

this["mura"]["templates"]["textarea"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\"  id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n	<label for=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</label>\r\n	<textarea "
    + ((stack1 = ((helper = (helper = helpers.commonInputAttributes || (depth0 != null ? depth0.commonInputAttributes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"commonInputAttributes","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + ">"
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "</textarea>\r\n</div>\r\n";
},"useData":true});

this["mura"]["templates"]["textblock"] = this.mura.Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function";

  return "<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + container.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n<div class=\"mura-form-text\">"
    + ((stack1 = ((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\r\n</div>";
},"useData":true});

this["mura"]["templates"]["textfield"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return " <ins>Required</ins>";
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return " placeholder=\""
    + container.escapeExpression(((helper = (helper = helpers.placeholder || (depth0 != null ? depth0.placeholder : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"placeholder","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div class=\""
    + ((stack1 = ((helper = (helper = helpers.inputWrapperClass || (depth0 != null ? depth0.inputWrapperClass : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"inputWrapperClass","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\" id=\"field-"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "-container\">\r\n	<label for=\""
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.label || (depth0 != null ? depth0.label : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"label","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.isrequired : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</label>\r\n	<input type=\"text\" "
    + ((stack1 = ((helper = (helper = helpers.commonInputAttributes || (depth0 != null ? depth0.commonInputAttributes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"commonInputAttributes","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + " value=\""
    + alias4(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data}) : helper)))
    + "\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.placeholder : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "/>\r\n</div>\r\n";
},"useData":true});

this["mura"]["templates"]["view"] = this.mura.Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "	<li>\n		<strong>"
    + alias4(((helper = (helper = helpers.displayName || (depth0 != null ? depth0.displayName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayName","hash":{},"data":data}) : helper)))
    + ": </strong> "
    + alias4(((helper = (helper = helpers.displayValue || (depth0 != null ? depth0.displayValue : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"displayValue","hash":{},"data":data}) : helper)))
    + " \n	</li>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"mura-control-group\">\n<ul>\n"
    + ((stack1 = (helpers.eachProp || (depth0 && depth0.eachProp) || helpers.helperMissing).call(depth0 != null ? depth0 : {},depth0,{"name":"eachProp","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</ul>\n<button type=\"button\" class=\"nav-back\">Back</button>\n</div>";
},"useData":true});