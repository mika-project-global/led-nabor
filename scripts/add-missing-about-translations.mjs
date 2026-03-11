import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Missing translations for Czech (cz)
const czTranslations = {
  how_we_work: "Jak pracujeme",
  how_we_work_desc: "Objednejte si na webu a během 5-10 dnů vám kurýr doveze krabice. Budou v nich LED pásky, napájecí zdroje, řídicí jednotka, kabely a konektory. Vše už bude propojeno. Stačí jen nalepit LED pásek do stropu, upevnit napájecí zdroj a připojit k síti 220V.",
  no_tools_needed: "NEBUDETE potřebovat žádné nástroje",
  no_tools_desc: "Pásky a komponenty přicházejí ze skladu do dílny. Pracovní místa jsou vybavena profesionálními nástroji. Dostanete již sestavený set. Pásky, napájecí zdroje a ovladače budou propojeny.",
  advantages: "Naše výhody",
  advantage_1_title: "Konzultace inženýra",
  advantage_1_desc: "Nemáme prodejce ani manažery. Pokud zavoláte nebo napíšete, odpoví inženýr osvětlení. On bude dohlížet na vaši objednávku. Inženýr je k dispozici od 10:00 do 16:00.",
  advantage_2_title: "Kvalitní značky",
  advantage_2_desc: "Můžete si být jisti: ve vašem stropě nebudou levné čínské noname produkty. Pracujeme pouze s výrobci známých značek, které prošly zkouškou času a poskytují oficiální záruky (Arlight, JazzWay, LedsPower, Rexant, Wago, Electrostandart, Klus).",
  advantage_3_title: "Spolehlivá montáž",
  advantage_3_desc: "Sestavujeme s důrazem na kvalitu. Na konec každého kabelu dáváme kontaktní dutinku. Kabel s dutinkou nikdy nevypadne z konektoru. Spíš se strop rozpadne stářím než selžou kontakty.",
  contact_info: "Kontaktní informace"
};

// Missing translations for German (de)
const deTranslations = {
  how_we_work: "Wie wir arbeiten",
  how_we_work_desc: "Bestellen Sie auf der Website und innerhalb von 5-10 Tagen liefert ein Kurier die Kartons zu Ihnen. Sie enthalten LED-Streifen, Netzteile, Steuereinheit, Kabel und Steckverbinder. Alles wird bereits miteinander verbunden sein. Sie müssen nur den LED-Streifen in die Deckenvertiefung kleben, das Netzteil befestigen und es an das 220V-Netz anschließen.",
  no_tools_needed: "Sie benötigen KEINE Werkzeuge",
  no_tools_desc: "Streifen und Komponenten kommen vom Lager in die Werkstatt. Die Arbeitsplätze sind mit professionellen Werkzeugen ausgestattet. Sie erhalten ein vormontiertes Set. Die Streifen, Netzteile und Controller sind miteinander verbunden.",
  advantages: "Unsere Vorteile",
  advantage_1_title: "Ingenieurberatung",
  advantage_1_desc: "Wir haben keine Verkäufer oder Manager. Wenn Sie anrufen oder schreiben, antwortet ein Beleuchtungsingenieur. Er wird Ihre Bestellung betreuen. Der Ingenieur ist von 10:00 bis 16:00 Uhr verfügbar.",
  advantage_2_title: "Qualitätsmarken",
  advantage_2_desc: "Sie können sicher sein: In Ihrer Decke werden keine billigen chinesischen Noname-Produkte verbaut. Wir arbeiten nur mit Herstellern bekannter Marken, die sich bewährt haben und offizielle Garantien bieten (Arlight, JazzWay, LedsPower, Rexant, Wago, Electrostandart, Klus).",
  advantage_3_title: "Zuverlässige Montage",
  advantage_3_desc: "Wir montieren mit Qualität im Sinn. Wir setzen an das Ende jedes Kabels eine Kontakthülse. Ein Kabel mit Hülse fällt niemals aus einem Steckverbinder. Die Decke wird eher vor Alter zerfallen als dass die Kontakte versagen.",
  contact_info: "Kontaktinformationen"
};

// Missing translations for Polish (pl)
const plTranslations = {
  how_we_work: "Jak pracujemy",
  how_we_work_desc: "Złóż zamówienie na stronie, a w ciągu 5-10 dni kurier dostarczy pudełka. Będą w nich taśmy LED, zasilacze, moduł sterujący, przewody i złącza. Wszystko będzie już ze sobą połączone. Wystarczy tylko przykleić taśmę LED do wnęki sufitowej, przymocować zasilacz i podłączyć do sieci 220V.",
  no_tools_needed: "NIE będziesz potrzebować żadnych narzędzi",
  no_tools_desc: "Taśmy i komponenty przychodzą z magazynu do warsztatu. Stanowiska pracy są wyposażone w profesjonalne narzędzia. Otrzymasz gotowy zestaw. Taśmy, zasilacze i kontrolery będą ze sobą połączone.",
  advantages: "Nasze zalety",
  advantage_1_title: "Konsultacja inżyniera",
  advantage_1_desc: "Nie mamy sprzedawców ani menedżerów. Jeśli zadzwonisz lub napiszesz, odpowie inżynier oświetlenia. On będzie nadzorował Twoje zamówienie. Inżynier jest dostępny od 10:00 do 16:00.",
  advantage_2_title: "Markowe produkty",
  advantage_2_desc: "Możesz być pewien: w Twoim suficie nie będzie tanich chińskich produktów bez nazwy. Pracujemy tylko z producentami znanych marek, które sprawdziły się w czasie i oferują oficjalne gwarancje (Arlight, JazzWay, LedsPower, Rexant, Wago, Electrostandart, Klus).",
  advantage_3_title: "Niezawodny montaż",
  advantage_3_desc: "Montujemy z myślą o jakości. Na koniec każdego przewodu zakładamy końcówkę kontaktową. Przewód z końcówką nigdy nie wypadnie ze złącza. Prędzej sufit się rozsypie ze starości niż zawiodą kontakty.",
  contact_info: "Informacje kontaktowe"
};

// Additional support section fields
const czSupportFields = {
  email_for_files: "Email pro soubory:",
  email_for_files_desc: "Posílejte schémata, výkresy a další dokumenty na tento email.",
  phone: "Telefon",
  prague: "Praha",
  our_location: "Naše poloha"
};

const deSupportFields = {
  email_for_files: "E-Mail für Dateien:",
  email_for_files_desc: "Senden Sie Schemata, Zeichnungen und andere Dokumente an diese E-Mail.",
  phone: "Telefon",
  prague: "Prag",
  our_location: "Unser Standort"
};

const plSupportFields = {
  email_for_files: "Email na pliki:",
  email_for_files_desc: "Wysyłaj schematy, rysunki i inne dokumenty na ten email.",
  phone: "Telefon",
  prague: "Praga",
  our_location: "Nasza lokalizacja"
};

// Function to add missing fields to about section
function addMissingAboutFields(filePath, translations, supportFields, langCode) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  // Add missing fields to about section
  if (data.about) {
    Object.assign(data.about, translations);
  }

  // Add missing fields to support section
  if (data.support) {
    Object.assign(data.support, supportFields);
  }

  // Write back with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ Updated ${langCode}.json with missing translations`);
}

const localesDir = join(__dirname, '..', 'src', 'i18n', 'locales');

// Update all three language files
addMissingAboutFields(join(localesDir, 'cz.json'), czTranslations, czSupportFields, 'cz');
addMissingAboutFields(join(localesDir, 'de.json'), deTranslations, deSupportFields, 'de');
addMissingAboutFields(join(localesDir, 'pl.json'), plTranslations, plSupportFields, 'pl');

console.log('\n✅ All missing translations added successfully!');
