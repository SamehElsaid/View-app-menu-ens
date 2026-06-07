"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useMenuLogoFallback } from "@/context/menuLogoFallbackContext";
import {
  DEFAULT_MENU_ITEM_IMAGE_SRC,
  resolveMenuItemImageSrc,
} from "@/lib/menuItemImage";

type ImageFallbackStage = "primary" | "logo" | "default";

function buildResizeUrl(src: string, width?: number, height?: number): string {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return src;
  }

  const params = new URLSearchParams({ url: src });

  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));

  return `/api/resize?${params.toString()}`;
}

function LoadImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  disableLazy = false,
  useMenuLogoFallback: useLogoFallback = true,
  onError,
  ...props
}: {
  src: string;
  alt: string;
  className: string;
  width?: number;
  height?: number;
  fill?: boolean;
  disableLazy?: boolean;
  /** When true (default), empty item images use the menu logo from MenuLogoFallbackProvider. */
  useMenuLogoFallback?: boolean;
  onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
  [key: string]: unknown;
}): React.ReactNode {
  const menuLogo = useMenuLogoFallback();
  const [fallbackStage, setFallbackStage] =
    useState<ImageFallbackStage>("primary");

  useEffect(() => {
    setFallbackStage("primary");
  }, [src]);

  const logoSrc = resolveMenuItemImageSrc(
    "",
    useLogoFallback ? menuLogo : undefined,
  );

  const normalizedSrc =
    fallbackStage === "default"
      ? DEFAULT_MENU_ITEM_IMAGE_SRC
      : fallbackStage === "logo"
        ? logoSrc
        : resolveMenuItemImageSrc(src, useLogoFallback ? menuLogo : undefined);

  const resizeUrl = buildResizeUrl(normalizedSrc, width, height);

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackStage === "primary") {
      if (logoSrc && logoSrc !== normalizedSrc) {
        setFallbackStage("logo");
        return;
      }
      setFallbackStage("default");
      return;
    }

    if (fallbackStage === "logo") {
      setFallbackStage("default");
      return;
    }

    onError?.(e);
  };

  return (
    <>
      <LazyLoadImage
        src={resizeUrl}
        alt={alt}
        className={`${fill ? "absolute inset-0 w-full h-full" : ""} ${className}`.trim()}
        placeholderSrc={DEFAULT_MENU_ITEM_IMAGE_SRC}
        effect="blur"
        visibleByDefault={disableLazy}
        width={fill ? "100%" : width}
        height={fill ? "100%" : height}
        onError={handleError}
        {...props}
      />
    </>
  );
}

export default LoadImage;
