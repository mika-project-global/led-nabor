-- Добавляем колонку variant_id в таблицу warranty_custom_prices, если она не существует
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'warranty_custom_prices' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE warranty_custom_prices ADD COLUMN variant_id text DEFAULT 'rgb-5';
  END IF;
END $$;

-- Создаем индекс для быстрого поиска по варианту продукта
CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_variant_months_idx 
ON warranty_custom_prices (product_id, variant_id, months, currency, is_active);

-- Удаляем существующие функции, чтобы избежать конфликтов
DROP FUNCTION IF EXISTS get_warranty_prices(text, text);
DROP FUNCTION IF EXISTS get_warranty_prices(text);
DROP FUNCTION IF EXISTS update_warranty_price_direct(integer, integer, text, numeric, text);
DROP FUNCTION IF EXISTS update_warranty_price_direct(integer, integer, text, numeric);
DROP FUNCTION IF EXISTS get_warranty_price(integer, integer, text, text);
DROP FUNCTION IF EXISTS get_warranty_price(integer, integer, text);

-- Создаем функцию для получения цен гарантий с поддержкой вариантов
CREATE FUNCTION get_warranty_prices(p_currency text)
RETURNS TABLE (
  id uuid,
  product_id integer,
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
    wcp.months,
    wcp.currency,
    wcp.custom_price,
    wcp.is_active,
    wcp.updated_at
  FROM warranty_custom_prices wcp
  WHERE wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.product_id, wcp.months;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения цен гарантий с поддержкой вариантов
CREATE FUNCTION get_warranty_prices_by_variant(p_currency text, p_variant_id text)
RETURNS TABLE (
  id uuid,
  product_id integer,
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
  
  -- Если нет результатов, пробуем с вариантом по умолчанию
  IF NOT FOUND AND p_variant_id != 'rgb-5' THEN
    RETURN QUERY
    SELECT 
      wcp.id,
      wcp.product_id,
      wcp.months,
      wcp.currency,
      wcp.custom_price,
      wcp.is_active,
      wcp.updated_at
    FROM warranty_custom_prices wcp
    WHERE wcp.currency = p_currency
      AND wcp.variant_id = 'rgb-5'
      AND wcp.is_active = true
    ORDER BY wcp.product_id, wcp.months;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для обновления цены гарантии с поддержкой вариантов
CREATE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  warranty_id uuid;
BEGIN
  -- Деактивируем существующие цены
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- Вставляем новую запись цены
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
    'rgb-5',
    p_months,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- Если обновляем цену в CZK, также обновляем таблицу warranty_policies
  IF p_currency = 'CZK' THEN
    -- Находим ID гарантийной политики
    SELECT id INTO warranty_id
    FROM warranty_policies
    WHERE product_id = p_product_id
      AND months = p_months;
      
    -- Обновляем таблицу warranty_policies, если политика найдена
    IF warranty_id IS NOT NULL THEN
      UPDATE warranty_policies
      SET 
        fixed_price = p_price,
        updated_at = now()
      WHERE id = warranty_id;
    END IF;
  END IF;
  
  -- Также обновляем таблицу warranty_fixed_prices
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
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для обновления цены гарантии с поддержкой вариантов
CREATE FUNCTION update_warranty_price_by_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  warranty_id uuid;
BEGIN
  -- Деактивируем существующие цены
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- Вставляем новую запись цены
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
  
  -- Если обновляем цену в CZK для варианта по умолчанию, также обновляем таблицу warranty_policies
  IF p_currency = 'CZK' AND p_variant_id = 'rgb-5' THEN
    -- Находим ID гарантийной политики
    SELECT id INTO warranty_id
    FROM warranty_policies
    WHERE product_id = p_product_id
      AND months = p_months;
      
    -- Обновляем таблицу warranty_policies, если политика найдена
    IF warranty_id IS NOT NULL THEN
      UPDATE warranty_policies
      SET 
        fixed_price = p_price,
        updated_at = now()
      WHERE id = warranty_id;
    END IF;
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения цены гарантии
CREATE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_price numeric;
  policy_multiplier numeric;
  base_product_price numeric;
BEGIN
  -- Сначала пробуем получить цену из таблицы warranty_custom_prices
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- Если найдено, возвращаем
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- Затем пробуем получить фиксированную цену из таблицы warranty_fixed_prices
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- Если найдено, возвращаем
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Затем пробуем получить фиксированную цену из таблицы warranty_policies
  SELECT wp.fixed_price, wp.price_multiplier INTO policy_price, policy_multiplier
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- Если найдено с fixed_price, возвращаем
  IF policy_price IS NOT NULL THEN
    RETURN policy_price;
  END IF;
  
  -- Если ничего не найдено, возвращаем 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для получения цены гарантии с поддержкой вариантов
CREATE FUNCTION get_warranty_price_by_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_price numeric;
  policy_multiplier numeric;
  base_product_price numeric;
BEGIN
  -- Сначала пробуем получить цену из таблицы warranty_custom_prices с точным совпадением варианта
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
  
  -- Пробуем получить цену из таблицы warranty_custom_prices с вариантом по умолчанию
  IF p_variant_id != 'rgb-5' THEN
    SELECT wcp.custom_price INTO custom_price
    FROM warranty_custom_prices wcp
    WHERE wcp.product_id = p_product_id
      AND wcp.variant_id = 'rgb-5'
      AND wcp.months = p_months
      AND wcp.currency = p_currency
      AND wcp.is_active = true
    ORDER BY wcp.updated_at DESC
    LIMIT 1;
    
    -- Если найдено, возвращаем
    IF custom_price IS NOT NULL THEN
      RETURN custom_price;
    END IF;
  END IF;
  
  -- Затем пробуем получить фиксированную цену из таблицы warranty_fixed_prices
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- Если найдено, возвращаем
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Затем пробуем получить фиксированную цену из таблицы warranty_policies
  SELECT wp.fixed_price, wp.price_multiplier INTO policy_price, policy_multiplier
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- Если найдено с fixed_price, возвращаем
  IF policy_price IS NOT NULL THEN
    RETURN policy_price;
  END IF;
  
  -- Если ничего не найдено, возвращаем 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем функцию для синхронизации цен гарантий между таблицами
CREATE OR REPLACE FUNCTION sync_warranty_prices() RETURNS void AS $$
BEGIN
  -- Синхронизация из warranty_policies в warranty_custom_prices
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
    'rgb-5',
    wp.months,
    'CZK',
    COALESCE(wp.fixed_price, 0),
    true
  FROM 
    warranty_policies wp
  WHERE 
    wp.fixed_price IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 
      FROM warranty_custom_prices wcp 
      WHERE 
        wcp.product_id = wp.product_id AND 
        wcp.variant_id = 'rgb-5' AND
        wcp.months = wp.months AND 
        wcp.currency = 'CZK' AND
        wcp.is_active = true
    )
  ON CONFLICT DO NOTHING;
  
  -- Синхронизация из warranty_custom_prices в warranty_fixed_prices
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  )
  SELECT 
    wcp.product_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price
  FROM 
    warranty_custom_prices wcp
  WHERE 
    wcp.is_active = true AND
    wcp.variant_id = 'rgb-5' AND
    NOT EXISTS (
      SELECT 1 
      FROM warranty_fixed_prices wfp 
      WHERE 
        wfp.product_id = wcp.product_id AND 
        wfp.months = wcp.months AND 
        wfp.currency = wcp.currency
    )
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
  
  -- Синхронизация из warranty_custom_prices в warranty_policies
  UPDATE warranty_policies wp
  SET 
    fixed_price = wcp.custom_price,
    updated_at = now()
  FROM warranty_custom_prices wcp
  WHERE 
    wp.product_id = wcp.product_id AND
    wp.months = wcp.months AND
    wcp.currency = 'CZK' AND
    wcp.variant_id = 'rgb-5' AND
    wcp.is_active = true AND
    (wp.fixed_price IS NULL OR wp.fixed_price != wcp.custom_price);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Запускаем функцию синхронизации для обеспечения правильной синхронизации всех цен
SELECT sync_warranty_prices();

-- Обновляем существующие цены гарантий, чтобы включить variant_id
UPDATE warranty_custom_prices
SET variant_id = 'rgb-5'
WHERE variant_id IS NULL OR variant_id = '';

-- Обеспечиваем, чтобы все гарантийные политики имели записи в warranty_custom_prices для каждого варианта
DO $$
DECLARE
  policy RECORD;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  FOR policy IN 
    SELECT * FROM warranty_policies
  LOOP
    FOREACH v_id IN ARRAY variants
    LOOP
      -- Вставляем только если нет активной цены
      IF NOT EXISTS (
        SELECT 1 
        FROM warranty_custom_prices 
        WHERE product_id = policy.product_id 
          AND variant_id = v_id
          AND months = policy.months 
          AND currency = 'CZK'
          AND is_active = true
      ) THEN
        -- Вставляем запись цены
        INSERT INTO warranty_custom_prices (
          product_id,
          variant_id,
          months,
          currency,
          custom_price,
          is_active
        ) VALUES (
          policy.product_id,
          v_id,
          policy.months,
          'CZK',
          COALESCE(policy.fixed_price, 0),
          true
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;