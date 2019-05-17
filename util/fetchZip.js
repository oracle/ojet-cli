/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
'use strict';

const Admzip = require('adm-zip');
const request = require('request');

module.exports = function (url) {
  // fetches the zip file
  return new Promise((resolve, reject) => {
    const data = [];
    let dataLen = 0;

    request.get({ url, encoding: null }).on('error', (err) => {
      reject(err);
    }).on('data', (block) => {
      data.push(block);
      dataLen += block.length;
    }).on('end', (err) => {
      if (err) {
        reject(err);
      }
      const buf = new Buffer(dataLen);

      for (let i = 0, len = data.length, pos = 0; i < len; i += 1) {
        data[i].copy(buf, pos);
        pos += data[i].length;
      }

      try {
        const zip = new Admzip(buf);
        resolve(zip);
      } catch (e) {
        reject(e);
      }
    });
  });
};
