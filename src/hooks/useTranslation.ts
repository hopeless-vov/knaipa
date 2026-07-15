import { useAppStore } from '../store/useAppStore';
import { translate, translateCount, translateList, normalizeLocale, Locale } from '../i18n';

type Params = Record<string, string | number>;

/**
 * Reactive translation hook. Re-renders when the user changes language in
 * Settings (subscribes to preferences.language).
 */
export function useTranslation() {
  const locale: Locale = normalizeLocale(useAppStore((s) => s.preferences.language));
  return {
    locale,
    t: (key: string, params?: Params) => translate(key, locale, params),
    tCount: (baseKey: string, count: number, params?: Params) =>
      translateCount(baseKey, count, locale, params),
    tList: <T = unknown>(key: string) => translateList<T>(key, locale),
  };
}
