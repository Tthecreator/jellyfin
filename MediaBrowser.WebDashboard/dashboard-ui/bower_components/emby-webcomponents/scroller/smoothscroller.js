define(["browser", "layoutManager", "dom", "focusManager", "ResizeObserver", "scrollStyles"], function(browser, layoutManager, dom, focusManager, ResizeObserver) {
    "use strict";

    function type(value) {
        return null == value ? String(value) : "object" == typeof value || "function" == typeof value ? Object.prototype.toString.call(value).match(/\s([a-z]+)/i)[1].toLowerCase() || "object" : typeof value
    }

    function disableOneEvent(event) {
        event.preventDefault(), event.stopPropagation(), this.removeEventListener(event.type, disableOneEvent)
    }

    function within(number, min, max) {
        return number < min ? min : number > max ? max : number
    }
    var dragMouseEvents = ["mousemove", "mouseup"],
        dragTouchEvents = ["touchmove", "touchend"],
        wheelEvent = document.implementation.hasFeature("Event.wheel", "3.0") ? "wheel" : "mousewheel",
        interactiveElements = ["INPUT", "SELECT", "TEXTAREA"],
        abs = Math.abs,
        sqrt = Math.sqrt,
        pow = Math.pow,
        round = Math.round,
        max = Math.max,
        scrollerFactory = (Math.min, function(frame, options) {
            function ensureSizeInfo() {
                requiresReflow && (requiresReflow = !1, frameSize = o.horizontal ? frame.offsetWidth : frame.offsetHeight, slideeSize = o.scrollWidth || Math.max(slideeElement[o.horizontal ? "offsetWidth" : "offsetHeight"], slideeElement[o.horizontal ? "scrollWidth" : "scrollHeight"]), self._pos.end = max(slideeSize - frameSize, 0))
            }

            function load(isInit) {
                if (requiresReflow = !0, !isInit) {
                    ensureSizeInfo();
                    var pos = self._pos;
                    self.slideTo(within(pos.dest, pos.start, pos.end))
                }
            }

            function initFrameResizeObserver() {
                var observerOptions = {};
                self.frameResizeObserver = new ResizeObserver(onResize, observerOptions), self.frameResizeObserver.observe(frame)
            }

            function nativeScrollTo(container, pos, immediate) {
                container.scroll ? o.horizontal ? container.scroll({
                    left: pos,
                    behavior: immediate ? "instant" : "smooth"
                }) : container.scroll({
                    top: pos,
                    behavior: immediate ? "instant" : "smooth"
                }) : !immediate && container.scrollTo ? o.horizontal ? container.scrollTo(Math.round(pos), 0) : container.scrollTo(0, Math.round(pos)) : o.horizontal ? container.scrollLeft = Math.round(pos) : container.scrollTop = Math.round(pos)
            }

            function setStyleProperty(elem, name, value, speed, resetTransition) {
                var style = elem.style;
                (resetTransition || browser.edge) && (style.transition = "none", elem.offsetWidth), style.transition = "transform " + speed + "ms ease-out", style[name] = value
            }

            function dispatchScrollEventIfNeeded() {
                o.dispatchScrollEvent && frame.dispatchEvent(new CustomEvent(self.getScrollEventName(), {
                    bubbles: !0,
                    cancelable: !1
                }))
            }

            function renderAnimateWithTransform(fromPosition, toPosition, immediate) {
                var speed = o.speed;
                immediate && (speed = o.immediateSpeed || 50), o.horizontal ? setStyleProperty(slideeElement, "transform", "translateX(" + -round(toPosition) + "px)", speed) : setStyleProperty(slideeElement, "transform", "translateY(" + -round(toPosition) + "px)", speed), self._pos.cur = toPosition, dispatchScrollEventIfNeeded()
            }

            function getBoundingClientRect(elem) {
                return elem.getBoundingClientRect ? elem.getBoundingClientRect() : {
                    top: 0,
                    left: 0
                }
            }

            function dragInitSlidee(event) {
                var isTouch = "touchstart" === event.type;
                if (!(dragging.init || !isTouch && isInteractive(event.target)) && (isTouch ? o.touchDragging : o.mouseDragging && event.which < 2)) {
                    isTouch || event.preventDefault(), dragging.released = 0, dragging.init = 0, dragging.source = event.target, dragging.touch = isTouch;
                    var pointer = isTouch ? event.touches[0] : event;
                    dragging.initX = pointer.pageX, dragging.initY = pointer.pageY, dragging.initPos = self._pos.cur, dragging.start = +new Date, dragging.time = 0, dragging.path = 0, dragging.delta = 0, dragging.locked = 0, dragging.pathToLock = isTouch ? 30 : 10, transform && (isTouch ? dragTouchEvents.forEach(function(eventName) {
                        dom.addEventListener(document, eventName, dragHandler, {
                            passive: !0
                        })
                    }) : dragMouseEvents.forEach(function(eventName) {
                        dom.addEventListener(document, eventName, dragHandler, {
                            passive: !0
                        })
                    }))
                }
            }

            function dragHandler(event) {
                dragging.released = "mouseup" === event.type || "touchend" === event.type;
                var pointer = dragging.touch ? event[dragging.released ? "changedTouches" : "touches"][0] : event;
                if (dragging.pathX = pointer.pageX - dragging.initX, dragging.pathY = pointer.pageY - dragging.initY, dragging.path = sqrt(pow(dragging.pathX, 2) + pow(dragging.pathY, 2)), dragging.delta = o.horizontal ? dragging.pathX : dragging.pathY, dragging.released || !(dragging.path < 1)) {
                    if (!dragging.init) {
                        if (dragging.path < o.dragThreshold) return dragging.released ? dragEnd() : void 0;
                        if (!(o.horizontal ? abs(dragging.pathX) > abs(dragging.pathY) : abs(dragging.pathX) < abs(dragging.pathY))) return dragEnd();
                        dragging.init = 1
                    }!dragging.locked && dragging.path > dragging.pathToLock && (dragging.locked = 1, dragging.source.addEventListener("click", disableOneEvent)), dragging.released && dragEnd(), self.slideTo(round(dragging.initPos - dragging.delta))
                }
            }

            function dragEnd() {
                dragging.released = !0, dragTouchEvents.forEach(function(eventName) {
                    dom.removeEventListener(document, eventName, dragHandler, {
                        passive: !0
                    })
                }), dragMouseEvents.forEach(function(eventName) {
                    dom.removeEventListener(document, eventName, dragHandler, {
                        passive: !0
                    })
                }), setTimeout(function() {
                    dragging.source.removeEventListener("click", disableOneEvent)
                }), dragging.init = 0
            }

            function isInteractive(element) {
                for (; element;) {
                    if (-1 !== interactiveElements.indexOf(element.tagName)) return !0;
                    element = element.parentNode
                }
                return !1
            }

            function normalizeWheelDelta(event) {
                return scrolling.curDelta = (o.horizontal ? event.deltaY || event.deltaX : event.deltaY) || -event.wheelDelta, transform && (scrolling.curDelta /= 1 === event.deltaMode ? 3 : 100), scrolling.curDelta
            }

            function scrollHandler(event) {
                ensureSizeInfo();
                var pos = self._pos;
                if (o.scrollBy && pos.start !== pos.end) {
                    var delta = normalizeWheelDelta(event);
                    transform ? (delta > 0 && pos.dest < pos.end || delta < 0 && (pos.dest, pos.start), self.slideBy(o.scrollBy * delta)) : (isSmoothScrollSupported && (delta *= 12), o.horizontal ? nativeScrollElement.scrollLeft += delta : nativeScrollElement.scrollTop += delta)
                }
            }

            function onResize(entries) {
                var entry = entries[0];
                if (entry) {
                    var newRect = entry.contentRect;
                    if (0 === newRect.width || 0 === newRect.height) return;
                    newRect.width === contentRect.width && newRect.height === contentRect.height || (contentRect = newRect, load(!1))
                }
            }

            function resetScroll() {
                o.horizontal ? this.scrollLeft = 0 : this.scrollTop = 0
            }

            function onFrameClick(e) {
                if (1 === e.which) {
                    var focusableParent = focusManager.focusableParent(e.target);
                    focusableParent && focusableParent !== document.activeElement && focusableParent.focus()
                }
            }
            var o = Object.assign({}, {
                    slidee: null,
                    horizontal: !1,
                    mouseWheel: !0,
                    scrollBy: 0,
                    dragSource: null,
                    mouseDragging: 1,
                    touchDragging: 1,
                    dragThreshold: 3,
                    intervactive: null,
                    speed: 0
                }, options),
                isSmoothScrollSupported = "scrollBehavior" in document.documentElement.style;
            !1 === options.allowNativeScroll ? options.enableNativeScroll = !1 : isSmoothScrollSupported && (browser.firefox && !layoutManager.tv || options.allowNativeSmoothScroll) ? options.enableNativeScroll = !0 : options.requireAnimation && (browser.animate || browser.supportsCssAnimation()) ? options.enableNativeScroll = !1 : layoutManager.tv && browser.animate || (options.enableNativeScroll = !0), browser.web0s && (options.enableNativeScroll = !0);
            var self = this;
            self.options = o;
            var slideeElement = o.slidee ? o.slidee : function(n, elem) {
                for (var matched = []; n; n = n.nextSibling) 1 === n.nodeType && n !== elem && matched.push(n);
                return matched
            }(frame.firstChild)[0];
            self._pos = {
                start: 0,
                center: 0,
                end: 0,
                cur: 0,
                dest: 0
            };
            var transform = !options.enableNativeScroll,
                scrollSource = frame,
                dragSourceElement = o.dragSource ? o.dragSource : frame,
                dragging = {
                    released: 1
                },
                scrolling = {
                    last: 0,
                    delta: 0,
                    resetTime: 200
                };
            self.initialized = 0, self.slidee = slideeElement, self.options = o, self.dragging = dragging;
            var nativeScrollElement = frame,
                requiresReflow = !0,
                frameSize = 0,
                slideeSize = 0;
            self.reload = function() {
                load()
            }, self.getScrollEventName = function() {
                return transform ? "scrollanimate" : "scroll"
            }, self.getScrollSlider = function() {
                return slideeElement
            }, self.getScrollFrame = function() {
                return frame
            };
            var lastAnimate;
            self.slideTo = function(newPos, immediate, fullItemPos) {
                ensureSizeInfo();
                var pos = self._pos;
                if (newPos = within(newPos, pos.start, pos.end), !transform) return void nativeScrollTo(nativeScrollElement, newPos, immediate);
                var from = pos.cur;
                immediate = immediate || dragging.init || !o.speed;
                var now = (new Date).getTime();
                o.autoImmediate && !immediate && now - (lastAnimate || 0) <= 50 && (immediate = !0), !immediate && o.skipSlideToWhenVisible && fullItemPos && fullItemPos.isVisible || newPos !== pos.dest && (pos.dest = newPos, renderAnimateWithTransform(from, newPos, immediate), lastAnimate = now)
            }, self.getPos = function(item) {
                var scrollElement = transform ? slideeElement : nativeScrollElement,
                    slideeOffset = getBoundingClientRect(scrollElement),
                    itemOffset = getBoundingClientRect(item),
                    offset = (o.horizontal ? slideeOffset.left : slideeOffset.top, o.horizontal ? slideeOffset.right : slideeOffset.bottom, o.horizontal ? itemOffset.left - slideeOffset.left : itemOffset.top - slideeOffset.top),
                    size = o.horizontal ? itemOffset.width : itemOffset.height;
                size || 0 === size || (size = item[o.horizontal ? "offsetWidth" : "offsetHeight"]);
                var centerOffset = o.centerOffset || 0;
                transform || (centerOffset = 0, o.horizontal ? offset += nativeScrollElement.scrollLeft : offset += nativeScrollElement.scrollTop), ensureSizeInfo();
                var currentStart = self._pos.cur,
                    currentEnd = currentStart + frameSize;
                return {
                    start: offset,
                    center: offset + centerOffset - frameSize / 2 + size / 2,
                    end: offset - frameSize + size,
                    size: size,
                    isVisible: offset >= currentStart && offset + size <= currentEnd
                }
            }, self.getCenterPosition = function(item) {
                ensureSizeInfo();
                var pos = self.getPos(item);
                return within(pos.center, pos.start, pos.end)
            }, self.destroy = function() {
                return self.frameResizeObserver && (self.frameResizeObserver.disconnect(), self.frameResizeObserver = null), dom.removeEventListener(frame, "scroll", resetScroll, {
                    passive: !0
                }), dom.removeEventListener(scrollSource, wheelEvent, scrollHandler, {
                    passive: !0
                }), dom.removeEventListener(dragSourceElement, "touchstart", dragInitSlidee, {
                    passive: !0
                }), dom.removeEventListener(frame, "click", onFrameClick, {
                    passive: !0,
                    capture: !0
                }), dom.removeEventListener(dragSourceElement, "mousedown", dragInitSlidee, {}), self.initialized = 0, self
            };
            var contentRect = {};
            self.getScrollPosition = function() {
                return transform ? self._pos.cur : o.horizontal ? nativeScrollElement.scrollLeft : nativeScrollElement.scrollTop
            }, self.getScrollSize = function() {
                return transform ? slideeSize : o.horizontal ? nativeScrollElement.scrollWidth : nativeScrollElement.scrollHeight
            }, self.init = function() {
                if (!self.initialized) return transform ? (frame.style.overflow = "hidden", slideeElement.style["will-change"] = "transform", slideeElement.style.transition = "transform " + o.speed + "ms ease-out", o.horizontal ? slideeElement.classList.add("animatedScrollX") : slideeElement.classList.add("animatedScrollY")) : o.horizontal ? (layoutManager.desktop && !o.hideScrollbar ? nativeScrollElement.classList.add("scrollX") : (nativeScrollElement.classList.add("scrollX"), nativeScrollElement.classList.add("hiddenScrollX"), layoutManager.tv && !1 !== o.allowNativeSmoothScroll && nativeScrollElement.classList.add("smoothScrollX")), o.forceHideScrollbars && nativeScrollElement.classList.add("hiddenScrollX-forced")) : (layoutManager.desktop && !o.hideScrollbar ? nativeScrollElement.classList.add("scrollY") : (nativeScrollElement.classList.add("scrollY"), nativeScrollElement.classList.add("hiddenScrollY"), layoutManager.tv && !1 !== o.allowNativeSmoothScroll && nativeScrollElement.classList.add("smoothScrollY")), o.forceHideScrollbars && nativeScrollElement.classList.add("hiddenScrollY-forced")), (transform || layoutManager.tv) && dom.addEventListener(dragSourceElement, "mousedown", dragInitSlidee, {}), initFrameResizeObserver(), transform ? (dom.addEventListener(dragSourceElement, "touchstart", dragInitSlidee, {
                    passive: !0
                }), o.horizontal || dom.addEventListener(frame, "scroll", resetScroll, {
                    passive: !0
                }), o.mouseWheel && dom.addEventListener(scrollSource, wheelEvent, scrollHandler, {
                    passive: !0
                })) : o.horizontal && o.mouseWheel && dom.addEventListener(scrollSource, wheelEvent, scrollHandler, {
                    passive: !0
                }), dom.addEventListener(frame, "click", onFrameClick, {
                    passive: !0,
                    capture: !0
                }), self.initialized = 1, load(!0), self
            }
        });
    return scrollerFactory.prototype.slideBy = function(delta, immediate) {
        delta && this.slideTo(this._pos.dest + delta, immediate)
    }, scrollerFactory.prototype.to = function(location, item, immediate) {
        if ("boolean" === type(item) && (immediate = item, item = void 0), void 0 === item) this.slideTo(this._pos[location], immediate);
        else {
            var itemPos = this.getPos(item);
            itemPos && this.slideTo(itemPos[location], immediate, itemPos)
        }
    }, scrollerFactory.prototype.toStart = function(item, immediate) {
        this.to("start", item, immediate)
    }, scrollerFactory.prototype.toEnd = function(item, immediate) {
        this.to("end", item, immediate)
    }, scrollerFactory.prototype.toCenter = function(item, immediate) {
        this.to("center", item, immediate)
    }, scrollerFactory.create = function(frame, options) {
        var instance = new scrollerFactory(frame, options);
        return Promise.resolve(instance)
    }, scrollerFactory
});