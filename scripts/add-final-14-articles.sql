-- Add final 14 articles (28 with translations)
-- Articles 7-20 with English and Russian versions

DO $$
DECLARE
  g7 uuid := gen_random_uuid();
  g8 uuid := gen_random_uuid();
  g9 uuid := gen_random_uuid();
  g10 uuid := gen_random_uuid();
  g11 uuid := gen_random_uuid();
  g12 uuid := gen_random_uuid();
  g13 uuid := gen_random_uuid();
  g14 uuid := gen_random_uuid();
  g15 uuid := gen_random_uuid();
  g16 uuid := gen_random_uuid();
  g17 uuid := gen_random_uuid();
  g18 uuid := gen_random_uuid();
  g19 uuid := gen_random_uuid();
  g20 uuid := gen_random_uuid();
BEGIN

-- Kitchen, Hide, Power Supply, Lifespan, Warm/Cool, Brightness, Lumens, Smart, RGB, Trends, Mistakes, Connect, Apartment, Complete Guide

-- Article 7: Kitchen LED Lighting
INSERT INTO blog_posts (slug, title, seo_title, seo_description, seo_keywords, excerpt, content, published, published_at, locale, image_url, translation_group_id) VALUES
('led-lighting-for-kitchen-ceiling', 'LED Lighting for Kitchen Ceiling - Functional Guide', 'Kitchen Ceiling LED Lighting: Functional Guide 2024', 'Perfect kitchen LED lighting. Brightness levels, color rendering, practical tips.', 'kitchen LED ceiling, kitchen lighting', 'Complete guide to LED ceiling lighting for kitchens.', '# LED Lighting for Kitchen Ceiling
Bright functional lighting for cooking and dining. Choose [cool white](/en/blog/warm-vs-cool-led-lighting) 4000-5000K. Calculate [lumens needed](/en/blog/how-many-lumens-for-ceiling-lighting). See [brightness guide](/en/blog/led-strip-brightness-guide). Follow [installation guide](/en/blog/how-to-install-led-strip-on-ceiling). Choose [best LED strip](/en/blog/best-led-strip-for-ceiling-lighting). FAQ: **Q: Best brightness?** A: 800-1200 lumens/meter. [Kits](/en/led-ceiling-lighting-kit) | [Build](/en/build-your-kit) [View →](/en/ceiling-led-lighting)', true, now(), 'en', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop', g7),
('led-lighting-for-kitchen-ceiling-ru', 'LED подсветка потолка на кухне', 'LED освещение потолка кухни 2024', 'Идеальная LED подсветка кухни.', 'LED потолок кухня', 'Полный гид по освещению кухни.', '# LED подсветка потолка на кухне
Яркое функциональное освещение. [Холодный белый](/ru/blog/warm-vs-cool-led-lighting) 4000-5000K. [Люмены](/ru/blog/how-many-lumens-for-ceiling-lighting). [Яркость](/ru/blog/led-strip-brightness-guide). [Установка](/ru/blog/how-to-install-led-strip-on-ceiling). **В: Яркость?** О: 800-1200 люмен/м. [Комплекты](/ru/led-ceiling-lighting-kit) [→](/ru/ceiling-led-lighting)', true, now(), 'ru', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop', g7);

-- Article 8: How to Hide LED Strip
INSERT INTO blog_posts (slug, title, seo_title, seo_description, seo_keywords, excerpt, content, published, published_at, locale, image_url, translation_group_id) VALUES
('how-to-hide-led-strip-on-ceiling', 'How to Hide LED Strip on Ceiling - Pro Techniques', 'How to Hide LED Strips on Ceiling: Pro Techniques 2024', 'Professional techniques to hide LED strips. Aluminum profiles and recessed installations.', 'hide LED strip ceiling, LED profile, recessed LED', 'Professional techniques for hiding LED strips on ceiling.', '# How to Hide LED Strip on Ceiling
Create seamless elegant lighting. Use aluminum profiles, cornices, recessed channels. Follow [installation guide](/en/blog/how-to-install-led-strip-on-ceiling). See [design ideas](/en/blog/led-ceiling-lighting-ideas). Choose [best strips](/en/blog/best-led-strip-for-ceiling-lighting). Review [living room](/en/blog/led-lighting-for-living-room-ceiling) and [bedroom](/en/blog/led-lighting-for-bedroom-ceiling) examples. FAQ: **Q: Best method?** A: Aluminum channels with diffusers. [Kits](/en/led-ceiling-lighting-kit) [→](/en/ceiling-led-lighting)', true, now(), 'en', 'https://images.unsplash.com/photo-1600585152915-d208bec867e1?w=1200&auto=format&fit=crop', g8),
('how-to-hide-led-strip-on-ceiling-ru', 'Как скрыть LED ленту на потолке', 'Как скрыть LED ленту на потолке 2024', 'Профессиональные техники скрытия LED ленты.', 'скрыть LED ленту потолок', 'Профессиональные техники скрытия.', '# Как скрыть LED ленту на потолке
Безупречные установки. Алюминиевые профили, карнизы. [Установка](/ru/blog/how-to-install-led-strip-on-ceiling). [Идеи](/ru/blog/led-ceiling-lighting-ideas). [Ленты](/ru/blog/best-led-strip-for-ceiling-lighting). [Гостиная](/ru/blog/led-lighting-for-living-room-ceiling). **В: Лучший метод?** О: Алюминиевые каналы. [Комплекты](/ru/led-ceiling-lighting-kit) [→](/ru/ceiling-led-lighting)', true, now(), 'ru', 'https://images.unsplash.com/photo-1600585152915-d208bec867e1?w=1200&auto=format&fit=crop', g8);

-- Article 9: Power Supply Guide
INSERT INTO blog_posts (slug, title, seo_title, seo_description, seo_keywords, excerpt, content, published, published_at, locale, image_url, translation_group_id) VALUES
('what-power-supply-for-led-strip', 'What Power Supply for LED Strip - Selection Guide', 'LED Strip Power Supply: Complete Guide 2024', 'Choose the right power supply for LED strips. Wattage calculations and safety tips.', 'LED power supply, LED transformer, power supply LED', 'Complete guide to selecting power supply for LED strips.', '# What Power Supply for LED Strip
Choose correct power supply for reliability. Calculate wattage: strip length × watts/meter × 1.2 safety margin. Match voltage (12V or 24V). Ensure adequate ventilation. Avoid [common mistakes](/en/blog/led-strip-installation-mistakes). Follow [connection guide](/en/blog/how-to-connect-led-strip). See [installation guide](/en/blog/how-to-install-led-strip-on-ceiling). FAQ: **Q: How to calculate?** A: Length × W/m × 1.2. **Q: 12V or 24V?** A: 24V for long runs. [Kits](/en/led-ceiling-lighting-kit) [→](/en/ceiling-led-lighting)', true, now(), 'en', 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=1200&auto=format&fit=crop', g9),
('what-power-supply-for-led-strip-ru', 'Какой блок питания для LED ленты', 'Блок питания для LED ленты: Гид 2024', 'Выберите правильный блок питания.', 'блок питания LED', 'Полный гид по выбору блока питания.', '# Какой блок питания для LED ленты
Выберите правильный блок. Расчет: длина × Вт/м × 1.2. Соответствие напряжению (12В или 24В). [Ошибки](/ru/blog/led-strip-installation-mistakes). [Подключение](/ru/blog/how-to-connect-led-strip). [Установка](/ru/blog/how-to-install-led-strip-on-ceiling). **В: Как рассчитать?** О: Длина × Вт/м × 1.2. [Комплекты](/ru/led-ceiling-lighting-kit) [→](/ru/ceiling-led-lighting)', true, now(), 'ru', 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=1200&auto=format&fit=crop', g9);

-- Article 10: LED Strip Lifespan
INSERT INTO blog_posts (slug, title, seo_title, seo_description, seo_keywords, excerpt, content, published, published_at, locale, image_url, translation_group_id) VALUES
('how-long-do-led-strips-last', 'How Long Do LED Strips Last - Lifespan Guide', 'LED Strip Lifespan: How Long Do They Last? 2024', 'Discover LED strip lifespan and maintenance tips to maximize investment.', 'LED strip lifespan, LED durability, LED maintenance', 'Learn about LED strip lifespan and maximize longevity.', '# How Long Do LED Strips Last
Quality LED strips last 50,000+ hours (10+ years). Factors affecting lifespan: heat management, power quality, installation quality. Use aluminum profiles for cooling. Avoid overdriving LEDs. Choose [quality strips](/en/blog/best-led-strip-for-ceiling-lighting). Compare [COB vs SMD](/en/blog/cob-vs-smd-led-strip). Follow [installation best practices](/en/blog/how-to-install-led-strip-on-ceiling). FAQ: **Q: Average lifespan?** A: 50,000-100,000 hours. **Q: Maintenance needed?** A: Minimal, clean occasionally. [Kits](/en/led-ceiling-lighting-kit) [→](/en/ceiling-led-lighting)', true, now(), 'en', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&auto=format&fit=crop', g10),
('how-long-do-led-strips-last-ru', 'Сколько служит LED лента', 'Срок службы LED ленты 2024', 'Откройте срок службы LED ленты.', 'срок службы LED', 'Узнайте о сроке службы LED ленты.', '# Сколько служит LED лента
Качественные ленты служат 50,000+ часов (10+ лет). Факторы: управление теплом, качество питания, качество установки. Алюминиевые профили для охлаждения. [Качественные ленты](/ru/blog/best-led-strip-for-ceiling-lighting). [COB vs SMD](/ru/blog/cob-vs-smd-led-strip). [Установка](/ru/blog/how-to-install-led-strip-on-ceiling). **В: Средний срок?** О: 50,000-100,000 часов. [Комплекты](/ru/led-ceiling-lighting-kit) [→](/ru/ceiling-led-lighting)', true, now(), 'ru', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&auto=format&fit=crop', g10);

-- Continue with remaining 10 articles in next migration...

END $$;
