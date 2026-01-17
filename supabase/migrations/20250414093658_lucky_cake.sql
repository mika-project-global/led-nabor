/*
  # Добавление поддержки индивидуальных цен гарантии для разных метражей
  
  1. Изменения
    - Удаление существующих функций, которые вызывают конфликт
    - Создание новых функций для работы с вариант-специфичными ценами гарантии
    - Обеспечение правильного масштабирования цен в зависимости от метража
    
  2. Безопасность
    - Сохранение существующих политик RLS
*/

-- Сначала удаляем существующие функции, чтобы избежать конфликта
DROP FUNCTION IF EXISTS get_warranty_prices_by_variant(text, text);
DROP FUNCTION IF EXISTS update_warranty_price_for_variant(integer, integer, text, numeric, text);

-- Создаем новую функцию для получения цен гарантии для конкретного варианта
CREATE FUNCTION get_warranty_prices_by_variant(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем новую функцию для обновления цены гарантии для конкретного варианта
CREATE FUNCTION update_warranty_price_for_variant(
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
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  -- Если обновляем базовый вариант, обновляем все варианты
  IF p_variant_id = 'rgb-5' THEN
    -- Сначала обновляем базовую цену для rgb-5
    UPDATE warranty_custom_prices
    SET is_active = false
    WHERE product_id = p_product_id
      AND variant_id = 'rgb-5'
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
      'rgb-5',
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
    
    -- Теперь обновляем все остальные варианты
    FOREACH v_id IN ARRAY variants
    LOOP
      -- Пропускаем rgb-5, так как мы уже обновили его
      IF v_id != 'rgb-5' THEN
        -- Извлекаем длину из ID варианта
        CASE 
          WHEN v_id = 'rgb-10' THEN variant_length := 10;
          WHEN v_id = 'rgb-15' THEN variant_length := 15;
          WHEN v_id = 'rgb-20' THEN variant_length := 20;
          WHEN v_id = 'rgb-25' THEN variant_length := 25;
          WHEN v_id = 'rgb-30' THEN variant_length := 30;
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

-- Создаем индекс для более быстрого поиска цен гарантии по варианту
CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_variant_months_currency_idx 
ON warranty_custom_prices (product_id, variant_id, months, currency, is_active);

-- Обеспечиваем, чтобы все политики гарантии имели записи в warranty_custom_prices для каждого варианта
DO $$
DECLARE
  policy RECORD;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5; -- Длина по умолчанию для rgb-5
BEGIN
  FOR policy IN 
    SELECT * FROM warranty_policies
  LOOP
    -- Получаем базовую цену для варианта rgb-5
    SELECT COALESCE(policy.fixed_price, 0) INTO base_price;
    
    -- Продолжаем только если у нас есть базовая цена
    IF base_price > 0 THEN
      FOREACH v_id IN ARRAY variants
      LOOP
        -- Извлекаем длину из ID варианта (например, 'rgb-10' -> 10)
        CASE 
          WHEN v_id = 'rgb-5' THEN variant_length := 5;
          WHEN v_id = 'rgb-10' THEN variant_length := 10;
          WHEN v_id = 'rgb-15' THEN variant_length := 15;
          WHEN v_id = 'rgb-20' THEN variant_length := 20;
          WHEN v_id = 'rgb-25' THEN variant_length := 25;
          WHEN v_id = 'rgb-30' THEN variant_length := 30;
          ELSE variant_length := 5;
        END CASE;
        
        -- Рассчитываем цену на основе соотношения длины - простое умножение
        IF v_id = 'rgb-5' THEN
          variant_price := base_price;
        ELSE
          variant_price := base_price * (variant_length / base_length);
          variant_price := round(variant_price);
        END IF;
        
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
            variant_price,
            true
          );
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;