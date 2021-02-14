define(["dojo/_base/declare",
        "alfresco/renderers/InlineEditProperty",
        "alvex/forms/controls/FilteringSelect"],
        function(declare, InlineEditProperty) {

   return declare([InlineEditProperty], {

      /**
       * Overrides the [inherited function]{@link module:alfresco/renderers/InlineEditProperty#getPrimaryFormWidget}
       * to return a [select form control]{@link module:alvex/forms/controls/FilteringSelect}.
       *
       * @instance
       * @returns {object} The widget for editing.
       */
      showAllOptionsOnOpen: true,

      getPrimaryFormWidget: function alvex_renderers_InlineEditSelect__getPrimaryFormWidget() {
         return {
            id: this.id + "_SELECT",
            name: "alvex/forms/controls/FilteringSelect",
            config: {
               name: this.postParam,
               optionsConfig: this.optionsConfig,
               additionalCssClasses: "hiddenlabel",
               label: this.message(this.editLabel),
               showAllOptionsOnOpen: this.showAllOptionsOnOpen
            }
         };
      }
   });
});
