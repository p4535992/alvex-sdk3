/*
  Generic form inherited from alfresco/forms/Form with warning in the bottom of the form that notifies user that not all mandatory fields are filled and form cannot be saved.
*/

define(["dojo/_base/declare",
        "alfresco/forms/Form",
        "alfresco/core/Core",
        "dojo/dom-construct",
        "dojo/dom-class",
        "alfresco/util/urlUtils"],
      function(declare, Form, AlfCore, domConstruct, domClass, urlUtils) {

        return declare ([Form, AlfCore], {

          i18nRequirements: [{i18nFile: "./i18n/FormWithWarning.properties"}],

          warningsPosition: "bottom",

          okButtonDisableOnPublish: true,

          createWarnings: function alvex_forms_FormWithWarning_createWarnings() {
               if (!(this.warnings)) {
                   this.warnings = [];
               }
               this.warnings.push({
                   message: this.message("form.mandatory.warning"),
                   initialValue: true,
                   rules: [{
                       topic: "ALF_FORM_VALIDITY",
                       attribute: "valid",
                       is: [false],
                       subscribeGlobal: false
                   }]
               });
             this.inherited(arguments);
           }

       });
});
