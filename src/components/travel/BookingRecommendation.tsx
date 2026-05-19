import { useMemo, useState } from 'react';
import { AFFILIATE_PROVIDERS, KNOWN_CITY_COORDS } from '@/constants/travel';
import { TravelPlan } from '@/types/travel';

interface BookingRecommendationProps {
  plan: TravelPlan;
  visibleSections?: Array<'travel' | 'stay'>;
}

export default function BookingRecommendation({
  plan,
  visibleSections = ['travel'],
}: BookingRecommendationProps) {
  const [activeMode, setActiveMode] = useState<'all' | 'share_car' | 'bus' | 'train' | 'flight'>('all');
  const showTravel = visibleSections.includes('travel');
  const showStay = visibleSections.includes('stay');

  const modeLabel: Record<string, string> = {
    train: 'Train',
    bus: 'Bus',
    flight: 'Flight',
    share_car: 'Share car',
    stay: 'Stay',
    multi: 'Multi',
  };

  const travelSuggestions = useMemo(
    () => plan.bookingSuggestions.filter((suggestion) => suggestion.mode !== 'stay'),
    [plan.bookingSuggestions]
  );

  // Detect long-distance legs (in km) and auto-suggest flights for long hops
  const hasLongLeg = useMemo(() => {
    try {
      const legs = plan.transport.legs || [];
      const R = 6371; // Earth radius km
      function toRad(deg: number) {
        return (deg * Math.PI) / 180;
      }
      for (const leg of legs) {
        const fromKey = leg.from.toLowerCase();
        const toKey = leg.to.toLowerCase();
        const fromCoord = KNOWN_CITY_COORDS[fromKey];
        const toCoord = KNOWN_CITY_COORDS[toKey];
        if (!fromCoord || !toCoord) continue;
        const dLat = toRad(toCoord.lat - fromCoord.lat);
        const dLon = toRad(toCoord.lon - fromCoord.lon);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(fromCoord.lat)) * Math.cos(toRad(toCoord.lat)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        // Treat anything over 600km as a flight-candidate
        if (d >= 600) return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [plan.transport.legs]);

  const staySuggestions = useMemo(
    () => plan.bookingSuggestions.filter((suggestion) => suggestion.mode === 'stay'),
    [plan.bookingSuggestions]
  );

  const filteredTravelSuggestions = useMemo(() => {
    if (activeMode === 'all') return travelSuggestions;
    const base = travelSuggestions.filter(
      (suggestion) => suggestion.mode === activeMode || suggestion.mode === 'multi'
    );
    // If user selected flight or all and there's a long leg but no flight suggestion, inject Skyscanner
    const isFlightOrAll = (['flight', 'all'] as string[]).includes(activeMode as string);
    if (isFlightOrAll && hasLongLeg) {
      const hasFlight = base.some((s) => s.mode === 'flight');
      if (!hasFlight) {
        const provider = AFFILIATE_PROVIDERS['skyscanner'];
        const synthetic = {
          provider: 'skyscanner' as const,
          mode: 'flight' as const,
          reason: 'Long-distance leg detected — consider flying for faster travel.',
          ctaLabel: provider.ctaLabel,
          redirectUrl: provider.baseUrl,
        } as const;
        return [synthetic, ...base];
      }
    }
    return base;
  }, [activeMode, travelSuggestions, hasLongLeg]);

  return (
    <div className="space-y-3">
      {showTravel && (
      <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
        <h5 className="mb-2 text-sm font-semibold text-white">Travel</h5>

        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'share_car', label: 'Car' },
              { key: 'bus', label: 'Bus' },
              { key: 'train', label: 'Train' },
              { key: 'flight', label: 'Flight' },
            ].map((item) => {
              const isActive = activeMode === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveMode(item.key as 'all' | 'share_car' | 'bus' | 'train' | 'flight')}
                  className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border border-cyan-400 bg-cyan-500/20 text-cyan-100'
                      : 'border border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {filteredTravelSuggestions.map((suggestion) => {
              const provider = AFFILIATE_PROVIDERS[suggestion.provider];
              return (
                <div key={`${plan.id}-${suggestion.provider}-${suggestion.mode}`} className="rounded-lg border border-gray-700 bg-gray-900/80 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">{provider.name}</p>
                    <span className="rounded border border-cyan-500/50 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200">
                      {modeLabel[suggestion.mode] || suggestion.mode}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-300">{suggestion.reason}</p>
                  <a
                    href={suggestion.redirectUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="mt-2 inline-flex cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    {suggestion.ctaLabel}
                  </a>
                </div>
              );
            })}

            {!filteredTravelSuggestions.length && (
              <p className="text-sm text-gray-400">No travel platforms for this mode yet. Try another tab.</p>
            )}
          </div>
        </>
      </div>
      )}

      {showStay && (
      <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-3">
        <h5 className="mb-2 text-sm font-semibold text-white">Stay</h5>
        <div className="space-y-3">
          {staySuggestions.map((suggestion) => {
            const provider = AFFILIATE_PROVIDERS[suggestion.provider];
            return (
              <div key={`${plan.id}-${suggestion.provider}-${suggestion.mode}`} className="rounded-lg border border-gray-700 bg-gray-900/80 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-white">{provider.name}</p>
                  <span className="rounded border border-cyan-500/50 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200">
                    {modeLabel[suggestion.mode] || suggestion.mode}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-300">{suggestion.reason}</p>
                <a
                  href={suggestion.redirectUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="mt-2 inline-flex cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
                >
                  {suggestion.ctaLabel}
                </a>
              </div>
            );
          })}

          {!staySuggestions.length && (
            <p className="text-sm text-gray-400">No stay platforms available.</p>
          )}
        </div>
      </div>
      )}

      <p className="text-xs text-gray-500">External partner links open in a new tab. Affiliate tracking can be enabled later.</p>
    </div>
  );
}
