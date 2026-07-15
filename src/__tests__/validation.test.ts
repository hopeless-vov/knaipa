import {
  isValidEmail,
  validateSignIn,
  validateSignUp,
  VALIDATION_MESSAGES,
} from '../utils/validation';

describe('isValidEmail', () => {
  it('accepts a standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts an email with surrounding whitespace', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  it('rejects an email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects an email without domain dot', () => {
    expect(isValidEmail('user@example')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('validateSignIn', () => {
  it('returns null for valid inputs', () => {
    expect(validateSignIn('user@example.com', 'secret')).toBeNull();
  });

  it('requires an email', () => {
    expect(validateSignIn('   ', 'secret')).toBe(VALIDATION_MESSAGES.emailRequired);
  });

  it('rejects a malformed email', () => {
    expect(validateSignIn('nope', 'secret')).toBe(VALIDATION_MESSAGES.emailInvalid);
  });

  it('requires a password', () => {
    expect(validateSignIn('user@example.com', '')).toBe(VALIDATION_MESSAGES.passwordRequired);
  });
});

describe('validateSignUp', () => {
  it('returns null for valid inputs', () => {
    expect(validateSignUp('Vova', 'user@example.com', 'secret1')).toBeNull();
  });

  it('requires a name', () => {
    expect(validateSignUp('  ', 'user@example.com', 'secret1')).toBe(
      VALIDATION_MESSAGES.nameRequired
    );
  });

  it('requires an email', () => {
    expect(validateSignUp('Vova', '', 'secret1')).toBe(VALIDATION_MESSAGES.emailRequired);
  });

  it('rejects a malformed email', () => {
    expect(validateSignUp('Vova', 'broken@', 'secret1')).toBe(VALIDATION_MESSAGES.emailInvalid);
  });

  it('requires a password', () => {
    expect(validateSignUp('Vova', 'user@example.com', '')).toBe(
      VALIDATION_MESSAGES.passwordRequired
    );
  });

  it('rejects a too-short password', () => {
    expect(validateSignUp('Vova', 'user@example.com', '12345')).toBe(
      VALIDATION_MESSAGES.passwordTooShort
    );
  });
});
