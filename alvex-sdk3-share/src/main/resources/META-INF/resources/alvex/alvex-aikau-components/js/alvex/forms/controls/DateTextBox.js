define(["alfresco/forms/controls/DateTextBox",
        "alvex/forms/controls/BaseFormControl",
        "alfresco/core/topics",
        "dojo/_base/declare",
        "dijit/form/DateTextBox",
        "dojo/dom-class",
        "dojo/_base/lang"
    ],
    function(DateTextBox, BaseFormControl, topics, declare, dijitDateTextBox, domClass, lang) {
        return declare([DateTextBox, BaseFormControl], {

            unsetReturnValue: "",
            createFormControl: function alvex_forms_controls_DateTextBox__createFormControl(config) {

                config.constraints = {
                    datePattern: 'dd.MM.yyyy'
                };
                domClass.add(this.domNode, "alfresco-forms-controls-DateTextBox");
                var dateTextBox = new dijitDateTextBox(config);
                dateTextBox.validate = lang.hitch(this, function() {
                    setTimeout(lang.hitch(this, this.validate), 0);
                    return true;
                });
                return dateTextBox;
            },
            setValue: function (value) {
               if (value === "") {
                  this.value = null;
               } else {
                  this.inherited(arguments);
               }
            }
        })
    });
