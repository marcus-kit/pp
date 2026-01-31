-- Миграция: Система счетов PP (invoicing)
-- Дата: 2026-01-31
-- Описание: Полная схема БД для системы выставления счетов с RLS политиками

-- ============================================
-- 1. ENUMS (Перечисления)
-- ============================================

-- Тип мерчанта
CREATE TYPE merchant_type AS ENUM (
  'individual',      -- физическое лицо
  'self_employed',   -- самозанятый
  'company'          -- компания
);

-- Статусы счетов
CREATE TYPE invoice_status AS ENUM (
  'draft',           -- черновик
  'sent',            -- отправлен
  'viewed',          -- просмотрен
  'paid',            -- оплачен
  'cancelled',       -- отменён
  'overdue'          -- просрочен
);

-- Интервалы повторения
CREATE TYPE recurring_interval AS ENUM (
  'monthly'          -- ежемесячно
);

-- ============================================
-- 2. ТАБЛИЦА: merchants
-- ============================================

CREATE TABLE merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связь с auth.users
  user_id uuid NOT NULL UNIQUE,
  
  -- Основная информация
  merchant_type merchant_type NOT NULL DEFAULT 'individual',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  
  -- Реквизиты (для счетов)
  inn text,
  kpp text,
  ogrn text,
  legal_address text,
  
  -- Статус
  is_active boolean DEFAULT true,
  
  -- Временные метки
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE merchants IS 'Мерчанты (продавцы) - основные пользователи системы';
COMMENT ON COLUMN merchants.user_id IS 'Связь с auth.users для аутентификации';
COMMENT ON COLUMN merchants.merchant_type IS 'Тип мерчанта для определения реквизитов';

-- Индексы
CREATE INDEX idx_merchants_user_id ON merchants(user_id);
CREATE INDEX idx_merchants_is_active ON merchants(is_active);

-- ============================================
-- 3. ТАБЛИЦА: customers
-- ============================================

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связь с мерчантом (для RLS)
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Основная информация
  full_name text NOT NULL,
  email text,
  phone text,
  
  -- Реквизиты
  inn text,
  kpp text,
  ogrn text,
  legal_address text,
  
  -- Временные метки
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE customers IS 'Клиенты мерчанта (покупатели)';
COMMENT ON COLUMN customers.merchant_id IS 'Мерчант-владелец для RLS изоляции';

-- Индексы
CREATE INDEX idx_customers_merchant_id ON customers(merchant_id);

-- ============================================
-- 4. ТАБЛИЦА: invoices
-- ============================================

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связь с мерчантом (для RLS)
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Связь с клиентом
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  
  -- Нумерация
  invoice_number text NOT NULL,
  CONSTRAINT unique_invoice_number UNIQUE (merchant_id, invoice_number),
  
  -- Публичный токен для доступа без аутентификации
  public_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  
  -- Данные плательщика (снимок)
  payer_name text NOT NULL,
  payer_address text,
  
  -- Суммы (в копейках)
  amount integer NOT NULL,              -- полная сумма
  
  -- Описание
  description text NOT NULL,
  period_start date,
  period_end date,
  
  -- Статус
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Даты
  issued_at timestamptz NOT NULL DEFAULT now(),
  due_date date,
  paid_at timestamptz,
  
  -- Снимок товаров/услуг (JSON)
  items jsonb,
  
  -- Временные метки
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE invoices IS 'Счета на оплату';
COMMENT ON COLUMN invoices.merchant_id IS 'Мерчант-владелец для RLS изоляции';
COMMENT ON COLUMN invoices.invoice_number IS 'Номер счета (уникален в рамках мерчанта)';
COMMENT ON COLUMN invoices.public_token IS 'Токен для публичного доступа к счету';
COMMENT ON COLUMN invoices.amount IS 'Сумма в копейках (10000 = 100.00 RUB)';
COMMENT ON COLUMN invoices.items IS 'Массив товаров/услуг в формате JSONB';

-- Индексы
CREATE INDEX idx_invoices_merchant_id ON invoices(merchant_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issued_at ON invoices(issued_at);
CREATE INDEX idx_invoices_public_token ON invoices(public_token);

-- ============================================
-- 5. ТАБЛИЦА: recurring_invoices
-- ============================================

CREATE TABLE recurring_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Связь с мерчантом (для RLS)
  merchant_id uuid NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Связь с клиентом
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  
  -- Основная информация
  name text NOT NULL,
  description text,
  
  -- Суммы (в копейках)
  amount integer NOT NULL,
  
  -- Интервал повторения
  interval recurring_interval NOT NULL DEFAULT 'monthly',
  
  -- День месяца для выставления (1-28)
  day_of_month integer NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 28),
  
  -- Снимок товаров/услуг (JSON)
  items jsonb,
  
  -- Статус
  is_active boolean DEFAULT true,
  
  -- Даты
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  last_generated_at timestamptz,
  next_generation_at timestamptz,
  
  -- Временные метки
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE recurring_invoices IS 'Шаблоны повторяющихся счетов';
COMMENT ON COLUMN recurring_invoices.merchant_id IS 'Мерчант-владелец для RLS изоляции';
COMMENT ON COLUMN recurring_invoices.amount IS 'Сумма в копейках';
COMMENT ON COLUMN recurring_invoices.day_of_month IS 'День месяца для автоматического выставления (1-28)';
COMMENT ON COLUMN recurring_invoices.items IS 'Шаблон товаров/услуг в формате JSONB';

-- Индексы
CREATE INDEX idx_recurring_invoices_merchant_id ON recurring_invoices(merchant_id);
CREATE INDEX idx_recurring_invoices_customer_id ON recurring_invoices(customer_id);
CREATE INDEX idx_recurring_invoices_is_active ON recurring_invoices(is_active);
CREATE INDEX idx_recurring_invoices_next_generation_at ON recurring_invoices(next_generation_at);

-- ============================================
-- 6. ФУНКЦИИ
-- ============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION update_updated_at IS 'Автоматически обновляет поле updated_at при изменении записи';

-- ============================================
-- 7. ТРИГГЕРЫ
-- ============================================

-- Триггер updated_at для merchants
DROP TRIGGER IF EXISTS trg_merchants_updated_at ON merchants;
CREATE TRIGGER trg_merchants_updated_at
BEFORE UPDATE ON merchants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Триггер updated_at для customers
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
CREATE TRIGGER trg_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Триггер updated_at для invoices
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON invoices;
CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Триггер updated_at для recurring_invoices
DROP TRIGGER IF EXISTS trg_recurring_invoices_updated_at ON recurring_invoices;
CREATE TRIGGER trg_recurring_invoices_updated_at
BEFORE UPDATE ON recurring_invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. RLS (Row Level Security) - Политики доступа
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8.1 MERCHANTS - Политики доступа
-- ============================================

-- Пользователь может видеть только свой профиль мерчанта
CREATE POLICY "Users can view own merchant profile"
ON merchants
FOR SELECT
USING (auth.uid() = user_id);

-- Пользователь может обновлять только свой профиль
CREATE POLICY "Users can update own merchant profile"
ON merchants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role имеет полный доступ
CREATE POLICY "Service role full access on merchants"
ON merchants
FOR ALL
TO service_role
USING (true);

-- ============================================
-- 8.2 CUSTOMERS - Политики доступа
-- ============================================

-- Пользователь может видеть клиентов только своего мерчанта
CREATE POLICY "Users can view own customers"
ON customers
FOR SELECT
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может создавать клиентов для своего мерчанта
CREATE POLICY "Users can create customers for own merchant"
ON customers
FOR INSERT
WITH CHECK (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может обновлять клиентов своего мерчанта
CREATE POLICY "Users can update own customers"
ON customers
FOR UPDATE
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может удалять клиентов своего мерчанта
CREATE POLICY "Users can delete own customers"
ON customers
FOR DELETE
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Service role имеет полный доступ
CREATE POLICY "Service role full access on customers"
ON customers
FOR ALL
TO service_role
USING (true);

-- ============================================
-- 8.3 INVOICES - Политики доступа
-- ============================================

-- Пользователь может видеть счета только своего мерчанта
CREATE POLICY "Users can view own invoices"
ON invoices
FOR SELECT
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может создавать счета для своего мерчанта
CREATE POLICY "Users can create invoices for own merchant"
ON invoices
FOR INSERT
WITH CHECK (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может обновлять счета своего мерчанта
CREATE POLICY "Users can update own invoices"
ON invoices
FOR UPDATE
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может удалять счета своего мерчанта
CREATE POLICY "Users can delete own invoices"
ON invoices
FOR DELETE
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Анонимный пользователь может просматривать счет по public_token
-- УДАЛЕНО: API использует service_role, прямой доступ anon не нужен и опасен
-- CREATE POLICY "Anon can view invoice by public token"
-- ON invoices
-- FOR SELECT
-- TO anon
-- USING (true);

-- Service role имеет полный доступ
CREATE POLICY "Service role full access on invoices"
ON invoices
FOR ALL
TO service_role
USING (true);

-- ============================================
-- 8.4 RECURRING_INVOICES - Политики доступа
-- ============================================

-- Пользователь может видеть повторяющиеся счета только своего мерчанта
CREATE POLICY "Users can view own recurring invoices"
ON recurring_invoices
FOR SELECT
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может создавать повторяющиеся счета для своего мерчанта
CREATE POLICY "Users can create recurring invoices for own merchant"
ON recurring_invoices
FOR INSERT
WITH CHECK (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может обновлять повторяющиеся счета своего мерчанта
CREATE POLICY "Users can update own recurring invoices"
ON recurring_invoices
FOR UPDATE
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Пользователь может удалять повторяющиеся счета своего мерчанта
CREATE POLICY "Users can delete own recurring invoices"
ON recurring_invoices
FOR DELETE
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);

-- Service role имеет полный доступ
CREATE POLICY "Service role full access on recurring invoices"
ON recurring_invoices
FOR ALL
TO service_role
USING (true);

-- ============================================
-- ГОТОВО
-- ============================================
