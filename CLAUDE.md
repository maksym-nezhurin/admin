# apps/admin conventions

## Localization (i18n)

This app ships in three languages and must never mix them mid-page.

- **Never hardcode user-facing text** in JSX/TSX. Every string goes through the shared
  `@reelo/i18n` package via the `useTypedTranslation()` hook:
  `import { useTypedTranslation, type TranslationKey } from '../i18n';`
  `const { t, i18n } = useTypedTranslation();`
- **Default language is English (`en`)** — `defaultLanguage` / `fallbackLng` in
  `packages/i18n/src/i18n.ts`. Ukrainian (`uk`) and Polish (`pl`) are opt-in, chosen by the
  user (browser-language-detector, cached in `localStorage`). Don't assume Polish just
  because the product targets `.pl` — that's what caused the language-mixing bug this rule
  exists to prevent (Ukrainian sidebar + hardcoded Polish dashboard copy).
- **Add new keys to all three locale files in the same change**:
  `packages/i18n/locales/{en,uk,pl}/<namespace>.json`. A key missing from one language
  falls back to i18next printing the raw key path as visible text — that's a bug, not a
  graceful degradation.
- **Key format**: `t('<namespace>.<path>.<key>')` — the first dot-segment must be a
  namespace registered in `packages/i18n/src/i18n.ts` (`baseNamespaces`). Admin-panel
  strings live in the `admin` namespace: `admin.dashboard.*` for `pages/Dashboard.tsx`,
  `admin.page.*` for `pages/Admin.tsx`. Add a new namespace (new `<namespace>.json` in all
  three locale dirs + register it in `baseNamespaces`) rather than overloading an existing
  one with unrelated content.
- **Interpolation**: use `{{varName}}` in the JSON value, pass values as the second arg —
  `t('admin.dashboard.stats.usersHint' as TranslationKey, { last7, last30, verified })`.
- **Dates**: use `formatLocalizedDate(value, i18n.language, options?)` from
  `src/utils/timeUtils.ts`. Never call `toLocaleDateString('pl-PL', ...)` or any other
  hardcoded locale directly — it silently ignores the user's selected language.
- **Exception**: raw backend enum/status codes shown as badges (roles like
  `SUPER_ADMIN`, statuses like `PUBLISHED`/`DRAFT`) are left untranslated by existing
  convention throughout this app — they're technical identifiers, not prose.

Before shipping any UI change here, grep the diff for non-ASCII letters
(`ę ą ł ż ź ć ś ń` / Cyrillic) outside of comments — if any show up in JSX text, they
almost certainly should be translation keys instead.
