
/*
  # Fix remaining SEO issues: apartment lighting article and one short CZ description

  ## Changes
  - Add seo_title/seo_description for best-led-strip-for-apartment-lighting (all locales)
  - Expand short CZ description for how-to-install-led-strip-on-ceiling
*/

UPDATE blog_posts SET
  seo_title = 'Best LED Strip Lights for Apartment Living: Renter-Friendly Guide',
  seo_description = 'Find the best LED strip lights for apartment living. No-drill installation, removable options, and renter-friendly setups that won''t damage your walls or ceiling.'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'en';

UPDATE blog_posts SET
  seo_title = 'Nejlepší LED pásky pro bytové bydlení: průvodce pro nájemníky 2026',
  seo_description = 'Nejlepší LED pásky pro byt. Instalace bez vrtání, snímatelné varianty a řešení přátelská k nájemníkům, která nepoškodí stěny ani strop vašeho bytu.'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'cz';

UPDATE blog_posts SET
  seo_title = 'Beste LED-Streifen für Wohnungsleben: Ratgeber für Mieter 2026',
  seo_description = 'Die besten LED-Streifen für Mietwohnungen. Installation ohne Bohren, abnehmbare Optionen und mieterfreundliche Lösungen, die Wände und Decken nicht beschädigen.'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'de';

UPDATE blog_posts SET
  seo_title = 'Najlepsze taśmy LED do mieszkania: przewodnik dla najemców 2026',
  seo_description = 'Najlepsze taśmy LED do życia w mieszkaniu. Instalacja bez wiercenia, opcje zdejmowalne i rozwiązania przyjazne najemcom, które nie uszkodzą ścian ani sufitu.'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'pl';

UPDATE blog_posts SET
  seo_title = 'Найкращі LED стрічки для квартири: посібник для орендарів 2026',
  seo_description = 'Найкращі LED стрічки для квартири. Встановлення без свердління, знімні варіанти та рішення дружні до орендарів, що не пошкодять стіни чи стелю.'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'uk';

UPDATE blog_posts SET
  seo_title = 'Лучшие LED ленты для квартиры: руководство для арендаторов 2026',
  seo_description = 'Лучшие LED ленты для жизни в квартире. Установка без сверления, съёмные варианты и решения дружественные арендаторам, не повреждающие стены и потолок.'
WHERE slug = 'best-led-strip-for-apartment-lighting' AND locale = 'ru';

-- Fix too-short CZ description (99 chars, expand to 130+)
UPDATE blog_posts SET
  seo_description = 'Kompletní návod k montáži LED pásku na strop krok za krokem: potřebné nástroje, techniky uchycení, správné zapojení k napájecímu zdroji a řešení typických chyb instalace.'
WHERE slug = 'how-to-install-led-strip-on-ceiling' AND locale = 'cz';
