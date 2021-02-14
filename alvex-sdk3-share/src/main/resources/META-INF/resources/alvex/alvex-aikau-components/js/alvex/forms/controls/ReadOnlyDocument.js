define(["dojo/_base/declare",
    "dojo/_base/lang",
    "alvex/forms/controls/BaseFormControl",
    "alfresco/core/CoreWidgetProcessing",
    "alvex/renderers/Document"
  ],

  function(declare, lang, BaseFormControl, CoreWidgetProcessing) {

    return declare([BaseFormControl, CoreWidgetProcessing], {

      createFormControl: function alvex_forms_controls_ReadOnlyDocument__postCreate() {
        this.subscriptionTopic = "ST_" + this.generateUuid();
        var widgetsForControl = this.createWidget({
          name: "alvex/renderers/Document",
          config: {
            isUploadRender: true,
            currentItem: lang.getObject(this.propertyToRender, false, this.currentItem).split(",")
          }
        });
        return widgetsForControl;
      }
    });
  });
