import { LazyLoadImage } from "react-lazy-load-image-component";
import placeholder from "@/components/img/30690.png";

const resolveImageUrl = (src: string): string => {
  if (!src) return placeholder.src;

  // Keep absolute and data URLs as-is
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:")
  ) {
    return src;
  }

  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseApi) return src;

  // Remove trailing `/api` to get the backend host
  const baseHost = baseApi.replace(/\/api\/?$/, "");

  const normalizedPath = src.startsWith("/") ? src : `/${src}`;
  return `${baseHost}${normalizedPath}`;
};

function LoadImage({
  src,
  alt,
  className,
  width,
  height,
  fill = false,
  disableLazy = false,
  ...props
}: {
  src: string;
  alt: string;
  className: string;
  width?: number;
  height?: number;
  fill?: boolean;
  disableLazy: boolean;
  [key: string]: unknown;
}): React.ReactNode {
  // function to resize image using canvas and return Blob URL
  const normalizedSrc = resolveImageUrl(src);
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
        placeholderSrc={placeholder.src}
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
