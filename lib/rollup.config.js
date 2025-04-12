const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs').default;
const typescript = require('@rollup/plugin-typescript').default;
const { dts } = require('rollup-plugin-dts');
const json = require('@rollup/plugin-json');
const postcss = require('rollup-plugin-postcss');
const packageJson = require('./package.json');

// List of external dependencies that should not be bundled
const external = [
  // React and related
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  
  // Third-party libraries
  '@0xfutbol/constants',
  '@0xfutbol/id-sign',
  '@matchain/matchid-sdk-react',
  '@rainbow-me/rainbowkit',
  '@tanstack/react-query',
  'react-use',
  'thirdweb',
  'wagmi',
  
  // Node.js built-ins
  'buffer',
  'crypto',
  'fs',
  'http',
  'https',
  'os',
  'path',
  'process',
  'stream',
  'url',
  'util',
  'zlib'
];

module.exports = [
  {
    input: 'src/index.tsx',
    output: [
      {
        dir: 'dist',
        format: 'cjs',
        entryFileNames: 'index.js',
        sourcemap: true,
        exports: 'named',
        preserveModules: false,
        compact: true,
      },
      {
        dir: 'dist',
        format: 'esm',
        entryFileNames: 'index.esm.js',
        sourcemap: true,
        exports: 'named',
        preserveModules: false,
        compact: true,
      },
    ],
    plugins: [
      postcss({
        extensions: ['.css'],
        minimize: true,
        modules: false,
        inject: true
      }),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.css'],
        preferBuiltins: false,
        browser: true,
        mainFields: ['browser', 'module', 'main']
      }),
      commonjs({
        ignoreDynamicRequires: true,
        transformMixedEsModules: true,
        ignore: ['**/node_modules/thirdweb/**']
      }),
      json(),
      typescript({ 
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
        compilerOptions: {
          declaration: true,
          declarationDir: 'dist',
          rootDir: 'src',
          outDir: 'dist',
          jsx: 'react-jsx'
        }
      })
    ],
    external: [
      ...external,
      /\.css$/
    ],
  },
  {
    input: 'src/index.tsx',
    output: {
      file: packageJson.types,
      format: 'esm'
    },
    plugins: [dts()],
    external: [
      ...external,
      /\.css$/
    ],
  },
];