"use client";

import {
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { FiX } from "react-icons/fi";
import { IoStar, IoStarOutline } from "react-icons/io5";
import { useAppSelector } from "@/store/hooks";
import { axiosPost } from "@/shared/axiosCall";

type RateMenuButtonProps = {
  className?: string;
  buttonClassName?: string;
  iconClassName?: string;
};

type RatePayload = {
  stars: number;
  comment?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
};

type RateApiError = {
  success?: boolean;
  message?: string;
  errorAr?: string;
  errorEn?: string;
};

function RateMenuButtonInner({
  className = "",
  buttonClassName = "",
  iconClassName = "text-lg",
}: RateMenuButtonProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const t = useTranslations("rateMenu");
  const menuInfo = useAppSelector((s) => s.menu.menuInfo);
  const customizations = useAppSelector((s) => s.menu.menuCustomizations);
  const accentColor = customizations?.primaryColor?.trim() || "#7000B5";

  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [sending, setSending] = useState(false);
  const dialogId = useId();
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!menuInfo?.id || !menuInfo.slug || menuInfo.isActive === false) {
    return null;
  }

  const resetForm = () => {
    setStars(0);
    setHoveredStar(0);
    setComment("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
  };

  const closeModal = () => {
    if (sending) return;
    setOpen(false);
  };

  const submitRating = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || stars < 1) return;

    setSending(true);
    try {
      const payload: RatePayload = { stars };
      const trimmedComment = comment.trim();
      const trimmedName = customerName.trim();
      const trimmedPhone = customerPhone.trim();
      const trimmedEmail = customerEmail.trim();

      if (trimmedComment) payload.comment = trimmedComment;
      if (trimmedName) payload.customerName = trimmedName;
      if (trimmedPhone) payload.customerPhone = trimmedPhone;
      if (trimmedEmail) payload.customerEmail = trimmedEmail;

      const response = await axiosPost<RatePayload, RateApiError>(
        `/public/menu/${menuInfo.slug}/rate`,
        locale,
        payload,
        false,
        true,
      );

      if (!response.status) {
        const errBody = response.data;
        const msg = isArabic
          ? (errBody?.errorAr || errBody?.message)
          : (errBody?.errorEn || errBody?.message);
        toast.error(msg || t("error"));
        return;
      }

      setOpen(false);
      resetForm();
      toast.success(t("success"));
    } catch {
      toast.error(t("error"));
    } finally {
      setSending(false);
    }
  };

  const activeStars = hoveredStar || stars;

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={dialogId}
          aria-label={t("button")}
          title={t("button")}
          onClick={() => setOpen(true)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${buttonClassName}`}
        >
          <IoStarOutline className={iconClassName} aria-hidden />
        </button>
      </div>

      {hasMounted && open
        ? createPortal(
            <div
              className="fixed inset-0 z-999999 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
              dir={isArabic ? "rtl" : "ltr"}
              onClick={closeModal}
            >
              <div
                id={dialogId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
                style={{ "--accent": accentColor } as CSSProperties}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ background: accentColor }}
                >
                  <h2 id={titleId} className="text-lg font-bold text-white">
                    {t("title")}
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={sending}
                    className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 disabled:opacity-60"
                    aria-label={t("close")}
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={(event) => void submitRating(event)}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                    <p className="text-center text-sm text-zinc-600">
                      {t("subtitle")}
                    </p>

                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="flex items-center gap-1"
                        role="radiogroup"
                        aria-label={t("starsLabel")}
                        onMouseLeave={() => setHoveredStar(0)}
                      >
                        {[1, 2, 3, 4, 5].map((value) => {
                          const filled = value <= activeStars;
                          return (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={stars === value}
                              aria-label={t("starValue", { count: value })}
                              disabled={sending}
                              onMouseEnter={() => setHoveredStar(value)}
                              onFocus={() => setHoveredStar(value)}
                              onClick={() => setStars(value)}
                              className="rounded-full p-1 transition hover:scale-110 disabled:opacity-60"
                            >
                              {filled ? (
                                <IoStar
                                  className="h-8 w-8 text-amber-400"
                                  aria-hidden
                                />
                              ) : (
                                <IoStarOutline
                                  className="h-8 w-8 text-zinc-300"
                                  aria-hidden
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {stars < 1 ? (
                        <p className="text-xs text-zinc-500">{t("starsHint")}</p>
                      ) : null}
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-zinc-700">
                        {t("comment")}
                      </span>
                      <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        rows={3}
                        maxLength={1000}
                        disabled={sending}
                        placeholder={t("commentPlaceholder")}
                        className="w-full resize-none rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 disabled:opacity-60"
                      />
                    </label>

                    <div className="space-y-3">
                      <p className="text-xs font-medium text-zinc-500">
                        {t("optionalSection")}
                      </p>

                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-zinc-700">
                          {t("name")}
                        </span>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(event) =>
                            setCustomerName(event.target.value)
                          }
                          maxLength={255}
                          disabled={sending}
                          placeholder={t("namePlaceholder")}
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 disabled:opacity-60"
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-zinc-700">
                          {t("phone")}
                        </span>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(event) =>
                            setCustomerPhone(event.target.value)
                          }
                          maxLength={50}
                          disabled={sending}
                          dir="ltr"
                          placeholder={t("phonePlaceholder")}
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 disabled:opacity-60"
                        />
                      </label>

                      <label className="block space-y-1.5">
                        <span className="text-sm font-medium text-zinc-700">
                          {t("email")}
                        </span>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(event) =>
                            setCustomerEmail(event.target.value)
                          }
                          maxLength={255}
                          disabled={sending}
                          dir="ltr"
                          placeholder={t("emailPlaceholder")}
                          className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 disabled:opacity-60"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 px-5 py-4">
                    <button
                      type="submit"
                      disabled={sending || stars < 1}
                      className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ background: accentColor }}
                    >
                      {sending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : null}
                      {sending ? t("submitting") : t("submit")}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

export default function RateMenuButton(props: RateMenuButtonProps) {
  return <RateMenuButtonInner {...props} />;
}
