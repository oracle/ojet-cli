/**
  Copyright (c) 2015, 2026, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
/**
 * This is an initialization file which will be loaded into the browser by Karma
 * to configure RequireJS for the test.
 */
var allTestFiles = []
var TEST_REGEXP = /jet-composites.*\w\.spec\.js$/i

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(function (file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    // If you require sub-dependencies of test files to be loaded as-is (requiring file extension)
    // then do not normalize the paths
    var normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '')
    allTestFiles.push('../../' + normalizedTestModule)
  }
})

require.config({
  // Karma serves files under /base, which is the basePath from karma.conf.js
  baseUrl: '/base/web/js',

  // Configure RequireJS path mappings
  // The build updates this block with generated paths from path_mapping.json.
  paths: {}
  ,

  // dynamically load all test files
  deps: allTestFiles,

  // start Karma after dependencies have been loaded
  callback: window.__karma__.start
})
