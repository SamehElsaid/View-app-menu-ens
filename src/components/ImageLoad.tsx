"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useMenuLogoFallback } from "@/context/menuLogoFallbackContext";
import ImageSkeleton from "@/components/Global/ImageSkeleton";
import { resolveMenuItemImageSrc } from "@/lib/menuItemImage";

type ImageFallbackStage = "primary" | "logo" | "failed";

function buildResizeUrl(src: string, width?: number, height?: number): string {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return src;
  }

  const params = new URLSearchParams({ url: src });

  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));

  return `/api/resize?${params.toString()}`;
}

function LoadImageInner({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  disableLazy = false,
  parentClassName,
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
  const [isLoaded, setIsLoaded] = useState(false);

  const logoSrc = resolveMenuItemImageSrc(
    "",
    useLogoFallback ? menuLogo : undefined,
  );

  const normalizedSrc =
    fallbackStage === "failed"
      ? ""
      : fallbackStage === "logo"
        ? logoSrc
        : resolveMenuItemImageSrc(src, useLogoFallback ? menuLogo : undefined);

  useEffect(() => {
    setFallbackStage("primary");
    setIsLoaded(false);
  }, [src]);

  const handleError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
    if (fallbackStage === "primary") {
      if (logoSrc && logoSrc !== normalizedSrc) {
        setFallbackStage("logo");
        setIsLoaded(false);
        return;
      }
      setFallbackStage("failed");
      return;
    }

    if (fallbackStage === "logo") {
      setFallbackStage("failed");
      return;
    }

    onError?.(e);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const wrapperClassName = [
    fill ? "absolute inset-0 block h-full w-full overflow-hidden" : "relative block leading-none",
    parentClassName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const showSkeleton = !normalizedSrc || !isLoaded;

  if (!normalizedSrc) {
    return (
      <div className={wrapperClassName}>
        <ImageSkeleton fill={fill} className={className} />
      </div>
    );
  }

  const resizeUrl = buildResizeUrl(normalizedSrc, width, height);

  const imageClassName = [
    fill ? "absolute inset-0 h-full w-full" : "block max-w-full",
    className,
    isLoaded ? "opacity-100" : "opacity-0",
    disableLazy ? "transition-opacity duration-300" : "transition-opacity duration-100",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div className={wrapperClassName}>
      {showSkeleton ? (
        <ImageSkeleton fill={fill} className={className} />
      ) : null}
      <LazyLoadImage
        src={resizeUrl}
        alt={alt}
        className={imageClassName}
        wrapperClassName={fill ? "absolute inset-0 block h-full w-full" : "block"}
        visibleByDefault={disableLazy}
        width={fill ? "100%" : width}
        height={fill ? "100%" : height}
        decoding="async"
        {...(!disableLazy ? { loading: "lazy" as const } : {})}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

function LoadImage(
  props: {
    parentClassName?: string;
    src: string;
    alt: string;
    className: string;
    width?: number;
    height?: number;
    fill?: boolean;
    disableLazy?: boolean;
    useMenuLogoFallback?: boolean;
    onError?: (e: SyntheticEvent<HTMLImageElement, Event>) => void;
    [key: string]: unknown;
  },
): React.ReactNode {
  return <LoadImageInner key={props.src} {...props} />;
}

export default LoadImage;
