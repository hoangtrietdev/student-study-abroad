interface PlanItineraryProps {
  itinerary: Array<{
    day: number;
    theme: string;
    highlights: string[];
    estimatedDailySpendEUR: number;
  }>;
}

export default function PlanItinerary({ itinerary }: PlanItineraryProps) {
  return (
    <div className="space-y-3">
      {itinerary.map((day) => (
        <div key={day.day} className="rounded-lg border border-gray-700 bg-gray-900/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-white">Day {day.day}: {day.theme}</h4>
            <span className="text-xs text-gray-400">~EUR {day.estimatedDailySpendEUR}</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-gray-300">
            {day.highlights.map((highlight, index) => (
              <li key={`${day.day}-${index}`}>• {highlight}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
