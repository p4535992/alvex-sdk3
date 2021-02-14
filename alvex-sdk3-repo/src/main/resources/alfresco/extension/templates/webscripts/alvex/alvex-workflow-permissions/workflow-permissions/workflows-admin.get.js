//<import resource="classpath:alfresco/templates/webscripts/workflow-permissions/workflow-shortcut.lib.js">
<import resource="classpath:alfresco/templates/webscripts/alvex/alvex-workflow-permissions/workflow-permissions/workflow-shortcut.lib.js">

var group = args['group'];
if(!group || group == 'undefined')
	group = 'default';

var allowedWorkflows = [];

var dict = companyhome.childrenByXPath("app:dictionary")[0];
var folder = Utils.getDir("app:alvex/app:workflow-permissions/", dict);

if(folder != undefined) {
	logger.error("[WORKFLOWS ADMIN GET] folder: " + jsonUtils.toJSONString(folder));
	var children = folder.children;
	var found = false;
	for (c in children) {
		var node = children[c];
		if (node.name == group + '.config') {
			found = true;
			var lines = new String(node.content).toString().split('\n');
			for(l in lines){
				if(lines[l] != ''){
					allowedWorkflows.push({name : lines[l]});
				}
			}
		}
	}
	if(!found) {
		var file = folder.createFile(group + '.config');
		file.mimetype = "text/plain";
		file.content = '';
		file.save();
	}
}else{
	logger.error("[WORKFLOWS ADMIN GET] folder is UNDEFINED");	
}

model.workflows = allowedWorkflows;
