import _ from 'lodash';
import path from 'path';
import {getPackageJson, install, savePackageJson} from '../../src/services/npm';

const pkgJsonTemplate = {
  "scripts": {
    "clean": "rimraf ./build/*",
    "build": "npm run clean && cross-env NODE_ENV=production webpack --config ./bin/webpack/webpack.config.js",
    "dev-dashboard": "webpack-dashboard -c -- webpack-dev-server --config ./bin/webpack/webpack.config.js",
    "dev": "webpack-dev-server --config ./bin/webpack/webpack.config.js"
  },
  "devDependencies": {
    "babel-cli": "^6.24.0",
    "babel-core": "^6.24.0",
    "babel-loader": "^6.4.1",
    "babel-plugin-transform-react-jsx": "^6.23.0",
    "babel-preset-es2015": "^6.24.0",
    "babel-preset-react": "^6.23.0",
    "babel-preset-stage-0": "^6.22.0",
    "cross-env": "^4.0.0",
    "css-loader": "^0.27.3",
    "cssnano": "^3.10.0",
    "extract-text-webpack-plugin": "^2.1.0",
    "file-loader": "^0.10.1",
    "html-webpack-plugin": "^2.28.0",
    "node-sass": "^4.5.0",
    "postcss-loader": "^1.3.3",
    "rimraf": "^2.6.1",
    "sass-loader": "^6.0.3",
    "style-loader": "^0.14.1",
    "url-loader": "^0.5.8",
    "webpack": "^2.2.1",
    "webpack-dashboard": "^0.3.0",
    "webpack-dev-server": "^2.4.2"
  },
  "dependencies": {
    "@shoutem/extension-sandbox": "^0.1.4",
    "@shoutem/react-web-ui": "^0.5.1",
    "@shoutem/redux-api-sdk": "^1.1.0",
    "@shoutem/redux-composers": "^0.1.5",
    "@shoutem/redux-io": "^2.3.0",
    "@shoutem/redux-sync-state-engine": "^0.0.2",
    "es6-promise": "^4.1.1",
    "fetch-everywhere": "^1.0.5",
    "lodash": "^4.17.4",
    "react": "^15.4.2",
    "react-dom": "^15.4.2",
    "react-redux": "^5.0.3",
    "redux": "^3.6.0",
    "redux-thunk": "^2.2.0",
    "urijs": "^1.18.9"
  }
};

module.exports = async (templatePath, extensionPath) => {
  const serverPath = path.join(extensionPath, 'server');

  const originalJson = await getPackageJson(serverPath);
  const updatedJson = _.merge({}, originalJson, pkgJsonTemplate);

  if (_.isEqual(originalJson, updatedJson)) {
    return null;
  }

  await savePackageJson(serverPath, updatedJson);
  await install(serverPath);
};
