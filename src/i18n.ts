// Import and re-export from shared i18n package
import i18n from '@reelo/i18n';
export { useTypedTranslation } from '@reelo/i18n';
export type { TranslationKey, TranslationOptions, SupportedLanguage } from '@reelo/i18n';

// Ensure i18n is initialized before export
export default i18n;
