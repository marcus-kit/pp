# Architectural Decisions - UI/UX Polish

## Theme & Colors
- Primary: PayPal Blue #0070BA
- Auto dark mode (prefers-color-scheme)

## Navigation
- Desktop: UNavigationMenu (horizontal)
- Mobile: UDrawer (left direction)

## Icons
- Unified on lucide (migrating from heroicons)


## app.config.ts Implementation

### Decision: Use Tailwind 'blue' for PayPal Primary
- Rationale: Tailwind's blue palette includes shades close to PayPal Blue (#0070BA)
- Alternative considered: Custom color definition in CSS @theme
- Chosen: Tailwind default for simplicity and consistency
- Benefit: No additional CSS configuration needed

### Decision: Auto Color Mode (system preference)
- Rationale: Modern UX pattern, respects user OS settings
- Alternative: Manual toggle via ColorModeButton
- Chosen: Auto mode per requirements (no manual toggle)
- Implementation: preference: 'system', fallback: 'light'

### Decision: Neutral = gray
- Rationale: Standard Tailwind color for text, borders, disabled states
- Consistent with Nuxt UI defaults
- Provides good contrast in both light and dark modes
