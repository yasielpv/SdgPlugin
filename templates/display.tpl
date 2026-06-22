{**
 * plugins/generic/sdg/templates/display.tpl
 *
 * Copyright (c) 2026 Yasiel Pérez Vera 
 * @file plugins/generic/sdg/templates/display.tpl
 *
 *}
<div class="item sdg">
<h3>
        {translate key="plugins.generic.sdg.SdgContribution"}
    </h3>
	<div class="sdg-wheel" data-text="{$sdgAbstract|escape}" data-model="{$sdgClassifierModel|escape}" data-wheel-height="250" data-labels="{$sdgLabels|json_encode|escape}" data-locale="{$currentLocale|escape}"></div>
</div>
