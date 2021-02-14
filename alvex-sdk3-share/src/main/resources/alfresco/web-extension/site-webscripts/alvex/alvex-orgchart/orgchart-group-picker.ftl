<#include "/org/alfresco/components/component.head.inc">
<#-- MOD 4535992 -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-orgchart/css/components/alvex/orgchart/orgchart-view.css" />
<@link rel="stylesheet" type="text/css" href="${page.url.context}/res/alvex/alvex-orgchart/css/grouped-data-table/grouped-data-table.css" />

<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-utils/js/components/alvex/alvex.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/components/alvex/orgchart/orgchart-view.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/components/alvex/orgchart/orgchart-group-view.js" />
<@script type="text/javascript" src="${page.url.context}/res/alvex/alvex-orgchart/js/grouped-data-table/grouped-data-table.js" />
<#-- END MOD 4535992 -->
<#-- <#include "./orgchart-group-picker-dialog.inc.ftl"> -->
<#include "/alvex/alvex-orgchart/orgchart-picker-dialog.inc.ftl">
<#assign controlId = fieldHtmlId + "-cntrl">

<div class="form-field">

	<#if form.mode == "view">
		<div id="${controlId}" class="viewmode-field">
			<#if field.endpointMandatory && field.value == "">
				<span class="incomplete-warning">
					<img src="${url.context}/res/components/form/images/warning-16.png" title="${msg("form.field.incomplete")}" />
				<span>
			</#if>
			<span class="viewmode-label">${field.label?html}:</span>
			<span id="${controlId}-currentValueDisplay" class="viewmode-value current-values"></span>
			<input type="hidden" id="${fieldHtmlId}" name="-" value="${field.value}" />
		</div>
	<#else>
		<label for="${controlId}">${field.label?html}:
			<#if field.endpointMandatory>
				<span class="mandatory-indicator">${msg("form.required.fields.marker")}</span>
			</#if>
		</label>
		<div id="${controlId}" class="object-finder">
			<div id="${controlId}-currentValueDisplay" class="current-values object-finder-items"></div>
			<input type="hidden" id="${fieldHtmlId}" name="-" value="${field.value}" />
			<#if field.disabled == false>
				<input type="hidden" id="${controlId}-added" name="${field.name}_added" value="" />
				<input type="hidden" id="${controlId}-removed" name="${field.name}_removed" value="" />
				<@renderOrgchartPickerDialogHTML controlId />
				<div id="${controlId}-itemGroupActions" class="orgchart-picker">
					<input type="button" id="${controlId}-orgchart-picker-button" name="-" 
						value="${msg("alvex.orgchart.orgchart_picker_button")}"/>
				</div>
			</#if>
		</div>
	</#if>

</div>

<script type="text/javascript">
	new Alvex.OrgchartGroupViewer( "${fieldHtmlId}" ).setOptions({
		<#if field.mandatory??>
        mandatory: ${field.mandatory?string},
	<#elseif field.endpointMandatory??>
        mandatory: ${field.endpointMandatory?string},
	</#if>
        multipleSelectMode: ${field.endpointMany?string}
    }).setMessages( ${messages} );
</script>
