/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const Admzip = require('adm-zip');
const CONST = require('../../lib/utils.constants');
const fs = require('fs-extra');
const path = require('path');
const graphics = require('../../hybrid/graphics');
const utils = require('../../lib/utils');

module.exports =
{
  handle: function _handle(baseTemplateHandler, namespace) {
    return new Promise((resolve, reject) => {
      baseTemplateHandler
        .then((generator) => {
          const common = path.resolve(__dirname, `../../generators/${namespace}/templates/common`);
          const commonDest = path.resolve(`${generator.appDir}/`);

          fs.copySync(common, commonDest, { filter(file) {
            return (file.indexOf(`${graphics.PATH + path.sep}screen`) === -1) &&
                                       (file.indexOf(`${graphics.PATH + path.sep}icon`) === -1);
          } });
          // copySync filter doesn't handle directories
          fs.removeSync(commonDest + graphics.PATH);

          resolve(generator);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  /**
   * ## handleZippedTemplateArchive
   * Unarchives provided zip (zip on given path) and merges with the default app template
   *
   * @private
   * @param {string || binary data buffer} template
   * @param {string} destination - output path
   */
  _handleZippedTemplateArchive: ((template, destination) => {
    const zip = new Admzip(template);
    const zipEntries = zip.getEntries();

    let isTemplateInNewFormat = false;

    for (let i = 0; i < zipEntries.length; i += 1) {
      if (zipEntries[i].entryName === 'src/') {
        isTemplateInNewFormat = true;
        break;
      }
    }

    if (isTemplateInNewFormat) {
      // Unpack the archive to the app root
      zipEntries.forEach((zipEntry) => {
        const entryName = zipEntry.entryName;
        if (CONST.APP_PROTECTED_OBJECTS.indexOf(entryName) === -1) {
          zip.extractEntryTo(entryName, path.join(destination, '..'), true, true);
        }
      });
    } else {
      // Unpack the archive content to 'src/' except of 'scripts'
      utils.log.warning('No "src" directory found. This might indicate you are using deprecated format of an app template.');

      zipEntries.forEach((zipEntry) => {
        const entryName = zipEntry.entryName;
        if (entryName.startsWith('scripts/')) {
          zip.extractEntryTo(entryName, path.join(destination, '..'), true, true);
        } else {
          zip.extractEntryTo(entryName, destination, true, true);
        }
      });
    }
  })
};
