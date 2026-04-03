interface TravelRouteMapProps {
  originCity: string;
  destinationCity: string;
  compact?: boolean;
  minimal?: boolean;
}

function encoded(value: string): string {
  return encodeURIComponent(value.trim());
}

export default function TravelRouteMap({
  originCity,
  destinationCity,
  compact = false,
  minimal = false,
}: TravelRouteMapProps) {
  const from = encoded(originCity);
  const to = encoded(destinationCity);
  const routeQuery = `${originCity} to ${destinationCity}`;

  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(routeQuery)}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}&travelmode=transit`;

  return (
    <section
      className={`rounded-2xl border border-gray-700 bg-gray-800/70 ${
        minimal ? 'h-full p-2' : 'p-4'
      } ${minimal ? 'flex min-h-0 flex-col' : ''}`}
    >
      {!minimal && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-white">Route & location preview</h3>
            <p className="text-sm text-gray-300">
              {originCity} to {destinationCity}
            </p>
          </div>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500"
          >
            Open full route
          </a>
        </div>
      )}

      <div className={`overflow-hidden rounded-xl border border-gray-700 ${minimal ? 'min-h-0 flex-1' : ''}`}>
        <iframe
          title="Travel route map"
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className={`w-full ${
            minimal
              ? 'h-[280px] md:h-full'
              : compact
              ? 'h-[170px] md:h-[200px]'
              : 'h-[280px] md:h-[360px]'
          }`}
        />
      </div>
    </section>
  );
}
