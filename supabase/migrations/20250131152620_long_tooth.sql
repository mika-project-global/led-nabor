-- Clear existing reviews
TRUNCATE TABLE reviews;

-- Insert new sample reviews with European names
INSERT INTO reviews (product_id, rating, comment, author_name, created_at) VALUES
-- Luxury Bright Sets (White)
(20, 5, 'Perfect lighting solution! Very bright and even illumination.', 'Thomas Schmidt', random_date_last_3months()),
(20, 5, 'Excellent quality, easy installation.', 'Emma Müller', random_date_last_3months()),
(20, 4, 'Great choice for living room.', 'Lucas Weber', random_date_last_3months()),
(20, 5, 'Professional quality product.', 'Sophie Wagner', random_date_last_3months()),

(21, 5, 'Impressive brightness and quality.', 'Jan Kowalski', random_date_last_3months()),
(21, 5, 'Best LED strips I''ve ever used.', 'Marie Dubois', random_date_last_3months()),
(21, 4, 'Very satisfied with the purchase.', 'Henrik Nielsen', random_date_last_3months()),
(21, 5, 'Perfect for large spaces.', 'Isabella Rossi', random_date_last_3months()),

(22, 5, 'Excellent light distribution.', 'Lars Andersen', random_date_last_3months()),
(22, 5, 'High-quality product, worth every euro.', 'Clara Fischer', random_date_last_3months()),
(22, 4, 'Professional installation kit.', 'Pierre Martin', random_date_last_3months()),
(22, 5, 'Amazing brightness!', 'Eva Kovács', random_date_last_3months()),

(23, 5, 'Perfect for my villa.', 'Giovanni Conti', random_date_last_3months()),
(23, 5, 'Exceptional quality.', 'Maria García', random_date_last_3months()),
(23, 4, 'Very bright and reliable.', 'Anders Johansen', random_date_last_3months()),
(23, 5, 'Professional grade lighting.', 'Lukas Novák', random_date_last_3months()),

-- Luxury Sets (White)
(17, 5, 'Great quality for the price.', 'Felix Bauer', random_date_last_3months()),
(17, 4, 'Nice and even lighting.', 'Sofia Andersson', random_date_last_3months()),
(17, 5, 'Perfect for my apartment.', 'Marcel van Dijk', random_date_last_3months()),
(17, 5, 'Very satisfied customer.', 'Elena Popov', random_date_last_3months()),

(18, 5, 'Excellent product quality.', 'David Moreau', random_date_last_3months()),
(18, 4, 'Good value for money.', 'Anna Kowalczyk', random_date_last_3months()),
(18, 5, 'Very happy with the purchase.', 'Marco Rossi', random_date_last_3months()),
(18, 5, 'Perfect lighting solution.', 'Lena Virtanen', random_date_last_3months()),

(19, 5, 'High-quality LED strips.', 'Andreas Weber', random_date_last_3months()),
(19, 4, 'Great customer service.', 'Carmen Santos', random_date_last_3months()),
(19, 5, 'Excellent product.', 'Viktor Nagy', random_date_last_3months()),
(19, 5, 'Very professional kit.', 'Nina Peeters', random_date_last_3months()),

-- Standard Sets (White)
(13, 4, 'Good starter kit.', 'Hans Meyer', random_date_last_3months()),
(13, 5, 'Nice basic lighting.', 'Julie Laurent', random_date_last_3months()),
(13, 4, 'Works as expected.', 'Mikkel Jensen', random_date_last_3months()),
(13, 4, 'Good value.', 'Laura Ferrari', random_date_last_3months()),

(14, 4, 'Decent quality.', 'Erik Svensson', random_date_last_3months()),
(14, 5, 'Good for beginners.', 'Amélie Bernard', random_date_last_3months()),
(14, 4, 'Nice basic set.', 'Tomasz Nowak', random_date_last_3months()),
(14, 4, 'Works well.', 'Chiara Romano', random_date_last_3months()),

(15, 4, 'Good quality basics.', 'Klaus Schmidt', random_date_last_3months()),
(15, 5, 'Nice starter package.', 'Léa Petit', random_date_last_3months()),
(15, 4, 'Decent lighting kit.', 'Mateusz Wojcik', random_date_last_3months()),
(15, 4, 'Good for the price.', 'Sara Lindholm', random_date_last_3months()),

(16, 4, 'Basic but good.', 'Wolfgang Huber', random_date_last_3months()),
(16, 5, 'Nice budget option.', 'Antoine Dupont', random_date_last_3months()),
(16, 4, 'Works as advertised.', 'Piotr Wisniewski', random_date_last_3months()),
(16, 4, 'Good value kit.', 'Martina Bianchi', random_date_last_3months()),

-- Luxury Bright Sets (RGB)
(9, 5, 'Amazing colors!', 'Friedrich Weber', random_date_last_3months()),
(9, 5, 'Perfect RGB lighting.', 'Charlotte Dubois', random_date_last_3months()),
(9, 4, 'Great effects.', 'Niklas Bergström', random_date_last_3months()),
(9, 5, 'Professional quality.', 'Beatrice Ferrari', random_date_last_3months()),

(10, 5, 'Fantastic RGB strips.', 'Maximilian Schulz', random_date_last_3months()),
(10, 5, 'Beautiful colors.', 'Camille Leroy', random_date_last_3months()),
(10, 4, 'Great quality.', 'Gustav Nilsson', random_date_last_3months()),
(10, 5, 'Perfect ambient lighting.', 'Alessandra Romano', random_date_last_3months()),

(11, 5, 'Excellent RGB lighting.', 'Lukas Hoffmann', random_date_last_3months()),
(11, 5, 'Amazing effects.', 'Mathilde Rousseau', random_date_last_3months()),
(11, 4, 'Very satisfied.', 'Oscar Lindqvist', random_date_last_3months()),
(11, 5, 'Professional grade.', 'Valentina Ricci', random_date_last_3months()),

(12, 5, 'Perfect for parties!', 'Sebastian Koch', random_date_last_3months()),
(12, 5, 'Great RGB effects.', 'Élise Moreau', random_date_last_3months()),
(12, 4, 'Excellent quality.', 'Erik Magnusson', random_date_last_3months()),
(12, 5, 'Amazing colors.', 'Francesca Marino', random_date_last_3months()),

-- Luxury Sets (RGB)
(5, 5, 'Very nice RGB lighting.', 'Markus Wagner', random_date_last_3months()),
(5, 4, 'Good color effects.', 'Sophie Martin', random_date_last_3months()),
(5, 5, 'Great quality.', 'Lars Eriksson', random_date_last_3months()),
(5, 5, 'Perfect ambient light.', 'Giulia Costa', random_date_last_3months()),

(6, 5, 'Excellent RGB strips.', 'Christian Bauer', random_date_last_3months()),
(6, 4, 'Nice effects.', 'Céline Petit', random_date_last_3months()),
(6, 5, 'Very happy.', 'Magnus Karlsson', random_date_last_3months()),
(6, 5, 'Great product.', 'Sofia Greco', random_date_last_3months()),

(7, 5, 'Perfect lighting.', 'Tobias Fischer', random_date_last_3months()),
(7, 4, 'Good quality.', 'Aurélie Durand', random_date_last_3months()),
(7, 5, 'Nice RGB effects.', 'Björn Larsson', random_date_last_3months()),
(7, 5, 'Very satisfied.', 'Lucia Romano', random_date_last_3months()),

-- Standard Sets (RGB)
(1, 4, 'Good basic RGB.', 'Philipp Meyer', random_date_last_3months()),
(1, 5, 'Nice starter kit.', 'Manon Bernard', random_date_last_3months()),
(1, 4, 'Works well.', 'Nils Andersson', random_date_last_3months()),
(1, 4, 'Good value.', 'Paola Ferrari', random_date_last_3months()),

(2, 4, 'Decent RGB effects.', 'Stefan Müller', random_date_last_3months()),
(2, 5, 'Good for beginners.', 'Juliette Roux', random_date_last_3months()),
(2, 4, 'Nice basic set.', 'Per Gustafsson', random_date_last_3months()),
(2, 4, 'Works as expected.', 'Claudia Conti', random_date_last_3months()),

(3, 4, 'Good starter RGB.', 'Michael Weber', random_date_last_3months()),
(3, 5, 'Nice colors.', 'Louise Blanc', random_date_last_3months()),
(3, 4, 'Decent effects.', 'Karl Lundgren', random_date_last_3months()),
(3, 4, 'Good basic kit.', 'Elena Rossi', random_date_last_3months()),

(4, 4, 'Basic but good RGB.', 'Daniel Schmidt', random_date_last_3months()),
(4, 5, 'Nice budget option.', 'Claire Dupont', random_date_last_3months()),
(4, 4, 'Works fine.', 'Johan Nilsson', random_date_last_3months()),
(4, 4, 'Good value.', 'Marco Russo', random_date_last_3months());