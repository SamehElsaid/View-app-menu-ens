export const MENU_GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Tajawal:wght@200;300;400;500;700;800;900&display=swap";

export const MENU_FONT_AR = '"Tajawal", sans-serif';
export const MENU_FONT_EN = '"Google Sans", sans-serif';

export function menuTemplateFontFamily(locale: string): string {
  return locale === "ar" ? MENU_FONT_AR : MENU_FONT_EN;
}
