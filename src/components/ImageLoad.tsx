"use client";

import { LazyLoadImage } from "react-lazy-load-image-component";
import { useMenuLogoFallback } from "@/context/menuLogoFallbackContext";
import {
  DEFAULT_MENU_ITEM_IMAGE_SRC,
  resolveMenuItemImageSrc,
} from "@/lib/menuItemImage";

function LoadImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  disableLazy = false,
  useMenuLogoFallback: useLogoFallback = true,
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
  [key: string]: unknown;
}): React.ReactNode {
  const menuLogo = useMenuLogoFallback();
  const normalizedSrc = resolveMenuItemImageSrc(
    src,
    useLogoFallback ? menuLogo : undefined,
  );
  const resizeUrl =
    height && width
      ? `/api/resize?url=${encodeURIComponent(
          normalizedSrc,
        )}&width=${width}&height=${height}`
      : normalizedSrc;

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
        {...props}
      />
    </>
  );
}

export default LoadImage;
