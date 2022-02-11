/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const util = require('./util');
const fs = require('fs-extra');

before(async () => {
  console.log('Setup copy');

  fs.ensureDirSync(util.testDir);

  // Modify the built ojet-cli's package.json to use the locally built oraclejet-tooling symlink when apps are scaffolded in the tests
  util.makePackageSymlink();

  // Initial copy of current oraclejet-tooling build over "global" ojet-cli install
  util.copyOracleJetTooling();
});