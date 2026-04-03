import { useEffect, useMemo, useState } from 'react';
import { KNOWN_CITY_COORDS } from '@/constants/travel';
import { TravelPlannerInput } from '@/types/travel';

function formatDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

interface TravelPlannerFormProps {
  onSubmit: (input: TravelPlannerInput) => void;
  loading: boolean;
  initialValue?: Partial<TravelPlannerInput>;
}

export default function TravelPlannerForm({
  onSubmit,
  loading,
  initialValue,
}: TravelPlannerFormProps) {
  const cityOptions = useMemo(
    () => Object.keys(KNOWN_CITY_COORDS).map((city) => city.charAt(0).toUpperCase() + city.slice(1)),
    []
  );

  const [originCity, setOriginCity] = useState(initialValue?.originCity || 'Budapest');
  const [destinationCity, setDestinationCity] = useState(initialValue?.destinationCity || 'Vienna');
  const [budgetEUR, setBudgetEUR] = useState<number | ''>(initialValue?.budgetEUR ?? '');
  const [startDate, setStartDate] = useState(initialValue?.startDate || '');
  const [endDate, setEndDate] = useState(initialValue?.endDate || '');
  const [originQuery, setOriginQuery] = useState(originCity);
  const [destinationQuery, setDestinationQuery] = useState(destinationCity);
  const [originDebounced, setOriginDebounced] = useState(originCity);
  const [destinationDebounced, setDestinationDebounced] = useState(destinationCity);
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);

  const todayDate = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const startMinDate = useMemo(() => formatDateInput(todayDate), [todayDate]);

  const startMaxDate = useMemo(() => {
    const maxDate = new Date(todayDate);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return formatDateInput(maxDate);
  }, [todayDate]);

  const endMinDate = startDate || startMinDate;

  const endMaxDate = useMemo(() => {
    const baseDate = startDate ? new Date(`${startDate}T00:00:00`) : new Date(todayDate);
    const maxDate = new Date(baseDate);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return formatDateInput(maxDate);
  }, [startDate, todayDate]);

  useEffect(() => {
    setOriginCity(initialValue?.originCity || 'Budapest');
    setDestinationCity(initialValue?.destinationCity || 'Vienna');
    setBudgetEUR(initialValue?.budgetEUR ?? '');
    setStartDate(initialValue?.startDate || '');
    setEndDate(initialValue?.endDate || '');
  }, [
    initialValue?.originCity,
    initialValue?.destinationCity,
    initialValue?.budgetEUR,
    initialValue?.startDate,
    initialValue?.endDate,
  ]);

  useEffect(() => {
    setOriginQuery(originCity);
  }, [originCity]);

  useEffect(() => {
    setDestinationQuery(destinationCity);
  }, [destinationCity]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOriginDebounced(originQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [originQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDestinationDebounced(destinationQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [destinationQuery]);

  useEffect(() => {
    if (!endDate) return;
    if (endDate < endMinDate || endDate > endMaxDate) {
      setEndDate('');
    }
  }, [endDate, endMinDate, endMaxDate]);

  const originSuggestions = useMemo(() => {
    const query = originDebounced.trim().toLowerCase();
    if (query.length < 2) return [];

    return cityOptions
      .filter((city) => city.toLowerCase().includes(query) && city.toLowerCase() !== originCity.trim().toLowerCase())
      .slice(0, 6);
  }, [cityOptions, originDebounced, originCity]);

  const destinationSuggestions = useMemo(() => {
    const query = destinationDebounced.trim().toLowerCase();
    if (query.length < 2) return [];

    return cityOptions
      .filter(
        (city) => city.toLowerCase().includes(query) && city.toLowerCase() !== destinationCity.trim().toLowerCase()
      )
      .slice(0, 6);
  }, [cityOptions, destinationDebounced, destinationCity]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      originCity,
      destinationCity,
      budgetEUR: budgetEUR === '' ? undefined : budgetEUR,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      mode: 'save_money',
      travelers: 1,
    });
    setActiveField(null);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-700 bg-gray-800/80 p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.1fr_1.1fr_0.7fr_0.7fr_0.6fr_0.8fr]">
        <div className="relative">
          <input
            value={originCity}
            onChange={(e) => {
              setOriginCity(e.target.value);
              setOriginQuery(e.target.value);
            }}
            onFocus={() => setActiveField('origin')}
            onBlur={() => {
              setTimeout(() => setActiveField((prev) => (prev === 'origin' ? null : prev)), 120);
            }}
            className="h-11 w-full rounded-xl border border-gray-600 bg-gray-900 px-4 text-base font-medium text-white outline-none focus:border-cyan-400"
            placeholder="From city"
            required
          />

          {activeField === 'origin' && originSuggestions.length > 0 && (
            <div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-600 bg-gray-900/95 p-1 shadow-xl backdrop-blur">
              {originSuggestions.map((city) => (
                <button
                  key={`origin-${city}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setOriginCity(city);
                    setOriginQuery(city);
                    setActiveField(null);
                  }}
                  className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-100 transition hover:bg-gray-800"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <input
            value={destinationCity}
            onChange={(e) => {
              setDestinationCity(e.target.value);
              setDestinationQuery(e.target.value);
            }}
            onFocus={() => setActiveField('destination')}
            onBlur={() => {
              setTimeout(() => setActiveField((prev) => (prev === 'destination' ? null : prev)), 120);
            }}
            className="h-11 w-full rounded-xl border border-gray-600 bg-gray-900 px-4 text-base font-medium text-white outline-none focus:border-cyan-400"
            placeholder="To city"
            required
          />

          {activeField === 'destination' && destinationSuggestions.length > 0 && (
            <div className="absolute z-30 mt-2 w-full rounded-xl border border-gray-600 bg-gray-900/95 p-1 shadow-xl backdrop-blur">
              {destinationSuggestions.map((city) => (
                <button
                  key={`destination-${city}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDestinationCity(city);
                    setDestinationQuery(city);
                    setActiveField(null);
                  }}
                  className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-gray-100 transition hover:bg-gray-800"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={startMinDate}
          max={startMaxDate}
          className="h-11 rounded-xl border border-gray-600 bg-gray-900 px-4 text-sm font-medium text-white outline-none focus:border-cyan-400 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:opacity-100"
          required
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={endMinDate}
          max={endMaxDate}
          className="h-11 rounded-xl border border-gray-600 bg-gray-900 px-4 text-sm font-medium text-white outline-none focus:border-cyan-400 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:opacity-100"
        />

        <input
          type="number"
          min={50}
          step={10}
          value={budgetEUR}
          onChange={(e) => {
            const value = e.target.value;
            setBudgetEUR(value === '' ? '' : Number(value));
          }}
          className="h-11 rounded-xl border border-gray-600 bg-gray-900 px-4 text-sm font-medium text-white outline-none focus:border-cyan-400"
          placeholder="Budget (EUR)"
        />

        <button
          type="submit"
          disabled={loading}
          className="h-11 cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}
