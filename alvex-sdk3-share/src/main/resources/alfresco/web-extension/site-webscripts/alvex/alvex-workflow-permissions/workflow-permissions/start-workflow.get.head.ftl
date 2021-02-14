<#-- 
	TODO: Try to get rid of this incclude, and refactor code in a way to 
	avoid using *.head.ftl since they've depricated!
	Hint: You can create some *-lib.ftl and include it!
-->
<#include "/alvex/alvex-workflow-permissions/com/alvexcore/components/form/form.get.head.ftl"> 
<!-- Start Workflow -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-workflow-permissions/css/components/workflow-permissions-admin/start-workflow.css" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-workflow-permissions/js/components/workflow-permissions-admin/start-workflow.js" />
