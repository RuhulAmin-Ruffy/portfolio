import { mediaUrl } from "@/lib/content";
import type { Placeholder } from "@/lib/types";

/** An uploaded image, or a CSS-only mock when no image has been uploaded yet. */
export default function ProjectVisual({
  imageId,
  placeholder,
  alt,
  className,
  variant = "card",
}: {
  imageId: string | null;
  placeholder: Placeholder;
  alt: string;
  className: string;
  variant?: "card" | "small";
}) {
  const src = mediaUrl(imageId);
  return (
    <div className={`${className} v-${placeholder}`}>
      {src && <img src={src} alt={alt} loading="lazy" />}
      {!src && <PlaceholderShapes kind={placeholder} variant={variant} />}
    </div>
  );
}

function PlaceholderShapes({ kind, variant }: { kind: Placeholder; variant: "card" | "small" }) {
  switch (kind) {
    case "flowly":
      return (
        <div className="phone">
          <div className="bar" style={{ width: "100%" }} />
          <div className="bar" /><div className="bar" /><div className="bar" />
        </div>
      );
    case "bazaarly":
      return <>{Array.from({ length: variant === "small" ? 4 : 8 }, (_, i) => <div key={i} className="cell" />)}</>;
    case "transit":
      return <>{Array.from({ length: variant === "small" ? 3 : 5 }, (_, i) => <div key={i} className="col" />)}</>;
    case "nur":
      return <><div className="blob b1" /><div className="blob b2" /><div className="blob b3" /></>;
    default:
      return null;
  }
}
