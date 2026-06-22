{**
 * templates/settingsForm.tpl
 *
 * Copyright (c) 2026 Yasiel Pérez Vera
 * Distributed under the GNU GPL v2. For full terms see the file docs/COPYING.
 *
 * SDG plugin settings
 *
 *}
<script type="text/javascript">
	$(function() {ldelim}
		// Attach the form handler.
		$('#sdgSettingsForm').pkpHandler('$.pkp.controllers.form.AjaxFormHandler');
	{rdelim});
</script>

<form class="pkp_form" id="sdgSettingsForm" method="post" action="{url router=$smarty.const.ROUTE_COMPONENT op="manage" plugin="sdgplugin" category="generic" verb="settings" save=true}">
	{csrf}
	{fbvFormArea id="sdgSettingsFormArea"}
		<p class="pkp_help">{translate key="plugins.generic.sdg.settings.description"}</p>
		{fbvFormSection list="true"}
			{fbvElement type="select" id="sdgClassifierModel" name="sdgClassifierModel" label="plugins.generic.sdg.settings.sdgClassifierModel" from=$sdgClassifierModels selected=$sdgClassifierModel translate=false size=$fbvStyles.size.MEDIUM}
		{/fbvFormSection}
	{/fbvFormArea}
	{fbvFormButtons submitText="common.save"}
</form>
