/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const http = require('http');
const https = require('https');
const url = require('url');

module.exports = function (requestedUrl) {
  // fetches the zip file
  return new Promise((resolve, reject) => {
    const protocol = url.parse(requestedUrl).protocol === 'https:' ? https : http;

    // HTTP/HTTPS request
    // https://nodejs.org/api/http.html#http_http_request_url_options_callback
    // https://nodejs.org/api/https.html#https_https_request_options_callback
    const request = protocol.request(requestedUrl, (response) => {
      const buffer = [];
      response.on('data', (chunk) => {
        buffer.push(chunk);
      });
      response.on('end', () => {
        resolve(Buffer.concat(buffer));
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  });
};
