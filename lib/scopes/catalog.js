#! /usr/bin/env node
/**
  Copyright (c) 2015, 2018, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/

'use strict';

/**
 * ## Dependencies
 */
// Node
const fs = require('fs');

// Oracle
const config = require('../../config');
const utils = require('../utils');

/**
 * # Catalog
 *
 * @public
 */
const catalog = module.exports;

/**
 * ## configure
 *
 * @public
 * @param {string} url - catalog url
 */
catalog.configureCatalogUrl = function (url) {
  const configObj = utils.readJsonAndReturnObject(config.configFile);
  configObj['catalog-url'] = url;
  try {
    fs.writeFileSync(config.configFile, JSON.stringify(configObj, null, 2));
    utils.log.success(`Catalog url set: '${url}'`);
  } catch (e) {
    throw utils.toError('Catalog url could not be set.');
  }
};

/**
 * ## search
 *
 * @public
 * @param {string} parameter
 */
catalog.search = function (parameter) {
  utils.log(`Searching for '${parameter}' in the catalog ...`);
  utils.request({
    path: `/components/?q=${parameter}*&format=full`,
  }, (response) => {
    let responseBody = '';
    response.on('data', (respBody) => {
      responseBody += respBody;
    });
    response.on('end', () => {
      utils.checkForHttpErrors(response, responseBody);
      const components = JSON.parse(responseBody).items;

      if (utils.isVerbose()) {
        utils.log(components);
      }

      if (components.length === 0) {
        utils.log.success('No components found.');
      } else {
        _printHead();
        _printResults(components, parameter);
      }
    });
  });
};

const table = {
  name: 20,
  displayName: 20,
  tags: 20,
  description: 40
};

const space = config.output.space;

/**
 * ## _printHead
 *
 * @private
 */
function _printHead() {
  let headLine = '';
  Object.keys(table).forEach((key) => {
    const colSpaces = table[key] - key.length;
    if (colSpaces < 0) {
      headLine += `<${key.substring(0, table[key] - 2)}>${space}`;
    } else {
      headLine += `<${key}>${space.repeat(colSpaces - 2)}${space}`;
    }
  });
  utils.log(headLine);
}

/**
 * ## _printResults
 *
 * @private
 * @param {Array} components
 * @param {string} parameter
 */
function _printResults(components, parameter) {
  components.forEach((component) => {
    const comp = component;
    let line = '';
    Object.keys(table).forEach((key) => {
      // 'displayName' and 'description' are within metadata[component] scope
      if (['displayName', 'description'].indexOf(key) > -1) {
        comp[key] = comp.component[key] || '';
      }

      if (utils.hasProperty(comp, key)) {
        // Custom handling for 'tags'
        if (key === 'tags') {
          comp[key] = _processTags(comp[key], parameter);
        }

        const colSpaces = table[key] - comp[key].length;

        if (colSpaces < 0) {
          line += comp[key].substring(0, table[key]) + space;
        } else {
          line += comp[key] + space.repeat(colSpaces) + space;
        }
      }
    });

    utils.log(line);
  });
}

/**
 * ## _processTags
 *
 * @private
 * @param {Array} tags
 * @param {string} parameter
 */
function _processTags(tags, parameter) {
  const lowerCaseTags = tags.map(value => value.toLowerCase());

  function matchTag(tag) {
    return tag.match(parameter.toLowerCase());
  }

  const i = lowerCaseTags.findIndex(matchTag);

  return i > -1 ? tags[i] : tags[0] || '';
}
