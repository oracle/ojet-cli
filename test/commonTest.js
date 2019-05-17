/**
  Copyright (c) 2015, 2019, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
var env = process.env,
	assert = require('assert'),
	path = require('path'),
	exec = require('child_process').exec,
	execOptions = {
		cwd:path.resolve('./dist/generator-oraclejet')
	};

describe("Example Test", function()
{
  it("basic example", function() 
  {
  	var foo = "bar";
   	assert.equal(foo, 'bar','foo equals to bar'); 
  });
});

describe("Npm Packages", function()
{
	it("check yeoman plugin is installed", function(done) 
	{
		this.timeout(30000);
	   	exec('npm list', execOptions, function(error, stdout)
	   	{	   	
	   		assert.equal(
	   			stdout.indexOf('yeoman-generator') > -1,
	   			true,
	   			'yeoman installed' + stdout
	   		);
	   		done();
	   	});
  	});
});
