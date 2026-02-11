import { LazyLoadImage } from "react-lazy-load-image-component";
import placeholder from "@/components/img/30690.png";

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
  const resizeUrl =
    height && width
      ? `/api/resize?url=${src}&width=${width}&height=${height}`
      : src;

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
