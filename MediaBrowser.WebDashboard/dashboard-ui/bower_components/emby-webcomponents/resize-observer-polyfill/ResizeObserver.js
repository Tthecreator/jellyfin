! function(global, factory) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define(factory) : global.ResizeObserver = factory()
}(this, function() {
    "use strict";

    function getHTMLElementContentRect(target) {
        var rect = target.getBoundingClientRect();
        return createRectInit(rect.left, rect.top, rect.width, rect.height)
    }

    function getContentRect(target) {
        return isBrowser ? getHTMLElementContentRect(target) : emptyRect
    }

    function createReadOnlyRect(ref) {
        var x = ref.x,
            y = ref.y,
            width = ref.width,
            height = ref.height,
            Constr = "undefined" != typeof DOMRectReadOnly ? DOMRectReadOnly : Object,
            rect = Object.create(Constr.prototype);
        return defineConfigurable(rect, {
            x: x,
            y: y,
            width: width,
            height: height,
            top: y,
            right: x + width,
            bottom: height + y,
            left: x
        }), rect
    }

    function createRectInit(x, y, width, height) {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        }
    }
    var MapShim = function() {
            function getIndex(arr, key) {
                var result = -1;
                return arr.some(function(entry, index) {
                    return entry[0] === key && (result = index, !0)
                }), result
            }
            return "undefined" != typeof Map ? Map : function() {
                function anonymous() {
                    this.__entries__ = []
                }
                var prototypeAccessors = {
                    size: {
                        configurable: !0
                    }
                };
                return prototypeAccessors.size.get = function() {
                    return this.__entries__.length
                }, anonymous.prototype.get = function(key) {
                    var index = getIndex(this.__entries__, key),
                        entry = this.__entries__[index];
                    return entry && entry[1]
                }, anonymous.prototype.set = function(key, value) {
                    var index = getIndex(this.__entries__, key);
                    ~index ? this.__entries__[index][1] = value : this.__entries__.push([key, value])
                }, anonymous.prototype.delete = function(key) {
                    var entries = this.__entries__,
                        index = getIndex(entries, key);
                    ~index && entries.splice(index, 1)
                }, anonymous.prototype.has = function(key) {
                    return !!~getIndex(this.__entries__, key)
                }, anonymous.prototype.clear = function() {
                    this.__entries__.splice(0)
                }, anonymous.prototype.forEach = function(callback, ctx) {
                    var this$1 = this;
                    void 0 === ctx && (ctx = null);
                    for (var i = 0, list = this$1.__entries__; i < list.length; i += 1) {
                        var entry = list[i];
                        callback.call(ctx, entry[1], entry[0])
                    }
                }, Object.defineProperties(anonymous.prototype, prototypeAccessors), anonymous
            }()
        }(),
        isBrowser = "undefined" != typeof window && "undefined" != typeof document && window.document === document,
        global$1 = function() {
            return "undefined" != typeof global && global.Math === Math ? global : "undefined" != typeof self && self.Math === Math ? self : "undefined" != typeof window && window.Math === Math ? window : Function("return this")()
        }(),
        requestAnimationFrame$1 = function() {
            return "function" == typeof requestAnimationFrame ? requestAnimationFrame.bind(global$1) : function(callback) {
                return setTimeout(function() {
                    return callback(Date.now())
                }, 1e3 / 60)
            }
        }(),
        trailingTimeout = 2,
        throttle = function(callback, delay) {
            function resolvePending() {
                leadingCall && (leadingCall = !1, callback()), trailingCall && proxy()
            }

            function timeoutCallback() {
                requestAnimationFrame$1(resolvePending)
            }

            function proxy() {
                var timeStamp = Date.now();
                if (leadingCall) {
                    if (timeStamp - lastCallTime < trailingTimeout) return;
                    trailingCall = !0
                } else leadingCall = !0, trailingCall = !1, setTimeout(timeoutCallback, delay);
                lastCallTime = timeStamp
            }
            var leadingCall = !1,
                trailingCall = !1,
                lastCallTime = 0;
            return proxy
        },
        transitionKeys = ["top", "right", "bottom", "left", "width", "height", "size", "weight"],
        mutationObserverSupported = "undefined" != typeof MutationObserver,
        ResizeObserverController = function() {
            this.connected_ = !1, this.mutationEventsAdded_ = !1, this.mutationsObserver_ = null, this.observers_ = [], this.onTransitionEnd_ = this.onTransitionEnd_.bind(this), this.refresh = throttle(this.refresh.bind(this), 20)
        };
    ResizeObserverController.prototype.addObserver = function(observer) {
        ~this.observers_.indexOf(observer) || this.observers_.push(observer), this.connected_ || this.connect_()
    }, ResizeObserverController.prototype.removeObserver = function(observer) {
        var observers = this.observers_,
            index = observers.indexOf(observer);
        ~index && observers.splice(index, 1), !observers.length && this.connected_ && this.disconnect_()
    }, ResizeObserverController.prototype.refresh = function() {
        this.updateObservers_() && this.refresh()
    }, ResizeObserverController.prototype.updateObservers_ = function() {
        var activeObservers = this.observers_.filter(function(observer) {
            return observer.gatherActive(), observer.hasActive()
        });
        return activeObservers.forEach(function(observer) {
            return observer.broadcastActive()
        }), activeObservers.length > 0
    }, ResizeObserverController.prototype.connect_ = function() {
        isBrowser && !this.connected_ && (document.addEventListener("transitionend", this.onTransitionEnd_), window.addEventListener("resize", this.refresh), window.addEventListener("orientationchange", this.refresh), mutationObserverSupported ? (this.mutationsObserver_ = new MutationObserver(this.refresh), this.mutationsObserver_.observe(document, {
            attributes: !0,
            childList: !0,
            characterData: !0,
            subtree: !0
        })) : (document.addEventListener("DOMSubtreeModified", this.refresh), this.mutationEventsAdded_ = !0), this.connected_ = !0)
    }, ResizeObserverController.prototype.disconnect_ = function() {
        isBrowser && this.connected_ && (document.removeEventListener("transitionend", this.onTransitionEnd_), window.removeEventListener("resize", this.refresh), window.removeEventListener("orientationchange", this.refresh), this.mutationsObserver_ && this.mutationsObserver_.disconnect(), this.mutationEventsAdded_ && document.removeEventListener("DOMSubtreeModified", this.refresh), this.mutationsObserver_ = null, this.mutationEventsAdded_ = !1, this.connected_ = !1)
    }, ResizeObserverController.prototype.onTransitionEnd_ = function(ref) {
        var propertyName = ref.propertyName;
        void 0 === propertyName && (propertyName = ""), transitionKeys.some(function(key) {
            return !!~propertyName.indexOf(key)
        }) && this.refresh()
    }, ResizeObserverController.getInstance = function() {
        return this.instance_ || (this.instance_ = new ResizeObserverController), this.instance_
    }, ResizeObserverController.instance_ = null;
    var defineConfigurable = function(target, props) {
            for (var i = 0, list = Object.keys(props); i < list.length; i += 1) {
                var key = list[i];
                Object.defineProperty(target, key, {
                    value: props[key],
                    enumerable: !1,
                    writable: !1,
                    configurable: !0
                })
            }
            return target
        },
        getWindowOf = function(target) {
            return target && target.ownerDocument && target.ownerDocument.defaultView || global$1
        },
        emptyRect = createRectInit(0, 0, 0, 0),
        ResizeObservation = function(target) {
            this.broadcastWidth = 0, this.broadcastHeight = 0, this.contentRect_ = createRectInit(0, 0, 0, 0), this.target = target
        };
    ResizeObservation.prototype.isActive = function() {
        var rect = getContentRect(this.target);
        return this.contentRect_ = rect, rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight
    }, ResizeObservation.prototype.broadcastRect = function() {
        var rect = this.contentRect_;
        return this.broadcastWidth = rect.width, this.broadcastHeight = rect.height, rect
    };
    var ResizeObserverEntry = function(target, rectInit) {
            var contentRect = createReadOnlyRect(rectInit);
            defineConfigurable(this, {
                target: target,
                contentRect: contentRect
            })
        },
        ResizeObserverSPI = function(callback, controller, callbackCtx) {
            if (this.activeObservations_ = [], this.observations_ = new MapShim, "function" != typeof callback) throw new TypeError("The callback provided as parameter 1 is not a function.");
            this.callback_ = callback, this.controller_ = controller, this.callbackCtx_ = callbackCtx
        };
    ResizeObserverSPI.prototype.observe = function(target) {
        if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
        if ("undefined" != typeof Element && Element instanceof Object) {
            if (!(target instanceof getWindowOf(target).Element)) throw new TypeError('parameter 1 is not of type "Element".');
            var observations = this.observations_;
            observations.has(target) || (observations.set(target, new ResizeObservation(target)), this.controller_.addObserver(this), this.controller_.refresh())
        }
    }, ResizeObserverSPI.prototype.unobserve = function(target) {
        if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
        if ("undefined" != typeof Element && Element instanceof Object) {
            if (!(target instanceof getWindowOf(target).Element)) throw new TypeError('parameter 1 is not of type "Element".');
            var observations = this.observations_;
            observations.has(target) && (observations.delete(target), observations.size || this.controller_.removeObserver(this))
        }
    }, ResizeObserverSPI.prototype.disconnect = function() {
        this.clearActive(), this.observations_.clear(), this.controller_.removeObserver(this)
    }, ResizeObserverSPI.prototype.gatherActive = function() {
        var this$1 = this;
        this.clearActive(), this.observations_.forEach(function(observation) {
            observation.isActive() && this$1.activeObservations_.push(observation)
        })
    }, ResizeObserverSPI.prototype.broadcastActive = function() {
        if (this.hasActive()) {
            var ctx = this.callbackCtx_,
                entries = this.activeObservations_.map(function(observation) {
                    return new ResizeObserverEntry(observation.target, observation.broadcastRect())
                });
            this.callback_.call(ctx, entries, ctx), this.clearActive()
        }
    }, ResizeObserverSPI.prototype.clearActive = function() {
        this.activeObservations_.splice(0)
    }, ResizeObserverSPI.prototype.hasActive = function() {
        return this.activeObservations_.length > 0
    };
    var observers = "undefined" != typeof WeakMap ? new WeakMap : new MapShim,
        ResizeObserver = function(callback) {
            if (!(this instanceof ResizeObserver)) throw new TypeError("Cannot call a class as a function.");
            if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
            var controller = ResizeObserverController.getInstance(),
                observer = new ResizeObserverSPI(callback, controller, this);
            observers.set(this, observer)
        };
    return ["observe", "unobserve", "disconnect"].forEach(function(method) {
            ResizeObserver.prototype[method] = function() {
                return (ref = observers.get(this))[method].apply(ref, arguments);
                var ref
            }
        }),
        function() {
            return void 0 !== global$1.ResizeObserver ? global$1.ResizeObserver : ResizeObserver
        }()
});