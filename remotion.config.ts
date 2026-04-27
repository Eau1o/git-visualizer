import { Config } from '@remotion/cli/config';
import type { WebpackOverrideFn } from '@remotion/bundler';

Config.overrideWebpackConfig(((currentConfiguration) => {
  return currentConfiguration;
}) as WebpackOverrideFn);
