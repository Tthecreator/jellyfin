define(["layoutManager", "browser", "css!./emby-textarea", "registerElement", "emby-input"], function(layoutManager, browser) {
    "use strict";

    function autoGrow(textarea, maxLines) {
        function reset() {
            textarea.rows = 1, offset = self.getOffset(textarea), self.rows = textarea.rows || 1, self.lineHeight = textarea.scrollHeight / self.rows - offset / self.rows, self.maxAllowedHeight = self.lineHeight * maxLines - offset
        }

        function autogrowFn() {
            if ((!self.lineHeight || self.lineHeight <= 0) && reset(), self.lineHeight <= 0) return textarea.style.overflowY = "scroll", textarea.style.height = "auto", void(textarea.rows = 3);
            var newHeight = 0;
            textarea.scrollHeight - offset > self.maxAllowedHeight ? (textarea.style.overflowY = "scroll", newHeight = self.maxAllowedHeight) : (textarea.style.overflowY = "hidden", textarea.style.height = "auto", newHeight = textarea.scrollHeight), textarea.style.height = newHeight + "px"
        }
        var self = this;
        void 0 === maxLines && (maxLines = 999), self.getOffset = function(textarea) {
            for (var style = window.getComputedStyle(textarea, null), props = ["paddingTop", "paddingBottom"], offset = 0, i = 0; i < props.length; i++) offset += parseInt(style[props[i]]);
            return offset
        };
        var offset;
        textarea.addEventListener("input", autogrowFn), textarea.addEventListener("focus", autogrowFn), textarea.addEventListener("valueset", autogrowFn), autogrowFn()
    }
    var EmbyTextAreaPrototype = Object.create(HTMLTextAreaElement.prototype),
        elementId = 0;
    if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
        var descriptor = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");
        if (descriptor && descriptor.configurable) {
            var baseSetMethod = descriptor.set;
            descriptor.set = function(value) {
                baseSetMethod.call(this, value), this.dispatchEvent(new CustomEvent("valueset", {
                    bubbles: !1,
                    cancelable: !1
                }))
            }, Object.defineProperty(HTMLTextAreaElement.prototype, "value", descriptor)
        }
    }
    EmbyTextAreaPrototype.createdCallback = function() {
        this.id || (this.id = "embytextarea" + elementId, elementId++)
    }, EmbyTextAreaPrototype.attachedCallback = function() {
        if (!this.classList.contains("emby-textarea")) {
            this.rows = 1, this.classList.add("emby-textarea");
            var parentNode = this.parentNode,
                label = this.ownerDocument.createElement("label");
            label.innerHTML = this.getAttribute("label") || "", label.classList.add("textareaLabel"), label.htmlFor = this.id, parentNode.insertBefore(label, this), this.addEventListener("focus", function() {
                label.classList.add("textareaLabelFocused"), label.classList.remove("textareaLabelUnfocused")
            }), this.addEventListener("blur", function() {
                label.classList.remove("textareaLabelFocused"), label.classList.add("textareaLabelUnfocused")
            }), this.label = function(text) {
                label.innerHTML = text
            }, new autoGrow(this)
        }
    }, document.registerElement("emby-textarea", {
        prototype: EmbyTextAreaPrototype,
        extends: "textarea"
    })
});