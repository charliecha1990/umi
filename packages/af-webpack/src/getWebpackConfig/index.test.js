import { join } from 'path';
import stringify from 'stringify-object';
import getWebpackConfig from './index';

const fixtures = join(__dirname, 'fixtures');

test('normal', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(config.mode).toEqual('production');
});

test('opts.urlLoaderExcludes', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    urlLoaderExcludes: [/.gif$/],
  });
  expect(config.module.rules.filter(r => r.exclude)[0].exclude.toString()).toContain('/.gif$/');
});

test('opts.entry', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    entry: {
      foo: 'foo.js',
      bar: ['bar.js'],
    },
  });
  expect(config.entry).toEqual({
    foo: ['foo.js'],
    bar: ['bar.js'],
  });
});

test('opts.alias', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    alias: {
      foo: 'bar',
    },
  });
  expect(config.resolve.alias).toEqual({
    foo: 'bar',
  });
});

test('opts.disableDynamicImport', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    disableDynamicImport: true,
  });
  expect(stringify(config.module.rules)).toContain('babel-plugin-dynamic-import-node/lib/index.js');
});

test('ESLINT env', () => {
  process.env.ESLINT = 1;
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  process.env.ESLINT = 'none';
  expect(stringify(config.module.rules.filter(r => r.enforce === 'pre'))).toContain(
    'eslint-loader/index.js',
  );
});

test('opts.extraBabelIncludes', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    extraBabelIncludes: ['foooo'],
  });
  expect(config.module.rules.filter(r => r.include && r.include[0] === 'foooo').length).toEqual(1);
});

test('opts.ignoreMomentLocale', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    ignoreMomentLocale: true,
  });
  expect(
    config.plugins.filter(p => {
      return p instanceof require('webpack/lib/IgnorePlugin') && stringify(p).includes('/moment$/');
    }).length,
  ).toEqual(1);
});

test('ANALYZE env', () => {
  process.env.ANALYZE = 1;
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(
    config.plugins.filter(p => {
      return stringify(p).includes('analyzerMode');
    }).length,
  ).toEqual(1);
  process.env.ANALYZE = '';
});

test('ANALYZE_REPORT env', () => {
  process.env.ANALYZE_REPORT = 1;
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(
    config.plugins.filter(p => {
      return stringify(p).includes('analyzerMode');
    }).length,
  ).toEqual(1);
  process.env.ANALYZE_REPORT = '';
});

test('DUPLICATE_CHECKER env', () => {
  process.env.DUPLICATE_CHECKER = 1;
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(
    config.plugins.filter(p => {
      return p instanceof require('duplicate-package-checker-webpack-plugin');
    }).length,
  ).toEqual(1);
  process.env.DUPLICATE_CHECKER = '';
});

test('FORK_TS_CHECKER env', () => {
  process.env.FORK_TS_CHECKER = 1;
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(
    config.plugins.filter(p => {
      return stringify(p).includes(`useTypescriptIncrementalApi: true`);
    }).length,
  ).toEqual(1);
  process.env.FORK_TS_CHECKER = '';
});

test('copy public directory', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'with-public-dir'),
  });
  expect(
    config.plugins.filter(p => {
      return p instanceof require('copy-webpack-plugin');
    }).length,
  ).toEqual(1);
});

test('opts.copy', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    copy: ['foo', { from: 'bar', to: './dist' }],
  });
  expect(
    config.plugins.filter(p => {
      return p instanceof require('copy-webpack-plugin');
    }).length,
  ).toEqual(2);
});

test('opts.externals', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    externals: {
      foo: 'bar',
    },
  });
  expect(config.externals).toEqual({
    foo: 'bar',
  });
});

test('opts.chainConfig', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    chainConfig(config) {
      config.entry('foo').add('foo.js');
    },
  });
  expect(config.entry).toEqual({
    foo: ['foo.js'],
  });
});

test('SPEED_MEASURE env', () => {
  process.env.SPEED_MEASURE = 1;
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(
    config.plugins.filter(p => {
      return (
        stringify(p).includes(`speed-measure.json`) && stringify(p).includes(`outputFormat: 'json'`)
      );
    }).length,
  ).toEqual(1);
});

test('opts.cssModulesExcludes', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    cssModulesExcludes: ['fooooo', 'barrrr'],
  });
  expect(
    config.module.rules.filter(r => {
      return typeof r.test === 'function';
    }).length,
  ).toEqual(2);
});

test('opts.cssModulesWithAffix', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    cssModulesWithAffix: true,
  });
  expect(
    config.module.rules.filter(r => {
      return stringify(r.test) === '/\\.module\\.css$/';
    }).length,
  ).toEqual(1);
});

test('opts.isDev', () => {
  const config = getWebpackConfig({
    cwd: join(fixtures, 'normal'),
    isDev: true,
  });
  expect(config.mode).toEqual('development');
});
