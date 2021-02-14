define(["dojo/_base/declare",
        "alfresco/forms/controls/DateTextBox",
        "dijit/form/DateTextBox",
        "dojo/aspect",
        "dojo/_base/lang",
        "dojo/dom-class",
        "dojo/dom-construct"],
    function(declare, DateTextBox, DojoDateTextBox, aspect, lang, domClass, domConstruct) {

        return declare([DateTextBox], {
            i18nRequirements: [{i18nFile: "./i18n/DateRange.properties"}],
            cssRequirements: [{cssFile:"./css/DateRange.css"}],
            baseCssClass: "alfresco-forms-controls-DateRange",
            dateSeparator: "|",
            toBeforeFromErrorMessage: "daterange.toBeforeFrom.error",
            validateFromIsBeforeTo: function alfresco_forms_controls_DateRange__validateFromIsBeforeTo(validationConfig) {
                var isValid = true;
                var value = this.getValue();
                if (value)
                {
                    var valueTokens = value.split(this.dateSeparator);
                    var fromValue = "";
                    var toValue = "";
                    if (valueTokens.length === 2)
                    {
                        fromValue = valueTokens[0];
                        toValue = valueTokens[1];
                    }
                    if (fromValue !== "" && toValue !== "")
                    {
                        // If both pickers have a date, compare the values...
                        isValid = new Date(fromValue) < new Date(toValue);
                    }
                    else if (fromValue === "" && toValue === "")
                    {
                        // If neither picker has a value, it's fine...
                        isValid = true;
                    }
                    else
                    {
                        // ...but if one picker has a value, then it's in the invalid state...
                        isValid = false;
                    }
                }
                this.reportValidationResult(validationConfig, isValid);
            },
            postMixInProperties: function alfresco_forms_controls_DateRange__postMixInProperties() {
                this.inherited(arguments);

                if (!this.validationConfig)
                {
                    this.validationConfig = [];
                }
                this.validationConfig.push({
                    validation: "validateFromIsBeforeTo",
                    errorMessage: this.toBeforeFromErrorMessage
                });
            },
            placeWidget: function alfresco_forms_controls_DateRange__placeWidget() {
                this.inherited(arguments);
                domClass.add(this.wrappedWidget.domNode, this.baseCssClass + "__from");

                // Update the DOM node to include a specific class that we can anchor styles off...
                domClass.add(this.domNode, this.baseCssClass);

                this.separatorNode = domConstruct.create("span", {
                    className: this.baseCssClass + "__separator",
                    textContent: this.message("daterange.to.label")
                }, this._controlNode);

                this.toDateNode = domConstruct.create("div", {
                    className: this.baseCssClass + "__to"
                }, this._controlNode);

                this.toDate = new DojoDateTextBox({
                    id: this.id + "_TO_DATE_CONTROL"
                });
                this.toDate.validate = lang.hitch(this, function(){
                    setTimeout(lang.hitch(this, this.validate), 0);
                    return true;
                });
                this.toDate.placeAt(this.toDateNode);
            },
            getValue: function alfresco_forms_controls_DateRange__getValue() {
                // Get the from value...
                var fromValue = this.inherited(arguments);

                // Get the to value...
                var toValue = this.toDate.getValue();
                toValue = this.convertStringValuesToBoolean(toValue);
                toValue = this.processDateValue(toValue);

                // Convert "null" to empty string...
                !fromValue && (fromValue = "");
                !toValue && (toValue = "");

                // Concatenate them together...
                var value = fromValue + this.dateSeparator + toValue;
                (value === "|") && (value = "");

                return value;
            },
            setValue: function alfresco_forms_controls_DateRange__setValue(value) {
                if (value)
                {
                    var valueTokens = value.split(this.dateSeparator);
                    this.inherited(arguments, [valueTokens[0]]);
                    this.toDate.setValue(valueTokens[1]);
                }
                else
                {
                    this.inherited(arguments);
                }
            }
        });
    });