import Image from "next/image";

export default function ResponsiveImage({
  src,
  alt,
  priority = false,
  fill = false,
  width,
  height,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
}) {
  // Centralized <Image> configuration to keep images mobile-friendly.
  const common = { alt, placeholder: "blur", blurDataURL: "/images/blur.png", priority };
  if (fill) {
    const ratio = (height || 1) / (width || 1);
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: String(ratio || 1.333) }}>
        <Image src={src} fill sizes={sizes} {...common} />
      </div>
    );
  }
  return <Image src={src} width={width} height={height} sizes={sizes} {...common} />;
}
