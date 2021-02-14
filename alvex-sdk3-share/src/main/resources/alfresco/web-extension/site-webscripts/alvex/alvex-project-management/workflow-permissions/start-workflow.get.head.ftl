<#include "/com/alvexcore/components/form/form.get.head.ftl"> 
<!-- через customization не переопределяет wf-permission,тк он все равно загружается последним, поэтому перезаписываем через web-extension -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-project-management/css/components/workflow-permissions-admin/start-workflow.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-project-management/components/wfscheduler/jquery-cron.css" />

<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-project-management/js/components/workflow-permissions-admin/start-workflow.js"/>
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-project-management/components/wfscheduler/load-jquery-cron.js"/>
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-project-management/components/wfscheduler/start-workflow.js"/>