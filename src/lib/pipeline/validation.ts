export type ValidationResult = {
  valid: boolean;
  error?: string;
};

export const validateSubmission = ({
  code,
  language,
}: {
  code: string;
  language: string;
}): ValidationResult => {

  if (!code || code.trim().length === 0) {
    return { valid: false, error: "Code cannot be empty" };
  }

  if (code.length < 10) {
    return { valid: false, error: "Code too short" };
  }

  if (code.length > 50000) {
    return { valid: false, error: "Code too long (max 50KB)" };
  }

  if (!language) {
    return { valid: false, error: "Language not selected" };
  }

  return { valid: true };
};