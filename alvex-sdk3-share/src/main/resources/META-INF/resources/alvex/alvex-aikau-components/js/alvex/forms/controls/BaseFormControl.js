/*
  Parent for all custom form constrols. Does not validate fields that are hidden if validateWhenHidden is false.
  Sample (using TextBox and CheckBox widgets):
  {
    name: "alvex/forms/controls/CheckBox",
    config: {
      fieldId: "TEST",
      name: "test1",
      label: "1"
    }
  },{
    name: "alvex/forms/controls/TextBox",
    config: {
      name: "test2",
      label: "2",
      requirementConfig: {
        initialValue: true
      },
      visibilityConfig: {
        initialValue: false,
        rules: [{
            targetId: "TEST",
            is: [true]
        }]
      }
    }
  }
*/

define(["dojo/_base/declare",
    "dojo/dom-style",
    "alfresco/core/ObjectTypeUtils",
    "alfresco/forms/controls/BaseFormControl"
  ],
  function(declare, domStyle, ObjectTypeUtils, BaseFormControl) {

    return declare([BaseFormControl], {

      validate: function alvex_forms_controls_BaseFormControl__validate() {
        if (this.deferValueAssigment) {
          // Do nothing until final value has been assigned
        } else {
          if ((this._visible || this.validateWhenHidden) && !this._disabled) {
            if (this.validationConfig && ObjectTypeUtils.isArray(this.validationConfig)) {
              this.startValidation();
            } else {
              var isValid = this.processValidationRules();
              if (isValid) {
                this.alfPublish("ALF_VALID_CONTROL", {
                  name: this.name,
                  fieldId: this.fieldId
                });
                this.hideValidationFailure();
              } else {
                this.alfPublish("ALF_INVALID_CONTROL", {
                  name: this.name,
                  fieldId: this.fieldId
                });

                this.showValidationFailure();
              }
            }
          } else {
            this.alfPublish("ALF_VALID_CONTROL", {
              name: this.name,
              fieldId: this.fieldId
            });
            this.hideValidationFailure();
          }
        }
      },

      alfVisible: function alvex_forms_controls_BaseFormControl__alfVisible(status) {
        this.alfLog("log", "Change visibility status for '" + this.fieldId + "' to: " + status);
        this._visible = status;
        if (this.containerNode) {
          var display = status ? "" : "none";
          domStyle.set(this.containerNode, {
            display: display
          });
        }
        this.validate();
      }
    });
  });
