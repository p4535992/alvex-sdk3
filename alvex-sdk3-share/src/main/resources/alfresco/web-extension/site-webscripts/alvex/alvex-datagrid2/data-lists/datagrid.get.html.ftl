<#assign id = args.htmlid>
<!--[if IE]>
   <iframe id="yui-history-iframe" src="${url.context}/res/yui/history/assets/blank.html"></iframe>
<![endif]-->
<input id="yui-history-field" type="hidden" />
<#-- <#include "/org/alfresco/components/form/form.dependencies.inc" /> -->

<#include "./alvex-datagrid.inc.ftl">
<@renderAlvexDatagridHTML id />
<@link href="${url.context}/res/components/data-lists/datagrid.css" />
<@script src="${url.context}/res/components/data-lists/datagrid.js" />
<#--
<@markup id="css" >  
   <#include "/org/alfresco/components/form/form.css.ftl" />
   <@link href="${url.context}/res/components/data-lists/datagrid.css"          group="datalistsAlvexDataGrid" />
   <@link rel="stylesheet" type="text/css" href="${url.context}/res/alvex/alvex-datagrid2/css/components/alvex/datalists/datagrid.css" group="datalistsAlvexDataGrid"/>
</@>

<@markup id="js">
   	<#include "/org/alfresco/components/form/form.js.ftl" />
   	<@script src="${url.context}/res/components/data-lists/datagrid.js"          group="datalistsAlvexDataGrid" />
   	<@script type="text/javascript" src="${url.context}/res/yui/calendar/calendar.js" group="datalistsAlvexDataGrid"/>
   	<@script type="text/javascript" src="${url.context}/res/modules/data-lists/datalist-actions.js"group="datalistsAlvexDataGrid" />
   
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-utils/js/components/alvex.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-datagrid2/js/components/alvex/datalists/datagrid-renderers.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-datagrid2/js/components/alvex/datalists/datagrid-search.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-datagrid2/js/components/alvex/datalists/datagrid-search-renderers.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-datagrid2/js/components/alvex/datalists/datagrid.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-datagrid2/js/components/alvex/datalists/datagrid-actions.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-utils/js/components/alvex/simple-dialog.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/alvex/alvex-utils/js/components/alvex/interval-calendar.js" group="datalistsAlvexDataGrid"/>
	<@script type="text/javascript" src="${url.context}/res/js/alfresco-dnd.js" group="datalistsAlvexDataGrid"/>
</@>

<@markup id="widgets">
   <@createWidgets group="datalistsAlvexDataGrid"/>
</@>
<@markup id="html">
   <@uniqueIdDiv>  

<div id="${id}-body" class="datagrid">
   <div class="datagrid-meta" <#if hideMeta>style="display:none"</#if>>
      <h2 id="${id}-title"></h2>
      <div id="${id}-listType" class="datagrid-description"></div>
      <div id="${id}-description" class="datagrid-description"></div>
   </div>
   <div class="datagrid-actions" <#if hideConfig>style="display:none"</#if>>
      <span class="configure-page"><button id="${id}-configurePage-button" name="configurePage">${msg("button.configurePage")}</button></span>
   </div>
   <div id="${id}-datagridBar" class="yui-ge datagrid-bar flat-button" <#if hidePanel>style="display:none"</#if>>
      <div class="yui-u first align-center">
         <div class="item-select" <#if hideSelect>style="display:none"</#if>>
            <button id="${id}-itemSelect-button" name="datagrid-itemSelect-button">${msg("menu.select")}</button>
            <div id="${id}-itemSelect-menu" class="yuimenu">
               <div class="bd">
                  <ul>
                     <li><a href="#"><span class="selectAll">${msg("menu.select.all")}</span></a></li>
                     <li><a href="#"><span class="selectInvert">${msg("menu.select.invert")}</span></a></li>
                     <li><a href="#"><span class="selectNone">${msg("menu.select.none")}</span></a></li>
                  </ul>
               </div>
            </div>
         </div>
         <div id="${id}-paginator" class="paginator" <#if hidePaginator>style="display:none"</#if>></div>
      </div>
      <div class="yui-u align-right">
         <div class="items-per-page" style="visibility: hidden;">
            <button id="${id}-itemsPerPage-button">${msg("menu.items-per-page")}</button>
         </div>
      </div>
   </div>

   <div id="${id}-search-form" name="search">
      <div id="${id}-search-container" class="hidden">
         <div style="background-color: #C0C0C0;">
            <strong style="display: inline-block; margin-bottom: 4px; margin-left: 10px; margin-top: 4px;">${msg("page.search.title")}</strong>
         </div>
         <table class="grid" style="border: 1px solid #C0C0C0; margin-bottom: 8px;"><tr id="${id}-search" ></tr></table>
         <div style="display:none">
            <button id="${id}-search-button">${msg("button.search")}</button>
         </div>
      </div>
   </div>

   <div id="${id}-grid" class="grid"></div>

   <div id="${id}-selectListMessage" class="hidden select-list-message">${msg("message.select-list")}</div>

   <div id="${id}-datagridBarBottom" class="yui-ge datagrid-bar datagrid-bar-bottom flat-button">
      <div class="yui-u first align-center">
         <div class="item-select">&nbsp;</div>
         <div id="${id}-paginatorBottom" class="paginator"></div>
      </div>
   </div>


   <div style="display:none">

      <div id="${id}-moreActions">
         <div title="onActionShowMore" class="onActionShowMore"><a href="#" class="show-more ${id}-show-more" title="${msg("actions.more")}"><span></span></a></div>
         <div class="more-actions hidden"></div>
      </div>


      <div id="${id}-actionSet" class="action-set simple">
      <#if actionSet??>
      <#list actionSet as action>
         <div title="${action.func}" class="${action.className}"><a rel="${action.permission!""}" href="${action.href}" class="${action.type} ${id}-${action.type}" title="${msg(action.label)}"><span>${msg(action.label)}</span></a></div>
      </#list>
      </#if>
      </div>
   </div>
</div>

<#assign pickerId = id + "-conf-dialog">

<div id="${pickerId}" class="picker yui-panel hidden">
   <div id="${pickerId}-head" class="hd">${msg("title.configurePage")}</div>
   <div id="${pickerId}-body" class="bd column-config-dialog-body">

      <div class="used">
         <h3 class="padded">${msg("title.usedColumns")}</h3>
         <ul id="${pickerId}-column-ul-1" class="usedList">
         </ul>
      </div>

      <div class="available">
         <h3 class="padded">${msg("title.availableColumns")}</h3>
         <ul id="${pickerId}-column-ul-0" class="availableList">
         </ul>
      </div>

      <div style="display: none;">
         <ul>
            
            <li class="usedDashlet dnd-shadow" id="${pickerId}-dashlet-li-shadow"></li>
         </ul>
      </div>

   </div>
   <div class="ft">
      <input id="${pickerId}-ok" name="-" type="button" value="${msg("button.ok")}" />
      <input id="${pickerId}-cancel" name="-" type="button" value="${msg("button.cancel")}" />
   </div>
</div>

   </@>
</@>
-->


<script type="text/javascript">//<![CDATA[
   var dg = new Alvex.DataGrid('${id}').setOptions(
   {
      workflowsAvailable: "${(workflowsAvailable!false)?string}",
      usePagination: ${(args.pagination!false)?string}
   }).setMessages(${messages});

   dg.DATASOURCE_METHOD = "POST";
   dg.ITEM_KEY = "nodeRef";

   dg.getColumnsConfigUrl = function(meta)
   {
      return Alfresco.util.combinePaths(Alfresco.constants.URL_SERVICECONTEXT, "alvex/components/data-lists/config/columns2?itemType=" + encodeURIComponent(meta.itemType));
   };

   dg.getPrefsStoreId = function(meta)
   {
      return "com.alvexcore.datagrid.docreg." + meta.nodeRef;
   };
   dg.getDataSource = function(meta)
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
   dg._buildDataGridParams = function(p_obj)
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

   dg.getSearchFormUrl = function(meta)
   {
      return Alfresco.util.combinePaths(Alfresco.constants.PROXY_URI,
               "api/alvex/dictionary?type=" + encodeURIComponent(meta.itemType) + "&container=" + encodeURIComponent(meta.nodeRef));
   };




//]]></script>