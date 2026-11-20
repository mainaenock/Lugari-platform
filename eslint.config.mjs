import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const generated = ['.next/**', '.npm-cache/**', 'out/**', 'dist/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts'];
export default defineConfig([...nextVitals, ...nextTypescript, globalIgnores(generated)]);
