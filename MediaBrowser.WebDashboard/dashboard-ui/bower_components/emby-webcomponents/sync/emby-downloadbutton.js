define(["connectionManager", "serverNotifications", "events", "globalize", "emby-button"], function(connectionManager, serverNotifications, events, globalize, EmbyButtonPrototype) {
    "use strict";

    function onClick(e) {
        var button = this,
            id = button.getAttribute("data-id"),
            serverId = button.getAttribute("data-serverid"),
            apiClient = connectionManager.getApiClient(serverId);
        button.classList.contains("downloadbutton-on") ? require(["confirm"], function(confirm) {
            confirm({
                text: globalize.translate("sharedcomponents#ConfirmRemoveDownload"),
                confirmText: globalize.translate("sharedcomponents#RemoveDownload"),
                cancelText: globalize.translate("sharedcomponents#KeepDownload"),
                primary: "cancel"
            }).then(function() {
                apiClient.cancelSyncItems([id]), button.dispatchEvent(new CustomEvent("download-cancel", {
                    cancelable: !1
                }))
            })
        }) : require(["syncDialog"], function(syncDialog) {
            syncDialog.showMenu({
                items: [id],
                mode: "download",
                serverId: serverId
            }).then(function() {
                button.dispatchEvent(new CustomEvent("download", {
                    cancelable: !1
                }))
            })
        })
    }

    function updateSyncStatus(button, syncPercent) {
        var icon = button.iconElement;
        icon || (button.iconElement = button.querySelector("i"), icon = button.iconElement), null != syncPercent ? (button.classList.add("downloadbutton-on"), icon && icon.classList.add("downloadbutton-icon-on")) : (button.classList.remove("downloadbutton-on"), icon && icon.classList.remove("downloadbutton-icon-on")), (syncPercent || 0) >= 100 ? (button.classList.add("downloadbutton-complete"), icon && icon.classList.add("downloadbutton-icon-complete")) : (button.classList.remove("downloadbutton-complete"), icon && icon.classList.remove("downloadbutton-icon-complete"));
        var text;
        text = (syncPercent || 0) >= 100 ? globalize.translate("sharedcomponents#Downloaded") : null != syncPercent ? globalize.translate("sharedcomponents#Downloading") : globalize.translate("sharedcomponents#Download");
        var textElement = button.querySelector(".emby-downloadbutton-downloadtext");
        textElement && (textElement.innerHTML = text), button.title = text
    }

    function clearEvents(button) {
        button.removeEventListener("click", onClick)
    }

    function bindEvents(button) {
        clearEvents(button), button.addEventListener("click", onClick)
    }

    function fetchAndUpdate(button, item) {
        connectionManager.getApiClient(item.ServerId).getSyncStatus(item.Id).then(function(result) {
            updateSyncStatus(button, result.Progress)
        }, function() {})
    }
    var EmbyDownloadButtonPrototype = Object.create(EmbyButtonPrototype);
    EmbyDownloadButtonPrototype.createdCallback = function() {
        EmbyButtonPrototype.createdCallback && EmbyButtonPrototype.createdCallback.call(this)
    }, EmbyDownloadButtonPrototype.attachedCallback = function() {
        EmbyButtonPrototype.attachedCallback && EmbyButtonPrototype.attachedCallback.call(this);
        var itemId = this.getAttribute("data-id"),
            serverId = this.getAttribute("data-serverid");
        itemId && serverId && bindEvents(this)
    }, EmbyDownloadButtonPrototype.detachedCallback = function() {
        EmbyButtonPrototype.detachedCallback && EmbyButtonPrototype.detachedCallback.call(this), clearEvents(this), this.iconElement = null
    }, EmbyDownloadButtonPrototype.setItem = function(item) {
        item ? (this.setAttribute("data-id", item.Id), this.setAttribute("data-serverid", item.ServerId), fetchAndUpdate(this, item), bindEvents(this)) : (this.removeAttribute("data-id"), this.removeAttribute("data-serverid"), clearEvents(this))
    }, document.registerElement("emby-downloadbutton", {
        prototype: EmbyDownloadButtonPrototype,
        extends: "button"
    })
});