/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
var env = process.env,
        assert = require('assert'),
        fs = require('fs-extra'),
        path = require('path'),
        exec = require('child_process').exec,
        util = require('./util'),
        helpers = require('yeoman-test'),
        yoAssert = require('yeoman-assert'),
        execOptions =
        {
          cwd: path.resolve('test_result/test/generator/test/')
        };

var filelist;
var testDir = path.resolve('test_result/test/generator/test', 'webTest');
var utilDir = path.resolve('test_result/test/generator/util/web');

describe("Web Test", function ()
{
  before(function(){
    fs.ensureDirSync(testDir);
    fs.emptyDirSync(testDir);
  });

  describe("Scaffold with norestore flag", function(){

    it("Generate web app", function (done)
    {
      this.timeout(520000);
      exec('yo @oracle/oraclejet webTest --norestore=true', execOptions, function (error, stdout)
      {
        done();
        assert.equal(util.norestoreSuccess(stdout), true, error);
        filelist = fs.readdirSync(testDir);
      });
    });
  })

  describe("Run Tests", function(){

    it("Copy npm and bower modules", function(done){
      this.timeout(200000);
      //copy Npm and bower modules
      fs.copy(utilDir, testDir, function(err){
        done();
      });
    });

    describe("Check essential files", function (){

      it("package.json exists", function () {
        var inlist = filelist.indexOf("package.json") > -1;
        assert.equal(inlist, true, path.resolve(testDir, 'package.json') + " missing");
      });

      it("Gruntfile.js exists", function () {
        var inlist = filelist.indexOf("Gruntfile.js") > -1;
        assert.equal(inlist, true, path.resolve(testDir, 'Gruntfile.js') + " missing");
      });

      it(".gitignore exists", function ()
      {
        var inlist = filelist.indexOf(".gitignore") > -1;
        assert.equal(inlist, true, path.resolve(testDir, '.gitignore') + " missing");
      });

    });

    describe('Extend to hybrid', function () {
      it('Add hybrid', function (done) {
        this.timeout(2400000);
        exec(`yo @oracle/oraclejet:add-hybrid --platform=${util.getPlatform(env.OS)}`, { cwd: testDir }, (error, stdout) => {
          filelist = fs.readdirSync(testDir);
          const inlist = filelist.indexOf('hybrid') > -1;
          assert.equal(inlist, true, `${testDir}/hybrid missing`);
          done();
        });
      });
    });
  });
});
