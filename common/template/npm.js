/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const utils = require('../../lib/util/utils');
const injectorUtils = require('../../lib/util/injectors');

const templateRoot = path.dirname(require.resolve('@oracle/oraclejet-templates'));

module.exports = {
  handle: function _handle(generator, destination, templateSpec) {
    try {
      _copyNpmTemplate(generator, templateSpec, destination);
      return Promise.resolve(generator);
    } catch (err) {
      return Promise.reject(err);
    }
  }
};

/**
 * ## _copyNpmTemplate
 * Copies template files.
 *
 * The templates are found in the installed oraclejet-templates module.
 * The source template directory is determined as follows:
 * 1. check if the templateName/type directory exists in oraclejet-templates
 *    e.g. 'navbar/hybrid'.
 * 2. if not, use the content of the templateName directory (only common content
 *    exists for both 'web' and 'hybrid' templates).
 *
 * @param {Object} generator  - parent generator
 * @param {Object} templateSpec - template specification
 * @param {string} destination  - destination path
 */
function _copyNpmTemplate(generator, templateSpec, destination) {
  const src = _getTemplateFromTypeSpecificDirectory(templateSpec) ||
              _getTemplateFromGenericDirectory(templateSpec);

  if (!src) {
    const msg = `${templateSpec.name}:${templateSpec.type}`;
    throw new Error(`Could not find source for template: ${msg}`);
  }

  // 1. Check if top level sources contain 'src/' directory
  const sourceTopLevelEntries = fs.readdirSync(src);
  let isTemplateInNewFormat = false;

  for (let i = 0; i < sourceTopLevelEntries.length; i += 1) {
    if (sourceTopLevelEntries[i] === 'src') {
      isTemplateInNewFormat = true;
      break;
    }
  }

  if (!isTemplateInNewFormat) {
    utils.log.error('No "src" directory found. This might indicate you are using deprecated format of an app template.');
  }

  const isVDOMTemplate = utils.isVDOMTemplate(generator);
  const filesToCopy = utils.readdirSync({ dir: src, recursive: true });
  const templateSegment = path.join(templateSpec.name, templateSpec.type);

  filesToCopy.forEach((filePath) => {
    // go from node_modules/@oracle/oraclejet-templates/<template-name>/<template-type>/path/to/file
    // to path/to/file
    let filePathDest;
    const filePathFromTemplateRoot = filePath.split(templateSegment).pop();
    const isPathMappingJson = path.basename(filePath) === 'path_mapping.json';
    const isIndexHtml = path.basename(filePath) === 'index.html';
    if (isVDOMTemplate && isPathMappingJson) {
      const pathMappingJson = fs.readJSONSync(filePath);
      // baseUrl will be set from javascript location in oraclejetconfig.json
      delete pathMappingJson.baseUrl;
      // write to root of the app and not /src
      filePathDest = path.join(destination, '../path_mapping.json');
      fs.writeJSONSync(filePathDest, pathMappingJson, { spaces: 2 });
    } else if (isIndexHtml) {
      // remove content between injector:theme and injector:scripts tokens,
      // they will be added during the build
      let indexHTML = fs.readFileSync(filePath, { encoding: 'utf-8' });
      const scriptsInjector = injectorUtils.scriptsInjector;
      const themeInjector = injectorUtils.themeInjector;
      // remove content between injector:scripts token
      indexHTML = injectorUtils.removeInjectorTokensContent({
        content: indexHTML,
        pattern: injectorUtils.getInjectorTagsRegExp(
          scriptsInjector.startTag,
          scriptsInjector.endTag
        ),
        eol: injectorUtils.getLineEnding(indexHTML),
        startTag: `\t\t${scriptsInjector.startTag}`,
        endTag: `\t\t${scriptsInjector.endTag}`
      });
      // remove content between injector:theme token
      indexHTML = injectorUtils.removeInjectorTokensContent({
        content: indexHTML,
        pattern: injectorUtils.getInjectorTagsRegExp(
          themeInjector.startTag,
          themeInjector.endTag
        ),
        eol: injectorUtils.getLineEnding(indexHTML),
        startTag: `\t\t${themeInjector.startTag}`,
        endTag: `\t\t${themeInjector.endTag}`
      });
      // write to /src
      filePathDest = path.join(destination, '..', filePathFromTemplateRoot);
      fs.outputFileSync(filePathDest, indexHTML, { encoding: 'utf-8' });
    } else {
      // copy to /src
      filePathDest = path.join(destination, '..', filePathFromTemplateRoot);
      fs.copySync(filePath, filePathDest);
    }
  });
}

function _getTemplateFromTypeSpecificDirectory(templateSpec) {
  const src = path.join(templateRoot, templateSpec.name, templateSpec.type);
  if (!_checkDirExists(src)) {
    return null;
  }
  return src;
}

function _getTemplateFromGenericDirectory(templateSpec) {
  const src = path.join(templateRoot, templateSpec.name);
  if (!_checkDirExists(src)) {
    return null;
  }
  return src;
}

function _checkDirExists(filePath) {
  try {
    // check if the directory exists
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}
