define(["alfresco/core/topics",
        "alvex/services/BaseUploadService",
        "dojo/_base/declare",
        "dojo/_base/lang",
        "dojo/Deferred",
        "alvex/upload/UploadMonitor"],
    function(topics, BaseUploadService, declare, lang, Deferred) {

        // Declare and return the class
        return declare([BaseUploadService], {
            i18nRequirements: [{i18nFile: "./i18n/FileUploadService.properties"}],
            closeButtonLabel: "upload-panel.close.label",
            minimiseButtonLabel: "upload-panel.minimise.label",
            restoreButtonLabel: "upload-panel.restore.label",
            uploadsContainerTitleUpdateTopic: topics.STICKY_PANEL_SET_TITLE,
            widgetsForUploadDisplay: [{
                name: "alvex/upload/UploadMonitor"
            }],
            resetTotalUploads: function alvex_services_FileUploadService__resetTotalUploads() {
                this.inherited(arguments);
                this.alfServicePublish(topics.STICKY_PANEL_ENABLE_CLOSE);
            },
            registerSubscriptions: function alvex_services_FileUploadService__registerSubscriptions() {
                this.inherited(arguments);
                this.alfSubscribe(topics.STICKY_PANEL_CLOSED, lang.hitch(this, this.onUploadsContainerClosed), true);
            },
            showUploadsWidget: function alvex_services_FileUploadService__showUploadsWidget() {
                var dfd = new Deferred();
                var widgetsForUploadDisplay = this.processWidgetsForUploadDisplay();
                this.alfServicePublish(topics.DISPLAY_STICKY_PANEL, {
                    title: this.message(this.uploadsContainerTitle, 0),
                    closeButtonLabel: this.message(this.closeButtonLabel),
                    minimiseButtonLabel: this.message(this.minimiseButtonLabel),
                    restoreButtonLabel: this.message(this.restoreButtonLabel),
                    padding: 0,
                    widgets: widgetsForUploadDisplay,
                    callback: lang.hitch(this, function(panel) {
                        this.uploadsContainer = panel;
                        dfd.resolve();
                    })
                });
                this.alfServicePublish(topics.STICKY_PANEL_DISABLE_CLOSE);
                return dfd.promise;
            }
        });
    });
