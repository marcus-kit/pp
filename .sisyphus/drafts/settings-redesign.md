# Draft: Редизайн страницы настроек PP Invoicing

## Контекст пользовательского запроса

Пользователь хочет редизайн страницы `/settings` с исправлением 5 ключевых проблем:
1. Poor validation UX - "Invalid input" без объяснения
2. Asymmetric layout - ОГРН и Корр. счет занимают 1 колонку, создавая пробелы
3. Save button not visible - кнопка внизу, требует скролл
4. Generic boring design - выглядит как обычная форма
5. No contextual help - нет подсказок для ИНН, КПП, ОГРН, БИК и т.д.

## Технический стек
- Nuxt 4 + Vue 3
- Nuxt UI 4.4 (UCard, UForm, UFormField, UInput, USelect, UTextarea, UButton, UIcon, UTooltip)
- Tailwind CSS
- Zod для валидации

## Текущее состояние

### Файл: `app/pages/settings.vue` (268 строк)
- Использует `UFormField` (Nuxt UI 4.4 API)
- Grid layout 2 колонки на desktop
- 3 карточки: Основная информация, Банковские реквизиты, Логотип
- Кнопка сохранения в конце формы
- Загрузка логотипа через Supabase Storage

### Файл: `app/shared/schemas/merchant.ts` (39 строк)
- `updateMerchantSchema` используется для валидации
- ПРОБЛЕМА: Отсутствуют русские сообщения об ошибках для:
  - `full_name: z.string().min(1)` - нет сообщения
  - `email: z.string().email()` - нет сообщения
  - Поля ИНН, КПП, ОГРН не имеют regex-валидации длины

### Nuxt UI 4.4 FormField возможности
- `label` - метка
- `description` - описание под меткой (подходит для help text!)
- `hint` - текст справа от метки
- `help` - текст под полем
- `error` - сообщение об ошибке
- `required` - звёздочка
- `size` - размер

### UTooltip возможности
- `text` - текст подсказки
- `arrow` - стрелка
- `delay-duration` - задержка

## Требования (подтверждённые)
- [x] Fix validation messages - добавить русские сообщения в updateMerchantSchema
- [x] Fix layout - сетка без пробелов, логичная группировка
- [x] Sticky save button - всегда видна внизу или вверху
- [x] Better visual design - современный SaaS look
- [x] Contextual help - подсказки для полей
- [x] Responsive - работает на мобильных

## Технические решения

### Validation messages
Обновить `updateMerchantSchema`:
```typescript
full_name: z.string().min(1, 'Укажите название организации или ФИО').max(255),
email: z.string().email('Укажите корректный email').optional(),
inn: z.string().regex(/^\d{10,12}$/, 'ИНН должен содержать 10 или 12 цифр').nullable().optional(),
kpp: z.string().regex(/^\d{9}$/, 'КПП должен содержать 9 цифр').nullable().optional(),
ogrn: z.string().regex(/^\d{13,15}$/, 'ОГРН должен содержать 13 или 15 цифр').nullable().optional(),
```

### Contextual help - варианты реализации
1. **description prop** - текст под label (ненавязчиво)
2. **help prop** - текст под полем
3. **hint prop** - текст справа от label
4. **UTooltip + icon** - иконка ? рядом с label, при наведении - подсказка

### Sticky button - варианты
1. **Sticky footer** - `fixed bottom-0` с тенью
2. **Sticky header** - кнопка вверху страницы, рядом с заголовком
3. **Floating action button** - круглая кнопка справа внизу

### Visual design - идеи
- Разделение секций с заголовками и иконками (уже есть)
- Более чёткая визуальная иерархия
- Accent colors для важных полей
- Progress indicator / completion status

## Открытые вопросы
1. [РЕШЕНО] Какой стиль подсказок предпочтительнее?
2. [РЕШЕНО] Sticky footer или sticky header для кнопки?
3. [РЕШЕНО] Нужен ли прогресс заполнения профиля?

## Scope Boundaries
- INCLUDE: settings.vue, merchant.ts schema
- EXCLUDE: другие страницы, API endpoints

## Research Findings

### Codebase patterns:
- `invoices/new.vue` и `customers/new.vue` используют `UFormGroup` (старый API)
- `settings.vue` использует `UFormField` (новый API Nuxt UI 4.4)
- Нужно унифицировать или оставить как есть

### Nuxt UI 4.4:
- FormField имеет `description`, `hint`, `help` props для контекстной помощи
- Tooltip работает через оборачивание элемента
