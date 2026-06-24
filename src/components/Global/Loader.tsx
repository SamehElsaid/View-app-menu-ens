import { buildResizeUrl } from "../ImageLoad";

const DEFAULT_PRIMARY = "#605dff";
const DEFAULT_SECONDARY = "#3584fc";

interface LoaderProps {
  logo?: string | null;
  name?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

function Loader({
  logo,
  name,
  primaryColor,
  secondaryColor,
}: LoaderProps = {}) {
  const displayName = name?.trim() ?? "";
  const initial = displayName.charAt(0).toUpperCase();
  const primary = primaryColor?.trim() || DEFAULT_PRIMARY;
  const secondary = secondaryColor?.trim() || DEFAULT_SECONDARY;

  const bgGradient = `linear-gradient(135deg, ${primary}55 0%, #ffffff 50%, ${secondary}33 100%)`;

  return (
    <div
      className="flex flex-col gap-4 w-full h-full items-center justify-center py-12"
      style={{ background: bgGradient }}
    >
      <div className="relative w-24 h-24">
        {/* track ring */}
        <div
          className="absolute inset-0 rounded-full border-4"
          style={{ borderColor: `${primary}22` }}
        />
        {/* outer spinning arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{ borderTopColor: primary }}
        />
        {/* inner counter-spinning arc */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderBottomColor: secondary,
            animationDuration: "0.7s",
            animationDirection: "reverse",
          }}
        />

        {/* avatar inside the rings */}
        <div className="absolute inset-2 rounded-full overflow-hidden shadow-md">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={buildResizeUrl(logo, 200, 200) || ""}
              alt={displayName || "logo"}
              className="w-full h-full object-cover"
            />
          ) : displayName ? (
            <div
              className="flex w-full h-full items-center justify-center text-white text-2xl font-black"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
            >
              {initial}
            </div>
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: `${primary}11` }} />
          )}
        </div>
      </div>

    </div>
  );
}

export default Loader;
