-- Сначала удаляем конфликтующие функции
DROP FUNCTION IF EXISTS update_warranty_price_with_variant(integer, integer, text, numeric, text);
DROP FUNCTION IF EXISTS get_warranty_prices_with_variant(text, text);
DROP FUNCTION IF EXISTS get_warranty_price_for_variant(integer, integer, text, text);
DROP FUNCTION IF EXISTS get_warranty_price(integer, integer, text, text);
DROP FUNCTION IF EXISTS get_product_price(integer, text, text);
DROP FUNCTION IF EXISTS update_product_price_direct(integer, text, text, numeric);
DROP FUNCTION IF EXISTS fix_all_warranty_prices();
DROP FUNCTION IF EXISTS fix_all_product_prices();
DROP FUNCTION IF EXISTS debug_warranty_price(integer, integer, text, text);
DROP FUNCTION IF EXISTS debug_product_price(integer, text, text);

-- Создаем функцию для получения цены продукта
CREATE FUNCTION get_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  base_price numeric;
BEGIN
  -- Сначала пробуем получить цену из product_prices
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  -- Если найдено, возвращаем
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- Если не найдено, пробуем получить из products
  SELECT (value->>'price')::numeric INTO base_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  -- Возвращаем базовую цену или 0, если не найдено
  RETURN COALESCE(base_price, 0);
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для обновления цены продукта
CREATE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_index integer;
  variant_length integer;
BEGIN
  -- Деактивируем существующие цены
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true;
    
  -- Вставляем новую цену
  INSERT INTO product_prices (
    product_id,
    variant_id,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    p_product_id,
    p_variant_id,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- Если обновляем цену в CZK, также обновляем таблицу products
  IF p_currency = 'CZK' THEN
    -- Находим индекс варианта
    SELECT 
      (ordinality - 1)::integer,
      (value->>'length')::integer
    INTO 
      variant_index,
      variant_length
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = p_product_id AND
      value->>'id' = p_variant_id;
    
    -- Обновляем таблицу products
    IF variant_index IS NOT NULL THEN
      UPDATE products
      SET 
        variants = jsonb_set(
          variants,
          ARRAY[variant_index::text],
          jsonb_build_object(
            'id', p_variant_id,
            'length', variant_length,
            'price', p_price,
            'stockStatus', 'in_stock'
          )
        ),
        updated_at = now()
      WHERE id = p_product_id;
    END IF;
  END IF;
  
  RETURN new_price;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для получения цены гарантии
CREATE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
BEGIN
  -- Извлекаем длину из ID варианта
  CASE 
    WHEN p_variant_id LIKE '%-5' THEN variant_length := 5;
    WHEN p_variant_id LIKE '%-10' THEN variant_length := 10;
    WHEN p_variant_id LIKE '%-15' THEN variant_length := 15;
    WHEN p_variant_id LIKE '%-20' THEN variant_length := 20;
    WHEN p_variant_id LIKE '%-25' THEN variant_length := 25;
    WHEN p_variant_id LIKE '%-30' THEN variant_length := 30;
    ELSE variant_length := 5;
  END CASE;

  -- Сначала пробуем получить цену из warranty_custom_prices
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = p_variant_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- Если найдено, возвращаем
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- Если не найдено, пробуем получить из warranty_fixed_prices
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- Если найдено, масштабируем для нужного варианта
  IF fixed_price IS NOT NULL THEN
    IF variant_length = 5 THEN
      RETURN fixed_price;
    ELSE
      calculated_price := fixed_price * (variant_length / base_length);
      RETURN round(calculated_price);
    END IF;
  END IF;
  
  -- Если не найдено, пробуем получить из warranty_policies
  SELECT wp.fixed_price INTO policy_price
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- Если найдено, масштабируем для нужного варианта
  IF policy_price IS NOT NULL THEN
    IF variant_length = 5 THEN
      RETURN policy_price;
    ELSE
      calculated_price := policy_price * (variant_length / base_length);
      RETURN round(calculated_price);
    END IF;
  END IF;
  
  -- Если ничего не найдено, возвращаем 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для обновления цены гарантии
CREATE FUNCTION update_warranty_price_with_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS boolean AS $$
DECLARE
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
BEGIN
  -- Извлекаем длину из ID варианта
  CASE 
    WHEN p_variant_id LIKE '%-5' THEN variant_length := 5;
    WHEN p_variant_id LIKE '%-10' THEN variant_length := 10;
    WHEN p_variant_id LIKE '%-15' THEN variant_length := 15;
    WHEN p_variant_id LIKE '%-20' THEN variant_length := 20;
    WHEN p_variant_id LIKE '%-25' THEN variant_length := 25;
    WHEN p_variant_id LIKE '%-30' THEN variant_length := 30;
    ELSE variant_length := 5;
  END CASE;

  -- Деактивируем существующие цены
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- Вставляем новую цену
  INSERT INTO warranty_custom_prices (
    product_id,
    variant_id,
    months,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    p_product_id,
    p_variant_id,
    p_months,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  );
  
  -- Если обновляем базовый вариант (5м) в CZK, обновляем warranty_policies и warranty_fixed_prices
  IF variant_length = 5 AND p_currency = 'CZK' THEN
    -- Обновляем warranty_policies
    UPDATE warranty_policies
    SET fixed_price = p_price
    WHERE product_id = p_product_id
      AND months = p_months;
      
    -- Обновляем warranty_fixed_prices
    INSERT INTO warranty_fixed_prices (
      product_id,
      months,
      currency,
      price
    ) VALUES (
      p_product_id,
      p_months,
      p_currency,
      p_price
    )
    ON CONFLICT (product_id, months, currency) 
    DO UPDATE SET price = EXCLUDED.price;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для получения цен гарантий
CREATE FUNCTION get_warranty_prices_with_variant(
  p_currency text,
  p_variant_id text
) RETURNS TABLE (
  id uuid,
  product_id integer,
  variant_id text,
  months integer,
  currency text,
  custom_price numeric,
  is_active boolean,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wcp.id,
    wcp.product_id,
    wcp.variant_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price,
    wcp.is_active,
    wcp.updated_at
  FROM warranty_custom_prices wcp
  WHERE wcp.currency = p_currency
    AND wcp.variant_id = p_variant_id
    AND wcp.is_active = true
  ORDER BY wcp.product_id, wcp.months;
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для исправления всех цен продуктов
CREATE FUNCTION fix_all_product_prices() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- Деактивируем существующие цены
  UPDATE product_prices SET is_active = false;
  
  -- Для каждого продукта
  FOR product IN SELECT * FROM products
  LOOP
    -- Для каждого варианта
    FOR variant IN SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric)
    LOOP
      -- Вставляем цену
      INSERT INTO product_prices (
        product_id,
        variant_id,
        currency,
        custom_price,
        is_active,
        updated_at
      ) VALUES (
        product.id,
        variant.id,
        'CZK',
        variant.price,
        true,
        clock_timestamp()
      );
    END LOOP;
  END LOOP;
  
  -- Обновляем таблицу products
  UPDATE products p
  SET variants = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', v->>'id',
        'length', (v->>'length')::integer,
        'price', COALESCE(pp.custom_price, (v->>'price')::numeric),
        'stockStatus', COALESCE(v->>'stockStatus', 'in_stock')
      )
    )
    FROM jsonb_array_elements(p.variants) AS v
    LEFT JOIN product_prices pp ON 
      pp.product_id = p.id AND 
      pp.variant_id = v->>'id' AND 
      pp.currency = 'CZK' AND
      pp.is_active = true
  );
END;
$$ LANGUAGE plpgsql;

-- Создаем функцию для исправления всех цен гарантий
CREATE FUNCTION fix_all_warranty_prices() RETURNS void AS $$
DECLARE
  policy RECORD;
  product RECORD;
  variant RECORD;
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5;
BEGIN
  -- Деактивируем существующие цены
  UPDATE warranty_custom_prices SET is_active = false;
  
  -- Для каждого продукта
  FOR product IN SELECT * FROM products
  LOOP
    -- Для каждой политики гарантии
    FOR policy IN 
      SELECT * FROM warranty_policies
      WHERE product_id = product.id
        AND fixed_price IS NOT NULL 
        AND fixed_price > 0
    LOOP
      -- Получаем базовую цену
      base_price := policy.fixed_price;
      
      -- Для каждого варианта
      FOR variant IN 
        SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric)
      LOOP
        -- Извлекаем длину из ID варианта
        variant_length := variant.length;
        
        -- Рассчитываем цену на основе соотношения длины
        IF variant_length = 5 THEN
          variant_price := base_price;
        ELSE
          variant_price := base_price * (variant_length / base_length);
          variant_price := round(variant_price);
        END IF;
        
        -- Вставляем цену
        INSERT INTO warranty_custom_prices (
          product_id,
          variant_id,
          months,
          currency,
          custom_price,
          is_active,
          updated_at
        ) VALUES (
          product.id,
          variant.id,
          policy.months,
          'CZK',
          variant_price,
          true,
          clock_timestamp()
        );
      END LOOP;
    END LOOP;
  END LOOP;
  
  -- Обновляем warranty_fixed_prices
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  )
  SELECT DISTINCT ON (product_id, months, currency)
    product_id,
    months,
    currency,
    custom_price
  FROM warranty_custom_prices
  WHERE is_active = true
    AND variant_id LIKE '%-5'
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
END;
$$ LANGUAGE plpgsql;

-- Запускаем функции исправления
SELECT fix_all_product_prices();
SELECT fix_all_warranty_prices();