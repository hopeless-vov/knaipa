import en from './en';
import uk from './uk';

export type Locale = 'en' | 'uk';
export const DEFAULT_LOCALE: Locale = 'en';

const DICTS: Record<Locale, unknown> = { en, uk };

type Params = Record<string, string | number>;

function lookup(dict: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>((acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined), dict);
}

function interpolate(str: string, params?: Params): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

/** Translates a dot-addressed key. Falls back to English, then to the key itself. */
export function translate(key: string, locale: Locale = DEFAULT_LOCALE, params?: Params): string {
  const val = lookup(DICTS[locale], key) ?? lookup(en, key);
  return typeof val === 'string' ? interpolate(val, params) : key;
}

/** Simple one/other plural selection with a {count} param. */
export function translateCount(baseKey: string, count: number, locale: Locale = DEFAULT_LOCALE, params?: Params): string {
  const suffix = count === 1 ? '_one' : '_other';
  return translate(`${baseKey}${suffix}`, locale, { count, ...params });
}

/** Returns a raw array value (e.g. legal sections). */
export function translateList<T = unknown>(key: string, locale: Locale = DEFAULT_LOCALE): T[] {
  const val = lookup(DICTS[locale], key) ?? lookup(en, key);
  return Array.isArray(val) ? (val as T[]) : [];
}

export function normalizeLocale(lang: string | undefined): Locale {
  return lang === 'uk' ? 'uk' : 'en';
}
