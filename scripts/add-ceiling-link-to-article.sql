-- Add ceiling-led-lighting CTA link to best-led-strip-for-apartment-lighting article
-- for all missing language versions

-- English version
UPDATE blog_posts
SET content = regexp_replace(
  content,
  '## Ready-Made LED Ceiling Lighting Kits',
  E'[Choose LED Strip for Rental Apartment →](/en/ceiling-led-lighting)\n\n## Ready-Made LED Ceiling Lighting Kits',
  'g'
)
WHERE slug = 'best-led-strip-for-apartment-lighting'
  AND locale = 'en'
  AND content NOT LIKE '%ceiling-led-lighting%';

-- Polish version
UPDATE blog_posts
SET content = regexp_replace(
  content,
  '## Gotowe zestawy oświetlenia sufitowego LED',
  E'[Wybierz taśmę LED do wynajmowanego mieszkania →](/pl/ceiling-led-lighting)\n\n## Gotowe zestawy oświetlenia sufitowego LED',
  'g'
)
WHERE slug = 'best-led-strip-for-apartment-lighting'
  AND locale = 'pl'
  AND content NOT LIKE '%ceiling-led-lighting%';

-- Ukrainian version
UPDATE blog_posts
SET content = regexp_replace(
  content,
  '## Готові комплекти LED підсвітки стелі',
  E'[Виберіть LED стрічку для орендованої квартири →](/uk/ceiling-led-lighting)\n\n## Готові комплекти LED підсвітки стелі',
  'g'
)
WHERE slug = 'best-led-strip-for-apartment-lighting'
  AND locale = 'uk'
  AND content NOT LIKE '%ceiling-led-lighting%';

-- German version
UPDATE blog_posts
SET content = regexp_replace(
  content,
  '## Fertige LED-Deckenbeleuchtungs-Sets',
  E'[Wählen Sie LED-Streifen für Mietwohnung →](/de/ceiling-led-lighting)\n\n## Fertige LED-Deckenbeleuchtungs-Sets',
  'g'
)
WHERE slug = 'best-led-strip-for-apartment-lighting'
  AND locale = 'de'
  AND content NOT LIKE '%ceiling-led-lighting%';

-- Czech version
UPDATE blog_posts
SET content = regexp_replace(
  content,
  '## Hotové sady LED stropního osvětlení',
  E'[Vyberte LED pásek pro pronajatý byt →](/cz/ceiling-led-lighting)\n\n## Hotové sady LED stropního osvětlení',
  'g'
)
WHERE slug = 'best-led-strip-for-apartment-lighting'
  AND locale = 'cz'
  AND content NOT LIKE '%ceiling-led-lighting%';

-- Verify the updates
SELECT
  locale,
  CASE
    WHEN content LIKE '%ceiling-led-lighting%' THEN '✓ Link added'
    ELSE '✗ Still missing'
  END as status
FROM blog_posts
WHERE slug = 'best-led-strip-for-apartment-lighting'
ORDER BY locale;
