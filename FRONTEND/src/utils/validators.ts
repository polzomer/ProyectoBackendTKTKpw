export const passwordMeetsRules = (pwd: string) => {
  const length = pwd.length >= 8;
  const upper = /[A-Z]/.test(pwd);
  const lower = /[a-z]/.test(pwd);
  const number = /[0-9]/.test(pwd);
  return { ok: length && upper && lower && number, length, upper, lower, number };
};

export const usernameAllowed = (u: string) => {
  return /^[a-zA-Z0-9_]{3,20}$/.test(u);
};

export const isNameValid = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]+$/;
  return nameRegex.test(name);
};