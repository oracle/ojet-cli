/**
  Copyright (c) 2015, 2024, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
module.exports = {
    rootDir: process.cwd(),
    preset: "@oracle/oraclejet-jest-preset",
    moduleNameMapper: { },
    setupFiles: [
      "<rootDir>/test-config/testSetup.ts"
    ],
    testMatch: [
      "<rootDir>/src/**/__tests__/**/*.spec.tsx"
    ]
}