/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
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

/**
 * Main entrypoint for component webscript logic
 *
 * @method main
 */
function main()
{
   // Actions
   var actionSet = [],
      myConfig = new XML(config.script),
      xmlActionSet = myConfig.actionSet;
   
   var hideMeta=false;
   var hideConfig=false;
   var hidePanel=false;
   var hideSelect=false;
   var hidePaginator=false;
   model.hideMeta = hideMeta;
   model.hideConfig = hideConfig;
   model.hidePanel = hidePanel;
   model.hideSelect = hideSelect;
   model.hidePaginator = hidePaginator;

   for each (var xmlAction in xmlActionSet.action)
   {
      actionSet.push(
      {
         id: xmlAction.@id.toString(),
         className: xmlAction.@className.toString(),
         type: xmlAction.@type.toString(),
         permission: xmlAction.@permission.toString(),
         href: xmlAction.@href.toString(),
		 func: xmlAction.@func.toString(),
         label: xmlAction.@label.toString()
      });
   }

   model.actionSet = actionSet;
   
   // Widget instantiation metadata...
   /*
   var dataGrid = {
      id : "DataGrid", 
      name : "Alfresco.component.DataGrid",
      options : {
         siteId : (page.url.templateArgs.site != null) ? page.url.templateArgs.site : "",
         containerId : template.properties.container != null ? template.properties.container : "dataLists",
         usePagination : (args.pagination == "true")
      }
   };
   model.widgets = [dataGrid];
   */
   /*
   var dataGrid = {
	  id : "DataGrid", 
	  name : "Alvex.DataGrid",     
	  options : {
		   workflowsAvailable: (template.properties.workflowsAvailable=="true"),
	       siteId : (page.url.templateArgs.site != null) ? page.url.templateArgs.site : "",
	       containerId : template.properties.container != null ? template.properties.container : "dataLists",
	       usePagination : (args.pagination == "true")
	  },
	  messages : template.properties.messages
   }
   
   dataGrid.DATASOURCE_METHOD = "POST";
   dataGrid.ITEM_KEY = "nodeRef";

   dataGrid.getColumnsConfigUrl = function(meta)
   {
      return Alfresco.util.combinePaths(Alfresco.constants.URL_SERVICECONTEXT, "alvex/components/data-lists/config/columns2?itemType=" + encodeURIComponent(meta.itemType));
   };

   dataGrid.getPrefsStoreId = function(meta)
   {
      return "com.alvexcore.datagrid.docreg." + meta.nodeRef;
   };
   dataGrid.getDataSource = function(meta)
   {
      var listNodeRef = new Alfresco.util.NodeRef(meta.nodeRef);
      return new YAHOO.util.DataSource(Alfresco.constants.PROXY_URI + "api/alvex/datalists/search/node/" + listNodeRef.uri,
         {
            connMethodPost: true,
            responseType: YAHOO.util.DataSource.TYPE_JSON,
            responseSchema:
            {
               resultsList: "items",
               metaFields:
               {
                  paginationRecordOffset: "startIndex",
                  totalRecords: "totalRecords"
               }
            }
         });
   };
   dataGrid._buildDataGridParams = function(p_obj)
   {
      var request =
      {
         fields: this.dataRequestFields
      };

      if (p_obj && p_obj.filter)
      {
         request.filter = {}
         for (var field in p_obj.filter)
            if( field != "eventGroup" )
               request.filter[field] = p_obj.filter[field];
      }

      return request;
   };

   dataGrid.getSearchFormUrl = function(meta)
   {
      return Alfresco.util.combinePaths(Alfresco.constants.PROXY_URI,
               "api/alvex/dictionary?type=" + encodeURIComponent(meta.itemType) + "&container=" + encodeURIComponent(meta.nodeRef));
   };
   
   model.widgets = [dataGrid];
   */
}

main();
