#!/usr/bin/env node

/**
 * Script to generate config.ts from config.template.ts
 * This is used to initialize the configuration for first-time users
 */

const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '../src/config.template.ts');
const configPath = path.join(__dirname, '../src/config.ts');

// Check if config.ts already exists
if (fs.existsSync(configPath)) {
  console.log('⚠️  config.ts already exists. Not overwriting.');
  console.log('   If you want to regenerate it, please delete src/config.ts first.');
  process.exit(0);
}

// Copy template to config.ts
try {
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(configPath, templateContent, 'utf8');
  console.log('✅ Successfully generated src/config.ts from template');
  console.log('   Please update the configuration values in src/config.ts according to your needs.');
} catch (error) {
  console.error('❌ Error generating config.ts:', error.message);
  process.exit(1);
}
