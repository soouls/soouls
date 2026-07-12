const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo (including packages/)
config.watchFolders = [
  path.resolve(workspaceRoot, 'packages'),
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Enable package exports for workspace packages (needed for @soouls/*)
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['import', 'require', 'react-native', 'browser'];

module.exports = config;
