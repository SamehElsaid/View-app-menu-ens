"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { IoCartOutline } from "react-icons/io5";
import { useLocale } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { useAppSelector } from "@/store/hooks";
import { useMusic } from "./MusicContext";
import {
  getProductTheme,
  mapMenuItemsToShowcase,
  type MoodKey,
  type ShowcaseProduct,
} from "./moodEnergy";

const TRANSITION_MS = 500;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type FloatOrb = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  kind: "ring" | "dot";
};

function buildOrbs(count: number): FloatOrb[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 6 + Math.random() * 88,
    y: 8 + Math.random() * 84,
    size: i % 2 === 0 ? 6 + Math.random() * 10 : 28 + Math.random() * 36,
    speed: 0.25 + Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2,
    kind: i % 3 === 0 ? "ring" : "dot",
  }));
}

function useProductTransition(total: number) {
  const [index, setIndex] = useState(0);
  const [contentVisible, setContentVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const goTo = useCallback(
    (next: number) => {
      if (next === index) return;
      clearTimer();
      setContentVisible(false);
      timerRef.current = setTimeout(() => {
        setIndex(next);
        setContentVisible(true);
      }, TRANSITION_MS);
    },
    [index],
  );

  const next = useCallback(
    () => goTo((index + 1) % total),
    [goTo, index, total],
  );
  const prev = useCallback(
    () => goTo((index - 1 + total) % total),
    [goTo, index, total],
  );

  useEffect(() => clearTimer, []);

  return { index, contentVisible, goTo, next, prev };
}

function ShowcaseCarousel({
  products,
  orderLabel,
  featuredLabel,
}: {
  products: ShowcaseProduct[];
  orderLabel: string;
  featuredLabel: string;
}) {
  const { index, contentVisible, goTo, next, prev } = useProductTransition(
    products.length,
  );
  const menuItems = useAppSelector((state) => state.menu.menu) ?? [];
  const {
    setActiveItemForce,
    setActiveCategoryId,
    isTableOrder,
    cart,
    addToCart,
  } = useMusic();
  const [featuredQty, setFeaturedQty] = useState(1);

  const active = products[index];
  const activeMenuItem = menuItems.find((item) => item.id === active?.id);
  const inCartQty = activeMenuItem
    ? (cart[activeMenuItem.id]?.quantity ?? 0)
    : 0;
  const activeMood = active.mood;
  const orbsRef = useRef<FloatOrb[]>(buildOrbs(8));
  const orbElsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef(0);
  const clockRef = useRef(0);
  const locale = useLocale() as "ar" | "en";

  const [bgLayer, setBgLayer] = useState({ current: 0, previous: 0, fade: 1 });
  const prevIndexRef = useRef(index);

  useEffect(() => {
    if (index === prevIndexRef.current) return;
    setBgLayer({ current: index, previous: prevIndexRef.current, fade: 0 });
    prevIndexRef.current = index;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setBgLayer((s) => ({ ...s, fade: 1 })));
    });
    return () => cancelAnimationFrame(id);
  }, [index]);

  const handleOrder = useCallback(() => {
    const product = products[index];
    const menuItem = menuItems.find((item) => item.id === product?.id);
    if (!menuItem) {
      document.getElementById("menu")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    setActiveCategoryId(menuItem.categoryId ?? null);
    setActiveItemForce(menuItem);

    document.getElementById("menu")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [products, index, menuItems, setActiveCategoryId, setActiveItemForce]);

  useEffect(() => {
    const tick = (ts: number) => {
      if (!clockRef.current) clockRef.current = ts;
      const t = (ts - clockRef.current) / 1000;

      orbsRef.current.forEach((orb, i) => {
        const el = orbElsRef.current[i];
        if (!el) return;
        const dx = Math.sin(t * orb.speed + orb.phase) * 6;
        const dy = Math.cos(t * orb.speed * 0.9 + orb.phase) * 8;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const contentMotion = contentVisible
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 translate-y-2 scale-[0.98]";

  const imageMotion = contentVisible
    ? "opacity-100 scale-100"
    : "opacity-0 scale-[0.94]";

  const currentBg = products[bgLayer.current];
  const previousBg = products[bgLayer.previous];
  const prevMood = previousBg.mood;
  const currMood = currentBg.mood;
  const activeTheme = getProductTheme(activeMood);

  return (
    <section
      className="music-showcase-hero music-showcase-card music-showcase-hero--cinematic relative isolate w-full overflow-hidden rounded-[1.25rem] border border-brand-sky/20 bg-brand-honeydew transition-[border-color,box-shadow] duration-500 ease-out sm:rounded-3xl lg:rounded-[1.75rem]"
      data-mood={activeMood}
      style={
        {
          "--showcase-accent": activeTheme.accentColor,
          "--showcase-glow": activeTheme.glowColor,
          "--showcase-tint": activeTheme.backgroundTint,
        } as CSSProperties
      }
      aria-label="Product showcase"
      aria-roledescription="carousel"
    >
      <div
        className={`music-showcase-hero__ambient music-showcase-hero__ambient--${prevMood} pointer-events-none absolute inset-0 transition-opacity duration-550 ease-out`}
        style={{ opacity: 1 - bgLayer.fade }}
        aria-hidden
      />
      <div
        className={`music-showcase-hero__ambient music-showcase-hero__ambient--${currMood} pointer-events-none absolute inset-0 transition-opacity duration-550 ease-out`}
        style={{ opacity: bgLayer.fade }}
        aria-hidden
      />

      <div
        className={`music-showcase-hero__bg music-showcase-hero__bg--${prevMood} pointer-events-none absolute inset-0 transition-opacity duration-550 ease-out`}
        style={{ opacity: 1 - bgLayer.fade }}
        aria-hidden
      />
      <div
        className={`music-showcase-hero__bg music-showcase-hero__bg--${currMood} pointer-events-none absolute inset-0 transition-opacity duration-550 ease-out`}
        style={{ opacity: bgLayer.fade }}
        aria-hidden
      />

      <div
        className="music-showcase-hero__blobs pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <span className="music-showcase-hero__blob music-showcase-hero__blob--a" />
        <span className="music-showcase-hero__blob music-showcase-hero__blob--b" />
        {orbsRef.current.map((orb, i) => (
          <span
            key={orb.id}
            ref={(el) => {
              orbElsRef.current[i] = el;
            }}
            className={`music-showcase-hero__float absolute will-change-transform ${
              orb.kind === "ring"
                ? "border border-brand-sky/25 bg-transparent"
                : "bg-brand-sky/15"
            } rounded-full`}
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.kind === "ring" ? orb.size : orb.size * 0.35,
              height: orb.kind === "ring" ? orb.size : orb.size * 0.35,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 py-9 sm:px-7 sm:py-11 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:px-10 lg:py-14 xl:gap-14 xl:px-12">
        <div className="music-showcase-hero__stage relative order-1 flex items-center justify-center lg:order-2">
          <div className="music-showcase-hero__glow-halo" aria-hidden />

          <div
            className={`music-showcase-hero__disc-wrap relative w-[min(72vw,300px)] transition-[opacity,transform] duration-500 sm:w-[min(68vw,340px)] lg:w-[min(42vw,400px)] ${imageMotion}`}
            style={{ transitionTimingFunction: EASE }}
          >
            <div className="music-showcase-hero__disc-ring" aria-hidden />
            <div className="music-showcase-hero__disc relative aspect-square overflow-hidden rounded-full">
              <LoadImage
                src={active.image ?? ""}
                alt={active.name}
                fill
                className="object-cover"
                disableLazy
              />
              <div
                className="music-showcase-hero__disc-vignette pointer-events-none absolute inset-0"
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div
          className={`music-showcase-hero__content order-2 mt-8 flex flex-col items-center text-center text-brand-tomato transition-[opacity,transform] duration-500 ease-out lg:order-1 lg:mt-0 lg:items-start lg:text-start ${contentMotion}`}
          style={{ transitionTimingFunction: EASE }}
        >
          <p className="music-showcase-hero__tag mb-3 inline-block rounded-full bg-brand-sky/25 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brand-tomato transition-[background-color,color] duration-500 ease-out">
            {featuredLabel}
          </p>

          <h2 className="music-showcase-hero__title mb-3 text-[clamp(1.75rem,6.5vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-brand-tomato transition-colors duration-300">
            {active.name}
          </h2>

          <p className="music-showcase-hero__desc mb-8 max-w-88 text-[clamp(0.875rem,3.2vw,1.0625rem)] leading-[1.65] text-brand-tomato/70 transition-colors duration-300 lg:max-w-md">
            {active.description}
          </p>

          <div className="mb-7 flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous product"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-sky/35 bg-brand-sky/12 text-brand-tomato backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-brand-sky/20 active:scale-95"
            >
              {locale === "ar" ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M7 4L12 9L7 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M11 4L6 9L11 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <div
              className="flex items-center gap-1.5 px-1"
              role="tablist"
              aria-label="Products"
            >
              {products.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={p.name}
                  onClick={() => goTo(i)}
                  className={`music-showcase-hero__dot rounded-full transition-all duration-450 ease-out ${
                    i === index
                      ? "music-showcase-hero__dot--active h-[7px] w-7"
                      : "h-[7px] w-[7px] bg-brand-sky/35"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Next product"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-sky/35 bg-brand-sky/12 text-brand-tomato backdrop-blur-sm transition-all duration-300 ease-out hover:scale-105 hover:bg-brand-sky/20 active:scale-95"
            >
              {locale === "ar" ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M11 4L6 9L11 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M7 4L12 9L7 14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:items-start">
            <button
              type="button"
              onClick={handleOrder}
              className="music-cta inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-tomato px-9 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-brand-honeydew transition-all duration-300 ease-out hover:bg-brand-coral active:duration-200 sm:w-auto"
            >
              {orderLabel}
            </button>

            {isTableOrder && activeMenuItem ? (
              <div className="flex w-full flex-col items-center gap-2 sm:w-auto lg:items-start">
                <div className="flex w-full items-center gap-2.5 sm:w-auto">
                  <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-brand-sky/35 bg-brand-sky/10 p-0.5">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-brand-tomato transition-all duration-200 hover:bg-brand-sky/15 active:scale-90"
                      onClick={() => setFeaturedQty((q) => Math.max(1, q - 1))}
                      aria-label={locale === "ar" ? "تقليل" : "Decrease"}
                    >
                      −
                    </button>
                    <span className="min-w-8 px-1 text-center text-sm font-bold tabular-nums text-brand-tomato">
                      {featuredQty}
                    </span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-base font-bold text-brand-tomato transition-all duration-200 hover:bg-brand-sky/15 active:scale-90"
                      onClick={() => setFeaturedQty((q) => q + 1)}
                      aria-label={locale === "ar" ? "زيادة" : "Increase"}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(activeMenuItem, featuredQty);
                      setFeaturedQty(1);
                    }}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-coral px-6 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-brand-honeydew transition-all duration-300 ease-out hover:bg-brand-tomato active:duration-200 sm:flex-none"
                  >
                    <IoCartOutline className="h-4 w-4 shrink-0" aria-hidden />
                    {locale === "ar" ? "أضف للسلة" : "Add to cart"}
                  </button>
                </div>
                {inCartQty > 0 ? (
                  <p className="text-center text-xs font-medium text-brand-tomato/60 lg:text-start">
                    {locale === "ar"
                      ? `في السلة: ${inCartQty}`
                      : `In cart: ${inCartQty}`}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <p
        className="pointer-events-none absolute bottom-4 end-5 text-[0.6875rem] font-medium tabular-nums text-brand-tomato/50 transition-colors duration-300 lg:bottom-5 lg:end-7"
        aria-live="polite"
      >
        {String(index + 1).padStart(2, "0")} /{" "}
        {String(products.length).padStart(2, "0")}
      </p>
    </section>
  );
}

export default function   Hero() {
  const locale = useLocale() as "ar" | "en";
  const storeMenuItems = useAppSelector((state) => state.menu.menu);

  const products = useMemo(
    () =>
      mapMenuItemsToShowcase(storeMenuItems ?? [], {
        limit: 5,
        locale,
      }),
    [storeMenuItems, locale],
  );

  if (!products.length) return null;

  return (
    <div className="music-showcase-wrap">
      <ShowcaseCarousel
        products={products}
        featuredLabel={locale === "ar" ? "أحدث المنتجات" : "Recently Added"}
        orderLabel={locale === "ar" ? "اطلب الآن" : "Order Now"}
      />
    </div>
  );
}
