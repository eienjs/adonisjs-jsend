// @ts-check
import nodecfdiConfig from '@nodecfdi/eslint-config';

const { defineConfig } = nodecfdiConfig(import.meta.dirname, { adonisjs: true, sonarjs: true, n: true });

export default defineConfig({
  files: ['**/providers/**/*.ts'],
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
});
