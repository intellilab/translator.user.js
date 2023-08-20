import { definePlugins } from '@gera2ld/plaid-rollup';
import { defineConfig } from 'rollup';
import userscript from 'rollup-plugin-userscript';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig(
  Object.entries({
    translator: 'src/index.tsx',
  }).map(([name, entry]) => ({
    input: entry,
    plugins: [
      ...definePlugins({
        esm: true,
        minimize: false,
        postcss: {
          inject: false,
          minimize: true,
          modules: {
            generateScopedName: 'tr_[local]_[hash:base64:5]',
          },
        },
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx'],
      }),
      userscript((meta) => meta.replace('process.env.VERSION', pkg.version)),
    ],
    external: [
      '@violentmonkey/ui',
      '@violentmonkey/dom',
      '@violentmonkey/shortcut',
    ],
    output: {
      format: 'iife',
      file: `dist/${name}.user.js`,
      globals: {
        '@violentmonkey/dom': 'VM',
        '@violentmonkey/ui': 'VM',
        '@violentmonkey/shortcut': 'VM.shortcut',
      },
      indent: false,
    },
  })),
);
