import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const languages = ['en', 'ru', 'uk', 'cz', 'de', 'pl'];

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

console.log('\n🔍 Checking translation completeness across all languages...\n');

// Load all language files
const translations = {};
for (const lang of languages) {
  const filePath = path.join(localesDir, `${lang}.json`);
  const content = fs.readFileSync(filePath, 'utf8');
  translations[lang] = JSON.parse(content);
}

// Get all keys from English (reference language)
const enKeys = getAllKeys(translations.en);
console.log(`📋 Total keys in English: ${enKeys.length}\n`);

// Check each language
const report = {};
for (const lang of languages) {
  if (lang === 'en') continue;

  const langKeys = getAllKeys(translations[lang]);
  const missing = enKeys.filter(key => !langKeys.includes(key));
  const extra = langKeys.filter(key => !enKeys.includes(key));

  report[lang] = {
    total: langKeys.length,
    missing: missing,
    extra: extra,
    coverage: ((langKeys.length - missing.length) / enKeys.length * 100).toFixed(1)
  };
}

// Print report
console.log('═══════════════════════════════════════════════════════════');
console.log('                 TRANSLATION COVERAGE REPORT                ');
console.log('═══════════════════════════════════════════════════════════\n');

let allComplete = true;

for (const lang of languages) {
  if (lang === 'en') {
    console.log(`✅ ${lang.toUpperCase()}: ${enKeys.length} keys (reference language)`);
    continue;
  }

  const r = report[lang];
  const status = r.missing.length === 0 ? '✅' : '⚠️';
  console.log(`${status} ${lang.toUpperCase()}: ${r.total}/${enKeys.length} keys (${r.coverage}% coverage)`);

  if (r.missing.length > 0) {
    allComplete = false;
    console.log(`   Missing ${r.missing.length} keys:`);
    r.missing.slice(0, 10).forEach(key => console.log(`      - ${key}`));
    if (r.missing.length > 10) {
      console.log(`      ... and ${r.missing.length - 10} more`);
    }
  }

  if (r.extra.length > 0) {
    console.log(`   Extra ${r.extra.length} keys not in English:`);
    r.extra.slice(0, 5).forEach(key => console.log(`      + ${key}`));
    if (r.extra.length > 5) {
      console.log(`      ... and ${r.extra.length - 5} more`);
    }
  }
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════');
if (allComplete) {
  console.log('✅ ALL TRANSLATIONS ARE COMPLETE!');
} else {
  console.log('⚠️  SOME TRANSLATIONS ARE INCOMPLETE');
}
console.log('═══════════════════════════════════════════════════════════\n');

// Critical pages check
console.log('\n📄 Checking critical pages for all languages...\n');

const criticalPages = [
  'nav',
  'home',
  'catalog',
  'about',
  'faq',
  'warranty',
  'support',
  'business',
  'installationGuide'
];

for (const page of criticalPages) {
  let pageComplete = true;
  let pageStatus = '';

  for (const lang of languages) {
    if (!translations[lang][page]) {
      pageComplete = false;
      pageStatus += ` ${lang.toUpperCase()}:❌`;
    } else {
      pageStatus += ` ${lang.toUpperCase()}:✅`;
    }
  }

  const status = pageComplete ? '✅' : '⚠️';
  console.log(`${status} ${page}:${pageStatus}`);
}

console.log('\n✅ Translation check complete!\n');
