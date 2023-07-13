/**
  Copyright (c) 2015, 2023, Oracle and/or its affiliates.
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
  // Note that every file listed here must also be listed in Karma's "files" array
  paths: {
    "knockout":"libs/knockout/knockout-3.5.1.debug",
    "jquery":"libs/jquery/jquery-3.6.0",
    "jqueryui-amd":"libs/jquery/jqueryui-amd-1.13.2",
    "hammerjs":"libs/hammer/hammer-2.0.8",
    "ojdnd":"libs/dnd-polyfill/dnd-polyfill-1.0.2",
    "ojs":"libs/oj/13.1.2/debug",
    "ojL10n":"libs/oj/13.1.2/ojL10n",
    "ojtranslations":"libs/oj/13.1.2/resources",
    "@oracle/oraclejet-preact":"libs/oraclejet-preact/amd",
    "oj-c":"libs/packs/oj-c",
    "persist":"libs/persist/debug",
    "text":"libs/require/text",
    "signals":"libs/js-signals/signals",
    "touchr":"libs/touchr/touchr",
    "preact":"libs/preact/dist/preact.umd",
    "preact/hooks":"libs/preact/hooks/dist/hooks.umd",
    "preact/compat":"libs/preact/compat/dist/compat.umd",
    "preact/jsx-runtime":"libs/preact/jsx-runtime/dist/jsxRuntime.umd",
    "preact/debug":"libs/preact/debug/dist/debug.umd",
    "preact/devtools":"libs/preact/devtools/dist/devtools.umd",
    "proj4":"libs/proj4js/dist/proj4-src",
    "css":"libs/require-css/css",
    "ojcss":"libs/oj/13.1.2/debug/ojcss",
    "ojs/ojcss":"libs/oj/13.1.2/debug/ojcss",
    "sinon":"libs/sinon/sinon",
    "css-builder":"libs/require-css/css-builder",
    "normalize":"libs/require-css/normalize",
    "ojs/normalize":"libs/require-css/normalize",
    "jet-composites":"jet-composites"
  }
  ,

  // dynamically load all test files
  deps: allTestFiles,

  // start Karma after dependencies have been loaded
  callback: window.__karma__.start
})
