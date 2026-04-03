import {
  CITY_TO_COUNTRY,
  DEFAULT_ASSUMPTIONS,
  KNOWN_CITY_COORDS,
  MODE_STRATEGIES,
} from '@/constants/travel';
import {
  ProviderKey,
  TravelMode,
  TravelPlan,
  TravelPlannerInput,
  TravelStrategy,
} from '@/types/travel';
import { clampBudget, estimateTripDays, toCityKey } from '@/utils/travel/normalizers';

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateDistanceKm(origin: string, destination: string): number {
  const o = KNOWN_CITY_COORDS[toCityKey(origin)];
  const d = KNOWN_CITY_COORDS[toCityKey(destination)];

  if (o && d) {
    return haversineKm(o.lat, o.lon, d.lat, d.lon);
  }

  return 900;
}

function rounded(value: number): number {
  return Math.round(value);
}

function getTransportMix(strategy: TravelStrategy, distanceKm: number) {
  if (strategy === 'budget-first') {
    if (distanceKm > 1200) return { type: 'mixed' as const, speedKmh: 180, eurPerKm: 0.08, label: 'Budget flight + local transit' };
    return { type: 'bus' as const, speedKmh: 75, eurPerKm: 0.06, label: 'Coach bus with practical schedules' };
  }

  if (strategy === 'comfort-first') {
    if (distanceKm > 900) return { type: 'flight' as const, speedKmh: 520, eurPerKm: 0.14, label: 'Direct or 1-stop economy flight' };
    return { type: 'train' as const, speedKmh: 120, eurPerKm: 0.11, label: 'Fast intercity train connection' };
  }

  if (distanceKm > 1100) return { type: 'mixed' as const, speedKmh: 230, eurPerKm: 0.1, label: 'Hybrid route: rail + low-cost flight' };
  return { type: 'train' as const, speedKmh: 105, eurPerKm: 0.09, label: 'Train-focused route with flexibility' };
}

function getAccommodation(strategy: TravelStrategy) {
  if (strategy === 'budget-first') {
    return { type: 'hostel' as const, min: 22, max: 45, note: 'Shared room or student-friendly budget stay.' };
  }
  if (strategy === 'comfort-first') {
    return { type: 'mid_hotel' as const, min: 75, max: 135, note: 'Private room with comfort-oriented amenities.' };
  }
  return { type: 'budget_hotel' as const, min: 45, max: 85, note: 'Private budget room with solid location convenience.' };
}

function defaultHighlights(day: number, destination: string): string[] {
  if (day === 1) return ['Arrival and check-in', `Neighborhood walk in ${destination}`, 'Budget-friendly local dinner'];
  if (day === 2) return ['Main city landmarks', 'Museum or cultural visit', 'Evening casual exploration'];
  if (day === 3) return ['Flexible half-day activity', 'Souvenir and grocery stop', 'Prepare for return'];
  return ['Light sightseeing', 'Local cafe break', 'Low-stress evening plan'];
}

function scorePlan(plan: TravelPlan, mode: TravelMode, budget: number): number {
  const costDiff = Math.max(0, plan.totals.estimatedTotalEUR - budget);
  const budgetPenalty = costDiff * 0.35;
  const timeScore = Math.max(0, 100 - plan.totals.estimatedTripHours * 4);
  const costScore = Math.max(0, 100 - plan.totals.estimatedTotalEUR / 6);

  if (mode === 'save_money') {
    return rounded(costScore * 0.65 + timeScore * 0.35 - budgetPenalty);
  }

  return rounded(timeScore * 0.65 + costScore * 0.35 - budgetPenalty * 0.6);
}

export function pickPrimaryProviders(strategy: TravelStrategy): ProviderKey[] {
  if (strategy === 'budget-first') return ['omio', 'hostelworld', 'booking'];
  if (strategy === 'comfort-first') return ['skyscanner', 'booking', 'omio'];
  return ['omio', 'booking', 'skyscanner'];
}

function getRegionalTrainProvider(city: string): ProviderKey {
  const country = CITY_TO_COUNTRY[toCityKey(city)] || 'other';
  if (country === 'de') return 'db';
  if (country === 'at') return 'obb';
  if (country === 'fr') return 'sncf';
  if (country === 'hu') return 'mav';
  return 'trainline';
}

export function pickModeAwareProviders(
  plan: TravelPlan,
  destinationCity: string
): Array<{ provider: ProviderKey; mode: 'train' | 'bus' | 'flight' | 'share_car' | 'stay' | 'multi' }> {
  const hasFlight = plan.transport.legs.some((leg) => leg.type === 'flight');
  const hasBus = plan.transport.legs.some((leg) => leg.type === 'bus');
  const hasTrain = plan.transport.legs.some((leg) => leg.type === 'train');
  const hasMixed = plan.transport.legs.some((leg) => leg.type === 'mixed');

  const picks: Array<{ provider: ProviderKey; mode: 'train' | 'bus' | 'flight' | 'share_car' | 'stay' | 'multi' }> = [];

  // Omio is shown as an all-mode aggregator entry.
  picks.push({ provider: 'omio', mode: 'multi' });

  if (hasTrain || hasMixed) {
    picks.push({ provider: getRegionalTrainProvider(destinationCity), mode: 'train' });
    picks.push({ provider: 'trainline', mode: 'train' });
  }

  if (hasBus || hasMixed) {
    picks.push({ provider: 'flixbus', mode: 'bus' });
    picks.push({ provider: 'blablacar', mode: 'bus' });
  }

  if (hasFlight || hasMixed) {
    picks.push({ provider: 'skyscanner', mode: 'flight' });
  }

  picks.push({ provider: 'blablacar', mode: 'share_car' });
  picks.push({ provider: 'booking', mode: 'stay' });
  picks.push({ provider: 'hostelworld', mode: 'stay' });

  const seen = new Set<string>();
  return picks.filter((item) => {
    const key = `${item.provider}-${item.mode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildDeterministicPlans(input: TravelPlannerInput): {
  plans: TravelPlan[];
  assumptions: string[];
  tripDays: number;
  distanceKm: number;
} {
  const budget = clampBudget(input.budgetEUR);
  const tripDays = estimateTripDays(input);
  const distanceKm = estimateDistanceKm(input.originCity, input.destinationCity);
  const travelers = Math.max(1, Math.min(input.travelers || 1, 6));
  const strategies = MODE_STRATEGIES[input.mode];

  const plans: TravelPlan[] = strategies.map((strategy, index) => {
    const transportProfile = getTransportMix(strategy, distanceKm);
    const accommodationProfile = getAccommodation(strategy);

    const oneWayHours = distanceKm / transportProfile.speedKmh;
    const totalTransportHours = rounded(oneWayHours * 2 + 2.5);
    const transportCost = rounded(distanceKm * transportProfile.eurPerKm * 2 * travelers);

    const nightlyBase = rounded((accommodationProfile.min + accommodationProfile.max) / 2);
    const nights = Math.max(1, tripDays - 1);
    const accommodationTotal = rounded(nightlyBase * nights);

    const dailyFoodAndLocal =
      strategy === 'budget-first' ? 26 : strategy === 'comfort-first' ? 55 : 38;
    const extraDaily = rounded(dailyFoodAndLocal * tripDays * travelers);

    const totalEstimated = transportCost + accommodationTotal + extraDaily;

    const itinerary = Array.from({ length: tripDays }).map((_, dayIndex) => ({
      day: dayIndex + 1,
      theme:
        dayIndex === 0
          ? 'Arrival day'
          : dayIndex === tripDays - 1
          ? 'Return day'
          : strategy === 'comfort-first'
          ? 'Relaxed exploration'
          : 'City highlights',
      highlights: defaultHighlights(dayIndex + 1, input.destinationCity),
      estimatedDailySpendEUR: rounded(extraDaily / tripDays),
    }));

    const plan: TravelPlan = {
      id: `${strategy}-${index + 1}`,
      title:
        strategy === 'budget-first'
          ? 'Lean Budget Route'
          : strategy === 'comfort-first'
          ? 'Comfort-First Route'
          : 'Balanced Explorer Route',
      strategy,
      score: 0,
      transport: {
        summary: transportProfile.label,
        legs: [
          {
            type: transportProfile.type,
            from: input.originCity,
            to: input.destinationCity,
            estimatedDurationHours: rounded(oneWayHours + 1),
            estimatedCostEUR: rounded(transportCost / 2),
          },
          {
            type: transportProfile.type,
            from: input.destinationCity,
            to: input.originCity,
            estimatedDurationHours: rounded(oneWayHours + 1),
            estimatedCostEUR: rounded(transportCost / 2),
          },
        ],
        totalEstimatedDurationHours: totalTransportHours,
        totalEstimatedCostEUR: transportCost,
      },
      accommodation: {
        type: accommodationProfile.type,
        nightlyRangeEUR: {
          min: accommodationProfile.min,
          max: accommodationProfile.max,
        },
        estimatedNights: nights,
        estimatedTotalEUR: accommodationTotal,
        notes: accommodationProfile.note,
      },
      itinerary,
      totals: {
        estimatedTotalEUR: totalEstimated,
        estimatedTripHours: totalTransportHours,
        confidence: 'medium',
      },
      bookingSuggestions: [],
      rationale:
        strategy === 'budget-first'
          ? 'This option minimizes major costs and keeps daily spending predictable.'
          : strategy === 'comfort-first'
          ? 'This option reduces transfer stress and total transit time.'
          : 'This option balances cost and comfort while keeping flexibility.',
      tradeoffs:
        strategy === 'budget-first'
          ? ['Longer travel times', 'Basic accommodation profile']
          : strategy === 'comfort-first'
          ? ['Higher total spend', 'Less flexibility on premium transport windows']
          : ['Moderate spend', 'Mixed transport comfort by leg'],
    };

    plan.score = scorePlan(plan, input.mode, budget);
    return plan;
  });

  return {
    plans,
    assumptions: DEFAULT_ASSUMPTIONS,
    tripDays,
    distanceKm: rounded(distanceKm),
  };
}
