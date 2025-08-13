/**
 * Validation utility functions
 */

/**
 * Check if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is not empty (after trimming)
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Check if a string meets minimum length requirement
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Check if a string doesn't exceed maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Check if a value is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate form field with multiple rules
 */
export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message: string = '필수 입력 항목입니다.'): ValidationRule => ({
    test: isNotEmpty,
    message,
  }),
  
  email: (message: string = '올바른 이메일 주소를 입력해주세요.'): ValidationRule => ({
    test: isValidEmail,
    message,
  }),
  
  minLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => hasMinLength(value, length),
    message: message || `최소 ${length}자 이상 입력해주세요.`,
  }),
  
  maxLength: (length: number, message?: string): ValidationRule => ({
    test: (value) => hasMaxLength(value, length),
    message: message || `최대 ${length}자까지 입력 가능합니다.`,
  }),
};