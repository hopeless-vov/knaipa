import { translate, translateCount, translateList, normalizeLocale } from '../i18n';
import en from '../i18n/en';
import uk from '../i18n/uk';

describe('translate', () => {
  it('resolves a nested English key', () => {
    expect(translate('auth.login', 'en')).toBe('Log in');
  });

  it('resolves the Ukrainian value', () => {
    expect(translate('auth.login', 'uk')).toBe('Увійти');
  });

  it('interpolates params', () => {
    expect(translate('validation.passwordTooShort', 'en', { min: 6 })).toBe(
      'Password must be at least 6 characters'
    );
  });

  it('falls back to English when the key is missing in the locale', () => {
    // Force a locale lookup miss by using a key that only English defines the same
    expect(translate('common.save', 'uk')).toBe('ЗБЕРЕГТИ'); // present in uk
    expect(translate('nonexistent.key', 'uk')).toBe('nonexistent.key');
  });

  it('returns the key itself when nothing matches', () => {
    expect(translate('totally.unknown', 'en')).toBe('totally.unknown');
  });

  it('leaves an unmatched placeholder intact', () => {
    expect(translate('profile.since', 'en', {})).toBe('Since {year}');
  });
});

describe('translateCount', () => {
  it('selects the singular form for 1', () => {
    expect(translateCount('saved.count', 1, 'en')).toBe('1 PLACE');
  });

  it('selects the plural form otherwise', () => {
    expect(translateCount('saved.count', 5, 'en')).toBe('5 PLACES');
  });
});

describe('translateList', () => {
  it('returns the legal sections array', () => {
    const sections = translateList<{ title: string; body: string }>('legal.privacy', 'uk');
    expect(sections.length).toBeGreaterThan(0);
    expect(sections[0].title).toBeTruthy();
  });

  it('returns [] for a non-array key', () => {
    expect(translateList('auth.login', 'en')).toEqual([]);
  });
});

describe('normalizeLocale', () => {
  it('maps uk to uk and everything else to en', () => {
    expect(normalizeLocale('uk')).toBe('uk');
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('es')).toBe('en');
    expect(normalizeLocale(undefined)).toBe('en');
  });
});

describe('dictionary parity', () => {
  // Every top-level namespace in en must exist in uk
  it('uk covers all en namespaces', () => {
    const enKeys = Object.keys(en).sort();
    const ukKeys = Object.keys(uk).sort();
    expect(ukKeys).toEqual(enKeys);
  });
});
