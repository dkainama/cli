import url from 'url';
import path from 'path';
import replace from 'replace-in-file';
import * as appManager from '../clients/app-manager';
import * as authService from '../clients/auth-service';
import decompressUri from './decompress';
import cliUrls from '../../config/services';
import { writeJsonFile, readJsonFile } from './data';
import * as npm from './npm';
import { ensureYarnInstalled } from './yarn';
import * as reactNative from './react-native';
import * as analytics from './analytics';
import { pathExists, readJson } from 'fs-extra';

async function isPlatformDirectory(dir) {
  const { name } = await readJsonFile(path.join(dir, 'package.json')) || {};

  // platform package was renamed with Platform release v1.1.10
  return name === '@shoutem/mobile-app' || name === '@shoutem/platform';
}

export async function getPlatformRootDir(dir = process.cwd()) {
  if (await isPlatformDirectory(dir)) {
    return dir;
  }

  const parentDir = path.join(dir, '..');

  if (parentDir === dir) {
    throw new Error('Not a platform directory');
  }
  return await getPlatformRootDir(parentDir);
}

export async function createPlatformConfig(platformDir, opts) {
  const configTemplate = await readJson(path.join(platformDir, 'config.template.json'));

  let authorization;
  try {
    authorization = await authService.createAppAccessToken(opts.appId, await authService.getRefreshToken());
  } catch (err) {
    if (err.code === 401 || err.code === 403) {
      err.message = 'Not authorized to create application token. You must log in again using `shoutem login` command.';
    }
    throw err;
  }

  return {
    ...configTemplate,
    ...opts,
    serverApiEndpoint: url.parse(cliUrls.appManager).hostname,
    legacyApiEndpoint: url.parse(cliUrls.legacyService).hostname,
    authorization,
    configurationFilePath: 'config.json'
  };
}

export async function getPlatformConfig(platformDir = null) {
  return await readJson(path.join(platformDir || await getPlatformRootDir(), 'config.json'));
}

export async function configurePlatform(platformDir, mobileConfig) {
  await ensureYarnInstalled();
  await reactNative.ensureInstalled();

  const configPath = path.join(platformDir, 'config.json');

  await writeJsonFile(mobileConfig, configPath);
  await npm.install(path.join(platformDir, 'scripts'));
  await npm.run(platformDir, 'configure');
}

export async function fixPlatform(platformDir, appId) {
  const appBuilderPath = path.join(platformDir, 'scripts', 'classes', 'app-builder.js');

  if (process.platform === 'win32') {
    try {
      await replace({
        files: appBuilderPath,
        from: './gradlew',
        to: 'gradlew'
      });
    } catch (err) {
      console.log('WARN: Could not rename ./gradle to gradle');
    }

    try {
      await replace({
        files: appBuilderPath,
        from: "const apkPath = path.join('android', 'app', 'build', 'outputs', 'apk');",
        to: `const apkPath = path.join('c:/', '${appId}', 'tmp', 'ShoutemApp', 'app', 'outputs', 'apk');`
      });
    } catch (err) {
      console.log('WARN: Could not adapt client for c:\\tmp build directory');
    }

    try {
      await replace({
        files: path.join(platformDir, 'android', 'build.gradle'),
        from: '//<CLI> buildDir = "C:/tmp/',
        to: `buildDir = "C:/tmp/${appId}/`
      })
    } catch (err) {
      console.log('WARN: Could not set the tmp build directory for android app');
    }
  }
}

export async function downloadApp(appId, destinationDir, options = {}) {
  analytics.setAppId(appId);

  const versionCheck = options.versionCheck || (() => {});

  const { mobileAppVersion } = await appManager.getApplicationPlatform(appId);
  await versionCheck(mobileAppVersion);

  await pullPlatform(mobileAppVersion, destinationDir, options);

  if (!await pathExists(destinationDir)) {
    throw new Error('Platform code could not be downloaded from github. Make sure that platform is setup correctly.');
  }
}

async function pullPlatform(version, destination, options) {
  const url = `${cliUrls.mobileAppUrl}/archive/v${version}.tar.gz`;
  await decompressUri(url, destination, { ...options, strip: 1 });
}

async function addLocalDependency(platformDir, dependencyDir) {

}
