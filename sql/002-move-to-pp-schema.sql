-- Миграция: Перенос таблиц PP из public в схему pp
-- Дата: 2026-02-01

-- ============================================
-- 1. Создание схемы pp
-- ============================================

CREATE SCHEMA IF NOT EXISTS pp;

-- ============================================
-- 2. Перенос ENUM типов
-- ============================================

ALTER TYPE merchant_type SET SCHEMA pp;
ALTER TYPE invoice_status SET SCHEMA pp;
ALTER TYPE recurring_interval SET SCHEMA pp;

-- ============================================
-- 3. Перенос таблиц
-- ============================================

ALTER TABLE merchants SET SCHEMA pp;
ALTER TABLE customers SET SCHEMA pp;
ALTER TABLE invoices SET SCHEMA pp;
ALTER TABLE recurring_invoices SET SCHEMA pp;

-- ============================================
-- 4. Перенос функций
-- ============================================

ALTER FUNCTION generate_invoice_number(uuid) SET SCHEMA pp;

-- ============================================
-- 5. Настройка search_path для удобства
-- ============================================

-- Для service_role (API запросы)
ALTER ROLE service_role SET search_path TO pp, public, extensions;

-- Для authenticated users
ALTER ROLE authenticated SET search_path TO pp, public, extensions;

-- Для anon (публичные запросы)
ALTER ROLE anon SET search_path TO pp, public, extensions;

-- ============================================
-- 6. Права доступа к схеме
-- ============================================

GRANT USAGE ON SCHEMA pp TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA pp TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pp TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pp TO anon, authenticated, service_role;

-- Для будущих объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA pp GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA pp GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA pp GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
