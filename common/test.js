/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const fs = require('fs-extra');
const path = require('path');
const CONSTANTS = require('../util/constants');
const paths = require('../util/paths');

module.exports =
{
  writeTestTemplate: function _writeTestTemplates(generator) {
    return new Promise((resolve) => {
      if (generator.options.componentName) {
        const isApp = fs.existsSync(path.join(process.cwd(), CONSTANTS.APP_CONFIG_JSON))
          || generator.appDir !== undefined;
        if (!isApp) return resolve();

        const appDir = generator.appDir === undefined
          ? process.cwd() : path.resolve(generator.appDir);

        const _configPaths = generator.appDir === undefined
          ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();

        const templateSrc = path.resolve(__dirname, '../template/test');
        const destDirectory = path.resolve(
          path.join(appDir, _configPaths.source, _configPaths.sourceTests));

        // avoid overwrite test
        if (fs.existsSync(destDirectory)) {
          resolve();
        } else {
          fs.ensureDirSync(destDirectory);
          fs.copySync(templateSrc, destDirectory);
          _replaceTestHTMLToken(generator);
        }
      }
      return resolve();
    });
  },
};

function _replaceTestHTMLToken(generator) {
  const componentName = generator.options.componentName;

  const appDir = generator.appDir === undefined
    ? process.cwd() : path.resolve(generator.appDir);

  const _configPaths = generator.appDir === undefined
    ? paths.getConfiguredPaths(appDir) : paths.getDefaultPaths();

  const htmlPath = path.join(appDir, _configPaths.source, _configPaths.sourceTests, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  fs.outputFileSync(htmlPath, html.replace(new RegExp('@component@', 'g'), componentName));
}
