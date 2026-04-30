interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return (
    <span className={`brand-logo ${className}`.trim()} aria-hidden="true">
      <img
        src="/osm-api-light.png"
        alt=""
        className="brand-logo-img brand-logo-light"
        draggable={false}
      />
      <img
        src="/osm-api-dark.png"
        alt=""
        className="brand-logo-img brand-logo-dark"
        draggable={false}
      />
    </span>
  );
}
