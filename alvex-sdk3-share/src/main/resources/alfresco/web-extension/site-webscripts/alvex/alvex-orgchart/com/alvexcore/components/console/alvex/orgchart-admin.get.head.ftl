<#-- <#include "/form.get.head.ftl"> -->
<#include "/org/alfresco/components/form/form.get.head.ftl">
<#-- MOD 4535992 ADDED INCLUDES OF FTL -->
<#include "/alvex/alvex-orgchart/orgchart-group-picker.ftl">
<#include "/alvex/alvex-orgchart/orgchart-picker.ftl">
<#-- MOD 4535992 https://community.alfresco.com/thread/208101-typeerror-alfrescoformui-is-not-a-constructor --> 
<#-- <#include "/org/alfresco/components/form/form.dependencies.inc"> -->
<#-- 
<@link href="${page.url.context}/res/yui/calendar/assets/calendar.css"/>
<@link href="${page.url.context}/res/components/object-finder/object-finder.css"/>
<@link href="${page.url.context}/res/components/form/form.css"/>
-->
<#--  
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/yui/datatable/assets/skins/sam/datatable.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/profile/profile.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/yui/assets/skins/sam/treeview.css" />
-->
<#-- 
<@script src="${page.url.context}/res/components/form/form.js"/>
<@script src="${page.url.context}/res/components/form/date.js"/>
<@script src="${page.url.context}/res/components/form/date-picker.js"/>
<@script src="${page.url.context}/res/components/form/period.js"/>
<@script src="${page.url.context}/res/components/object-finder/object-finder.js"/>
<@script src="${url.context}/res/components/common/common-component-style-filter-chain.js"/>
<@script src="${page.url.context}/res/yui/calendar/calendar.js"/>
<script type="text/javascript" src="${page.url.context}/res/modules/editors/tinymce/tinymce.min.js"></script>
<@script src="${page.url.context}/res/modules/editors/tiny_mce.js"/>
<@script src="${page.url.context}/res/components/form/rich-text.js"/>
<@script src="${page.url.context}/res/components/form/content.js"/>
<@script src="${page.url.context}/res/components/form/workflow/transitions.js"/>
<@script src="${page.url.context}/res/components/form/workflow/activiti-transitions.js"/>
<@script src="${page.url.context}/res/components/form/jmx/operations.js"/>

<@script type="text/javascript" src="${page.url.context}/res/yui/yahoo-dom-event/yahoo-dom-event.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/element/element.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/uploader/uploader.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/datasource/datasource.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/datatable/datatable.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/cookie/cookie.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/resize/resize.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/treeview/treeview.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/animation/animation.js" />
<@script type="text/javascript" src="${page.url.context}/res/yui/dragdrop/dragdrop.js" />
-->
<@script src="${page.url.context}/res/components/form/form.js"/>
<@script src="${page.url.context}/res/components/form/date.js"/>
<@script src="${page.url.context}/res/components/form/date-picker.js"/>
<@script src="${page.url.context}/res/components/form/period.js"/>
<#-- END MOD 4535992 -->

<@script type="text/javascript" src="${page.url.context}/res/modules/simple-dialog.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/components/alvex/alvex.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/components/alvex/orgchart/people-finder.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/components/alvex/orgchart/orgchart-view.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/components/alvex/orgchart/orgchart-group-view.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/grouped-data-table/grouped-data-table.js" />

<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/people-finder/people-finder.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-orgchart/css/components/alvex/orgchart/orgchart-view.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-orgchart/css/grouped-data-table/grouped-data-table.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/components/profile/profile.css" />
