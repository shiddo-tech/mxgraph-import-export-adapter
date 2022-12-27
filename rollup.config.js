import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import url from '@rollup/plugin-url';
import postcss from 'rollup-plugin-postcss';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';

const packageJson = require('./package.json');

export default {
  input: 'src/index.js',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'umd',
      sourcemap: true,
      name: 'Adapter',
      globals: { 'xml-js': 'window' },
    },
  ],
  plugins: [
    peerDepsExternal(),
    url(),
    resolve(),
    commonjs({
      include: /\**node_modules\**/,
    }),
    babel({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: /\**node_modules\**/,
    }),
    postcss({
      extensions: ['.css', '.scss', '.less'],
      use: ['sass', ['less', { javascriptEnabled: true }]],
    }),
    terser(),
  ],
};
