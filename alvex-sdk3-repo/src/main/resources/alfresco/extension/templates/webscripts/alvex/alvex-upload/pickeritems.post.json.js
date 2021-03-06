<import resource="classpath:alfresco/extension/templates/webscripts/alvex/alvex-upload/pickerresults.lib.js">

function sortNewestFirst(a,b) {
   if (a.properties == undefined || b.properties == undefined
         || a.properties["cm:modified"] == undefined
         || b.properties["cm:modified"] == undefined
         || a.properties["cm:created"] == undefined
         || b.properties["cm:created"] == undefined)
      return 0;

   if (a.properties["cm:modified"] < b.properties["cm:modified"])
      return 1;
   if (a.properties["cm:modified"] > b.properties["cm:modified"])
      return -1;
   if (a.properties["cm:created"] < b.properties["cm:created"])
      return 1;
   if (a.properties["cm:created"] > b.properties["cm:created"])
      return -1;
   return 0;
}

function main()
{
   var count = 0,
      items = [],
      results = [];

   // extract mandatory data from request body
   if (!json.has("items"))
   {
       status.setCode(status.STATUS_BAD_REQUEST, "items parameter is not present");
       return;
   }
   
   // convert the JSONArray object into a native JavaScript array
   var jsonItems = json.get("items"),
      itemValueType = "nodeRef",
      itemValueTypeHint = "",
      numItems = jsonItems.length(),
      item, result;
   
   if (json.has("itemValueType"))
   {
      var jsonValueTypes = json.get("itemValueType").split(";");
      itemValueType = jsonValueTypes[0];
      itemValueTypeHint = (jsonValueTypes.length > 1) ? jsonValueTypes[1] : "";
   }
   
   for (count = 0; count < numItems; count++)
   {
      item = jsonItems.get(count);
      if (item != "")
      {
         result = null;
         if (itemValueType == "nodeRef")
         {
            result = search.findNode(item);
         }
         else if (itemValueType == "xpath")
         {
            result = search.xpathSearch(itemValueTypeHint.replace("%VALUE%", search.ISO9075Encode(item)))[0];
         }
         
         if (result != null)
         {
            // create a separate object if the node represents a user or group
            if (result.isSubType("cm:person"))
            {
               result = createPersonResult(result);
            }
            else if (result.isSubType("cm:authorityContainer"))
            {
               result = createGroupResult(result);
            }
            
            results.push(
            {
               item: result
            });
         }
      }
   }

   results.sort(sortNewestFirst);

   if (logger.isLoggingEnabled())
       logger.log("#items = " + count + ", #results = " + results.length);

   model.results = results;
}

main();
