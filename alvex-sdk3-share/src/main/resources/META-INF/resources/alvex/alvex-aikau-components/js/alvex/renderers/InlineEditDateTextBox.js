define(["dojo/_base/declare",
        "alfresco/renderers/InlineEditProperty",
        "alvex/forms/controls/DateTextBox"],
        function(declare, InlineEditProperty) {

   return declare([InlineEditProperty], {

      /**
       * Overrides the [inherited function]{@link module:alfresco/renderers/InlineEditProperty#getPrimaryFormWidget}
       * to return a [select form control]{@link module:alfresco/forms/controls/Select}.
       *
       * @instance
       * @returns {object} The widget for editing.
       */

      getPrimaryFormWidget: function alvex_renderers_InlineEditSelect__getPrimaryFormWidget() {
         return {
            id: this.id + "_SELECT",
            name: "alvex/forms/controls/DateTextBox",
            config: {
               name: this.postParam,
               optionsConfig: this.optionsConfig,
               additionalCssClasses: "hiddenlabel",
               label: this.message(this.editLabel)
            }
         };
      }
   });
});
