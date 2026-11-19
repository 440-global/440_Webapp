export type IdentifierType = "email" | "phone";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 0 + [7-9] + [0-1] + 8 digits  -> 11 digits (070x, 080x, 081x, 090x, 091x)
const NG_LOCAL_REGEX = /^0[789][01]\d{8}$/;

// +234 / 234 + [7-9] + [0-1] + 8 digits
const NG_INTL_REGEX = /^\+?234[789][01]\d{8}$/;

// Generic international: + then 8-15 digits, no leading zero
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function getIdentifierType(input: string): IdentifierType | null {
  const value = input.trim();
  if (!value) return null;

  if (EMAIL_REGEX.test(value)) return "email";

  // Strip common separators people type: spaces, dashes, dots, brackets
  const phone = value.replace(/[\s\-().]/g, "");

  if (
    NG_LOCAL_REGEX.test(phone) ||
    NG_INTL_REGEX.test(phone) ||
    E164_REGEX.test(phone)
  ) {
    return "phone";
  }

  return null;
}

export const isValidIdentifier = (input: string) =>
  getIdentifierType(input) !== null;
