import { useEffect } from 'react';

interface GoogleAdsenseProps {
  style?: React.CSSProperties;
  className?: string;
  client?: string;
  slot: string;
  format?: 'auto' | 'fluid';
  responsive?: boolean;
  layoutKey?: string;
}

export default function GoogleAdsense({
  style = {},
  className = '',
  client = 'ca-pub-4624818853225101',
  slot,
  format = 'auto',
  responsive = true,
  layoutKey,
}: GoogleAdsenseProps) {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Error loading Google Adsense:', err);
    }
  }, []);

  return (
    <div aria-label="Advertisement" role="complementary" className={className}>
      <span className="sr-only">Advertisement</span>
      <ins
        className={`adsbygoogle`}
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        {...(layoutKey && { 'data-ad-layout-key': layoutKey })}
      />
    </div>
  );
}
