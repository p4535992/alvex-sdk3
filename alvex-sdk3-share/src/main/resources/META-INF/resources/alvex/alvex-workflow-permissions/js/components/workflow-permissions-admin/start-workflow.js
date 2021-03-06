/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 * Patched version, part of Alvex
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

if (typeof Alvex == "undefined" || !Alvex)
{
	var Alvex = {};
}

/**
 * StartWorkflow component.
 *
 * @namespace Alvex
 * @class Alvex.StartWorkflow
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * StartWorkflow constructor.
    *
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alvex.StartWorkflow} The new StartWorkflow instance
    * @constructor
    */
   Alvex.StartWorkflow = function StartWorkflow_constructor(htmlId)
   {
      Alvex.StartWorkflow.superclass.constructor.call(this, htmlId, ["button"]);

      // Re-register with our own name
      this.name = "Alvex.StartWorkflow";
      Alfresco.util.ComponentManager.reregister(this);

      // Instance variables
      this.options = YAHOO.lang.merge(this.options, Alvex.StartWorkflow.superclass.options);
      this.selectedItems = "";
      this.destination = "";
      this.workflowTypes = [];

      YAHOO.Bubbling.on("objectFinderReady", this.onObjectFinderReady, this);
      YAHOO.Bubbling.on("formContentReady", this.onStartWorkflowFormContentReady, this);

      return this;
   };

   YAHOO.extend(Alvex.StartWorkflow, Alfresco.component.ShareFormManager,
   {

      /**
       * Object container for initialization options
       *
       * @property options
       * @type object
       */
      options:
      {
         /**
          * The nodeRefs, separated by commas, to display in the workflow forms packageItems control.
          *
          * @property selectedItems
          * @type string
          */
         selectedItems: "",

         /**
          * A nodeRef that represents the context of the workflow
          *
          * @property destination
          * @type string
          */
         destination: "",

         // Name of the workflow to start
         workflowToStart: "",

         /**
          * The workflow types that can be started
          *
          * @property workflowDefinitions
          * @type Array of
          *    {
          *       name: {String} The workflow name (unique)
          *       title: {String} The title of the workflow
          *       description {String} The description of the workflow
          *    }
          */
         workflowDefinitions: []
      },

      /**
       * Fired by YUI when parent element is available for scripting.
       * Template initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function StartWorkflow_onReady()
      {
         this.widgets.workflowDefinitionMenuButton = Alfresco.util.createYUIButton(this, "workflow-definition-button",
               this.onWorkflowSelectChange,
         {
            label: this.msg("label.selectWorkflowDefinition"),
            title: this.msg("title.selectWorkflowDefinition"),
            type: "menu",
            menu: "workflow-definition-menu"
         });
		 
         if( this.options.workflowToStart != '' )
            for (wd in this.options.workflowDefinitions)
               if(this.options.workflowDefinitions[wd].name == this.options.workflowToStart)
                  this.processSelection(wd);
		 
         return Alvex.StartWorkflow.superclass.onReady.call(this);
      },

      /**
       * Will populate the form packageItem's objectFinder with selectedItems when its ready
       *
       * @method onObjectFinderReady
       * @param layer {object} Event fired (unused)
       * @param args {array} Event parameters
       */
      onObjectFinderReady: function StartWorkflow_onObjectFinderReady(layer, args)
      {
         var objectFinder = args[1].eventGroup;
         if (objectFinder.options.field == "assoc_packageItems" && objectFinder.eventGroup.indexOf(this.id) == 0)
         {
            objectFinder.selectItems(this.options.selectedItems);
         }
      },

      /**
       * Called when a workflow definition has been selected
       *
       * @method onWorkflowSelectChange
       */
      onWorkflowSelectChange: function StartWorkflow_onWorkflowSelectChange(p_sType, p_aArgs)
      {
         var i = p_aArgs[1].index;
         if (i >= 0)
            this.processSelection(i);
      },
	  
      processSelection: function (index)
      {
         // Update label of workflow menu button
         var workflowDefinition = this.options.workflowDefinitions[index];
         this.widgets.workflowDefinitionMenuButton.set("label", workflowDefinition.title);
         this.widgets.workflowDefinitionMenuButton.set("title", workflowDefinition.description);

         // Load the form for the specific workflow
         //MOD 4535992
         /*
         Alfresco.util.Ajax.request(
         {
            url: Alfresco.constants.URL_SERVICECONTEXT + "components/alvex/form",
            dataObj:
            {
               htmlid: this.id + "-startWorkflowForm-" + Alfresco.util.generateDomId(),
               itemKind: "workflow",
               itemId: workflowDefinition.name,
               mode: "create",
               submitType: "json",
               showCaption: true,
               formUI: true,
               showCancelButton: true,
               destination: this.options.destination
            },
            successCallback:
            {
               fn: this.onWorkflowFormLoaded,
               scope: this
            },
            failureMessage: this.msg("message.failure"),
            scope: this,
            execScripts: true
         }); 
         */
         //WHY THIS NOT WORK ????????????????????
         //var formUrl = Alfresco.constants.URL_SERVICECONTEXT + "components/alvex/form"
         var formUrl = Alfresco.constants.URL_SERVICECONTEXT + "components/form"
         Alfresco.util.Ajax.request(
         {
            url: formUrl,
            dataObj:
            {
               htmlid: this.id + "-startWorkflowForm-" + Alfresco.util.generateDomId(),
               itemKind: "workflow",
               itemId: workflowDefinition.name,
               mode: "create",
               submitType: "json",
               showCaption: true,
               formUI: true,
               showCancelButton: true,
               destination: this.options.destination
            },
            successCallback:
            {
            	fn: this.onWorkflowFormLoaded,
            	//fn: this.onWorkflowFormLoaded,
            	//fn: function (res) {
            	//	var formEl = Dom.get(this.id + "-workflowFormContainer");
            	//	Dom.addClass(formEl, "hidden");
            	//	formEl.innerHTML = res.serverResponse.responseText;			
            	//},
                scope: this
            },
            failureCallback: {
                fn: function (res) {
                	Alfresco.util.PopupManager.displayMessage({text: this.msg("message.failure")+" : " + res.serverResponse.responseText});
                },
                scope: this
            },
            //failureMessage: this.msg("message.failure"),
            scope: this,
            execScripts: true
         });
        //END MOD 4535992
	  },

      /**
       * Called when a workflow form has been loaded.
       * Will insert the form in the Dom.
       *
       * @method onWorkflowFormLoaded
       * @param response {Object}
       */
      onWorkflowFormLoaded: function StartWorkflow_onWorkflowFormLoaded(response)
      {
         var formEl = Dom.get(this.id + "-workflowFormContainer");
         Dom.addClass(formEl, "hidden");
         formEl.innerHTML = response.serverResponse.responseText;
      },

      /**
       * Event handler called when the "formContentReady" event is received
       */
      onStartWorkflowFormContentReady: function FormManager_onStartWorkflowFormContentReady(layer, args)
      {
         var formEl = Dom.get(this.id + "-workflowFormContainer");
         Dom.removeClass(formEl, "hidden");                  
      }

   });

})();
