import { formValidationRules } from "./formValidationRules";

export const validateField = (
  fieldName: string,
  value: string,
): string | null => {
  const rule = formValidationRules.find((r) => r.field === fieldName);
  if (!rule) return null;

  if (rule.required && !value) {
    return "To pole jest wymagane";
  }

  if (value) {
    if (value.length > rule.maxLength) {
      return `Maksymalna długość to ${rule.maxLength} znaków`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return "Nieprawidłowy format";
    }
  }

  return null;
};
