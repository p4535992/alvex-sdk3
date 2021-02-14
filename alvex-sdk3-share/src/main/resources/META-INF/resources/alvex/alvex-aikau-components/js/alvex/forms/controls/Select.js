define(["alfresco/forms/controls/Select",
    "alvex/forms/controls/BaseFormControl",
    "dojo/_base/declare"
  ],
  function(Select, BaseFormControl, declare) {
    return declare([Select, BaseFormControl], {

      i18nRequirements: [{
        i18nFile: "./i18n/ValidationMixin.properties"
      }],

      getWidgetConfig: function alvex_forms_controls_Select__getWidgetConfig() {
        // Return the configuration for the widget
        this.configureValidation();
        return {
          id: this.id + "_CONTROL",
          name: this.name,
          forceWidth: this.forceWidth,
          truncate: this.truncate,
          width: this.width
        };
      },

      /**
       * This function is used to set or update the validationConfig
       *
       * @instance
       */
      configureValidation: function alvex_forms_controls_Select__configureValidation() {

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
    });
  });
