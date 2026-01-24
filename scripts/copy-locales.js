#!/usr/bin/env node

/**
 * Copy translation files from @reelo/i18n package to public/locales
 * This script runs after npm install to ensure translations are available
 */

import { cpSync, existsSync, realpathSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths to check (in order of preference)
const possibleSourcePaths = [
  // From admin app node_modules (symlink)
  join(__dirname, '../../node_modules/@reelo/i18n/locales'),
  // From root node_modules
  join(__dirname, '../../../node_modules/@reelo/i18n/locales'),
  // From admin app directory
  join(__dirname, '../node_modules/@reelo/i18n/locales'),
];

const targetPath = join(__dirname, '../public/locales');

// Find the first existing source path
let sourcePath = null;
for (const path of possibleSourcePaths) {
  try {
    // Resolve symlinks to get real path
    const resolvedPath = existsSync(path) ? realpathSync(path) : null;
    if (resolvedPath && existsSync(resolvedPath)) {
      sourcePath = resolvedPath;
      break;
    }
  } catch (error) {
    // Continue to next path
    continue;
  }
}

// Check if source exists
if (sourcePath && existsSync(sourcePath)) {
  try {
    // Ensure target directory exists
    mkdirSync(targetPath, { recursive: true });
    
    // Copy locales from node_modules to public
    cpSync(sourcePath, targetPath, { recursive: true, force: true });
    console.log('✅ Translation files copied successfully from:', sourcePath);
  } catch (error) {
    console.error('❌ Could not copy translation files:', error.message);
    process.exit(1);
  }
} else {
  console.warn('⚠️  @reelo/i18n locales not found in any of these locations:');
  possibleSourcePaths.forEach(path => console.warn(`   - ${path}`));
  console.warn('   Make sure the package is installed: pnpm install');
  // Don't exit with error, as this might be OK in some CI scenarios
}
