/**
  Copyright (c) 2015, 2022, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
const env = process.env;
const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const util = require('./util');

const hybridDirectory = 'hybrid';

const platform = util.getPlatform(env.OS);

const buildConfig = process.env.HYBRID_TEST_BUILDCONFIG ? `--build-config=${process.env.HYBRID_TEST_BUILDCONFIG}` : '';
let idName = 'dummy';

if (!util.noHybrid()) {
  describe('Hybrid Test', () => {
    before(async () => {
      if (!util.noScaffold()) {
        util.removeAppDir(util.HYBRID_APP_NAME);
    
        // Scaffold hybrid app from scratch
        result = await util.execCmd(`${util.OJET_COMMAND} create ${util.HYBRID_APP_NAME} --use-global-tooling --template=navbar --appid=com.oraclecorp.dummy.myapp --appName=testcase --hybrid --platform=${platform}`, { cwd: util.testDir });
        console.log(result.stdout);
        // Check output
        assert.equal(util.norestoreSuccess(result.stdout) || /Your app is/.test(result.stdout), true, result.error);
      }
    });
    
    describe('Run Tests', () => {
      describe('Invalid arguments & check error messages', () => {
        it('should complain about generating app to non-empty appDir', async () => {
          const result = await util.execCmd(`${util.OJET_COMMAND} create ${util.HYBRID_APP_NAME} --hybrid --platforms=${platform}`, { cwd: util.testDir }, true);
          const errLogCorrect = /path already exists/.test(result.stdout);
          assert.equal(errLogCorrect, true, result.stdout);
        });

        it('should complain about unsupported platform android1', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build android1`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) }, true);

          const errLogCorrect = /Invalid platform/i.test(result.stdout);
          assert.equal(errLogCorrect, true, result.error);
        });

        it('should complain about unsupported server port', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve ${platform} --server-port=12we`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) }, true);

          const errLogCorrect = /is not valid/.test(result.stdout);
          assert.equal(errLogCorrect, true, result.stdout);
        });

        it('should complain about unsupported build argument', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build xyz ${platform}`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) }, true);

          const errLogCorrect = /Invalid platform xyz/.test(result.stdout);
          assert.equal(errLogCorrect, true, result.error);
        });
      });

      if (!util.noBuild()) {
        describe('Build', () => {
          it('should build android or ios', async () => {
            let result = await util.execCmd(`${util.OJET_APP_COMMAND} build ${platform}`, { cwd: util.getAppDir(util.HYBRID_APP_NAME), maxBuffer: 1024 * 20000 });
            assert.equal(util.buildSuccess(result.stdout), true, result.error);

            if (buildConfig !== '') {
              // Need to change 'dummy' to 'internal' to match oracle provision if we're doing an ios buildconfig
              idName = 'internal';
              const testDir = util.getAppDir(util.HYBRID_APP_NAME);
              const hybridTestDir = path.resolve(testDir, hybridDirectory);
              const fileName = path.resolve(hybridTestDir, 'config.xml');
              let configRead = fs.readFileSync(fileName, 'utf-8');
              configRead = configRead.replace('dummy', 'internal');
              // write it back out
              fs.unlinkSync(fileName);
              fs.writeFileSync(fileName, configRead);
            }
            result = await util.execCmd(`${util.OJET_APP_COMMAND} build ${platform} --destination=device ${buildConfig}`, { cwd: util.getAppDir(util.HYBRID_APP_NAME), maxBuffer: 1024 * 20000 });
            assert.equal(util.buildSuccess(result.stdout), true, result.error);
          });
        });
      }

      describe('Check essential files', () => { 
        let filelist;
        let hybridFileList;
        const testDir = util.getAppDir(util.HYBRID_APP_NAME);
        const hybridTestDir = path.resolve(testDir, hybridDirectory);

        it('should have config.xml and be correct', () => {
          filelist = fs.readdirSync(testDir);
          hybridFileList = fs.readdirSync(hybridTestDir);
          const inlist = hybridFileList.indexOf('config.xml') > -1;
          assert.equal(inlist, true, `${path.resolve(hybridTestDir, 'config.xml')} missing`);
          if (inlist) {
            // Check contents of config.xml
            const configRead = fs.readFileSync(path.resolve(hybridTestDir, 'config.xml'), 'utf-8');
            assert.equal(configRead.indexOf('<name>testcase</name>') > -1, true, 'config.xml missing <name>');
            assert.equal(configRead.indexOf(`id="com.oraclecorp.${idName}.myapp"`) > -1, true, 'config.xml missing correct id value');
          }
        });

        it('should have package.json', () => {
          const inlist = filelist.indexOf('package.json') > -1;
          assert.equal(inlist, true, `${path.resolve(testDir, 'package.json')} missing`);
        });

        it('should have .gitignore', () => {
          const inlist = filelist.indexOf('.gitignore') > -1;
          assert.equal(inlist, true, `${path.resolve(testDir, '.gitignore')} missing`);
        });

        if (platform === 'android') {
          it('should have an .apk', () => {
            const apkList = fs.readdirSync(path.resolve(testDir, hybridDirectory, 'platforms/android/app/build/outputs/apk/debug'));
            let inlist = false;
            apkList.forEach((value) => {
              inlist = inlist || /.apk/.test(value);
            });
            assert.equal(inlist, true, `${path.resolve(testDir, hybridDirectory, 'platforms/android/build/outputs/apk', 'android.apk')} missing`);
          });

          it('should reference the redwood.css from web in index.html', () => {
            const hybridName = util.getAppDir(util.HYBRID_APP_NAME);
            const index = fs.readFileSync(`${hybridName}/${hybridDirectory}/platforms/android/app/src/main/assets/www/index.html`);
            assert.equal(index.indexOf('web/redwood.css') > -1, true, 'android index.html missing web/redwood.css reference');
          });
        }

        it('should not have \'locale_\' dirs in resources', () => {
          const resourcePath = path.resolve(hybridTestDir, 'www/js/libs/oj', `${util.getJetVersion(util.HYBRID_APP_NAME)}`, 'resources/nls');
          const locList = fs.readdirSync(resourcePath);
          if (locList) {
            locList.forEach((elem) => {
              if (elem.startsWith('locale_')) {
                assert.fail(elem);
              }
            });
          } else {
            assert.fail('No files found in resources!');
          }
        });
      });
    });

    if (!util.noServe()) {
      describe('serve', () => {
        it('should serve android/ios without platform', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} serve --build=false`, { cwd: util.getAppDir(util.HYBRID_APP_NAME), maxBuffer: 1024 * 20000, timeout: 60000, killSignal: 'SIGTERM' }, true);
          assert.equal(/cordova serve/i.test(result.stdout), true, result.stdout);
          result.process.kill();
        });
      });
    }

    if (!util.noSass()) {
      describe('add sass', () => {
        it('should add sass generator', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} add sass`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) });
          assert.equal(/add sass complete/.test(result.stdout), true, result.stdout);
        });
      });

      describe('create theme', () => {
        it('should add green theme', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme green`, { cwd: util.getAppDir(util.HYBRID_APP_NAME), maxBuffer: 1024 * 20000 });
          assert.equal(/green theme added/.test(result.stdout), true, result.error);
        });
      });

      describe('compile sass', () => {
        it('should compile sass', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} build ${platform} --theme=green`, { cwd: util.getAppDir(util.HYBRID_APP_NAME), maxBuffer: 1024 * 20000 });
          assert.equal(/Cordova compile finished/.test(result.stdout) && /green.scss/.test(result.stdout), true, result.error);
        });
      }); 
    }

    /* describe('add pcss', () => {
      it('should add pcss generator', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} add theming`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) });
        assert.equal(/add pcss complete/.test(result.stdout), true, result.stdout);
      });
    });

    describe('create theme', () => {
      it('should add green theme', async () => {
        const result = await util.execCmd(`${util.OJET_APP_COMMAND} create theme green --basetheme=redwood`, { cwd: util.getAppDir(util.HYBRID_APP_NAME), maxBuffer: 1024 * 20000 });
        assert.equal(/green theme added/.test(result.stdout), true, result.error);
      });
    }); */

    if (!util.noCordova()) {
      describe('Plugin management', async () => {
        const batteryPlugin = 'cordova-plugin-battery-status';

        it('should add cordova plugin', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} add plugin ${batteryPlugin}`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) });

          assert.equal(new RegExp(`Adding ${batteryPlugin}`).test(result.stdout) && util.succeeded(result.stdout), true, result.error);

          const hybridName = util.getAppDir(util.HYBRID_APP_NAME);
          const pkg = JSON.parse(fs.readFileSync(`${hybridName}/${hybridDirectory}/package.json`));
          assert.ok(pkg.dependencies[batteryPlugin], pkg);
        });

        it('should remove cordova plugin', async () => {
          const result = await util.execCmd(`${util.OJET_APP_COMMAND} remove plugin ${batteryPlugin}`, { cwd: util.getAppDir(util.HYBRID_APP_NAME) });
          assert.equal(new RegExp(`Removing ${batteryPlugin}`).test(result.stdout) && util.succeeded(result.stdout), true, result.error);
          const hybridName = util.getAppDir(util.HYBRID_APP_NAME);
          const pkg = JSON.parse(fs.readFileSync(`${hybridName}/${hybridDirectory}/package.json`));
          assert.equal(pkg.dependencies[batteryPlugin], null || undefined, pkg);
        });
      });
    }
  });
}