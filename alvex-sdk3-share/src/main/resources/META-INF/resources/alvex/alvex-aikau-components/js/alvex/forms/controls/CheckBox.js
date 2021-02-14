define(["alfresco/forms/controls/CheckBox",
    "alvex/forms/controls/BaseFormControl",
    "alfresco/core/topics",
    "dojo/_base/declare",
    "alfresco/core/ObjectTypeUtils"
  ],
  function(CheckBox, BaseFormControl, topics, declare, ObjectTypeUtils) {
    return declare([CheckBox, BaseFormControl], {

      i18nRequirements: [{
        i18nFile: "./i18n/ValidationMixin.properties"
      }],

      getWidgetConfig: function alvex_forms_controls_CheckBox__getWidgetConfig() {
        return {
          id: this.generateUuid(),
          name: this.name
        };
      }
    })
  });
