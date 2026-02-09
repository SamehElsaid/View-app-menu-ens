import { IoLocationOutline, IoCallOutline } from "react-icons/io5";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FooterProps } from "@/types/menu";

import ImageLoad from "@/components/ImageLoad";

export default function Footer({
  menuName,
  menuLogo,
  footerLogo,
  footerDescriptionEn,
  footerDescriptionAr,
  socialFacebook,
  socialInstagram,
  socialTwitter,
  socialWhatsapp,
  addressEn,
  addressAr,
  phone,
  workingHours,
}: FooterProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("footer");
  const menuT = useTranslations("menu");
  const currentYear = new Date().getFullYear();

  // استخراج بيانات الفوتر
  const displayLogo = footerLogo || menuLogo;
  const footerDescription = isArabic
    ? footerDescriptionAr
    : footerDescriptionEn;
  const address = isArabic ? addressAr : addressEn;

  // تحويل مواعيد العمل إلى تنسيق قابل للعرض
  const formatTime = (time?: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const daysOfWeek = [
    { key: "sunday", label: isArabic ? "الأحد" : "Sunday" },
    { key: "monday", label: isArabic ? "الإثنين" : "Monday" },
    { key: "tuesday", label: isArabic ? "الثلاثاء" : "Tuesday" },
    { key: "wednesday", label: isArabic ? "الأربعاء" : "Wednesday" },
    { key: "thursday", label: isArabic ? "الخميس" : "Thursday" },
    { key: "friday", label: isArabic ? "الجمعة" : "Friday" },
    { key: "saturday", label: isArabic ? "السبت" : "Saturday" },
  ];

  const displayWorkingHours = workingHours
    ? daysOfWeek
        .map((day) => {
          const dayHours = workingHours[day.key as keyof typeof workingHours];
          if (!dayHours || dayHours.closed) {
            return null;
          }
          const openTime = formatTime(dayHours.open);
          const closeTime = formatTime(dayHours.close);
          if (openTime && closeTime) {
            return { day: day.label, hours: `${openTime} - ${closeTime}` };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  // روابط السوشيال ميديا
  const socialLinks = [
    {
      platform: "facebook",
      url: socialFacebook,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      platform: "instagram",
      url: socialInstagram,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      platform: "twitter",
      url: socialTwitter,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
    },
    {
      platform: "whatsapp",
      url: socialWhatsapp
        ? `https://wa.me/${socialWhatsapp.replace(/[^0-9]/g, "")}`
        : null,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
    },
  ].filter((link) => link.url && link.url.trim() !== "");

  return (
    <footer className="py-16 bg-linear-to-b from-(--bg-main)/10 to-white border-t border-(--border-main)/10">
      <div className="container mx-auto px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Description */}
          <div className="md:col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              {displayLogo && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg">
                  <ImageLoad
                    src={displayLogo}
                    alt={menuName || "Logo"}
                    disableLazy={false}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <span className="font-heading text-2xl font-bold text-sky-900 group-hover:text-sky-600 transition-colors">
                {menuName || (locale === "ar" ? "القائمة" : "Menu")}
              </span>
            </Link>
            {footerDescription && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-md">
                {footerDescription}
              </p>
            )}

            {/* Contact Information */}
            {(address || phone) && (
              <div className="space-y-3 mt-4">
                {address && (
                  <div className="flex items-start gap-2">
                    <IoLocationOutline className="text-sky-600 text-[20px]! mt-0.5" />
                    <p
                      className="text-gray-600 text-sm"
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {address}
                    </p>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <IoCallOutline className="text-sky-600 text-[20px]!" />
                    <Link
                      href={`tel:${phone}`}
                      className="text-gray-600 text-sm hover:text-sky-600 transition-colors"
                      dir="ltr"
                    >
                      {phone}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Working Hours */}
          {displayWorkingHours.length > 0 && (
            <div>
              <h4 className="font-heading text-lg font-semibold text-sky-900 mb-4">
                {isArabic ? "مواعيد العمل" : "Working Hours"}
              </h4>
              <div className="space-y-2">
                {displayWorkingHours.map(
                  (item, index) =>
                    item && (
                      <div key={index} className="text-gray-600 text-sm">
                        <span className="font-medium text-sky-900">
                          {item.day}:
                        </span>{" "}
                        <span>{item.hours}</span>
                      </div>
                    ),
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <div>
              <h4 className="font-heading text-lg font-semibold text-sky-900 mb-4">
                {isArabic ? "تابعنا" : "Follow Us"}
              </h4>
              <div className="flex gap-3">
                {socialLinks.map((link) => (
                  <Link
                    key={link.platform}
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all duration-300 text-sky-600 shadow-sm hover:shadow-md hover:scale-110"
                    aria-label={link.platform}
                  >
                    {link.icon}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-sky-100 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-gray-600 text-sm" dir="ltr">
              © {currentYear} {menuT("ourMenu")}. {t("rights")}
            </p>
            <p className="flex items-center justify-center gap-1 text-sm text-gray-600">
              <span>{t("designedBy")}</span>
              <Link
                href="https://www.facebook.com/ENSEGYPTEG"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-600 hover:text-sky-700 hover:underline transition"
              >
                ENS
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
