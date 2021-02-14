define([
    "alfresco/forms/controls/TextArea",
    "alvex/forms/controls/BaseFormControl",
    "alfresco/core/topics",
    "alfresco/core/ObjectTypeUtils",
    "dojo/_base/declare"
  ],
  function(TextArea, BaseFormControl, topics, ObjectTypeUtils, declare) {
    return declare([TextArea, BaseFormControl], {

      i18nRequirements: [{
        i18nFile: "./i18n/ValidationMixin.properties"
      }],
      getWidgetConfig: function alvex_forms_controls_TextArea__getWidgetConfig() {
        this.configureValidation();
        return {
          id: this.generateUuid(),
          name: this.name,
          rows: this.rows,
          cols: this.cols
        };
      },

      /**
       * This function is used to set or update the validationConfig
       *
       * @instance
       */
      configureValidation: function alvex_forms_controls_TextArea__configureValidation() {

        if (this.requirementConfig && this.requirementConfig.initialValue == true) {
          if (!this.validationConfig || !ObjectTypeUtils.isArray(this.validationConfig)) {
            this.validationConfig = [];
          }
          this.validationConfig.push({
            validation: "minLength",
            length: 1,
            errorMessage: this.message("requirement.text")
          });
        }
      }
    })
  });
