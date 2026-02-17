import * as yup from "yup";

export interface LoginSchema {
  email: string;
  password: string;
}

export type TranslateFn = (key: string) => string;

export function loginSchema(t: TranslateFn) {
  return yup.object({
    email: yup
      .string()
      .required(t("validation.required") ?? "Required")
      .email(t("validation.invalidEmail") ?? "Invalid email"),
    password: yup
      .string()
      .required(t("validation.required") ?? "Required"),
  });
}
