define(["dialogHelper", "layoutManager", "globalize", "require", "paper-icon-button-light", "emby-input", "emby-select", "css!./../formdialog"], function(dialogHelper, layoutManager, globalize, require) {
    "use strict";

    function centerFocus(elem, horiz, on) {
        require(["scrollHelper"], function(scrollHelper) {
            var fn = on ? "on" : "off";
            scrollHelper.centerFocus[fn](elem, horiz)
        })
    }

    function show(person) {
        return new Promise(function(resolve, reject) {
            require(["text!./personeditor.template.html"], function(template) {
                var dialogOptions = {
                    removeOnClose: !0,
                    scrollY: !1
                };
                layoutManager.tv ? dialogOptions.size = "fullscreen" : dialogOptions.size = "medium-tall";
                var dlg = dialogHelper.createDialog(dialogOptions);
                dlg.classList.add("formDialog");
                var html = "",
                    submitted = !1;
                html += globalize.translateDocument(template, "sharedcomponents"), dlg.innerHTML = html, dlg.querySelector(".txtPersonName", dlg).value = person.Name || "", dlg.querySelector(".selectPersonType", dlg).value = person.Type || "", dlg.querySelector(".txtPersonRole", dlg).value = person.Role || "", layoutManager.tv && centerFocus(dlg.querySelector(".formDialogContent"), !1, !0), dialogHelper.open(dlg), dlg.addEventListener("close", function() {
                    layoutManager.tv && centerFocus(dlg.querySelector(".formDialogContent"), !1, !1), submitted ? resolve(person) : reject()
                }), dlg.querySelector(".selectPersonType").addEventListener("change", function(e) {
                    "Actor" === this.value ? dlg.querySelector(".fldRole").classList.remove("hide") : dlg.querySelector(".fldRole").classList.add("hide")
                }), dlg.querySelector(".btnCancel").addEventListener("click", function(e) {
                    dialogHelper.close(dlg)
                }), dlg.querySelector("form").addEventListener("submit", function(e) {
                    return submitted = !0, person.Name = dlg.querySelector(".txtPersonName", dlg).value, person.Type = dlg.querySelector(".selectPersonType", dlg).value, person.Role = dlg.querySelector(".txtPersonRole", dlg).value || null, dialogHelper.close(dlg), e.preventDefault(), !1
                }), dlg.querySelector(".selectPersonType").dispatchEvent(new CustomEvent("change", {
                    bubbles: !0
                }))
            })
        })
    }
    return {
        show: show
    }
});