/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

const assert = require('assert');
const http = require('http');
const fetchZip = require('../lib/util/fetchZip');

function listen(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      resolve({
        server,
        url: `http://127.0.0.1:${server.address().port}/template.zip`
      });
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

describe('fetchZip', () => {
  it('should resolve with the response body for a successful template download', async () => {
    const expected = Buffer.from('zip content');
    const { server, url } = await listen((request, response) => {
      response.writeHead(200, { 'Content-Length': expected.length });
      response.end(expected);
    });

    try {
      const actual = await fetchZip(url, {
        maxSizeBytes: 1024,
        timeoutMs: 1000,
        idleTimeoutMs: 1000
      });
      assert.deepStrictEqual(actual, expected);
    } finally {
      await close(server);
    }
  });

  it('should reject non-successful status codes', async () => {
    const { server, url } = await listen((request, response) => {
      response.writeHead(404);
      response.end('not found');
    });

    try {
      await assert.rejects(
        fetchZip(url, {
          maxSizeBytes: 1024,
          timeoutMs: 1000,
          idleTimeoutMs: 1000
        }),
        /status code 404/
      );
    } finally {
      await close(server);
    }
  });

  it('should reject when Content-Length is larger than the maximum template size', async () => {
    const { server, url } = await listen((request, response) => {
      response.writeHead(200, { 'Content-Length': 10 });
      response.end('too large');
    });

    try {
      await assert.rejects(
        fetchZip(url, {
          maxSizeBytes: 5,
          timeoutMs: 1000,
          idleTimeoutMs: 1000
        }),
        /maximum size of 5 bytes/
      );
    } finally {
      await close(server);
    }
  });

  it('should reject when a streamed response exceeds the maximum template size', async () => {
    const { server, url } = await listen((request, response) => {
      response.writeHead(200);
      response.write('12345');
      response.end('67890');
    });

    try {
      await assert.rejects(
        fetchZip(url, {
          maxSizeBytes: 5,
          timeoutMs: 1000,
          idleTimeoutMs: 1000
        }),
        /maximum size of 5 bytes/
      );
    } finally {
      await close(server);
    }
  });

  it('should reject when a template download exceeds the total timeout', async function () {
    this.timeout(3000);

    const { server, url } = await listen((request, response) => {
      response.writeHead(200);
      response.write('partial');
    });

    try {
      await assert.rejects(
        fetchZip(url, {
          maxSizeBytes: 1024,
          timeoutMs: 50,
          idleTimeoutMs: 1000
        }),
        /timed out after 50 ms/
      );
    } finally {
      await close(server);
    }
  });

  it('should reject when a template download is idle for too long', async function () {
    this.timeout(3000);

    const { server, url } = await listen((request, response) => {
      response.writeHead(200);
      response.write('partial');
    });

    try {
      await assert.rejects(
        fetchZip(url, {
          maxSizeBytes: 1024,
          timeoutMs: 1000,
          idleTimeoutMs: 50
        }),
        /idle for more than 50 ms/
      );
    } finally {
      await close(server);
    }
  });
});
