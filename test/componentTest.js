/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
var assert = require('assert');
var fs = require('fs-extra');
var util = require('./util');

const COMP_APP_NAME = 'comp-1';

describe('ojet create component', () => {
  if (!util.noScaffold()) {
    before(async () => {
      let result = await util.execCmd(`${util.OJET_APP_COMMAND} create component ${COMP_APP_NAME}`, { cwd: util.getAppDir(util.APP_NAME) });
      it('should create a component app', async () => {
        assert.equal(/after_component_create/.test(result.stdout), true, result.error);
      });
    });
  }

  describe("check component", () => {
    it('should have a component directory with component.json', () => {
      console.log(util.getAppDir(`${util.getAppDir(util.APP_NAME)}/src/js/jet-composites/${COMP_APP_NAME}`));

      const filelist = fs.readdirSync(util.getAppDir(`${util.getAppDir(util.APP_NAME)}/src/js/jet-composites/${COMP_APP_NAME}`));
      assert.ok(filelist.indexOf('component.json') > -1, filelist);
    });
  });
});
