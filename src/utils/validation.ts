const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const MIN_PASSWORD_LENGTH = 6;

export const VALIDATION_MESSAGES = {
  emailRequired: 'Please enter your email address',
  emailInvalid: 'Please enter a valid email address',
  passwordRequired: 'Please enter your password',
  passwordTooShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  nameRequired: 'Please enter your name',
} as const;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

/** Returns an error message, or null when sign-in inputs are valid. */
export function validateSignIn(email: string, password: string): string | null {
  if (!email.trim()) return VALIDATION_MESSAGES.emailRequired;
  if (!isValidEmail(email)) return VALIDATION_MESSAGES.emailInvalid;
  if (!password) return VALIDATION_MESSAGES.passwordRequired;
  return null;
}

/** Returns an error message, or null when sign-up inputs are valid. */
export function validateSignUp(name: string, email: string, password: string): string | null {
  if (!name.trim()) return VALIDATION_MESSAGES.nameRequired;
  if (!email.trim()) return VALIDATION_MESSAGES.emailRequired;
  if (!isValidEmail(email)) return VALIDATION_MESSAGES.emailInvalid;
  if (!password) return VALIDATION_MESSAGES.passwordRequired;
  if (password.length < MIN_PASSWORD_LENGTH) return VALIDATION_MESSAGES.passwordTooShort;
  return null;
}
