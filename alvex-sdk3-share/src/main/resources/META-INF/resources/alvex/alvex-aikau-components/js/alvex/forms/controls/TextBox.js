define(["alfresco/forms/controls/TextBox",
        "alvex/forms/controls/BaseFormControl",
        "alfresco/core/topics",
        "dojo/_base/declare",
        "alfresco/core/ObjectTypeUtils"
    ],
    function(TextBox, BaseFormControl, topics, declare, ObjectTypeUtils) {
        return declare([TextBox, BaseFormControl], {

          i18nRequirements: [{i18nFile: "./i18n/ValidationMixin.properties"}],

           configureValidation: function alvex_forms_controls_TextBox__configureValidation() {
              if (this.requirementConfig && this.requirementConfig.initialValue === true) {
                 if (!this.validationConfig || !ObjectTypeUtils.isArray(this.validationConfig)) {
                    this.validationConfig = [];
                 }
                 this.validationConfig.push({
                    validation: "minLength",
                    length: 1,
                    errorMessage: this.message("requirement.text")
                 });
              }
           },
            getWidgetConfig: function alvex_forms_controls_TextBox__getWidgetConfig() {
                this.configureValidation();
                var placeHolder = (this.placeHolder) ? this.message(this.placeHolder) : "";
                return {
                    id: this.generateUuid(),
                    name: this.name,
                    autocomplete: this.autocomplete,
                    placeHolder: placeHolder,
                    iconClass: this.iconClass
                };
            }
        })
    });
