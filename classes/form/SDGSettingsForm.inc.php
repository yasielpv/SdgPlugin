<?php

/**
 * @file classes/form/SDGSettingsForm.inc.php
 *
 * Copyright (c) 2026 Yasiel Pérez Vera
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class SDGSettingsForm
 * @brief Form for journal managers to setup the SDG plugin.
 */

import('lib.pkp.classes.form.Form');

class SDGSettingsForm extends Form
{
    const CONFIG_VARS = array(
        'sdgClassifierModel' => 'string',
	);
    //
    // Private properties
    //
    /** @var int */
    public $_contextId;

    /**
     * Get the context ID.
     *
     * @return int
     */
    public function _getContextId()
    {
        return $this->_contextId;
    }

    /** @var SDGPlugin */
    public $_plugin;

    /**
     * Get the plugin.
     *
     * @return SDGPlugin
     */
    public function _getPlugin()
    {
        return $this->_plugin;
    }

    //
    // Constructor
    //
    /**
     * Constructor
     *
     * @param SDGPlugin $plugin
     * @param int $contextId
     */
    public function __construct($plugin, $contextId)
    {
        $this->_contextId = $contextId;
        $this->_plugin = $plugin;

        parent::__construct($plugin->getTemplateResource('settingsForm.tpl'));

		$this->addCheck(new FormValidatorPost($this));
		$this->addCheck(new FormValidatorCSRF($this));
    }


    //
    // Implement template methods from Form
    //
    /**
     * @copydoc Form::initData()
     */
    public function initData()
    {
        $contextId = $this->_getContextId();
        $plugin = $this->_getPlugin();
        foreach (self::CONFIG_VARS as $fieldName => $type)  {
            $this->setData($fieldName, $plugin->getSetting($contextId, $fieldName));
        }
        $this->setData('sdgClassifierModels', $this->_getClassifierModels());
    }

    /**
     * Get the list of available classifier models for the settings select input.
     *
     * @return array
     */
    protected function _getClassifierModels()
    {
        return array(
            'aurora-sdg' => __('plugins.generic.sdg.settings.model.aurora-sdg'),
            'aurora-sdg-multi' => __('plugins.generic.sdg.settings.model.aurora-sdg-multi'),
            'elsevier-sdg-multi' => __('plugins.generic.sdg.settings.model.elsevier-sdg-multi'),
            'osdg' => __('plugins.generic.sdg.settings.model.osdg'),
        );
    }

    /**
     * @copydoc Form::readInputData()
     */
    public function readInputData()
    {
        $this->readUserVars(array_keys(self::CONFIG_VARS));
    }

     public function fetch($request, $template = null, $display = false)
    {
        $templateMgr = TemplateManager::getManager($request);
        $templateMgr->assign('sdgClassifierModels', $this->_getClassifierModels());
        $templateMgr->assign('pluginName', $this->_plugin->getName());
        return parent::fetch($request, $template, $display);
    }


    /**
     * @copydoc Form::execute()
     */
    public function execute(...$functionArgs)
    {
        $plugin = $this->_getPlugin();
        $contextId = $this->_getContextId();
        parent::execute(...$functionArgs);
        foreach (self::CONFIG_VARS as $fieldName => $type)  {
            $plugin->updateSetting($contextId, $fieldName, $this->getData($fieldName), $type);
        }
    }
}
