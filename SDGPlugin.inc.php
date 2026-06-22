<?php

/**
 * @file plugins/generic/sdg/SDGPlugin.inc.php
 *
 * Copyright (c) 2026 Yasiel Pérez Vera
 * Distributed under the GNU GPL v2. For full terms see the file docs/COPYING.
 *
 * @class SDGPlugin
 * @ingroup plugins_generic_sdg
 *
 * @brief SDG plugin class
 */


import('lib.pkp.classes.plugins.GenericPlugin');

class SDGPlugin extends GenericPlugin {

	//
	// Implement template methods from Plugin.
	//
	/**
	 * @copydoc Plugin::getDisplayName()
	 */
	function getDisplayName() {
		return __('plugins.generic.sdg.displayName');
	}

	/**
	 * @copydoc Plugin::getDescription()
	 */
	function getDescription() {
		return __('plugins.generic.sdg.description');
	}

    /**
     * @copydoc Plugin::getActions()
     */
    public function getActions($request, $verb){
        $actions = parent::getActions($request, $verb);
		if (!$this->getEnabled()) {
			return $actions;
		}
		$router = $request->getRouter();
		import('lib.pkp.classes.linkAction.request.AjaxModal');
		$linkAction = new LinkAction(
			'settings',
			new AjaxModal(
				$router->url(
					$request,
					null,
					null,
					'manage',
					null,
					array(
						'verb' => 'settings',
						'plugin' => $this->getName(),
						'category' => 'generic',
					)
				),
				$this->getDisplayName()
			),
			__('manager.plugins.settings'),
			null
		);
		array_unshift($actions, $linkAction);
		return $actions;
    }

    /**
     * @copydoc Plugin::manage()
     */
    public function manage($args, $request){

        $contextId = $request->getContext()->getId();
        switch ($request->getUserVar('verb')) {
			case 'settings':
				$this->import('classes/form/SDGSettingsForm');
				$form = new SDGSettingsForm($this, $contextId);
				if (!$request->getUserVar('save')) {
					$form->initData();

					return new JSONMessage(true, $form->fetch($request));
				}
				$form->readInputData();
				if ($form->validate()) {
					$form->execute();

					return new JSONMessage(true);
				}
		}
		return parent::manage($args, $request);
    }

	/**
	 * @see Plugin::register()
	 */
	function register($category, $path, $mainContextId = null) {
		if (!parent::register($category, $path, $mainContextId)) return false;
		if ($this->getEnabled($mainContextId)) {
			HookRegistry::register('ArticleHandler::view', array($this, 'insertSDGWheel'));
			//HookRegistry::register('Templates::Article::Main', array($this, 'insertSDGWheel'));

		}
		return true;
	}

	/**
	 * insert script SDG Wheel
	 * @param string $hookName
	 * @param array $args
	 */
	function insertSDGWheel($hookName, $args) {
		$request = Application::getRequest();
		$templateMgr = TemplateManager::getManager($request);

		$article = $templateMgr->getTemplateVars('article');
		if (!$article) return false;

		$context = $request->getContext();
		$model = $this->getSetting($context->getId(), 'sdgClassifierModel');
		if (!$model) {
			$model = 'aurora-sdg-multi';
		}

		$abstract = strip_tags($article->getLocalizedAbstract());

		$sdgLabels = array();
		for ($i = 1; $i <= 17; $i++) {
			$sdgLabels[] = __('plugins.generic.sdg.label.sdg' . $i);
		}

		// Get current locale
		$locale = AppLocale::getLocale();

		$templateMgr->assign(array(
			'sdgClassifierModel' => $model,
			'sdgAbstract' => $abstract,
			'sdgLabels' => $sdgLabels,
			'currentLocale' => $locale,
		));

        // Assign our private stylesheet, for front and back ends.
        $templateMgr->addStyleSheet(
            'sdgPlugin',
            $request->getBaseUrl() . '/' . $this->getPluginPath() . '/styles.css',
            [
                'contexts' => ['frontend']
            ]
        );

		$templateMgr->addJavaScript(
			'sdgPluginWidget',
			$request->getBaseUrl() . '/' . $this->getPluginPath() . '/widget.js',
			[
				'contexts' => ['frontend']
			]
		);

		$templateMgr->registerFilter('output', [$this, 'outputFilter']);

        return false;
	}

	/**
	 * Output filter to inject widget placeholder
	 * @param string $output
	 * @param TemplateManager $templateMgr
	 * @return string
	 */
	function outputFilter($output, $templateMgr) {
		if (preg_match('/<div[^>]+class="item published"[^>]*>/', $output, $matches, PREG_OFFSET_CAPTURE)) {
			$match = $matches[0][0];
			$offset = $matches[0][1];
			$newOutput = substr($output, 0, $offset);
			$newOutput .= $templateMgr->fetch($this->getTemplateResource('display.tpl'));
			$newOutput .= $match;
			$newOutput .= substr($output, $offset + strlen($match));
			$output = $newOutput;
			$templateMgr->unregisterFilter('output', array($this, 'outputFilter'));
		}
		return $output;
	}

}


