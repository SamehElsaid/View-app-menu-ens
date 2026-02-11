import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { FooterProps } from "@/types/menu";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

type NeonFooterProps = FooterProps & {
  primaryColor?: string;
  secondaryColor?: string;
};

export const Footer: React.FC<NeonFooterProps> = ({
  menuName,
  menuLogo,
  primaryColor = "#14b8a6",
  secondaryColor = "#06b6d4",
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
}) => {
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const isArabic = locale === "ar";

  // استخراج بيانات الفوتر
  const footerDescription = isArabic
    ? footerDescriptionAr
    : footerDescriptionEn;
  const address = isArabic ? addressAr : addressEn;
  const displayLogo = footerLogo || menuLogo;

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
      icon: <FaFacebookF className="text-xl" />,
      color: "#1877F2",
    },
    {
      platform: "instagram",
      url: socialInstagram,
      icon: <FaInstagram className="text-xl" />,
      color: "#E4405F",
    },
    {
      platform: "twitter",
      url: socialTwitter,
      icon: <FaXTwitter className="text-xl" />,
      color: "#1DA1F2",
    },
    {
      platform: "whatsapp",
      url: socialWhatsapp
        ? `https://wa.me/${socialWhatsapp.replace(/[^0-9]/g, "")}`
        : null,
      icon: <FaWhatsapp className="text-xl" />,
      color: "#25D366",
    },
  ].filter((link) => link.url);

  return (
    <footer
      id="contact"
      className="relative  bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 overflow-hidden border-t-2 "
      style={{
        borderColor: `${primaryColor}20`,
      }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `${primaryColor}0D`,
          }}
        />
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl"
          style={{
            backgroundColor: `${secondaryColor}0D`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-center md:text-start">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              {displayLogo ? (
                <Image
                  src={displayLogo}
                  alt={menuName}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-xl border border-slate-700"
                  style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {(menuName || "M").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-white text-xl md:text-2xl font-bold">
                  {menuName || (isArabic ? "القائمة" : "Menu")}
                </h3>
                <p className="text-slate-400 text-sm">
                  {isArabic ? "تذوق التميز" : "Taste the excellence"}
                </p>
              </div>
            </div>
            {footerDescription && (
              <p className="text-slate-400 mb-4 leading-relaxed text-base">
                {footerDescription}
              </p>
            )}
            {/* Contact Information */}
            {(address || phone) && (
              <div className="space-y-3">
                {address && (
                  <div className="flex items-start justify-center md:justify-start gap-3">
                    <span className="text-2xl">📍</span>
                    <p
                      className="text-slate-400 text-base"
                      dir={isArabic ? "rtl" : "ltr"}
                    >
                      {address}
                    </p>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="text-2xl">📞</span>
                    <a
                      href={`tel:${phone}`}
                      className="text-slate-400 text-base transition-colors"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "";
                      }}
                      dir="ltr"
                    >
                      {phone}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Working Hours */}
          {displayWorkingHours.length > 0 && (
            <div>
              <h4
                className="text-lg font-bold mb-4"
                style={{ color: primaryColor }}
              >
                {isArabic ? "مواعيد العمل" : "Working Hours"}
              </h4>
              <ul className="space-y-2">
                {displayWorkingHours.map(
                  (item, index) =>
                    item && (
                      <li key={index} className="text-slate-400 text-sm">
                        <span className="font-medium text-slate-300">
                          {item.day}:
                        </span>{" "}
                        <span>{item.hours}</span>
                      </li>
                    ),
                )}
              </ul>
            </div>
          )}

          {/* Social Media */}
          {socialLinks.length > 0 && (
            <div>
              <h4
                className="text-lg font-bold mb-4"
                style={{ color: primaryColor }}
              >
                {isArabic ? "تابعنا" : "Follow Us"}
              </h4>
              <div className="flex justify-center md:justify-start gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: `${link.color}20`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = link.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = `${link.color}20`;
                    }}
                    aria-label={link.platform}
                  >
                    <span style={{ color: link.color }}>{link.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center gap-6">
            <p className="text-slate-500 text-base md:text-lg flex items-center gap-2 font-bold">
              © {currentYear}{" "}
              <a
                href="https://www.facebook.com/ENSEGYPTEG"
                className="transition-colors hover:underline"
                style={{ color: primaryColor }}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                ENS
              </a>
              . {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
