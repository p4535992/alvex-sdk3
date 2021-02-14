/*
  Renders file thumbnail and title, shows preview on click. Add DocumentService and NodePreviewService to the page to make it works.
  TODO: add label support
*/

define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "alfresco/renderers/_JsNodeMixin",
        "alfresco/core/ValueDisplayMapMixin",
        "alfresco/core/Core",
        "alfresco/core/CoreWidgetProcessing",
        "alfresco/core/ProcessWidgets",
        "alfresco/core/topics",
        "alfresco/core/ObjectTypeUtils",
        "alfresco/core/UrlUtilsMixin",
        "alfresco/core/TemporalUtils",
        "dojo/_base/lang",
        "dojo/_base/array",
        "dojo/dom-class",
        "dojo/dom-style",
        "dijit/Tooltip",
        "dojo/on",
        "alfresco/services/DocumentService",
        "alfresco/layout/DynamicWidgets",
        "alfresco/core/DynamicWidgetProcessingTopics"],

    function(declare, _WidgetBase, _JsNodeMixin, ValueDisplayMapMixin, AlfCore, CoreWidgetProcessing, ProcessWidgets, topics,
             ObjectTypeUtils, UrlUtilsMixin, TemporalUtils, lang, array, domClass, domStyle, Tooltip, on, DocumentService, DynamicWidgets) {

        return declare([_WidgetBase, AlfCore, _JsNodeMixin, ValueDisplayMapMixin, TemporalUtils, UrlUtilsMixin, DynamicWidgets], {


            i18nRequirements: [{i18nFile: "./i18n/Document.properties"}],

            selectedFiles: [],

            subscriptionTopic: null,

            postCreate: function alvex_renderers_Document__postCreate() {
                this.subscriptionTopic = "ST_" + this.generateUuid();
                this.alfSubscribe(this.subscriptionTopic, lang.hitch(this, this.render), this.subscribeGlobal);
                var data = [];
                this.alfPublish(this.subscriptionTopic, {
                    widgets: [{
                        name: "alfresco/renderers/Property",
                        config: {
                            renderedValue: " "
                        }
                    }]
                }, this.subscribeGlobal);
                this.selectedFiles = []; // somehow if we're not clearing this docs are stacking when there are multiple calls of this widget

                if (ObjectTypeUtils.isString(this.propertyToRender) &&
                    ObjectTypeUtils.isObject(this.currentItem) &&
                    lang.exists(this.propertyToRender, this.currentItem))
                {
                   data = lang.getObject(this.propertyToRender, false, this.currentItem);
                   if (ObjectTypeUtils.isString(data)) {
                      data = data.split(",");
                   }
                }


                if (ObjectTypeUtils.isArray(data) && (data !== 0)) {
                   for (var i = 0; i < data.length; i++) {
                      if (ObjectTypeUtils.isString(data[i].nodeRef)) {
                         data[i] = data[i].nodeRef;
                      }
                        var processedNodeRef = data[i].replace("/[_]/g", ":");
                        var responseTopic = this.generateUuid();
                        this.alfSubscribe(responseTopic + "_SUCCESS", lang.hitch(this, this.newFileReceived), true);
                        this.alfPublish(topics.GET_DOCUMENT, {
                            alfResponseTopic: responseTopic,
                            nodeRef: processedNodeRef
                        },true);
                    }
                }
                else
                {
                    this.alfLog("log", "Property does not exist:", this);
                }
            },
            newFileReceived: function alvex_renderers_Document__newFileReceived(payload) {
                this.alfUnsubscribe(payload.topic);
                var file = payload.response.item;
                this.normaliseFile(file);
                this.selectedFiles.push(file);
                this.updateSelectedFiles(this.subscriptionTopic);
            },

            normaliseFile: function alvex_renderers_Document__normaliseFile(file) {
                !!!file.displayName && (file.displayName = lang.getObject("node.properties.cm:name", false, file) || "");
                !!!file.title && (file.title = lang.getObject("node.properties.cm:title", false, file) || "");
                !!!file.description && (file .description = lang.getObject("node.properties.cm:description", false, file) || "");
                !!!file.nodeRef && (file.nodeRef = lang.getObject("node.nodeRef", false, file) || "");
                !!!file.modifiedOn && (file.modifiedOn = lang.getObject("node.properties.cm:modified.iso8601", false, file) || "");
                !!!file.modifiedBy && (file.modifiedBy = lang.getObject("node.properties.cm:modifier.displayName", false, file) || "");
                !!!file.site && (file.site = lang.getObject("location.site", false, file) || {});
                !!!file.site.shortName && (file.site.shortName = lang.getObject("location.site.name", false, file) || "");
                !!!file.path && (file.path = lang.getObject("location.path", false, file) || "");
            },

            updateSelectedFiles: function alvex_renderers_Document__updateSelectedFiles(topic) {
                var widgetsForView = lang.clone(this.widgetsForView);
                this.processObject(["processInstanceTokens"], widgetsForView);
                this.alfPublish(topic, {
                    widgets: widgetsForView
                }, this.subscribeGlobal);
            },

            widgetsForView: [
                {
                    id: "{id}_SELECTED_FILES_VIEW",
                    name: "alfresco/lists/views/AlfListView",
                    config: {
                        noItemsMessage: "filepicker.noitems.message",
                        currentData: {
                            items: "{selectedFiles}"
                        },
                        widgets: [
                            {
                                name: "alfresco/lists/views/layouts/Row",
                                config: {
                                    widgets: [
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                additionalCssClasses: "viewform",
                                                width: "22px",
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_THUMBNAIL",
                                                        name: "alfresco/search/SearchThumbnail",
                                                        config: {
                                                            width: "18px",
                                                            showDocumentPreview: true
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "alfresco/lists/views/layouts/Cell",
                                            config: {
                                                additionalCssClasses: "viewform",
                                                widgets: [
                                                    {
                                                        id: "{id}_SELECTED_FILES_NAME",
                                                        name: "alfresco/renderers/PropertyLink",
                                                        config: {
                                                            propertyToRender: "displayName",
                                                            publishTopic: topics.SHOW_NODE_PREVIEW,
                                                            publishPayloadType: "PROCESS",
                                                            publishPayloadModifiers: ["processCurrentItemTokens"],
                                                            useCurrentItemAsPayload: false,
                                                            publishGlobal: true,
                                                            publishPayload: {
                                                              node: "{node}",
                                                              displayName: "{displayName}"
                                                            }
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
            ]
        });
    });
