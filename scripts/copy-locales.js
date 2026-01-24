#!/usr/bin/env node

/**
 * Copy translation files from @reelo/i18n package to public/locales
 * This script runs after npm install to ensure translations are available
 */

import { cpSync, existsSync, realpathSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 [copy-locales] Starting translation files copy...');
console.log('📁 [copy-locales] Script directory:', __dirname);

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

console.log('🔍 [copy-locales] Checking for @reelo/i18n package in:');
possibleSourcePaths.forEach((path, index) => {
  console.log(`   ${index + 1}. ${path}`);
});

// Find the first existing source path
let sourcePath = null;
for (const path of possibleSourcePaths) {
  try {
    if (existsSync(path)) {
      // Resolve symlinks to get real path
      const resolvedPath = realpathSync(path);
      console.log(`✅ [copy-locales] Found package at: ${path}`);
      console.log(`   → Resolved to: ${resolvedPath}`);
      
      if (existsSync(resolvedPath)) {
        // Check if locales directory has files
        const files = readdirSync(resolvedPath);
        console.log(`   → Found ${files.length} language directories: ${files.join(', ')}`);
        sourcePath = resolvedPath;
        break;
      }
    } else {
      console.log(`❌ [copy-locales] Path not found: ${path}`);
    }
  } catch (error) {
    console.log(`⚠️  [copy-locales] Error checking path ${path}:`, error.message);
    continue;
  }
}

// Check if source exists
if (sourcePath && existsSync(sourcePath)) {
  try {
    console.log(`📋 [copy-locales] Target directory: ${targetPath}`);
    
    // Ensure target directory exists
    mkdirSync(targetPath, { recursive: true });
    console.log('✅ [copy-locales] Target directory created/verified');
    
    // Copy locales from node_modules to public
    console.log('📦 [copy-locales] Copying translation files...');
    cpSync(sourcePath, targetPath, { recursive: true, force: true });
    
    // Verify copy was successful
    const copiedFiles = readdirSync(targetPath);
    console.log(`✅ [copy-locales] Translation files copied successfully!`);
    console.log(`   → Copied ${copiedFiles.length} language directories: ${copiedFiles.join(', ')}`);
    console.log(`   → Source: ${sourcePath}`);
    console.log(`   → Target: ${targetPath}`);
  } catch (error) {
    console.error('❌ [copy-locales] ERROR: Could not copy translation files');
    console.error('   → Error:', error.message);
    console.error('   → Stack:', error.stack);
    process.exit(1);
  }
} else {
  console.warn('⚠️  [copy-locales] WARNING: @reelo/i18n locales not found in any of these locations:');
  possibleSourcePaths.forEach(path => console.warn(`   - ${path}`));
  console.warn('   → Make sure the package is installed: pnpm install');
  console.warn('   → Check that @reelo/i18n is in package.json dependencies');
  // Don't exit with error, as this might be OK in some CI scenarios
  console.warn('   → Continuing build anyway (translations might be missing)');
}
