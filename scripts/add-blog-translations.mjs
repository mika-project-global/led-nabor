import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Czech blog translations
const czBlog = {
  title: "Blog a Průvodci",
  description: "Užitečné články, návody k instalaci, nápady designu a tipy pro LED osvětlení",
  heading: "Blog o LED osvětlení",
  subheading: "Odborné rady, průvodce instalací a inspirace designu pro vaše projekty LED osvětlení",
  noPosts: "Zatím žádné články",
  readMore: "Číst více",
  backToBlog: "Zpět na blog",
  postNotFound: "Článek nenalezen",
  minRead: "min čtení",
  views: "zobrazení",
  relatedArticles: "Související články"
};

// German blog translations
const deBlog = {
  title: "Blog & Anleitungen",
  description: "Nützliche Artikel, Installationsanleitungen, Designideen und LED-Beleuchtungstipps",
  heading: "LED-Beleuchtungs-Blog",
  subheading: "Expertenberatung, Installationsanleitungen und Designinspiration für Ihre LED-Beleuchtungsprojekte",
  noPosts: "Noch keine Artikel verfügbar",
  readMore: "Mehr lesen",
  backToBlog: "Zurück zum Blog",
  postNotFound: "Artikel nicht gefunden",
  minRead: "Min. Lesezeit",
  views: "Aufrufe",
  relatedArticles: "Ähnliche Artikel"
};

// Polish blog translations
const plBlog = {
  title: "Blog i Poradniki",
  description: "Przydatne artykuły, przewodniki instalacji, pomysły projektowe i wskazówki dotyczące oświetlenia LED",
  heading: "Blog o oświetleniu LED",
  subheading: "Porady ekspertów, przewodniki instalacji i inspiracje projektowe dla twoich projektów oświetlenia LED",
  noPosts: "Brak dostępnych artykułów",
  readMore: "Czytaj więcej",
  backToBlog: "Wróć do bloga",
  postNotFound: "Artykuł nie został znaleziony",
  minRead: "min czytania",
  views: "wyświetleń",
  relatedArticles: "Powiązane artykuły"
};

function addBlogSection(filePath, blogTranslations, langCode) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  // Add blog section
  data.blog = blogTranslations;

  // Write back with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ Added blog section to ${langCode}.json`);
}

const localesDir = join(__dirname, '..', 'src', 'i18n', 'locales');

// Add blog sections to all three language files
addBlogSection(join(localesDir, 'cz.json'), czBlog, 'cz');
addBlogSection(join(localesDir, 'de.json'), deBlog, 'de');
addBlogSection(join(localesDir, 'pl.json'), plBlog, 'pl');

console.log('\n✅ Blog translations added successfully to all languages!');
