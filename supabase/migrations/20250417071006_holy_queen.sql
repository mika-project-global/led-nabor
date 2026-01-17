/*
  # Улучшение функций для админ-панели управления ценами
  
  1. Изменения
    - Добавление функций для получения и обновления цен с поддержкой вариантов
    - Улучшение обработки ошибок и логирования
    - Оптимизация запросов для лучшей производительности
    
  2. Безопасность
    - Сохранение существующих политик RLS
*/

-- Создаем улучшенную функцию для получения цены гарантии для конкретного варианта
CREATE OR REPLACE FUNCTION get_warranty_price_for_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
  fixed_price numeric;
  policy_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  variant_prefix text;
BEGIN
  -- Определяем префикс варианта (rgb или cct)
  variant_prefix := CASE 
    WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
    WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
    ELSE 'rgb'
  END;
  
  -- Извлекаем длину из ID варианта (например, 'rgb-10' -> 10)
  CASE 
    WHEN p_variant_id LIKE '%-5' THEN variant_length := 5;
    WHEN p_variant_id LIKE '%-10' THEN variant_length := 10;
    WHEN p_variant_id LIKE '%-15' THEN variant_length := 15;
    WHEN p_variant_id LIKE '%-20' THEN variant_length := 20;
    WHEN p_variant_id LIKE '%-25' THEN variant_length := 25;
    WHEN p_variant_id LIKE '%-30' THEN variant_length := 30;
    ELSE variant_length := 5;
  END CASE;

  -- Сначала пробуем получить пользовательскую цену для конкретного варианта
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
  
  -- Если не найдено, получаем базовую цену (вариант 5м) и масштабируем ее
  -- Сначала пробуем из warranty_custom_prices
  SELECT wcp.custom_price INTO default_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = variant_prefix || '-5'
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- Если не найдено, пробуем из warranty_fixed_prices
  IF default_price IS NULL THEN
    SELECT wfp.price INTO default_price
    FROM warranty_fixed_prices wfp
    WHERE wfp.product_id = p_product_id
      AND wfp.months = p_months
      AND wfp.currency = p_currency;
  END IF;
  
  -- Если все еще не найдено, пробуем из warranty_policies
  IF default_price IS NULL THEN
    SELECT wp.fixed_price INTO default_price
    FROM warranty_policies wp
    WHERE wp.product_id = p_product_id
      AND wp.months = p_months;
  END IF;
  
  -- Если мы нашли базовую цену, рассчитываем цену для этого варианта
  IF default_price IS NOT NULL THEN
    -- Для варианта 5м возвращаем базовую цену
    IF variant_length = 5 THEN
      RETURN default_price;
    ELSE
      -- Для других вариантов масштабируем цену на основе соотношения длины
      calculated_price := default_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      -- Сохраняем рассчитанную цену для будущего использования
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
        calculated_price,
        true,
        clock_timestamp()
      )
      ON CONFLICT DO NOTHING;
      
      RETURN calculated_price;
    END IF;
  END IF;
  
  -- Если ничего не найдено, возвращаем 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Обновляем основную функцию get_warranty_price для использования новой функции для конкретного варианта
CREATE OR REPLACE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS numeric AS $$
BEGIN
  -- Вызываем функцию для конкретного варианта
  RETURN get_warranty_price_for_variant(
    p_product_id,
    p_months,
    p_currency,
    p_variant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для обновления цены гарантии с учетом варианта
CREATE OR REPLACE FUNCTION update_warranty_price_with_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  v_id text;
  product_prefix text;
  variant_ids text[];
BEGIN
  -- Определяем префикс продукта (rgb или cct)
  product_prefix := CASE 
    WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
    WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
    ELSE 'rgb'
  END;
  
  -- Создаем список вариантов для этого типа продукта
  variant_ids := ARRAY[
    product_prefix || '-5', 
    product_prefix || '-10', 
    product_prefix || '-15', 
    product_prefix || '-20', 
    product_prefix || '-25', 
    product_prefix || '-30'
  ];

  -- Если обновляем базовый вариант, обновляем все варианты
  IF p_variant_id = product_prefix || '-5' THEN
    -- Сначала обновляем базовую цену для варианта 5м
    UPDATE warranty_custom_prices
    SET is_active = false
    WHERE product_id = p_product_id
      AND variant_id = p_variant_id
      AND months = p_months
      AND currency = p_currency
      AND is_active = true;
      
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
    )
    RETURNING custom_price INTO new_price;
    
    -- Обновляем таблицу warranty_policies, если это применимо
    IF p_currency = 'CZK' THEN
      UPDATE warranty_policies
      SET fixed_price = p_price
      WHERE product_id = p_product_id
        AND months = p_months;
    END IF;
    
    -- Обновляем таблицу warranty_fixed_prices
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
    
    -- Теперь обновляем все остальные варианты для этого продукта
    FOREACH v_id IN ARRAY variant_ids
    LOOP
      -- Пропускаем если не соответствует префиксу продукта или уже обновлен
      IF v_id != p_variant_id THEN
        -- Извлекаем длину из ID варианта
        CASE 
          WHEN v_id LIKE '%-5' THEN variant_length := 5;
          WHEN v_id LIKE '%-10' THEN variant_length := 10;
          WHEN v_id LIKE '%-15' THEN variant_length := 15;
          WHEN v_id LIKE '%-20' THEN variant_length := 20;
          WHEN v_id LIKE '%-25' THEN variant_length := 25;
          WHEN v_id LIKE '%-30' THEN variant_length := 30;
          ELSE variant_length := 5;
        END CASE;
        
        -- Простое умножение на основе соотношения длины
        calculated_price := p_price * (variant_length / base_length);
        calculated_price := round(calculated_price);
        
        -- Обновляем цену для этого варианта
        UPDATE warranty_custom_prices
        SET is_active = false
        WHERE product_id = p_product_id
          AND variant_id = v_id
          AND months = p_months
          AND currency = p_currency
          AND is_active = true;
          
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
          v_id,
          p_months,
          p_currency,
          calculated_price,
          true,
          clock_timestamp()
        );
      END IF;
    END LOOP;
  ELSE
    -- Обновляем только этот конкретный вариант
    UPDATE warranty_custom_prices
    SET is_active = false
    WHERE product_id = p_product_id
      AND variant_id = p_variant_id
      AND months = p_months
      AND currency = p_currency
      AND is_active = true;
      
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
    )
    RETURNING custom_price INTO new_price;
  END IF;

  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения цены продукта с правильным запасным вариантом
CREATE OR REPLACE FUNCTION get_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  base_price numeric;
BEGIN
  -- Сначала пробуем получить пользовательскую цену из таблицы product_prices
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
  
  -- Если не найдено, пробуем получить из таблицы products
  SELECT (value->>'price')::numeric INTO base_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  -- Возвращаем базовую цену или 0, если не найдено
  RETURN COALESCE(base_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для обновления цены продукта с правильной синхронизацией
CREATE OR REPLACE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_index integer;
  variant_length integer;
  stock_status text;
BEGIN
  -- Сначала деактивируем существующие цены
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true;
    
  -- Вставляем новую запись цены
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
    -- Находим индекс варианта, длину и статус наличия
    SELECT 
      (ordinality - 1)::integer,
      (value->>'length')::integer,
      COALESCE(value->>'stockStatus', 'in_stock')
    INTO 
      variant_index,
      variant_length,
      stock_status
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = p_product_id AND
      value->>'id' = p_variant_id;
    
    -- Обновляем таблицу products, если вариант найден
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
            'stockStatus', stock_status
          )
        ),
        updated_at = now()
      WHERE id = p_product_id;
    END IF;
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения цен гарантий с поддержкой вариантов
CREATE OR REPLACE FUNCTION get_warranty_prices_with_variant(
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
  
  -- Если нет результатов, пробуем синхронизировать из warranty_policies
  IF NOT FOUND THEN
    -- Определяем префикс варианта (rgb или cct)
    DECLARE
      variant_prefix text := CASE 
        WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
        WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
        ELSE 'rgb'
      END;
      
      variant_length integer := CASE 
        WHEN p_variant_id LIKE '%-5' THEN 5
        WHEN p_variant_id LIKE '%-10' THEN 10
        WHEN p_variant_id LIKE '%-15' THEN 15
        WHEN p_variant_id LIKE '%-20' THEN 20
        WHEN p_variant_id LIKE '%-25' THEN 25
        WHEN p_variant_id LIKE '%-30' THEN 30
        ELSE 5
      END;
      
      base_length integer := 5;
    BEGIN
      -- Вставляем цены гарантий из политик
      INSERT INTO warranty_custom_prices (
        product_id,
        variant_id,
        months,
        currency,
        custom_price,
        is_active
      )
      SELECT 
        wp.product_id,
        p_variant_id,
        wp.months,
        p_currency,
        CASE 
          WHEN variant_length = 5 THEN COALESCE(wp.fixed_price, 0)
          ELSE round(COALESCE(wp.fixed_price, 0) * (variant_length / base_length))
        END,
        true
      FROM 
        warranty_policies wp
      WHERE 
        wp.fixed_price IS NOT NULL
      ON CONFLICT DO NOTHING;
      
      -- Возвращаем вновь вставленные цены
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
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для отладки цены гарантии
CREATE OR REPLACE FUNCTION debug_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS TABLE (
  source text,
  price numeric,
  details jsonb
) AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
  fixed_price numeric;
  policy_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  variant_prefix text;
BEGIN
  -- Определяем префикс варианта (rgb или cct)
  variant_prefix := CASE 
    WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
    WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
    ELSE 'rgb'
  END;
  
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

  -- Проверяем таблицу warranty_custom_prices
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = p_variant_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  IF custom_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'warranty_custom_prices'::text, 
      custom_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id,
        'months', p_months,
        'currency', p_currency
      );
    RETURN;
  END IF;
  
  -- Проверяем вариант по умолчанию в warranty_custom_prices
  SELECT wcp.custom_price INTO default_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = variant_prefix || '-5'
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  IF default_price IS NOT NULL THEN
    IF variant_length = 5 THEN
      RETURN QUERY SELECT 
        'warranty_custom_prices (default variant)'::text, 
        default_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'default_variant_id', variant_prefix || '-5',
          'months', p_months,
          'currency', p_currency
        );
    ELSE
      calculated_price := default_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      RETURN QUERY SELECT 
        'warranty_custom_prices (scaled from default)'::text, 
        calculated_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'base_variant_id', variant_prefix || '-5',
          'target_variant_id', p_variant_id,
          'months', p_months,
          'currency', p_currency,
          'base_price', default_price,
          'scale_factor', variant_length / base_length
        );
    END IF;
    RETURN;
  END IF;
  
  -- Проверяем таблицу warranty_fixed_prices
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  IF fixed_price IS NOT NULL THEN
    IF variant_length = 5 THEN
      RETURN QUERY SELECT 
        'warranty_fixed_prices'::text, 
        fixed_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months,
          'currency', p_currency
        );
    ELSE
      calculated_price := fixed_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      RETURN QUERY SELECT 
        'warranty_fixed_prices (scaled)'::text, 
        calculated_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months,
          'currency', p_currency,
          'base_price', fixed_price,
          'scale_factor', variant_length / base_length
        );
    END IF;
    RETURN;
  END IF;
  
  -- Проверяем таблицу warranty_policies
  SELECT wp.fixed_price INTO policy_price
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  IF policy_price IS NOT NULL THEN
    IF variant_length = 5 THEN
      RETURN QUERY SELECT 
        'warranty_policies (fixed_price)'::text, 
        policy_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months
        );
    ELSE
      calculated_price := policy_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      RETURN QUERY SELECT 
        'warranty_policies (fixed_price, scaled)'::text, 
        calculated_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months,
          'base_price', policy_price,
          'scale_factor', variant_length / base_length
        );
    END IF;
    RETURN;
  END IF;
  
  -- Если ничего не найдено, возвращаем 0
  RETURN QUERY SELECT 
    'no price found'::text, 
    0::numeric,
    jsonb_build_object(
      'product_id', p_product_id,
      'variant_id', p_variant_id,
      'months', p_months,
      'currency', p_currency
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для отладки цены продукта
CREATE OR REPLACE FUNCTION debug_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  source text,
  price numeric,
  details jsonb
) AS $$
DECLARE
  custom_price numeric;
  product_price numeric;
BEGIN
  -- Проверяем таблицу product_prices
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  IF custom_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'product_prices'::text, 
      custom_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id,
        'currency', p_currency
      );
    RETURN;
  END IF;
  
  -- Проверяем таблицу products
  SELECT (value->>'price')::numeric INTO product_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  IF product_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'products table'::text, 
      product_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id
      );
    RETURN;
  END IF;
  
  -- Если ничего не найдено, возвращаем 0
  RETURN QUERY SELECT 
    'no price found'::text, 
    0::numeric,
    jsonb_build_object(
      'product_id', p_product_id,
      'variant_id', p_variant_id,
      'currency', p_currency
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для исправления всех цен гарантий
CREATE OR REPLACE FUNCTION fix_all_warranty_prices() RETURNS void AS $$
DECLARE
  policy RECORD;
  product RECORD;
  variant RECORD;
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5;
  temp_prices RECORD;
BEGIN
  -- Сначала деактивируем все существующие цены гарантий
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
        
        -- Вставляем запись цены
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
  
  -- Обновляем warranty_fixed_prices из warranty_custom_prices
  -- Сначала собираем все уникальные записи во временную таблицу
  CREATE TEMP TABLE temp_fixed_prices AS
  SELECT DISTINCT ON (product_id, months, currency)
    product_id,
    months,
    currency,
    custom_price
  FROM warranty_custom_prices
  WHERE is_active = true
    AND (variant_id LIKE '%-5')
  ORDER BY product_id, months, currency, updated_at DESC;
  
  -- Затем обновляем warranty_fixed_prices
  FOR temp_prices IN SELECT * FROM temp_fixed_prices
  LOOP
    UPDATE warranty_fixed_prices
    SET price = temp_prices.custom_price
    WHERE product_id = temp_prices.product_id
      AND months = temp_prices.months
      AND currency = temp_prices.currency;
    
    -- Если записи нет, вставляем новую
    IF NOT FOUND THEN
      INSERT INTO warranty_fixed_prices (
        product_id,
        months,
        currency,
        price
      ) VALUES (
        temp_prices.product_id,
        temp_prices.months,
        temp_prices.currency,
        temp_prices.custom_price
      );
    END IF;
  END LOOP;
  
  -- Удаляем временную таблицу
  DROP TABLE temp_fixed_prices;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для исправления всех цен продуктов
CREATE OR REPLACE FUNCTION fix_all_product_prices() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- Сначала деактивируем все существующие цены продуктов
  UPDATE product_prices SET is_active = false;
  
  -- Для каждого продукта
  FOR product IN SELECT * FROM products
  LOOP
    -- Для каждого варианта
    FOR variant IN SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric, stockStatus text)
    LOOP
      -- Вставляем запись цены
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
  
  -- Обновляем таблицу products из product_prices
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
  )
  WHERE EXISTS (
    SELECT 1 
    FROM product_prices pp 
    WHERE pp.product_id = p.id AND pp.currency = 'CZK' AND pp.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Запускаем функции исправления для обеспечения правильной синхронизации всех цен
SELECT fix_all_product_prices();
SELECT fix_all_warranty_prices();