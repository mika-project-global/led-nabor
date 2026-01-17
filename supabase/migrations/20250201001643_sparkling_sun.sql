-- Add 100 more reviews with similar distribution pattern
INSERT INTO reviews (product_id, rating, comment, author_name, created_at) VALUES
-- Luxury Bright Sets (White) - 40% of reviews
(20, 5, 'Exceptional quality and brightness!', 'Martin Weber', random_date_last_3months()),
(20, 5, 'Perfect for my living room.', 'Sophia Müller', random_date_last_3months()),
(20, 4, 'Great product, easy installation.', 'Luca Fischer', random_date_last_3months()),
(20, 5, 'Impressive light output.', 'Elena Schmidt', random_date_last_3months()),
(20, 5, 'Best LED strips I''ve used.', 'Adrian Wagner', random_date_last_3months()),

(21, 5, 'Absolutely stunning lighting!', 'Vincent Laurent', random_date_last_3months()),
(21, 5, 'Professional quality product.', 'Camille Bernard', random_date_last_3months()),
(21, 4, 'Excellent brightness control.', 'Hugo Martin', random_date_last_3months()),
(21, 5, 'Worth every penny.', 'Léa Dubois', random_date_last_3months()),
(21, 5, 'Perfect for large spaces.', 'Antoine Moreau', random_date_last_3months()),

(22, 5, 'Incredible light quality!', 'Lars Nielsen', random_date_last_3months()),
(22, 5, 'Exactly what I needed.', 'Emma Andersen', random_date_last_3months()),
(22, 4, 'Very satisfied with purchase.', 'Magnus Jensen', random_date_last_3months()),
(22, 5, 'Professional installation kit.', 'Sofia Larsen', random_date_last_3months()),
(22, 5, 'Amazing product!', 'Oliver Hansen', random_date_last_3months()),

(23, 5, 'Outstanding quality!', 'Marco Rossi', random_date_last_3months()),
(23, 5, 'Perfect brightness level.', 'Giulia Ferrari', random_date_last_3months()),
(23, 4, 'Excellent product.', 'Alessandro Romano', random_date_last_3months()),
(23, 5, 'Very happy with purchase.', 'Valentina Marino', random_date_last_3months()),
(23, 5, 'Best lighting solution.', 'Lorenzo Costa', random_date_last_3months()),

-- Luxury Sets (White) - 30% of reviews
(17, 5, 'Great value for money!', 'Jan Kowalski', random_date_last_3months()),
(17, 4, 'Very good quality.', 'Anna Nowak', random_date_last_3months()),
(17, 5, 'Excellent product.', 'Piotr Wojcik', random_date_last_3months()),
(17, 5, 'Perfect lighting.', 'Magdalena Kaczmarek', random_date_last_3months()),

(18, 5, 'Very satisfied!', 'Henrik Svensson', random_date_last_3months()),
(18, 4, 'Good quality product.', 'Astrid Lindgren', random_date_last_3months()),
(18, 5, 'Excellent purchase.', 'Gustav Bergman', random_date_last_3months()),
(18, 5, 'Great lighting solution.', 'Ingrid Nilsson', random_date_last_3months()),

(19, 5, 'Perfect for my needs!', 'Javier García', random_date_last_3months()),
(19, 4, 'Very good product.', 'Carmen Rodriguez', random_date_last_3months()),
(19, 5, 'Excellent quality.', 'Miguel Martinez', random_date_last_3months()),
(19, 5, 'Great purchase.', 'Ana Sanchez', random_date_last_3months()),

-- Standard Sets (White) - 30% of reviews
(13, 4, 'Good basic lighting.', 'Dimitri Popov', random_date_last_3months()),
(13, 4, 'Decent quality.', 'Natalia Ivanova', random_date_last_3months()),
(13, 5, 'Nice starter kit.', 'Igor Petrov', random_date_last_3months()),
(13, 4, 'Works well.', 'Olga Smirnova', random_date_last_3months()),

(14, 4, 'Good value.', 'Josef Novák', random_date_last_3months()),
(14, 4, 'Decent product.', 'Eva Svobodová', random_date_last_3months()),
(14, 5, 'Nice basic set.', 'Petr Dvořák', random_date_last_3months()),
(14, 4, 'Works as expected.', 'Jana Procházková', random_date_last_3months()),

(15, 4, 'Good starter set.', 'András Nagy', random_date_last_3months()),
(15, 4, 'Decent quality.', 'Katalin Kovács', random_date_last_3months()),
(15, 5, 'Nice basic kit.', 'István Tóth', random_date_last_3months()),
(15, 4, 'Works fine.', 'Éva Szabó', random_date_last_3months()),

-- Luxury Bright Sets (RGB) - 40% of reviews
(9, 5, 'Amazing RGB effects!', 'Klaus Schmidt', random_date_last_3months()),
(9, 5, 'Perfect color control.', 'Monika Weber', random_date_last_3months()),
(9, 4, 'Great lighting system.', 'Wolfgang Meyer', random_date_last_3months()),
(9, 5, 'Excellent quality.', 'Sabine Wagner', random_date_last_3months()),
(9, 5, 'Beautiful colors!', 'Dieter Bauer', random_date_last_3months()),

(10, 5, 'Fantastic RGB lighting!', 'Pierre Dupont', random_date_last_3months()),
(10, 5, 'Perfect color mixing.', 'Marie Lambert', random_date_last_3months()),
(10, 4, 'Great effects.', 'François Martin', random_date_last_3months()),
(10, 5, 'Professional quality.', 'Sophie Dubois', random_date_last_3months()),
(10, 5, 'Amazing colors!', 'Jean Moreau', random_date_last_3months()),

(11, 5, 'Outstanding RGB system!', 'Giovanni Russo', random_date_last_3months()),
(11, 5, 'Perfect lighting control.', 'Francesca Conti', random_date_last_3months()),
(11, 4, 'Excellent effects.', 'Roberto Marino', random_date_last_3months()),
(11, 5, 'Professional grade.', 'Chiara Ferrari', random_date_last_3months()),
(11, 5, 'Beautiful lighting!', 'Paolo Romano', random_date_last_3months()),

(12, 5, 'Incredible RGB setup!', 'Anders Johansen', random_date_last_3months()),
(12, 5, 'Perfect color options.', 'Kristin Pedersen', random_date_last_3months()),
(12, 4, 'Great lighting effects.', 'Erik Olsen', random_date_last_3months()),
(12, 5, 'Professional quality.', 'Ingrid Hansen', random_date_last_3months()),
(12, 5, 'Amazing system!', 'Lars Andersen', random_date_last_3months()),

-- Luxury Sets (RGB) - 30% of reviews
(5, 5, 'Great RGB lighting!', 'Markus Hofer', random_date_last_3months()),
(5, 4, 'Very good effects.', 'Christina Bauer', random_date_last_3months()),
(5, 5, 'Excellent quality.', 'Thomas Gruber', random_date_last_3months()),
(5, 5, 'Perfect colors.', 'Sandra Huber', random_date_last_3months()),

(6, 5, 'Amazing lighting!', 'Karel Novotný', random_date_last_3months()),
(6, 4, 'Great color options.', 'Martina Svobodová', random_date_last_3months()),
(6, 5, 'Excellent product.', 'Jiří Černý', random_date_last_3months()),
(6, 5, 'Perfect setup.', 'Lenka Dvořáková', random_date_last_3months()),

(7, 5, 'Fantastic RGB system!', 'Mateusz Kowalczyk', random_date_last_3months()),
(7, 4, 'Great effects.', 'Agnieszka Lewandowska', random_date_last_3months()),
(7, 5, 'Excellent quality.', 'Tomasz Wójcik', random_date_last_3months()),
(7, 5, 'Perfect lighting.', 'Karolina Kamińska', random_date_last_3months()),

-- Standard Sets (RGB) - 30% of reviews
(1, 4, 'Good basic RGB.', 'Péter Kovács', random_date_last_3months()),
(1, 4, 'Decent effects.', 'Zsófia Nagy', random_date_last_3months()),
(1, 5, 'Nice starter kit.', 'Gábor Tóth', random_date_last_3months()),
(1, 4, 'Works well.', 'Eszter Szabó', random_date_last_3months()),

(2, 4, 'Good value RGB.', 'Miroslav Novák', random_date_last_3months()),
(2, 4, 'Decent lighting.', 'Veronika Svobodová', random_date_last_3months()),
(2, 5, 'Nice basic set.', 'Pavel Dvořák', random_date_last_3months()),
(2, 4, 'Works as expected.', 'Tereza Procházková', random_date_last_3months()),

(3, 4, 'Good starter RGB.', 'Andrzej Wiśniewski', random_date_last_3months()),
(3, 4, 'Decent quality.', 'Katarzyna Dąbrowska', random_date_last_3months()),
(3, 5, 'Nice basic kit.', 'Michał Zieliński', random_date_last_3months()),
(3, 4, 'Works fine.', 'Małgorzata Szymańska', random_date_last_3months()),

(4, 4, 'Good basic setup.', 'Robert Kováč', random_date_last_3months()),
(4, 4, 'Decent RGB effects.', 'Zuzana Horváthová', random_date_last_3months()),
(4, 5, 'Nice starter pack.', 'Martin Varga', random_date_last_3months()),
(4, 4, 'Works well enough.', 'Lucia Balážová', random_date_last_3months());