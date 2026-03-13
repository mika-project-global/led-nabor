import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Complete Czech warranty page translations
const czWarranty = {
  title: "Záruka produktů LED Nabor",
  subtitle: "Jsme si jisti kvalitou našich produktů a nabízíme standardní 24měsíční záruku",
  standard_warranty: "24 měsíců",
  standard_warranty_desc: "Standardní záruka v souladu s předpisy EU",
  technical_support: "Technická podpora",
  technical_support_desc: "Bezplatná konzultace ohledně instalace a provozu",
  service_life: "Životnost",
  service_life_desc: "Naše produkty mají životnost 10 let při správném použití",
  tabs: {
    info: "Záruční podmínky",
    register: "Registrace záruky"
  },
  what_covered: "Co pokrývá záruka",
  covered_power_supply: "Napájecí zdroj",
  covered_power_supply_desc: "Záruka pokrývá všechny typy poruch napájecího zdroje, včetně selhání komponent, nestabilního provozu a dalších defektů.",
  covered_controller: "Ovladač",
  covered_controller_desc: "Pokrývá poruchy ovladače, včetně problémů s ovládáním, připojením a funkčností.",
  covered_led_strip: "LED pásek",
  covered_led_strip_desc: "Záruka na LED pásek zahrnuje selhání LED diod, ztrátu jasu více než 30% oproti původnímu stavu, odlepení pásku od podkladu a další výrobní vady.",
  what_not_covered: "Co záruka nepokrývá",
  not_covered_mechanical: "Mechanické poškození",
  not_covered_mechanical_desc: "Záruka nepokrývá poškození způsobené nesprávným zacházením, pádem nebo jinými mechanickými vlivy.",
  not_covered_installation: "Nesprávná instalace",
  not_covered_installation_desc: "Poškození způsobená nesprávnou instalací, připojením k nevhodnému zdroji napájení nebo nedodržením pokynů k instalaci.",
  not_covered_wear: "Přirozené opotřebení",
  not_covered_wear_desc: "Přirozené snížení jasu až o 30% během životnosti se nepovažuje za záruční případ.",
  important_info: "Důležité informace",
  important_1: "Pro získání záručního servisu je nutné předložit doklad o nákupu (účtenku, fakturu, číslo objednávky).",
  important_2: "Záruční doba začíná dnem nákupu.",
  important_3: "V případě výměny produktu v rámci záruky pokračuje záruční doba od data původního nákupu.",
  product_registration: "Registrace produktu",
  product_registration_desc: "Zaregistrujte svou sadu LED Nabor a získejte technickou podporu a oznámení o nových produktech.",
  order_number: "Číslo objednávky",
  order_number_placeholder: "Např. ORD-12345",
  email: "Email",
  email_placeholder: "Váš email",
  agree_terms: "Potvrzuji, že jsem si přečetl a souhlasím s",
  warranty_terms: "záručními podmínkami",
  and: "a",
  privacy_policy: "zásadami ochrany osobních údajů",
  success_registration: "Váš produkt byl úspěšně zaregistrován! Potvrzení bylo odesláno na váš email.",
  error_registration: "Při registraci produktu došlo k chybě. Zkuste to prosím později nebo kontaktujte naši podporu.",
  submitting: "Odesílání...",
  register_product: "Zaregistrovat produkt",
  faq_title: "Často kladené otázky",
  faq_1_q: "Jak aktivuji standardní záruku?",
  faq_1_a: "Záruka se aktivuje automaticky při nákupu. Uschovejte si účtenku nebo číslo objednávky k potvrzení data nákupu.",
  faq_2_q: "Co mám dělat v případě poruchy?",
  faq_2_a: "Pokud objevíte poruchu, kontaktujte naši zákaznickou podporu emailem nebo telefonem. Naši specialisté vám pomohou určit příčinu poruchy a navrhnou optimální řešení."
};

// Complete German warranty page translations
const deWarranty = {
  title: "LED Nabor Produktgarantie",
  subtitle: "Wir sind von der Qualität unserer Produkte überzeugt und bieten eine standardmäßige 24-Monats-Garantie",
  standard_warranty: "24 Monate",
  standard_warranty_desc: "Standardgarantie gemäß EU-Vorschriften",
  technical_support: "Technischer Support",
  technical_support_desc: "Kostenlose Beratung zu Installation und Betrieb",
  service_life: "Lebensdauer",
  service_life_desc: "Unsere Produkte haben eine Lebensdauer von 10 Jahren bei ordnungsgemäßer Verwendung",
  tabs: {
    info: "Garantiebedingungen",
    register: "Garantieregistrierung"
  },
  what_covered: "Was deckt die Garantie ab",
  covered_power_supply: "Netzteil",
  covered_power_supply_desc: "Die Garantie deckt alle Arten von Netzteilausfällen ab, einschließlich Komponentenausfällen, instabilem Betrieb und anderen Defekten.",
  covered_controller: "Controller",
  covered_controller_desc: "Deckt Controller-Fehlfunktionen ab, einschließlich Steuerungsproblemen, Verbindungsproblemen und Funktionalität.",
  covered_led_strip: "LED-Streifen",
  covered_led_strip_desc: "Die LED-Streifen-Garantie umfasst LED-Ausfälle, Helligkeitsverlust von mehr als 30% vom Original, Ablösung des Streifens von der Basis und andere Herstellungsfehler.",
  what_not_covered: "Was deckt die Garantie nicht ab",
  not_covered_mechanical: "Mechanische Beschädigungen",
  not_covered_mechanical_desc: "Die Garantie deckt keine Schäden ab, die durch unsachgemäße Handhabung, Herunterfallen oder andere mechanische Einwirkungen verursacht wurden.",
  not_covered_installation: "Unsachgemäße Installation",
  not_covered_installation_desc: "Schäden, die durch unsachgemäße Installation, Anschluss an eine ungeeignete Stromquelle oder Nichtbeachtung der Installationsanweisungen verursacht wurden.",
  not_covered_wear: "Natürliche Abnutzung",
  not_covered_wear_desc: "Eine natürliche Helligkeitsreduzierung von bis zu 30% während der Lebensdauer gilt nicht als Garantiefall.",
  important_info: "Wichtige Informationen",
  important_1: "Für den Garantieservice müssen Sie einen Kaufbeleg (Quittung, Rechnung, Bestellnummer) vorlegen.",
  important_2: "Die Garantiezeit beginnt am Kaufdatum.",
  important_3: "Im Falle eines Produktersatzes unter Garantie wird die Garantiezeit ab dem Zeitpunkt des ursprünglichen Kaufs fortgesetzt.",
  product_registration: "Produktregistrierung",
  product_registration_desc: "Registrieren Sie Ihr LED Nabor Kit, um technischen Support und Benachrichtigungen über neue Produkte zu erhalten.",
  order_number: "Bestellnummer",
  order_number_placeholder: "Z.B. ORD-12345",
  email: "E-Mail",
  email_placeholder: "Ihre E-Mail",
  agree_terms: "Ich bestätige, dass ich die",
  warranty_terms: "Garantiebedingungen",
  and: "und die",
  privacy_policy: "Datenschutzerklärung",
  success_registration: "Ihr Produkt wurde erfolgreich registriert! Eine Bestätigung wurde an Ihre E-Mail gesendet.",
  error_registration: "Bei der Registrierung Ihres Produkts ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut oder kontaktieren Sie unseren Support.",
  submitting: "Wird gesendet...",
  register_product: "Produkt registrieren",
  faq_title: "Häufig gestellte Fragen",
  faq_1_q: "Wie aktiviere ich die Standardgarantie?",
  faq_1_a: "Die Garantie wird automatisch beim Kauf aktiviert. Bewahren Sie Ihre Quittung oder Bestellnummer auf, um das Kaufdatum zu bestätigen.",
  faq_2_q: "Was soll ich im Falle einer Fehlfunktion tun?",
  faq_2_a: "Wenn Sie eine Fehlfunktion feststellen, kontaktieren Sie bitte unseren Support per E-Mail oder Telefon. Unsere Spezialisten helfen Ihnen, die Ursache der Fehlfunktion zu ermitteln und die optimale Lösung vorzuschlagen."
};

// Complete Polish warranty page translations
const plWarranty = {
  title: "Gwarancja produktów LED Nabor",
  subtitle: "Jesteśmy pewni jakości naszych produktów i oferujemy standardową 24-miesięczną gwarancję",
  standard_warranty: "24 miesiące",
  standard_warranty_desc: "Standardowa gwarancja zgodna z przepisami UE",
  technical_support: "Wsparcie Techniczne",
  technical_support_desc: "Bezpłatna konsultacja w zakresie instalacji i eksploatacji",
  service_life: "Żywotność",
  service_life_desc: "Nasze produkty mają żywotność 10 lat przy prawidłowym użytkowaniu",
  tabs: {
    info: "Warunki gwarancji",
    register: "Rejestracja gwarancji"
  },
  what_covered: "Co obejmuje gwarancja",
  covered_power_supply: "Zasilacz",
  covered_power_supply_desc: "Gwarancja obejmuje wszystkie rodzaje awarii zasilacza, w tym uszkodzenia komponentów, niestabilną pracę i inne defekty.",
  covered_controller: "Kontroler",
  covered_controller_desc: "Obejmuje usterki kontrolera, w tym problemy ze sterowaniem, połączeniem i funkcjonalnością.",
  covered_led_strip: "Taśma LED",
  covered_led_strip_desc: "Gwarancja na taśmę LED obejmuje awarie diod LED, utratę jasności przekraczającą 30% wartości początkowej, oderwanie taśmy od podłoża i inne wady produkcyjne.",
  what_not_covered: "Czego nie obejmuje gwarancja",
  not_covered_mechanical: "Uszkodzenia mechaniczne",
  not_covered_mechanical_desc: "Gwarancja nie obejmuje uszkodzeń spowodowanych niewłaściwym obchodzeniem się, upadkiem lub innymi wpływami mechanicznymi.",
  not_covered_installation: "Niewłaściwa instalacja",
  not_covered_installation_desc: "Uszkodzenia spowodowane niewłaściwą instalacją, podłączeniem do nieodpowiedniego źródła zasilania lub nieprzestrzeganiem instrukcji instalacji.",
  not_covered_wear: "Naturalne zużycie",
  not_covered_wear_desc: "Naturalne zmniejszenie jasności do 30% w czasie eksploatacji nie jest uważane za przypadek gwarancyjny.",
  important_info: "Ważne informacje",
  important_1: "Aby otrzymać obsługę gwarancyjną, należy przedstawić dokument potwierdzający zakup (paragon, fakturę, numer zamówienia).",
  important_2: "Okres gwarancji rozpoczyna się od daty zakupu.",
  important_3: "W przypadku wymiany produktu na podstawie gwarancji, okres gwarancji jest kontynuowany od daty pierwotnego zakupu.",
  product_registration: "Rejestracja produktu",
  product_registration_desc: "Zarejestruj swój zestaw LED Nabor, aby otrzymywać wsparcie techniczne i powiadomienia o nowych produktach.",
  order_number: "Numer zamówienia",
  order_number_placeholder: "Np. ORD-12345",
  email: "Email",
  email_placeholder: "Twój email",
  agree_terms: "Potwierdzam, że przeczytałem i zgadzam się z",
  warranty_terms: "warunkami gwarancji",
  and: "i",
  privacy_policy: "polityką prywatności",
  success_registration: "Twój produkt został pomyślnie zarejestrowany! Potwierdzenie zostało wysłane na Twój email.",
  error_registration: "Wystąpił błąd podczas rejestracji produktu. Spróbuj ponownie później lub skontaktuj się z naszą pomocą techniczną.",
  submitting: "Wysyłanie...",
  register_product: "Zarejestruj produkt",
  faq_title: "Często zadawane pytania",
  faq_1_q: "Jak aktywować standardową gwarancję?",
  faq_1_a: "Gwarancja jest automatycznie aktywowana przy zakupie. Zachowaj paragon lub numer zamówienia, aby potwierdzić datę zakupu.",
  faq_2_q: "Co zrobić w przypadku usterki?",
  faq_2_a: "Jeśli odkryjesz usterkę, skontaktuj się z naszym wsparciem technicznym przez email lub telefon. Nasi specjaliści pomogą określić przyczynę usterki i zasugerują optymalne rozwiązanie."
};

function updateWarrantySection(filePath, warrantyTranslations, langCode) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);

  // Replace the warranty_page section with complete translations
  data.warranty_page = warrantyTranslations;

  // Write back with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ Updated warranty_page section in ${langCode}.json`);
}

const localesDir = join(__dirname, '..', 'src', 'i18n', 'locales');

// Update warranty sections in all three language files
updateWarrantySection(join(localesDir, 'cz.json'), czWarranty, 'cz');
updateWarrantySection(join(localesDir, 'de.json'), deWarranty, 'de');
updateWarrantySection(join(localesDir, 'pl.json'), plWarranty, 'pl');

console.log('\n✅ Warranty translations updated successfully for all languages!');
