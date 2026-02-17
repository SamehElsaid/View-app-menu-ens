import * as yup from "yup";

export interface RegisterSchema {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type TranslateFn = (key: string) => string;

export function registerSchema(t: TranslateFn) {
  return yup.object({
    fullName: yup
      .string()
      .required(t("validation.required") ?? "Required"),
    email: yup
      .string()
      .required(t("validation.required") ?? "Required")
      .email(t("validation.invalidEmail") ?? "Invalid email"),
    phone: yup
      .string()
      .required(t("validation.required") ?? "Required"),
    password: yup
      .string()
      .required(t("validation.required") ?? "Required")
      .min(6, t("validation.minPassword") ?? "Password must be at least 6 characters"),
    confirmPassword: yup
      .string()
      .required(t("validation.required") ?? "Required")
      .oneOf([yup.ref("password")], t("validation.passwordMatch") ?? "Passwords must match"),
  });
}
