define(["alfresco/forms/controls/BaseFormControl",
        "dojo/_base/declare",
        "alfresco/core/CoreWidgetProcessing",
        "service/constants/Default",
        "dojo/_base/lang",
        "dojo/_base/array",
        "jquery",
        "alfresco/core/ObjectTypeUtils",
        "alfresco/core/topics"
    ],
    function(BaseFormControl, declare, CoreWidgetProcessing, AlfConstants, lang, array, $, ObjectTypeUtils, topics) {
        return declare([BaseFormControl, CoreWidgetProcessing], {
            allSites: null,
            favouriteSites: null,
            recentSites: null,
            repositoryRootNode: "alfresco://company/home",
            selectedFiles: null,
            showAllSites: true,
            showFavouriteSites: true,
            showRecentSites: true,
            showSearch: true,
            showRepository: true,
            i18nRequirements: [{i18nFile: "./i18n/FileUploader.properties"}],
            itemKeyProperty: "nodeRef",
            multipleItemMode: false,
            itemsToShow: null,
            filterMimeType: "",
            valueDelimiter: ",",
            configureValidation: function alvex_forms_controls_FileUploader__configureValidation() {
                if (this.requirementConfig && this.requirementConfig.initialValue === true) {
                    if (!this.validationConfig || !ObjectTypeUtils.isArray(this.validationConfig)) {
                        this.validationConfig = [];
                    }
                    this.validationConfig.push({
                        validation: "minLength",
                        length: 1,
                        errorMessage: "uploader.error.mandatory"
                    });
                }
            },
            setupSubTopics: function alvex_forms_controls__FileUploader_setupSubTopics () {
                this.updateSelectedItemsTopic = this.generateUuid() + "_updateSelectedItemsTopic";
                this.removeItemTopic = this.generateUuid() + "_removeItemTopic";
                this.detailsItemTopic = this.generateUuid() + "_detailsItemTopic";
                this.alfSubscribe(this.detailsItemTopic, lang.hitch(this, this.onItemDetails), true);
                this.alfSubscribe(this.removeItemTopic, lang.hitch(this, this.onItemRemoved), true);
                this.alvexUploadResponseTopic = this.generateUuid();
                this.alfSubscribe(this.alvexUploadResponseTopic, lang.hitch(this, this.onFileUploadResult), true);


                // Scoping of tabs is required...
                this.searchTabScope = "STS_" + this.generateUuid();
                this.recentSitesTabScope = "RSTB_" + this.generateUuid();
                this.favouriteSitesTabScope = "FSTS_" + this.generateUuid();
                this.allSitesTabScope = "ASTS_" + this.generateUuid();
                this.repositoryTabScope = "RTS_" + this.generateUuid();

                // Generate some unique topics for this form control to avoid any cross-contamination
                // of other instances of the widget within the same scope...
                this.recentSitesRequestTopic = "RSRT_" + this.generateUuid();
                this.favouriteSitesRequestTopic = "FSRT_" + this.generateUuid();
                this.showRecentSiteBrowserTopic = "SRSBT_" + this.generateUuid();
                this.showFavouriteSiteBrowserTopic = "SFSBT_" + this.generateUuid();
                this.allSitesRequestTopic = "ASRT_" + this.generateUuid();
                this.showSiteBrowserTopic = "SASBT_" + this.generateUuid();

                // Generate topics for selecting and removing items...
                this.addFileTopic = "AFT_" + this.generateUuid();
                this.alfSubscribe(this.addFileTopic, lang.hitch(this, this.onFileSelected), true);
                this.removeFileTopic = "RFT_" + this.generateUuid();
                this.alfSubscribe(this.removeFileTopic, lang.hitch(this, this.onItemRemoved), true);

                this.updateSelectedFilesTopic = "USFT_" + this.generateUuid();

                // Generate and subscribe to a topic for populating the dialog with the previously selected
                // files when it is first displayed...
                this.addPreviouslySelectedFilesTopic = "APSFT_" + this.generateUuid();
                this.alfSubscribe(this.addPreviouslySelectedFilesTopic, lang.hitch(this, this.addPreviouslySelectedFiles), true);

                // Generate a topic for confirming the file selection...
                this.confirmFileSelectionTopic = "ConFST_" + this.generateUuid();
                this.alfSubscribe(this.confirmFileSelectionTopic, lang.hitch(this, this.onFileSelectionConfirmed), true);
                this.cancelFileSelectionTopic = "CanFST_" + this.generateUuid();

                // Set up the subscriptions to handle publication of the generated topics...
                this.alfSubscribe(this.recentSitesRequestTopic, lang.hitch(this, this.onRecentSitesOptionsRequest), true);
                this.alfSubscribe(this.favouriteSitesRequestTopic, lang.hitch(this, this.onFavouriteSitesOptionsRequest), true);
                this.alfSubscribe(this.allSitesRequestTopic, lang.hitch(this, this.onAllSitesOptionsRequest), true);

                // Set up subscription to valueChangeOf generated Select control fieldIds for recent and favourite sites
                this.alfSubscribe(this.recentSitesTabScope + "_valueChangeOf_RECENT_SITE_SELECTION", lang.hitch(this, this.onShowSiteBrowser, this.showRecentSiteBrowserTopic), true);
                this.alfSubscribe(this.favouriteSitesTabScope + "_valueChangeOf_FAVOURITE_SITE_SELECTION", lang.hitch(this, this.onShowSiteBrowser, this.showFavouriteSiteBrowserTopic), true);
                this.alfSubscribe(this.allSitesTabScope + "_valueChangeOf_SITE_SELECTION", lang.hitch(this, this.onShowSiteBrowser, this.showSiteBrowserTopic), true);
            },
            onItemDetails: function alvex_forms_controls__FileUploader_onItemDetails(payload) {
                var nodeRef = encodeURIComponent(payload.nodeRef);
                this.alfPublish("ALF_NAVIGATE_TO_PAGE", {
                    url: "/document-details?nodeRef=" + nodeRef,
                    type: "SHARE_PAGE_RELATIVE",
                    target: "NEW"
                },true);
            },
            onFileUploadResult: function alvex_forms_controls__FileUploader_onFileUploadResult(payload) {
                if ((payload.isUploaded) &&(payload.response.nodeRef != null)) {
                    var responseTopic = this.generateUuid()+"_FileUpl_";
                    var handle = this.alfSubscribe(responseTopic + "_SUCCESS", lang.hitch(this, function(payload) {
                        !!!this.value && (this.value = []);
                        !!!this.itemsToShow && (this.itemsToShow = []);
                        var oldValue = this.value;
                        var updatedValue = this.value;
                        this.alfUnsubscribe(handle);
                        var updatedFile = payload.response.item;
                        this.normaliseFile(updatedFile);
                        var nodeRef = lang.getObject("nodeRef", false, updatedFile);
                        if (this.multipleItemMode) {
                            this.itemsToShow.push(updatedFile);
                            updatedValue.push(nodeRef);
                        }
                        else {
                            updatedValue = [nodeRef];
                            this.itemsToShow = [updatedFile];
                        }
                        this.value = updatedValue;
                        this.onValueChangeEvent(this.name, oldValue, updatedValue);
                        this.updateSelectedItems(this.updateSelectedItemsTopic);
                    }), true);
                    this.alfServicePublish(topics.GET_DOCUMENT, {
                        alfResponseTopic: responseTopic,
                        nodeRef: payload.response.nodeRef
                    });
                } else
                {
                    // Handle upload failure by removing the lock from the form.
                    // It's possible that we need to throw one more GOST_UPLOAD_RESULT from UploadMonitor for
                    // handling manual cancellation.
                }
            },
            onFileSelected: function alfresco_forms_controls_FilePicker__onFileSelected(payload) {
                this.normaliseFile(payload);

                // Check to see whether or not the file has already been selected...
                var fileAlreadySelected = false;
                if (this.itemsToShow)
                {
                    var newKey = lang.getObject(this.itemKeyProperty, false, payload);
                    fileAlreadySelected = array.some(this.itemsToShow, function(file) {
                        var existingKey = lang.getObject(this.itemKeyProperty, false, file);
                        return newKey === existingKey;
                    }, this);
                }

                if (fileAlreadySelected)
                {
                    // No action required. The file has previously been selected.
                }
                else if (this.multipleItemMode)
                {
                    // Initialise the selected files array if it is still null and then add the latest
                    // file that has been selected...
                    !!!this.itemsToShow && (this.itemsToShow = []);
                    this.itemsToShow.push(payload);
                }
                else
                {
                    this.itemsToShow = [payload];
                }

                this.updateSelectedItems(this.updateSelectedItemsTopic);
            },

            onItemRemoved: function alvex_forms_controls__FileUploader_onItemRemoved (payload) {
                var keyToRemove = lang.getObject("nodeRef", false, payload);
                this.itemsToShow = array.filter(this.itemsToShow, function(file) {
                    var existingKey = lang.getObject("nodeRef", false, file);
                    return keyToRemove !== existingKey;
                }, this);

                var oldValue = this.value;
                var updatedValue = [];
                array.forEach(this.itemsToShow, function (file) {
                    updatedValue.push(file.nodeRef);
                }, this);

                this.value = updatedValue;
                this.onValueChangeEvent(this.name, oldValue, updatedValue);
                this.updateSelectedItems(this.updateSelectedItemsTopic);
            },
            createFormControl: function alvex_forms_controls__FileUploader_createFormControl (config, domNode) {
                this.setupSubTopics();
                this._dialogId_1 = this.id + "_UPLOAD_DIALOG";
                this._dialogId_2 = this.id + "_FILE_PICKER_DIALOG";
                var widgetsForSearchView = lang.clone(this.widgetsForSearchView);
                this.processObject(["processInstanceTokens"], widgetsForSearchView);
                this.widgetsForSearchView = widgetsForSearchView;

                var widgetsForBrowseView = lang.clone(this.widgetsForBrowseView);
                this.processObject(["processInstanceTokens"], widgetsForBrowseView);
                this.widgetsForBrowseView = widgetsForBrowseView;

                var widgets = lang.clone(this.widgetsForDialog);
                this.processObject(["processInstanceTokens"], widgets);

                var button = this.createWidget({
                    name: "alfresco/layout/VerticalWidgets",
                    config: {
                        widgets: [
                            {
                                id: this.id + "_ITEMS",
                                name: "alfresco/layout/DynamicWidgets",
                                config: {
                                    subscriptionTopic: this.updateSelectedItemsTopic,
                                    subscribeGlobal: true
                                }
                            },
                            {
                                name: "alfresco/layout/VerticalWidgets",
                                config: {
                                    widgets: [
                                        {
                                            id: this.id + "_UPLOAD_BUTTON",
                                            name: "alfresco/buttons/AlfButton",
                                            config: {
                                                label: "uploader.button.upload",
                                                publishTopic: "ALF_CREATE_FORM_DIALOG_REQUEST",
                                                publishPayload: {
                                                    dialogId: this._dialogId_1,
                                                    dialogTitle: "uploader.dialog.upload.title",
                                                    formSubmissionTopic: "ALF_UPLOAD_REQUEST",
                                                    formSubmissionPayloadMixin: {
                                                        targetData: {
                                                            destination: "alfresco://user/home",
                                                            siteId: null,
                                                            containerId: null
                                                        },
                                                        alvexUploadResponseTopic: this.alvexUploadResponseTopic
                                                    },
                                                    widgets: [
                                                        /*{
                                                            name: "alfresco/forms/controls/ContainerPicker",
                                                            config: {
                                                                name: "targetData.destination",
                                                                label: "Upload location"
                                                            }
                                                        },*/
                                                        {
                                                            name: "alfresco/forms/controls/FileSelect",
                                                            config: {
                                                                filterMimeType: this.filterMimeType,
                                                                name: "files",
                                                                label: "uploader.dialog.select",
                                                                multiple: this.multipleItemMode
                                                            }
                                                        }
                                                    ]
                                                },
                                                publishGlobal: true
                                            }
                                        },
                                        {
                                            id: this.id + "_SHOW_FILE_PICKER_DIALOG",
                                            name: "alfresco/buttons/AlfButton",
                                            config: {
                                                label: "filepicker.dialog.title",
                                                publishTopic: topics.CREATE_DIALOG,
                                                publishPayload: {
                                                    dialogId: this._dialogId_2,
                                                    dialogTitle: "filepicker.dialog.title",
                                                    widgetsContent: widgets,
                                                    contentWidth: "800px",
                                                    contentHeight: "700px",
                                                    handleOverflow: false,
                                                    widgetsButtons: [
                                                        {
                                                            id: this.id + "_CONFIRMATION_BUTTON",
                                                            name: "alfresco/buttons/AlfButton",
                                                            config: {
                                                                label: "filepicker.dialog.confirmation.label",
                                                                publishTopic: this.confirmFileSelectionTopic,
                                                                additionalCssClasses: "call-to-action"
                                                            }
                                                        },
                                                        {
                                                            id: this.id + "_CANCELLATION_BUTTON",
                                                            name: "alfresco/buttons/AlfButton",
                                                            config: {
                                                                label: "filepicker.dialog.cancellation.label",
                                                                publishTopic: this.cancelFileSelectionTopic
                                                            }
                                                        }
                                                    ],
                                                    publishOnShow: [
                                                        {
                                                            publishTopic: this.addPreviouslySelectedFilesTopic,
                                                            publishGlobal: true
                                                        }
                                                    ]
                                                },
                                                publishGlobal: true
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                });
                return button;
            },
            getValue: function alvex_forms_controls__FileUploader_getValue() {
                var value = this.value;
                if (value && ObjectTypeUtils.isArray(value)) {
                    value = value.join(this.valueDelimiter);
                } else if ((!value)||(value == [])) {
                    // we're working with arrays inside widget and giving out string
                    value = "";
                }
                return value;
            },
            setValue: function alvex_forms_controls__FileUploader_setValue(value) {
                if ((ObjectTypeUtils.isString(value))&&(value !== "")) {
                    value = value.split(this.valueDelimiter);
                }
                if (value && ObjectTypeUtils.isArray(value)) {
                    if (!this.multipleItemMode && value.length > 1) {
                        this.alfLog("warn", "More than one element in value array set for single-selection FilePicker - only using first element", value, this);
                        value = [value[0]];
                    }
                    var valueCount = value.length;
                    var tmpValue, tmpItemsToShow = [];
                    tmpValue = this.multipleItemMode ? [] : null;
                    // NOTE: value - string with nodeRefs divided by this.valueDelimiter
                    array.forEach(value, function(currentRef) {
                        if (currentRef) {
                            var responseTopic = this.generateUuid()+"_FileUpl_";
                            var handle = this.alfSubscribe(responseTopic + "_SUCCESS", lang.hitch(this, function(payload) {
                                this.alfUnsubscribe(handle);
                                var updatedFile = payload.response.item;
                                this.normaliseFile(updatedFile);
                                var nodeRef = lang.getObject("nodeRef", false, updatedFile);
                                if (this.multipleItemMode) {
                                    tmpValue.push(nodeRef);
                                }
                                else {
                                    tmpValue = nodeRef;
                                }
                                tmpItemsToShow.push(updatedFile);
                                valueCount--;
                                if (valueCount === 0) {
                                    this.itemsToShow = tmpItemsToShow;
                                    this.value = tmpValue;
                                    this.updateSelectedItems(this.updateSelectedItemsTopic);
                                    this.onValueChangeEvent(this.name, null, tmpValue);
                                }
                            }), true);
                            this.alfServicePublish(topics.GET_DOCUMENT, {
                                alfResponseTopic: responseTopic,
                                nodeRef: currentRef
                            });
                        }
                    }, this);
                }
                //TODO get the metadata for files from value
                this.value = value;
            },

            updateSelectedItems: function alvex_forms_controls__FileUploader__updateSelectedItems(topic) {
                var widgetsForSelectedItems = lang.clone(this.widgetsForSelectedItems);
                this.processObject(["processInstanceTokens"], widgetsForSelectedItems);
                this.alfPublish(topic, {
                    widgets: widgetsForSelectedItems
                }, true);
            },

            normaliseFile: function alfresco_forms_controls_FilePicker__normaliseFile(file) {
                !!!file.name && (file.name = lang.getObject("node.properties.cm:name", false, file) || "");
                !!!file.title && (file.title = lang.getObject("node.properties.cm:title", false, file) || "");
                !!!file.description && (file.description = lang.getObject("node.properties.cm:description", false, file) || "");
                !!!file.nodeRef && (file.nodeRef = lang.getObject("node.nodeRef", false, file) || "");
                !!!file.modifiedOn && (file.modifiedOn = lang.getObject("node.properties.cm:modified.iso8601", false, file) || "");
                !!!file.modifiedBy && (file.modifiedBy = lang.getObject("node.properties.cm:modifier.displayName", false, file) || "");
                !!!file.site && (file.site = lang.getObject("location.site", false, file) || {});
                !!!file.site.shortName && (file.site.shortName = lang.getObject("location.site.name", false, file) || "");
                !!!file.path && (file.path = lang.getObject("location.path", false, file) || "");
            },

            getWidgetConfig: function alfresco_forms_controls_FilePicker__getWidgetConfig() {
                if (this.requirementConfig && this.requirementConfig.initialValue == true) {
                    if (!this.validationConfig || !ObjectTypeUtils.isArray(this.validationConfig)) {
                        this.validationConfig = [];
                    }
                    this.validationConfig.push({
                        validation: "minLength",
                        length: 1,
                        errorMessage: "uploader.error.mandatory"
                    });
                }
                return {};
            },

            widgetsForSelectedItems: [
                {
                    id: "{id}_ITEMS_VIEW",
                    name: "alfresco/lists/views/AlfListView",
                    config: {
                        noItemsMessage: " ",
                        currentData: {
                            items: "{itemsToShow}"
                        },
                        widgets: [
                            /* {
                                 name: "alfresco/lists/views/layouts/Row",
                                 config: {
                                     widgets: [
                                         {
                                             name: "alfresco/lists/views/layouts/Cell",
                                             config: {
                                                 width: "22px",
                                                 widgets: [
                                                     {
                                                         id: "{id}_SELECTED_FILES_THUMBNAIL",
                                                         name: "alfresco/search/SearchThumbnail",
                                                         config: {
                                                             width: "22px",
                                                             showDocumentPreview: true
                                                         }
                                                     }
                                                 ]
                                             }
                                         },
                                         {
                                             name: "alfresco/lists/views/layouts/Cell",
                                             config: {
                                                 widgets: [
                                                     {
                                                         id: "{id}_SELECTED_FILES_NAME",
                                                         name: "alfresco/renderers/Property",
                                                         config: {
                                                             propertyToRender: "name"
                                                         }
                                                     }
                                                 ]
                                             }
                                         },
                                         {
                                             name: "alfresco/lists/views/layouts/Cell",
                                             config: {
                                                 width: "20px",
                                                 widgets: [
                                                     {
                                                         id: "{id}_ITEMS_REMOVE",
                                                         name: "alfresco/renderers/PublishAction",
                                                         config: {
                                                             iconClass: "delete-16",
                                                             publishTopic: "{removeItemTopic}",
                                                             publishPayloadType: "CURRENT_ITEM",
                                                             publishGlobal: true
                                                         }
                                                     }
                                                 ]
                                             }
                                         }
                                     ]
                                 }
                             }*/
                            {
                                name: "alfresco/lists/views/layouts/Row",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                width: "40px",
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_THUMBNAIL",
                                                        name: "alfresco/search/SearchThumbnail",
                                                        config: {
                                                            width: "32px",
                                                            showDocumentPreview: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_NAME",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "displayName",
                                                            renderSize: "large"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_TITLE",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "title",
                                                            renderSize: "small",
                                                            renderedValuePrefix: "(",
                                                            renderedValueSuffix: ")"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_DATE",
                                                        name: "alfresco/renderers/Date",
                                                        config: {
                                                            renderSize: "small",
                                                            deemphasized: true,
                                                            renderOnNewLine: true,
                                                            modifiedDateProperty: "modifiedOn",
                                                            modifiedByProperty: "modifiedBy"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_DESCRIPTION",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "description",
                                                            renderSize: "small",
                                                            renderOnNewLine: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                width: "40px",
                                                widgets: [
                                                    {
                                                        id: "{id}_ITEM_DETAILS",
                                                        name: "alfresco/renderers/PublishAction",
                                                        config: {
                                                            iconClass: "info-16",
                                                            publishTopic: "{detailsItemTopic}",
                                                            publishPayloadType: "CURRENT_ITEM",
                                                            publishGlobal: true
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_REMOVE",
                                                        name: "alfresco/renderers/PublishAction",
                                                        config: {
                                                            iconClass: "delete-16",
                                                            publishTopic: "{removeItemTopic}",
                                                            publishPayloadType: "CURRENT_ITEM",
                                                            publishGlobal: true
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ],

            getSiteOptions: function alfresco_forms_controls_FilePicker__getSiteOptions(requestTopic, options, responseTopic) {
                // Setup a one-time subscription for requesting the recent sites for the user...
                var sitesTopic = this.generateUuid();
                var handle = this.alfSubscribe(sitesTopic + "_SUCCESS", lang.hitch(this, function(pl) {
                    this.alfUnsubscribe(handle);
                    array.forEach(pl.response, lang.hitch(this, function(site) {
                        options.push({
                            label: site.title,
                            value: site.shortName
                        });
                    }), this);

                    this.alfPublish(responseTopic, {
                        options: options
                    }, true);
                }), true);

                this.alfServicePublish(requestTopic, {
                    alfResponseTopic: sitesTopic
                });
            },

            /**
             * This function is called when the dialog is opened. It calls
             * [updateSelectedFiles]{@link module:alfresco/forms/controls/FilePicker#updateSelectedFiles}
             * to ensure that the previously selected files are shown in the dialog.
             *
             * @instance
             */
            addPreviouslySelectedFiles: function alfresco_forms_controls_FilePicker__addPreviouslySelectedFiles() {
                this.updateSelectedItems(this.updateSelectedItemsTopic);
            },
            onFileSelectionConfirmed: function alfresco_forms_controls_FilePicker__onFileSelectionConfirmed() {
                var updatedValue = this.multipleItemMode ? [] : null;

                if (this.itemsToShow)
                {
                    array.forEach(this.itemsToShow, function(file) {
                        var itemKey = lang.getObject(this.itemKeyProperty, false, file);
                        if (itemKey)
                        {
                            if (this.multipleItemMode)
                            {
                                updatedValue.push(itemKey);
                            }
                            else
                            {
                                updatedValue = itemKey;
                            }
                        }
                    }, this);
                }

                this.updateSelectedItems(this.updateSelectedItemsTopic);
                var oldValue = this.value;
                this.value = updatedValue;
                this.onValueChangeEvent(this.name, oldValue, updatedValue);
            },
            /**
             *
             * @instance
             * @param  {object} payload The request for sites. This contains the responseTopic to publish the options on.
             */
            onAllSitesOptionsRequest: function alfresco_forms_controls_FilePicker__onAllSitesOptionsRequest(payload) {
                var optionsTopic = payload.responseTopic;
                // NOTE: Commented code to ensure a recent site can be viewed without changing option...
                // if (!this.recentSites)
                // {
                this.allSites = [];
                this.getSiteOptions(topics.GET_SITES, this.allSites, optionsTopic);
                // }
                // else
                // {
                //    this.alfPublish(optionsTopic, {
                //       options: this.recentSites
                //    }, true);
                // }
            },

            /**
             *
             * @instance
             * @param  {object} payload The request for recent sites. This contains the responseTopic to publish the options on.
             */
            onRecentSitesOptionsRequest: function alfresco_forms_controls_FilePicker__onRecentSitesOptionsRequest(payload) {
                var optionsTopic = payload.responseTopic;
                // NOTE: Commented code to ensure a recent site can be viewed without changing option...
                // if (!this.recentSites)
                // {
                this.recentSites = [];
                this.getSiteOptions(topics.GET_RECENT_SITES, this.recentSites, optionsTopic);
                // }
                // else
                // {
                //    this.alfPublish(optionsTopic, {
                //       options: this.recentSites
                //    }, true);
                // }
            },

            /**
             *
             * @instance
             * @param  {object} payload The request for favourite sites. This contains the responseTopic to publish the options on.
             */
            onFavouriteSitesOptionsRequest: function alfresco_forms_controls_FilePicker__onFavouriteSitesOptionsRequest(payload) {
                var optionsTopic = payload.responseTopic;
                // NOTE: Commented code to ensure a favourite site can be viewed without changing option...
                // if (!this.favouriteSites)
                // {
                this.favouriteSites = [];
                this.getSiteOptions(topics.GET_FAVOURITE_SITES, this.favouriteSites, optionsTopic);
                // }
                // else
                // {
                //    this.alfPublish(optionsTopic, {
                //       options: this.favouriteSites
                //    }, true);
                // }
            },

            /**
             * This function is called whenever the user changes the site that they want to browse for files in. This
             * site can be from the drop-down showing favourites or recent sites, but the effect is the same - to
             * update a [DynamicWidgets]{@link module:alfresco/layout/DynamicWidgets} widget with a model that allows
             * the user to browse the selected site.
             *
             * @instance
             * @param {string} topic The topic to publish a new widget model on
             * @param {object} payload The payload of the changed selecte widget containing the new site browse
             */
            onShowSiteBrowser: function alfresco_forms_controls_FilePicker__onShowSiteBrowser(topic, payload) {
                this.alfPublish(topic, {
                    widgets: [
                        {
                            name: "alfresco/layout/HorizontalWidgets",
                            config: {
                                widgets: [
                                    {
                                        name: "alfresco/navigation/PathTree",
                                        config: {
                                            siteId: payload.value,
                                            containerId: "documentLibrary",
                                            rootNode: null,
                                            showRoot: true,
                                            rootLabel: "filepicker.sites.tree.root.label", // TODO: correct folder name?
                                            useHash: false
                                        }
                                    },
                                    {
                                        name: "alfresco/layout/VerticalWidgets",
                                        config: {
                                            widgets: [
                                                {
                                                    name: "alfresco/lists/Paginator",
                                                    config: {
                                                        pageSizePreferenceName: "org.alfresco.share.filepicker.documentsPerPage",
                                                        documentsPerPage: 10,
                                                        pageSizes: [5,10,20]
                                                    }
                                                },
                                                {
                                                    name: "alfresco/documentlibrary/AlfDocumentList",
                                                    config: {
                                                        pageSizePreferenceName: "org.alfresco.share.filepicker.documentsPerPage",
                                                        currentPageSize: 10,
                                                        waitForPageWidgets: false,
                                                        rawData: false,
                                                        useHash: false,
                                                        siteId: payload.value,
                                                        containerId: "documentLibrary",
                                                        rootNode: null,
                                                        usePagination: true,
                                                        showFolders: true,
                                                        sortAscending: true,
                                                        sortField: "cm:name", // TODO: Check this
                                                        widgets: this.widgetsForBrowseView
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }, true);
            },

            /**
             *
             * @instance
             * @type {object[]}
             */
            widgetsForSelectedFilesView: [
                {
                    id: "{id}_SELECTED_FILES_VIEW",
                    name: "alfresco/lists/views/AlfListView",
                    config: {
                        noItemsMessage: "filepicker.noitems.message",
                        currentData: {
                            items: "{itemsToShow}"
                        },
                        widgets: [
                            {
                                name: "alfresco/lists/views/layouts/Row",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                width: "40px",
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_THUMBNAIL",
                                                        name: "alfresco/search/SearchThumbnail",
                                                        config: {
                                                            width: "32px",
                                                            showDocumentPreview: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_NAME",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "displayName",
                                                            renderSize: "large"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_TITLE",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "title",
                                                            renderSize: "small",
                                                            renderedValuePrefix: "(",
                                                            renderedValueSuffix: ")"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_DATE",
                                                        name: "alfresco/renderers/Date",
                                                        config: {
                                                            renderSize: "small",
                                                            deemphasized: true,
                                                            renderOnNewLine: true,
                                                            modifiedDateProperty: "modifiedOn",
                                                            modifiedByProperty: "modifiedBy"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_DESCRIPTION",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "description",
                                                            renderSize: "small",
                                                            renderOnNewLine: true
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_SITE",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "site.title",
                                                            renderSize: "small",
                                                            label: "filepicker.item.site.prefix",
                                                            renderOnNewLine: true
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SELECTED_FILES_PATH",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "path",
                                                            renderSize: "small",
                                                            label: "filepicker.item.folder.prefix",
                                                            renderOnNewLine: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                width: "20px",
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_REMOVE",
                                                        name: "alfresco/renderers/PublishAction",
                                                        config: {
                                                            iconClass: "delete-16",
                                                            publishTopic: "{removeItemTopic}",
                                                            publishPayloadType: "CURRENT_ITEM",
                                                            publishGlobal: true
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ],

            widgetsForBrowseView: [
                {
                    id: "{id}_BROWSE_VIEW",
                    name: "alfresco/lists/views/AlfListView",
                    config: {
                        widgets: [
                            {
                                name: "alfresco/lists/views/layouts/Row",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                widgets: [
                                                    {
                                                        id: "{id}_BROWSE_THUMBNAIL",
                                                        name: "alfresco/renderers/Thumbnail",
                                                        config: {
                                                            width: "32px",
                                                            showDocumentPreview: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                widgets: [
                                                    {
                                                        id: "{id}_BROWSE_NAME",
                                                        name: "alfresco/renderers/InlineEditPropertyLink",
                                                        config: {
                                                            propertyToRender: "node.properties.cm:name",
                                                            permissionProperty: "prevent.editing", // Hack to work around lack of mixin in PropertyLink
                                                            renderSize: "large"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_BROWSE_TITLE",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "node.properties.cm:title",
                                                            renderSize: "small",
                                                            renderedValuePrefix: "(",
                                                            renderedValueSuffix: ")"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_BROWSE_DATE",
                                                        name: "alfresco/renderers/Date",
                                                        config: {
                                                            propertyToRender: "node.properties.cm:title",
                                                            renderSize: "small",
                                                            deemphasized: true,
                                                            renderOnNewLine: true
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_BROWSE_DESCRIPTION",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "node.properties.cm:description",
                                                            renderSize: "small",
                                                            renderOnNewLine: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                width: "20px",
                                                widgets: [
                                                    {
                                                        id: "{id}_BROWSE_ADD",
                                                        name: "alfresco/renderers/PublishAction",
                                                        config: {
                                                            publishTopic: "{addFileTopic}",
                                                            publishPayloadType: "CURRENT_ITEM",
                                                            publishGlobal: true,
                                                            renderFilter: [
                                                                {
                                                                    property: "node.isContainer",
                                                                    values: [false]
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ],

            /**
             * This is the model for the search view.
             *
             * @instance
             * @type {object[]}
             */
            widgetsForSearchView: [
                {
                    id: "{id}_SEARCH_VIEW",
                    name: "alfresco/lists/views/AlfListView",
                    config: {
                        widgets: [
                            {
                                name: "alfresco/lists/views/layouts/Row",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                widgets: [
                                                    {
                                                        id: "{id}_SEARCH_THUMBNAIL",
                                                        name: "alfresco/search/SearchThumbnail",
                                                        config: {
                                                            width: "32px",
                                                            showDocumentPreview: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                widgets: [
                                                    {
                                                        id: "{id}_SEARCH_NAME",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "displayName",
                                                            renderSize: "large"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SEARCH_TITLE",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "title",
                                                            renderSize: "small",
                                                            renderedValuePrefix: "(",
                                                            renderedValueSuffix: ")"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SEARCH_DATE",
                                                        name: "alfresco/renderers/Date",
                                                        config: {
                                                            renderSize: "small",
                                                            deemphasized: true,
                                                            renderOnNewLine: true,
                                                            modifiedDateProperty: "modifiedOn",
                                                            modifiedByProperty: "modifiedBy"
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SEARCH_DESCRIPTION",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "description",
                                                            renderSize: "small",
                                                            renderOnNewLine: true
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SEARCH_SITE",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "site.title",
                                                            renderSize: "small",
                                                            label: "filepicker.item.site.prefix",
                                                            renderOnNewLine: true
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SEARCH_PATH",
                                                        name: "alfresco/renderers/Property",
                                                        config: {
                                                            propertyToRender: "path",
                                                            renderSize: "small",
                                                            label: "filepicker.item.folder.prefix",
                                                            renderOnNewLine: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                width: "20px",
                                                widgets: [
                                                    {
                                                        id: "{id}_SEARCH_ADD",
                                                        name: "alfresco/renderers/PublishAction",
                                                        config: {
                                                            publishTopic: "{addFileTopic}",
                                                            publishPayloadType: "CURRENT_ITEM",
                                                            publishGlobal: true
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ],

            /**
             * The model to use in the file selection dialog.
             *
             * @instance
             * @type {object[]}
             */
            widgetsForDialog: [
                {
                    name: "alfresco/layout/FixedHeaderFooter",
                    config: {
                        heightMode: "DIALOG",
                        widgetsForHeader: [
                            {
                                id: "{id}_SELECTED_FILES",
                                name: "alfresco/layout/VerticalWidgets",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/layout/DynamicWidgets",
                                            config: {
                                                subscriptionTopic: "{updateSelectedItemsTopic}",
                                                subscribeGlobal: true
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        widgets: [
                            {
                                id: "{id}_TABCONTAINER",
                                name: "alfresco/layout/AlfTabContainer",
                                config: {
                                    padded: true,
                                    currentItem: {
                                        showSearch: "{showSearch}",
                                        showRepository: "{showRepository}",
                                        showAllSites: "{showAllSites}",
                                        showFavouriteSites: "{showFavouriteSites}",
                                        showRecentSites: "{showRecentSites}"
                                    },
                                    widgets: [
                                        {
                                            id: "{id}_SEARCH_TAB",
                                            title: "filepicker.search.tab.label",
                                            name: "alfresco/layout/VerticalWidgets",
                                            config: {
                                                pubSubScope: "{searchTabScope}",
                                                widgetMarginTop: 10,
                                                widgets: [
                                                    {
                                                        id: "{id}_SEARCH_FIELD",
                                                        name: "alfresco/forms/SingleComboBoxForm",
                                                        config: {
                                                            useHash: true,
                                                            okButtonLabel: "filepicker.search.button.label",
                                                            okButtonPublishTopic : "ALF_SET_SEARCH_TERM",
                                                            okButtonPublishGlobal: false,
                                                            okButtonIconClass: "alf-white-search-icon",
                                                            okButtonClass: "call-to-action",
                                                            textFieldName: "searchTerm",
                                                            textBoxIconClass: "alf-search-icon",
                                                            textBoxCssClasses: "long hiddenlabel",
                                                            queryAttribute: "term",
                                                            optionsPublishTopic: "ALF_AUTO_SUGGEST_SEARCH",
                                                            optionsPublishPayload: {
                                                                resultsProperty: "response.suggestions"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        name: "alfresco/lists/Paginator",
                                                        config: {
                                                            pageSizePreferenceName: "org.alfresco.share.filepicker.documentsPerPage",
                                                            documentsPerPage: 10,
                                                            pageSizes: [5,10,20]
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_SEARCH_RESULTS",
                                                        name: "alfresco/documentlibrary/AlfSearchList",
                                                        config: {
                                                            _resetVars: ["facetFilters"], // NOTE: Stops query being reset...
                                                            query: {
                                                                datatype: "cm:content" // NOTE: Restricts search to files!
                                                            },
                                                            pageSizePreferenceName: "org.alfresco.share.filepicker.documentsPerPage",
                                                            currentPageSize: 10,
                                                            waitForPageWidgets: false,
                                                            loadDataImmediately: false,
                                                            useHash: false,
                                                            selectedScope: "repo",
                                                            useInfiniteScroll: false,
                                                            siteId: null,
                                                            rootNode: null,
                                                            repo: true,
                                                            widgets: "{widgetsForSearchView}"
                                                        }
                                                    }
                                                ],
                                                renderFilter: [
                                                    {
                                                        property: "showSearch",
                                                        values: [true]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "{id}_RECENT_SITES_TAB",
                                            title: "filepicker.recent.tab.label",
                                            name: "alfresco/layout/VerticalWidgets",
                                            config: {
                                                pubSubScope: "{recentSitesTabScope}",
                                                widgetMarginTop: 10,
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECT_RECENT_SITE",
                                                        name: "alfresco/forms/controls/Select",
                                                        config: {
                                                            fieldId: "RECENT_SITE_SELECTION",
                                                            label: "filepicker.recent.site.selection.label",
                                                            name: "recentSite",
                                                            optionsConfig: {
                                                                publishTopic: "{recentSitesRequestTopic}"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_RECENT_SITES",
                                                        name: "alfresco/layout/DynamicWidgets",
                                                        config: {
                                                            subscriptionTopic: "{showRecentSiteBrowserTopic}",
                                                            subscribeGlobal: true
                                                        }
                                                    }
                                                ],
                                                renderFilter: [
                                                    {
                                                        property: "showRecentSites",
                                                        values: [true]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "{id}_FAVOURITE_SITES_TAB",
                                            title: "filepicker.favourite.tab.label",
                                            name: "alfresco/layout/VerticalWidgets",
                                            config: {
                                                pubSubScope: "{favouriteSitesTabScope}",
                                                widgetMarginTop: 10,
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECT_FAVOURITE_SITE",
                                                        name: "alfresco/forms/controls/Select",
                                                        config: {
                                                            fieldId: "FAVOURITE_SITE_SELECTION",
                                                            label: "filepicker.favourite.site.selection.label",
                                                            name: "favouriteSite",
                                                            optionsConfig: {
                                                                publishTopic: "{favouriteSitesRequestTopic}"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_FAVOURITE_SITES",
                                                        name: "alfresco/layout/DynamicWidgets",
                                                        config: {
                                                            subscriptionTopic: "{showFavouriteSiteBrowserTopic}",
                                                            subscribeGlobal: true
                                                        }
                                                    }
                                                ],
                                                renderFilter: [
                                                    {
                                                        property: "showFavouriteSites",
                                                        values: [true]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "{id}_ALL_SITES_TAB",
                                            title: "filepicker.allsites.tab.label",
                                            name: "alfresco/layout/VerticalWidgets",
                                            config: {
                                                pubSubScope: "{allSitesTabScope}",
                                                widgetMarginTop: 10,
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECT_SITE",
                                                        name: "alfresco/forms/controls/Select",
                                                        config: {
                                                            fieldId: "SITE_SELECTION",
                                                            label: "filepicker.site.selection.label",
                                                            name: "site",
                                                            optionsConfig: {
                                                                publishTopic: "{allSitesRequestTopic}"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        id: "{id}_FAVOURITE_SITES",
                                                        name: "alfresco/layout/DynamicWidgets",
                                                        config: {
                                                            subscriptionTopic: "{showSiteBrowserTopic}",
                                                            subscribeGlobal: true
                                                        }
                                                    }
                                                ],
                                                renderFilter: [
                                                    {
                                                        property: "showAllSites",
                                                        values: [true]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            id: "{id}_REPOSITORY_TAB",
                                            title: "filepicker.repository.tab.label",
                                            name: "alfresco/layout/VerticalWidgets",
                                            config: {
                                                pubSubScope: "{repositoryTabScope}",
                                                widgetMarginTop: 10,
                                                widgets: [
                                                    {
                                                        name: "alfresco/layout/HorizontalWidgets",
                                                        config: {
                                                            widgets: [
                                                                {
                                                                    name: "alfresco/navigation/PathTree",
                                                                    config: {
                                                                        siteId: null,
                                                                        containerId: null,
                                                                        rootNode: "{repositoryRootNode}",
                                                                        rootLabel: "filepicker.repository.tree.root.label",
                                                                        useHash: false
                                                                    }
                                                                },
                                                                {
                                                                    name: "alfresco/layout/VerticalWidgets",
                                                                    config: {
                                                                        widgets: [
                                                                            {
                                                                                name: "alfresco/lists/Paginator",
                                                                                config: {
                                                                                    pageSizePreferenceName: "org.alfresco.share.filepicker.documentsPerPage",
                                                                                    documentsPerPage: 10,
                                                                                    pageSizes: [5,10,20]
                                                                                }
                                                                            },
                                                                            {
                                                                                name: "alfresco/documentlibrary/AlfDocumentList",
                                                                                config: {
                                                                                    pageSizePreferenceName: "org.alfresco.share.filepicker.documentsPerPage",
                                                                                    currentPageSize: 10,
                                                                                    waitForPageWidgets: false,
                                                                                    rawData: false,
                                                                                    useHash: false,
                                                                                    siteId: null,
                                                                                    containerId: null,
                                                                                    rootNode: null,
                                                                                    usePagination: true,
                                                                                    showFolders: true,
                                                                                    sortAscending: true,
                                                                                    sortField: "cm:name", // TODO: Check this
                                                                                    widgets: "{widgetsForBrowseView}"
                                                                                }
                                                                            }
                                                                        ]
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }
                                                ],
                                                renderFilter: [
                                                    {
                                                        property: "showRepository",
                                                        values: [true]
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]

        })
    });
