/**
 * Main entrypoint for component webscript logic
 *
 * @method main
 */
function main()
{
   // Actions
   var myConfig = new XML(config.script),
      xmlActionSet = myConfig.actionSet,
      actionSet = [];
   
   for each (var xmlAction in xmlActionSet.action)
   {
      actionSet.push(
      {
         id: xmlAction.@id.toString(),
         type: xmlAction.@type.toString(),
         permission: xmlAction.@permission.toString(),
         asset: xmlAction.@asset.toString(),
         href: xmlAction.@href.toString(),
         label: xmlAction.@label.toString()
      });
   }

/*
   model.actionSet = actionSet;
   
   // Widget instantiation metadata...
   var toolbar = {
      id : "DataListToolbar", 
      name : "Alfresco.component.DataListToolbar",
      options : {
         siteId : (page.url.templateArgs.site != null) ? page.url.templateArgs.site : ""
      }
   };
   
   model.widgets = [toolbar];
*/
   
   var userId = user.id;
   var siteId = page.url.templateArgs.site;
   
   var resp = remote.call("/api/sites/" + siteId + "/memberships/" + userId);
   
   var isAdmin = false;
   
   if (resp.status == 200)
   {
      var data = eval('(' + resp + ')');
      if(data.role == "SiteManager")
         isAdmin = true;
   }
   model.isSiteAdmin = isAdmin;
   model.actionSet = actionSet;
   
   /*
   var toolbar = {
      id : "DataListToolbar", 
      name : "Alvex.DataListsToolbar",
      options : {
         siteId : (page.url.templateArgs.site != null) ? page.url.templateArgs.site : ""
      },
	  messages : template.properties.messages
   };
   
   model.widgets = [toolbar];
   */
}

main();

