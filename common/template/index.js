/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const urlTemplate = require('./url');
const commonTemplate = require('./common');
const npmTemplate = require('./npm');
const localTemplate = require('./local');
const path = require('path');
const util = require('../../util');

const _HYBRID = 'hybrid';
const _WEB = 'web';

const BLANK_TEMPLATE = 'blank';

const _TEMPLATES_NPM_URL = '@oracle/oraclejet-templates@~7.1.0';

const _TEMPLATES = [BLANK_TEMPLATE, 'basic', 'navbar', 'navdrawer'];


module.exports =
{
  handleTemplate: function _handleTemplate(generator, utils, templateDestDirectory) {
    const template = generator.options.template || BLANK_TEMPLATE;
    utils.log(`Processing template: ${template}`);
    const templateHandler = _getHandler(generator, template, templateDestDirectory);
    return commonTemplate.handle(templateHandler, generator.options.namespace);
  }
};

function _getHandler(generator, template, templateDestDirectory) {
  const templateUrl = _toTemplateUrl(template);
  const templateLocalPath = _getLocalFileAbsolutePath(template);

  if (templateUrl) {
    return urlTemplate.handle(generator, templateUrl, templateDestDirectory);
  }

  if (templateLocalPath) {
    return localTemplate.handle(generator, templateLocalPath, templateDestDirectory);
  }
  const templateSpec = _resolveTemplateSpec(generator, template);
  return npmTemplate.handle(generator, _TEMPLATES_NPM_URL, templateDestDirectory, templateSpec);
}

function _isUrl(url) {
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(url);
}

function _toTemplateUrl(template) {
  if (_isUrl(template)) {
    return template;
  }

  return null;
}

function _resolveTemplateSpec(generator, template) {
  const res = template.split(':');

  const templateName = res[0];
  const templateType = (res.length > 1) ? res[1] : _getGeneratorType(generator.options.namespace);

  _validateTemplateName(templateName);
  _validateTemplateType(templateType);

  return { name: templateName, type: templateType };
}

function _validateTemplateName(templateName) {
  if (_TEMPLATES.indexOf(templateName) < 0) {
    let templateList = '';
    _TEMPLATES.forEach((value) => {
      templateList += `\n  ${value}`;
    });
    const msg = `\nA URL or one of the following names is expected: ${templateList}`;
    throw new Error(`Invalid template name: ${templateName}. ${msg}`);
  }
}

function _getGeneratorType(generatorNameSpace) {
  return /hybrid/.test(generatorNameSpace) ? _HYBRID : _WEB;
}

function _validateTemplateType(templateType) {
  if (templateType !== _WEB && templateType !== _HYBRID) {
    throw new Error(`Invalid template type: ${templateType}`);
  }
}

function _getLocalFileAbsolutePath(templatePath) {
  const tempPath = (templatePath[0] !== '~') ? templatePath
                      : path.join(process.env.HOME, templatePath.slice(1));
  const absolutePath = path.isAbsolute(tempPath) ? tempPath
                      : path.resolve(process.cwd(), tempPath);
  return util.fsExistsSync(absolutePath) ? absolutePath : null;
}
