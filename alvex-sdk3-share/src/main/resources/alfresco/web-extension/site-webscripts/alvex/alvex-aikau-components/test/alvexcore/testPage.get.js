<import resource="classpath:alfresco/site-webscripts/org/alfresco/share/imports/share-header.lib.js">
<import resource="classpath:alfresco/site-webscripts/org/alfresco/share/imports/share-footer.lib.js">

var headerServices = getHeaderServices();
var headerWidgets = getHeaderModel("test");
headerServices.push("alfresco/services/OptionsService");
headerServices.push("alfresco/services/UserService");
headerServices.push("alfresco/services/DocumentService");
headerServices.push("alfresco/services/NodePreviewService");
headerServices.push("alvex/services/FileUploadService");
headerServices.push("alfresco/services/ContentService");
headerServices.push("alfresco/services/SiteService");
headerServices.push("alfresco/services/NotificationService");
headerServices.push("alfresco/services/LightboxService");
headerServices.push("alfresco/services/DialogService");


headerWidgets.push({
  name: "alfresco/layout/TitleDescriptionAndContent",
  config: {
    title: "Form sample",
    widgets: [{
      name: "alvex/forms/FormWithWarning",
      config: {
        widgets: [{
          name: "alvex/forms/controls/CheckBox",
          config: {
            fieldId: "TEST_CHECKBOX",
            name: "testCheckbox",
            label: "Checkbox"
          }
        }, {
          name: "alvex/forms/controls/Select",
          config: {
            name: "testSelect",
            label: "Select",
            requirementConfig: {
              initialValue: true
            },
            optionsConfig: {
              fixed: [{
                label: "Value 1",
                value: "Value1"
              }, {
                label: "Value 2",
                value: "Value2"
              }]
            },
            visibilityConfig: {
              initialValue: false,
              rules: [{
                targetId: "TEST_CHECKBOX",
                is: [true]
              }]
            }
          }
        }, {
          name: "alvex/forms/controls/FilteringSelect",
          config: {
            name: "testFilteringSelect",
            label: "Filtering Select",
            requirementConfig: {
              initialValue: true
            },
            optionsConfig: {
              labelAttribute: "name",
              queryAttribute: "name",
              valueAttribute: "nodeRef",
              publishTopic: "ALF_GET_AUTHORITIES",
              publishPayload: {
                resultsProperty: "response.data.items"
              }
            },
            visibilityConfig: {
              initialValue: false,
              rules: [{
                targetId: "TEST_CHECKBOX",
                is: [true]
              }]
            }
          }
        }, {
           name: "alvex/forms/controls/FileUploader",
           config: {
              label: "Uploader",
              name: "testUploader",
              addedAndRemovedValues: true
           }
        }, {
          name: "alfresco/forms/CollapsibleSection",
          config: {
            label: "Section that will be hidden",
            visibilityConfig: {
              initialValue: false,
              rules: [{
                topic: "_valueChangeOf_TEST_CHECKBOX",
                attribute: 'value',
                is: [true],
                strict: true
              }]
            },
            widgets: [{
              name: "alvex/forms/controls/TextBox",
              config: {
                name: "testTextBox",
                label: "TextBox",
                requirementConfig: {
                  initialValue: true
                }
              }
            }, {
              name: "alvex/forms/controls/TextArea",
              config: {
                name: "testTextArea",
                label: "TextArea",
                requirementConfig: {
                  initialValue: true
                }
              }
            }, {
              name: "alvex/forms/controls/DateTextBox",
              config: {
                name: "testDateTextBox",
                label: "DateTextBox",
                requirementConfig: {
                  initialValue: true
                }
              }
            }]
          }
        }]
      }
    }]
  }
}, {
  name: "alfresco/html/Spacer",
  config: {
    height: "40px",
  }
}, {
  name: "alfresco/layout/TitleDescriptionAndContent",
  config: {
    title: "Renderers samples",
    widgets: [{
      name: "alvex/renderers/Document",
      config: {
        propertyToRender: "nodeRef",
        currentItem: {
          nodeRef: "workspace://SpacesStore/1a0b110f-1e09-4ca2-b367-fe25e4964a4e"
        }
        /* label: "Document" -- does not support label */
      }
    }, {
      name: "alvex/renderers/InlineEditFilteringSelect",
      config: {
        propertyToRender: "test",
        currentItem: {
          test: "abeecher"
        },
        publishTopic: "SAVE_NEW_VALUE",
        publishPayloadType: "PROCESS",
        publishPayloadModifiers: ["processCurrentItemTokens"],
        publishPayload: {
          originalValue: "test"
        },
        optionsConfig: {
          labelAttribute: "name",
          queryAttribute: "name",
          valueAttribute: "nodeRef",
          publishTopic: "ALF_GET_AUTHORITIES",
          publishPayload: {
            resultsProperty: "response.data.items"
          }
        },
        publishGlobal: true
      }
    }, {
      name: "alvex/renderers/InlineEditDateTextBox",
      config: {
        propertyToRender: "test",
        currentItem: {
          test: "25.12.2017"
        },
        publishTopic: "SAVE_NEW_VALUE",
        publishPayloadType: "PROCESS",
        publishPayloadModifiers: ["processCurrentItemTokens"],
        publishPayload: {
          originalValue: "test"
        },
        publishGlobal: true
      }
    }]
  }
});

model.jsonModel = getFooterModel(headerServices, headerWidgets);
model.jsonModel.groupMemberships = user.properties["alfUserGroups"];
