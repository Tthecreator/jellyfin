define(["jQuery", "loading", "libraryMenu", "fnchecked", "emby-select"], function($, loading, libraryMenu) {
    "use strict";

    function loadPage(page, config) {
        $("#txtSyncTempPath", page).val(config.TemporaryPath || ""), $("#txtUploadSpeedLimit", page).val(config.UploadSpeedLimitBytes / 1e6 || ""), $("#selectThreadCount", page).val(config.TranscodingCpuCoreLimit), $("#chkEnableFullSpeedConversion", page).checked(config.EnableFullSpeedTranscoding), loading.hide()
    }

    function onSubmit() {
        loading.show();
        var form = this;
        return ApiClient.getNamedConfiguration("sync").then(function(config) {
            config.TemporaryPath = $("#txtSyncTempPath", form).val(), config.UploadSpeedLimitBytes = parseInt(1e6 * parseFloat($("#txtUploadSpeedLimit", form).val() || "0")), config.TranscodingCpuCoreLimit = parseInt($("#selectThreadCount", form).val()), config.EnableFullSpeedTranscoding = $("#chkEnableFullSpeedConversion", form).checked(), ApiClient.updateNamedConfiguration("sync", config).then(Dashboard.processServerConfigurationUpdateResult)
        }), !1
    }

    function getTabs() {
        return [{
            href: "syncactivity.html",
            name: Globalize.translate("TabSyncJobs")
        }, {
            href: "appservices.html?context=sync",
            name: Globalize.translate("TabServices")
        }, {
            href: "syncsettings.html",
            name: Globalize.translate("TabSettings")
        }]
    }
    $(document).on("pageinit", "#syncSettingsPage", function() {
        var page = this;
        $("#btnSelectSyncTempPath", page).on("click.selectDirectory", function() {
            require(["directorybrowser"], function(directoryBrowser) {
                var picker = new directoryBrowser;
                picker.show({
                    callback: function(path) {
                        path && $("#txtSyncTempPath", page).val(path), picker.close()
                    },
                    validateWriteable: !0
                })
            })
        }), $(".syncSettingsForm").off("submit", onSubmit).on("submit", onSubmit)
    }).on("pageshow", "#syncSettingsPage", function() {
        loading.show(), libraryMenu.setTabs("syncadmin", 2, getTabs);
        var page = this;
        ApiClient.getNamedConfiguration("sync").then(function(config) {
            loadPage(page, config)
        })
    })
});