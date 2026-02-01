# Learnings - UI/UX Polish

## Conventions & Patterns

## Design Decisions

## Gotchas & Issues


## Nuxt UI v4 Theme Configuration

### app.config.ts Pattern
- Use `defineAppConfig()` to configure UI colors at runtime
- Colors must exist in Tailwind theme (either default or custom)
- Semantic color aliases: primary, secondary, success, info, warning, error, neutral
- Primary color uses Tailwind color name (e.g., 'blue'), not hex value
- Actual hex values defined in CSS @theme directive or Tailwind config

### Color Mode Integration
- @nuxtjs/color-mode auto-registered by Nuxt UI
- preference: 'system' respects prefers-color-scheme
- fallback: 'light' for browsers without system preference
- classSuffix: '' for standard dark/light class naming
- No manual toggle needed for auto mode

### PayPal Blue Implementation
- Primary: 'blue' (Tailwind default, includes #0070BA in blue-600 range)
- Neutral: 'gray' (standard for text/borders/backgrounds)
- Auto dark mode via system preference

## Layout Updates
- Replaced manual `NuxtLink` navigation with `UNavigationMenu` for cleaner code and better accessibility.
- Implemented `UDrawer` for mobile navigation, triggered by a hamburger button visible only on mobile.
- Centralized navigation items in a `computed` property to ensure consistency between desktop and mobile menus.
- Added `data-testid` attributes to critical UI elements (mobile menu button) to facilitate E2E testing.
