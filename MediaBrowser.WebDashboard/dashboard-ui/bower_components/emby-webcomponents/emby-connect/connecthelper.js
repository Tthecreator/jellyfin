define(["globalize", "apphost", "loading", "alert", "emby-linkbutton"], function(globalize, appHost, loading, alert) {
    "use strict";

    function resolvePromise() {
        return Promise.resolve()
    }

    function rejectPromise() {
        return Promise.reject()
    }

    function showNewUserInviteMessage(result) {
        if (!result.IsNewUserInvitation && !result.IsPending) return Promise.resolve();
        var message = result.IsNewUserInvitation ? globalize.translate("sharedcomponents#MessageInvitationSentToNewUser", result.GuestDisplayName) : globalize.translate("sharedcomponents#MessageInvitationSentToUser", result.GuestDisplayName);
        return alert({
            text: message,
            title: globalize.translate("sharedcomponents#HeaderInvitationSent")
        }).then(resolvePromise, resolvePromise)
    }

    function inviteGuest(options) {
        var apiClient = options.apiClient;
        return loading.show(), apiClient.ajax({
            type: "POST",
            url: apiClient.getUrl("Connect/Invite"),
            dataType: "json",
            data: options.guestOptions || {}
        }).then(function(result) {
            return loading.hide(), showNewUserInviteMessage(result)
        }, function(response) {
            loading.hide();
            var statusCode = response ? response.status : 0;
            return 502 === statusCode ? showConnectServerUnreachableErrorMessage().then(rejectPromise, rejectPromise) : 404 === statusCode ? alert({
                text: globalize.translate("sharedcomponents#GuestUserNotFound")
            }).then(rejectPromise, rejectPromise) : (statusCode || 0) >= 500 ? alert({
                text: globalize.translate("sharedcomponents#ErrorReachingEmbyConnect")
            }).then(rejectPromise, rejectPromise) : showGuestGeneralErrorMessage().then(rejectPromise, rejectPromise)
        })
    }

    function showGuestGeneralErrorMessage() {
        var html;
        appHost.supports("externallinks") && (html = globalize.translate("sharedcomponents#ErrorAddingGuestAccount1", '<a is="emby-linkbutton" class="button-link" href="https://github.com/jellyfin/jellyfin" target="_blank">https://github.com/jellyfin/jellyfin</a>'), html += "<br/><br/>" + globalize.translate("sharedcomponents#ErrorAddingGuestAccount2", "apps@emby.media"));
        var text = globalize.translate("sharedcomponents#ErrorAddingGuestAccount1", "https://github.com/jellyfin/jellyfin");
        return text += "\n\n" + globalize.translate("sharedcomponents#ErrorAddingGuestAccount2", "apps@emby.media"), alert({
            text: text,
            html: html
        })
    }

    function showConnectServerUnreachableErrorMessage() {
        var text = globalize.translate("sharedcomponents#ErrorConnectServerUnreachable", "https://connect.emby.media");
        return alert({
            text: text
        })
    }

    function showLinkUserErrorMessage(username, statusCode) {
        var html, text;
        return 502 === statusCode ? showConnectServerUnreachableErrorMessage() : (username ? (appHost.supports("externallinks") && (html = globalize.translate("sharedcomponents#ErrorAddingEmbyConnectAccount1", '<a is="emby-linkbutton" class="button-link" href="https://github.com/jellyfin/jellyfin" target="_blank">https://github.com/jellyfin/jellyfin</a>'), html += "<br/><br/>" + globalize.translate("sharedcomponents#ErrorAddingEmbyConnectAccount2", "apps@emby.media")), text = globalize.translate("sharedcomponents#ErrorAddingEmbyConnectAccount1", "https://github.com/jellyfin/jellyfin"), text += "\n\n" + globalize.translate("sharedcomponents#ErrorAddingEmbyConnectAccount2", "apps@emby.media")) : html = text = globalize.translate("sharedcomponents#DefaultErrorMessage"), alert({
            text: text,
            html: html
        }))
    }

    function updateUserLink(apiClient, user, newConnectUsername) {
        var currentConnectUsername = user.ConnectUserName || "",
            enteredConnectUsername = newConnectUsername,
            linkUrl = apiClient.getUrl("Users/" + user.Id + "/Connect/Link");
        return currentConnectUsername && !enteredConnectUsername ? apiClient.ajax({
            type: "DELETE",
            url: linkUrl
        }).then(function() {
            return alert({
                text: globalize.translate("sharedcomponents#MessageEmbyAccontRemoved"),
                title: globalize.translate("sharedcomponents#HeaderEmbyAccountRemoved")
            }).catch(resolvePromise)
        }, function(response) {
            return 502 === (response ? response.status : 0) ? showConnectServerUnreachableErrorMessage().then(rejectPromise) : alert({
                text: globalize.translate("sharedcomponents#ErrorRemovingEmbyConnectAccount")
            }).then(rejectPromise)
        }) : currentConnectUsername !== enteredConnectUsername ? apiClient.ajax({
            type: "POST",
            url: linkUrl,
            data: {
                ConnectUsername: enteredConnectUsername
            },
            dataType: "json"
        }).then(function(result) {
            var msgKey = result.IsPending ? "sharedcomponents#MessagePendingEmbyAccountAdded" : "sharedcomponents#MessageEmbyAccountAdded";
            return alert({
                text: globalize.translate(msgKey),
                title: globalize.translate("sharedcomponents#HeaderEmbyAccountAdded")
            }).catch(resolvePromise)
        }, function(response) {
            var statusCode = response ? response.status : 0;
            return 502 === statusCode ? showConnectServerUnreachableErrorMessage().then(rejectPromise) : showLinkUserErrorMessage(".", statusCode).then(rejectPromise)
        }) : Promise.reject()
    }
    return {
        inviteGuest: inviteGuest,
        updateUserLink: updateUserLink,
        showLinkUserErrorMessage: showLinkUserErrorMessage,
        showConnectServerUnreachableErrorMessage: showConnectServerUnreachableErrorMessage
    }
});