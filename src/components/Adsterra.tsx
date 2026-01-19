import { useEffect, useRef } from 'react';

interface AdsterraProps {
  // Banner Ad properties
  atOptions?: {
    key: string;
    format?: 'iframe';
    height?: number;
    width?: number;
    params?: Record<string, unknown>;
  };
  style?: React.CSSProperties;
  className?: string;
}

export default function Adsterra({
  atOptions,
  style = {},
  className = '',
}: AdsterraProps) {
  const banner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (banner.current && !banner.current.firstChild) {
      const conf = document.createElement('script');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://pl28514680.effectivegatecpm.com/${atOptions?.key}.js`;
      conf.innerHTML = `atOptions = ${JSON.stringify(atOptions)}`;

      banner.current.append(conf);
      banner.current.append(script);
    }
  }, [atOptions]);

  return (
    <div
      aria-label="Advertisement"
      role="complementary"
      className={className}
      style={style}
      ref={banner}
    >
      <span className="sr-only">Advertisement</span>
    </div>
  );
}

// Native Banner Ad Component
interface AdsterraNativeBannerProps {
  bannerId: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdsterraNativeBanner({
  bannerId,
  className = '',
  style = {},
}: AdsterraNativeBannerProps) {
  const atOptions = {
    key: bannerId,
    format: 'iframe' as const,
    height: 90,
    width: 728,
    params: {},
  };

  return <Adsterra atOptions={atOptions} className={className} style={style} />;
}

// Social Bar Ad Component
interface AdsterraSocialBarProps {
  bannerId: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdsterraSocialBar({
  bannerId,
  className = '',
  style = {},
}: AdsterraSocialBarProps) {
  const atOptions = {
    key: bannerId,
    format: 'iframe' as const,
    height: 50,
    width: 320,
    params: {},
  };

  return <Adsterra atOptions={atOptions} className={className} style={style} />;
}

// Display Banner Ad Component (300x250, 728x90, etc.)
interface AdsterraDisplayBannerProps {
  bannerId: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}

export function AdsterraDisplayBanner({
  bannerId,
  width,
  height,
  className = '',
  style = {},
}: AdsterraDisplayBannerProps) {
  const atOptions = {
    key: bannerId,
    format: 'iframe' as const,
    height,
    width,
    params: {},
  };

  return <Adsterra atOptions={atOptions} className={className} style={style} />;
}
