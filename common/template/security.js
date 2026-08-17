/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const Admzip = require('adm-zip');
const fs = require('fs-extra');
const path = require('path');
const fetchZip = require('../../lib/util/fetchZip');
const constants = require('../../lib/util/constants');

const PACKAGE_LIFECYCLE_SCRIPTS = [
  'preinstall',
  'install',
  'postinstall',
  'prepublish',
  'prepublishOnly',
  'prepare',
  'preprepare',
  'postprepare',
  'dependencies'
];

// JET-79009 F1: URL and local templates can supply package.json lifecycle
// scripts and scripts/hooks files that ojet may execute during app creation or
// later CLI flows. Reject those execution surfaces by default and require the
// explicit --allow-template-code-execution opt-in for trusted templates.
// Include "dependencies" even though it is not part of npm's ordinary install
// lifecycle order. npm can run it after operations that modify node_modules, so
// a template-supplied package.json can persist an execution point for later
// npm install / ojet restore flows.

function _hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function _normalizeTemplatePath(templatePath) {
  const normalized = path.posix.normalize(String(templatePath).replace(/\\/g, '/'));
  if (normalized === '.') {
    return '';
  }
  return normalized.replace(/^\/+/, '');
}

function _isInDirectory(templatePath, directoryName) {
  return templatePath === directoryName || templatePath.startsWith(`${directoryName}/`);
}

function _toZipDestinationPath(entryName, isTemplateInNewFormat) {
  const normalizedEntryName = _normalizeTemplatePath(entryName);
  if (!normalizedEntryName) {
    return null;
  }
  if (isTemplateInNewFormat) {
    return normalizedEntryName;
  }
  return _isInDirectory(normalizedEntryName, 'scripts')
    ? normalizedEntryName
    : path.posix.join('src', normalizedEntryName);
}

function _toLocalDirectoryDestinationPath(entryName, isTemplateInNewFormat) {
  const normalizedEntryName = _normalizeTemplatePath(entryName);
  if (!normalizedEntryName) {
    return null;
  }
  return isTemplateInNewFormat
    ? normalizedEntryName
    : path.posix.join('src', normalizedEntryName);
}

function _addFinding(findings, finding) {
  if (findings.indexOf(finding) === -1) {
    findings.push(finding);
  }
}

function _inspectPackageJson(pathInApp, readPackageJson, findings, isSymbolicLink) {
  const comparablePathInApp = pathInApp.toLowerCase();
  if (comparablePathInApp !== 'package.json') {
    return;
  }
  if (isSymbolicLink) {
    _addFinding(findings, `${pathInApp} (symbolic link)`);
    return;
  }

  let packageJson;
  try {
    packageJson = JSON.parse(readPackageJson());
  } catch (error) {
    return;
  }

  const scripts = packageJson && packageJson.scripts;
  if (!scripts || typeof scripts !== 'object') {
    return;
  }

  PACKAGE_LIFECYCLE_SCRIPTS.forEach((scriptName) => {
    if (_hasOwn(scripts, scriptName)) {
      _addFinding(findings, `package.json scripts.${scriptName}`);
    }
  });
}

function _inspectHookPath(pathInApp, findings, isSymbolicLink) {
  const comparablePathInApp = pathInApp.toLowerCase();
  if (comparablePathInApp === 'scripts/hooks/hooks.json') {
    _addFinding(findings, isSymbolicLink
      ? `${pathInApp} (symbolic link)`
      : pathInApp);
  } else if (comparablePathInApp.startsWith('scripts/hooks/') && comparablePathInApp.endsWith('.js')) {
    _addFinding(findings, isSymbolicLink
      ? `${pathInApp} (symbolic link)`
      : pathInApp);
  }
}

function _inspectDestinationPath(pathInApp, readFile, findings, isSymbolicLink) {
  if (!pathInApp) {
    return;
  }
  _inspectPackageJson(pathInApp, readFile, findings, isSymbolicLink);
  _inspectHookPath(pathInApp, findings, isSymbolicLink);
}

function _inspectZip(template) {
  const zip = new Admzip(template);
  const zipEntries = zip.getEntries();
  const isTemplateInNewFormat = zipEntries.some(zipEntry =>
    _normalizeTemplatePath(zipEntry.entryName).startsWith('src/'));
  const findings = [];

  zipEntries.forEach((zipEntry) => {
    if (zipEntry.isDirectory) {
      return;
    }
    const destinationPath = _toZipDestinationPath(zipEntry.entryName, isTemplateInNewFormat);
    _inspectDestinationPath(
      destinationPath,
      () => zipEntry.getData().toString('utf8'),
      findings,
      false
    );
  });

  return findings;
}

function _walkDirectory(rootPath, relativeDirectory, callback) {
  fs.readdirSync(path.join(rootPath, relativeDirectory)).forEach((entryName) => {
    const relativePath = path.join(relativeDirectory, entryName);
    const absolutePath = path.join(rootPath, relativePath);
    const stats = fs.lstatSync(absolutePath);

    if (stats.isSymbolicLink()) {
      callback(relativePath, absolutePath, true);
    } else if (stats.isDirectory()) {
      _walkDirectory(rootPath, relativePath, callback);
    } else if (stats.isFile()) {
      callback(relativePath, absolutePath, false);
    }
  });
}

function _inspectDirectory(templatePath) {
  const isTemplateInNewFormat = fs.existsSync(path.join(templatePath, 'src'));
  const findings = [];

  _walkDirectory(templatePath, '', (relativePath, absolutePath, isSymbolicLink) => {
    const destinationPath = _toLocalDirectoryDestinationPath(relativePath, isTemplateInNewFormat);
    _inspectDestinationPath(
      destinationPath,
      () => fs.readFileSync(absolutePath, 'utf8'),
      findings,
      isSymbolicLink
    );
  });

  return findings;
}

function _inspectLocalTemplate(templateInfo) {
  const stats = fs.statSync(templateInfo.localPath);
  if (stats.isDirectory()) {
    return _inspectDirectory(templateInfo.localPath);
  }
  if (path.extname(templateInfo.localPath) === '.zip') {
    return _inspectZip(templateInfo.localPath);
  }
  return [];
}

function _formatExecutionSurfaceError(templateInfo, findings) {
  const flag = `--${constants.ALLOW_TEMPLATE_CODE_EXECUTION_FLAG}`;
  return new Error([
    'This template contains code execution entries:',
    '',
    ...findings.map(finding => `- ${finding}`),
    '',
    'For security, ojet treats URL and local templates as static content by default.',
    `Review the template source and rerun with ${flag} if you trust it.`
  ].join('\n'));
}

function _validatePreparedTemplate(templateInfo) {
  const findings = templateInfo.kind === 'url'
    ? _inspectZip(templateInfo.fetchedTemplate)
    : _inspectLocalTemplate(templateInfo);
  const preparedTemplateInfo = Object.assign({}, templateInfo, {
    codeExecutionFindings: findings
  });

  if (!templateInfo.allowCodeExecution && findings.length) {
    throw _formatExecutionSurfaceError(templateInfo, findings);
  }

  return preparedTemplateInfo;
}

module.exports = {
  prepareTemplate: function _prepareTemplate(generator, templateInfo) {
    const preparedGenerator = generator;
    const allowCodeExecution = Boolean(
      preparedGenerator.options[constants.ALLOW_TEMPLATE_CODE_EXECUTION_FLAG]
    );
    const preparedTemplateInfo = Object.assign({}, templateInfo, {
      allowCodeExecution
    });

    if (preparedTemplateInfo.trusted) {
      preparedGenerator.templateInfo = preparedTemplateInfo;
      return Promise.resolve(preparedTemplateInfo);
    }

    const prepared = preparedTemplateInfo.kind === 'url'
      ? fetchZip(preparedTemplateInfo.templateUrl)
        .then(fetchedTemplate => Object.assign({}, preparedTemplateInfo, { fetchedTemplate }))
      : Promise.resolve(preparedTemplateInfo);

    return prepared
      .then(_validatePreparedTemplate)
      .then((validatedTemplateInfo) => {
        preparedGenerator.templateInfo = validatedTemplateInfo;
        return validatedTemplateInfo;
      });
  },

  isCodeExecutionAllowed: function _isCodeExecutionAllowed(generator) {
    const templateInfo = generator && generator.templateInfo;
    return !templateInfo || templateInfo.trusted || templateInfo.allowCodeExecution;
  },

  _inspectZip,
  _inspectDirectory
};
