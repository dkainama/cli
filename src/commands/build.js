import * as platformBuild from '../extension/platform-build';
import { buildPlatform, fixPlatform } from '../extension/platform';
import { getBuildPath } from '../clients/cli-paths';
import selectApp from '../extension/app-selector';

export default async function(platform, opts) {
  opts.appId = opts.appId || await selectApp();

  if (!opts.noclean && !opts.noconfigure) {
    await platformBuild.clean();
  }

  if (!opts.noconfigure) {
    await platformBuild.configure(platform, opts.appId, {
      excludePackages: [],
      debug: false,
      production: false,
      workingDirectories: []
    });
  }

  await fixPlatform(await getBuildPath());
  await buildPlatform(await getBuildPath(), platform);
}