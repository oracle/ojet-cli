/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const http = require('http');
const https = require('https');

// JET-79009: Prevent DoS of local CLI process (OOM / hangs) by capping
// accumulated bytes, applying timeouts, and aborting early on non-successful
// status codes.
// This is a low-severity problem because the user needs to explicitly point
// the CLI to a malicious or misbehaving URL. The limits here are very generous
// and likely won't be hit by legitimate custom templates; our largest default
// template is only ~27 KB compressed and ~108 KB unpacked.
// If users have larger trusted templates, they can download them locally first
// and pass the local zip path to --template instead.
const MAX_TEMPLATE_ZIP_SIZE = 250 * 1024 * 1024;
const TEMPLATE_FETCH_TIMEOUT_MS = 10 * 60 * 1000;
const TEMPLATE_FETCH_IDLE_TIMEOUT_MS = 60 * 1000;

module.exports = function (requestedUrl, options) {
  // fetches the zip file
  return new Promise((resolve, reject) => {
    const protocol = new URL(requestedUrl).protocol === 'https:' ? https : http;
    const maxSizeBytes = options && options.maxSizeBytes !== undefined
      ? options.maxSizeBytes
      : MAX_TEMPLATE_ZIP_SIZE;
    const timeoutMs = options && options.timeoutMs !== undefined
      ? options.timeoutMs
      : TEMPLATE_FETCH_TIMEOUT_MS;
    const idleTimeoutMs = options && options.idleTimeoutMs !== undefined
      ? options.idleTimeoutMs
      : TEMPLATE_FETCH_IDLE_TIMEOUT_MS;
    let completed = false;
    let request;
    let timeoutId;

    function finish(error, value) {
      if (completed) {
        return;
      }
      completed = true;
      clearTimeout(timeoutId);
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    }

    function abort(error) {
      finish(error);
      if (request) {
        request.destroy();
      }
    }

    // HTTP/HTTPS request
    // https://nodejs.org/api/http.html#http_http_request_url_options_callback
    // https://nodejs.org/api/https.html#https_https_request_options_callback
    request = protocol.request(requestedUrl, (response) => {
      const statusCode = response.statusCode;
      const contentLength = Number(response.headers['content-length']);
      const buffer = [];
      let totalBytes = 0;

      if (statusCode < 200 || statusCode >= 300) {
        response.resume();
        abort(new Error(`Template download failed with status code ${statusCode}`));
        return;
      }

      if (!Number.isNaN(contentLength) && contentLength > maxSizeBytes) {
        response.resume();
        abort(new Error(`Template download exceeds maximum size of ${maxSizeBytes} bytes`));
        return;
      }

      response.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > maxSizeBytes) {
          abort(new Error(`Template download exceeds maximum size of ${maxSizeBytes} bytes`));
          return;
        }
        buffer.push(chunk);
      });
      response.on('end', () => {
        finish(null, Buffer.concat(buffer, totalBytes));
      });
      response.on('error', (error) => {
        finish(error);
      });
    });

    timeoutId = setTimeout(() => {
      abort(new Error(`Template download timed out after ${timeoutMs} ms`));
    }, timeoutMs);

    request.setTimeout(idleTimeoutMs, () => {
      abort(new Error(`Template download was idle for more than ${idleTimeoutMs} ms`));
    });

    request.on('error', (error) => {
      finish(error);
    });

    request.end();
  });
};
