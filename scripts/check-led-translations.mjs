#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const localesDir = join(__dirname, '../src/i18n/locales');

const languages = ['en', 'ru', 'uk', 'pl', 'de', 'cz'];

console.log('Checking LED ceiling lighting translations...\n');

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const sections = ['led_ceiling_kit', 'ceiling_lighting'];
const results = {};

for (const lang of languages) {
  const filePath = join(localesDir, `${lang}.json`);
  const content = JSON.parse(readFileSync(filePath, 'utf-8'));

  results[lang] = {};

  for (const section of sections) {
    if (content[section]) {
      const keys = getKeys(content[section]);
      results[lang][section] = {
        exists: true,
        keysCount: keys.length,
        keys: keys.sort()
      };
    } else {
      results[lang][section] = {
        exists: false,
        keysCount: 0,
        keys: []
      };
    }
  }
}

// Compare with English (reference)
const enKeys = {};
for (const section of sections) {
  enKeys[section] = results['en'][section].keys;
}

console.log('📊 Translation completeness:\n');

for (const section of sections) {
  console.log(`\n🔹 ${section}:`);
  console.log('─'.repeat(60));

  for (const lang of languages) {
    const status = results[lang][section];
    const missing = enKeys[section].filter(k => !status.keys.includes(k));
    const extra = status.keys.filter(k => !enKeys[section].includes(k));

    const icon = status.exists && missing.length === 0 ? '✅' : '⚠️';
    console.log(`${icon} ${lang.toUpperCase()}: ${status.keysCount} keys`);

    if (missing.length > 0) {
      console.log(`   Missing: ${missing.join(', ')}`);
    }
    if (extra.length > 0) {
      console.log(`   Extra: ${extra.join(', ')}`);
    }
  }
}

console.log('\n' + '='.repeat(60));
console.log('Summary:');
console.log('='.repeat(60));

for (const section of sections) {
  const allComplete = languages.every(lang =>
    results[lang][section].exists &&
    results[lang][section].keysCount === enKeys[section].length
  );

  if (allComplete) {
    console.log(`✅ ${section}: All translations complete`);
  } else {
    console.log(`⚠️  ${section}: Some translations missing or incomplete`);
  }
}
