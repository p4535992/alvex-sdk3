define(["alfresco/forms/controls/FilteringSelect",
    "alvex/forms/controls/BaseFormControl",
    "dojo/_base/declare"
  ],
  function(FilteringSelect, BaseFormControl, declare) {
    return declare([FilteringSelect, BaseFormControl], {

      i18nRequirements: [{
        i18nFile: "./i18n/ValidationMixin.properties"
      }],

      showAllOptionsOnOpen: true,

      getWidgetConfig: function alvex_forms_controls_FilteringSelect__getWidgetConfig() {
        // Return the configuration for the widget
        this.configureValidation();
        return {
           id : this.id + "_CONTROL",
           name: this.name
        };
      },

      /**
       * This function is used to set or update the validationConfig
       *
       * @instance
       */
      configureValidation: function alvex_forms_controls_FilteringSelect__configureValidation() {

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
