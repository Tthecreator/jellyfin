define(["focusManager", "layoutManager", "dom", "css!./style.css", "paper-icon-button-light", "material-icons"], function(focusManager, layoutManager, dom) {
    "use strict";

    function focus() {
        var scope = this,
            selected = scope.querySelector("." + selectedButtonClass);
        selected ? focusManager.focus(selected) : focusManager.autoFocus(scope, !0)
    }

    function getAlphaPickerButtonClassName(vertical) {
        var alphaPickerButtonClassName = "alphaPickerButton";
        return layoutManager.tv && (alphaPickerButtonClassName += " alphaPickerButton-tv"), vertical && (alphaPickerButtonClassName += " alphaPickerButton-vertical"), alphaPickerButtonClassName
    }

    function getLetterButton(l, vertical) {
        return '<button data-value="' + l + '" class="' + getAlphaPickerButtonClassName(vertical) + '">' + l + "</button>"
    }

    function mapLetters(letters, vertical) {
        return letters.map(function(l) {
            return getLetterButton(l, vertical)
        })
    }

    function render(element, options) {
        element.classList.add("alphaPicker"), layoutManager.tv && element.classList.add("alphaPicker-tv");
        var vertical = element.classList.contains("alphaPicker-vertical");
        vertical || element.classList.add("focuscontainer-x");
        var letters, html = "",
            alphaPickerButtonClassName = getAlphaPickerButtonClassName(vertical),
            rowClassName = "alphaPickerRow";
        vertical && (rowClassName += " alphaPickerRow-vertical"), html += '<div class="' + rowClassName + '">', "keyboard" === options.mode ? html += '<button data-value=" " is="paper-icon-button-light" class="' + alphaPickerButtonClassName + '"><i class="md-icon alphaPickerButtonIcon">&#xE256;</i></button>' : (letters = ["#"], html += mapLetters(letters, vertical).join("")), letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"], html += mapLetters(letters, vertical).join(""), "keyboard" === options.mode ? (html += '<button data-value="backspace" is="paper-icon-button-light" class="' + alphaPickerButtonClassName + '"><i class="md-icon alphaPickerButtonIcon">&#xE14A;</i></button>', html += "</div>", letters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], html += '<div class="' + rowClassName + '">', html += "<br/>", html += mapLetters(letters, vertical).join(""), html += "</div>") : html += "</div>", element.innerHTML = html, element.classList.add("focusable"), element.focus = focus
    }

    function AlphaPicker(options) {
        function onItemFocusTimeout() {
            itemFocusTimeout = null, self.value(itemFocusValue)
        }

        function onAlphaFocusTimeout() {
            if (alphaFocusTimeout = null, document.activeElement === alphaFocusedElement) {
                var value = alphaFocusedElement.getAttribute("data-value");
                self.value(value, !0)
            }
        }

        function onAlphaPickerInKeyboardModeClick(e) {
            var alphaPickerButton = dom.parentWithClass(e.target, "alphaPickerButton");
            if (alphaPickerButton) {
                var value = alphaPickerButton.getAttribute("data-value");
                element.dispatchEvent(new CustomEvent("alphavalueclicked", {
                    cancelable: !1,
                    detail: {
                        value: value
                    }
                }))
            }
        }

        function onAlphaPickerClick(e) {
            var alphaPickerButton = dom.parentWithClass(e.target, "alphaPickerButton");
            if (alphaPickerButton) {
                var value = alphaPickerButton.getAttribute("data-value");
                (this._currentValue || "").toUpperCase() === value.toUpperCase() ? self.value(null, !0) : self.value(value, !0)
            }
        }

        function onAlphaPickerFocusIn(e) {
            alphaFocusTimeout && (clearTimeout(alphaFocusTimeout), alphaFocusTimeout = null);
            var alphaPickerButton = dom.parentWithClass(e.target, "alphaPickerButton");
            alphaPickerButton && (alphaFocusedElement = alphaPickerButton, alphaFocusTimeout = setTimeout(onAlphaFocusTimeout, 600))
        }

        function onItemsFocusIn(e) {
            var item = dom.parentWithClass(e.target, itemClass);
            if (item) {
                var prefix = item.getAttribute("data-prefix");
                prefix && prefix.length && (itemFocusValue = prefix[0], itemFocusTimeout && clearTimeout(itemFocusTimeout), itemFocusTimeout = setTimeout(onItemFocusTimeout, 100))
            }
        }
        var self = this;
        this.options = options;
        var itemFocusValue, itemFocusTimeout, alphaFocusedElement, alphaFocusTimeout, element = options.element,
            itemsContainer = options.itemsContainer,
            itemClass = options.itemClass;
        self.enabled = function(enabled) {
            enabled ? (itemsContainer && itemsContainer.addEventListener("focus", onItemsFocusIn, !0), "keyboard" === options.mode && element.addEventListener("click", onAlphaPickerInKeyboardModeClick), "click" !== options.valueChangeEvent ? element.addEventListener("focus", onAlphaPickerFocusIn, !0) : element.addEventListener("click", onAlphaPickerClick.bind(this))) : (itemsContainer && itemsContainer.removeEventListener("focus", onItemsFocusIn, !0), element.removeEventListener("click", onAlphaPickerInKeyboardModeClick), element.removeEventListener("focus", onAlphaPickerFocusIn, !0), element.removeEventListener("click", onAlphaPickerClick.bind(this)))
        }, render(element, options), this.enabled(!0), this.visible(!0)
    }
    var selectedButtonClass = "alphaPickerButton-selected";
    return AlphaPicker.prototype.value = function(value, applyValue) {
        var btn, selected, element = this.options.element;
        if (void 0 !== value)
            if (null != value) {
                if (value = value.toUpperCase(), this._currentValue = value, "keyboard" !== this.options.mode) {
                    selected = element.querySelector("." + selectedButtonClass);
                    try {
                        btn = element.querySelector(".alphaPickerButton[data-value='" + value + "']")
                    } catch (err) {
                        console.log("Error in querySelector: " + err)
                    }
                    btn && btn !== selected && btn.classList.add(selectedButtonClass), selected && selected !== btn && selected.classList.remove(selectedButtonClass)
                }
            } else this._currentValue = value, (selected = element.querySelector("." + selectedButtonClass)) && selected.classList.remove(selectedButtonClass);
        return applyValue && element.dispatchEvent(new CustomEvent("alphavaluechanged", {
            cancelable: !1,
            detail: {
                value: value
            }
        })), this._currentValue
    }, AlphaPicker.prototype.on = function(name, fn) {
        this.options.element.addEventListener(name, fn)
    }, AlphaPicker.prototype.off = function(name, fn) {
        this.options.element.removeEventListener(name, fn)
    }, AlphaPicker.prototype.visible = function(visible) {
        this.options.element.style.visibility = visible ? "visible" : "hidden"
    }, AlphaPicker.prototype.values = function() {
        for (var element = this.options.element, elems = element.querySelectorAll(".alphaPickerButton"), values = [], i = 0, length = elems.length; i < length; i++) values.push(elems[i].getAttribute("data-value"));
        return values
    }, AlphaPicker.prototype.focus = function() {
        var element = this.options.element;
        focusManager.autoFocus(element, !0)
    }, AlphaPicker.prototype.destroy = function() {
        var element = this.options.element;
        this.enabled(!1), element.classList.remove("focuscontainer-x"), this.options = null
    }, AlphaPicker
});