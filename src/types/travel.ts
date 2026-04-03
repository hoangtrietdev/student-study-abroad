export type TravelMode = 'save_money' | 'comfort';
export type TravelStrategy = 'budget-first' | 'balanced' | 'comfort-first';
export type TransportType = 'bus' | 'train' | 'flight' | 'mixed';
export type ProviderKey =
  | 'skyscanner'
  | 'omio'
  | 'booking'
  | 'hostelworld'
  | 'db'
  | 'obb'
  | 'sncf'
  | 'mav'
  | 'flixbus'
  | 'blablacar'
  | 'trainline';

export interface TravelPlannerInput {
  originCity: string;
  destinationCity: string;
  budgetEUR?: number;
  startDate?: string;
  endDate?: string;
  mode: TravelMode;
  travelers?: number;
}

export interface TravelLeg {
  type: TransportType;
  from: string;
  to: string;
  estimatedDurationHours: number;
  estimatedCostEUR: number;
  notes?: string;
}

export interface TravelPlan {
  id: string;
  title: string;
  strategy: TravelStrategy;
  score: number;
  transport: {
    summary: string;
    legs: TravelLeg[];
    totalEstimatedDurationHours: number;
    totalEstimatedCostEUR: number;
  };
  accommodation: {
    type: 'hostel' | 'budget_hotel' | 'mid_hotel' | 'apartment' | 'mixed';
    nightlyRangeEUR: { min: number; max: number };
    estimatedNights: number;
    estimatedTotalEUR: number;
    notes: string;
  };
  itinerary: Array<{
    day: number;
    theme: string;
    highlights: string[];
    estimatedDailySpendEUR: number;
  }>;
  totals: {
    estimatedTotalEUR: number;
    estimatedTripHours: number;
    confidence: 'low' | 'medium' | 'high';
  };
  bookingSuggestions: Array<{
    provider: ProviderKey;
    mode: 'train' | 'bus' | 'flight' | 'share_car' | 'stay' | 'multi';
    reason: string;
    ctaLabel: string;
    redirectUrl: string;
  }>;
  rationale: string;
  tradeoffs: string[];
}

export interface TravelPlanResponse {
  requestId: string;
  currency: 'EUR';
  generatedAt: string;
  assumptions: string[];
  plans: TravelPlan[];
}

export interface TravelRefineRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  plannerInput?: TravelPlannerInput;
  activePlan?: TravelPlan;
  allPlans?: TravelPlan[];
}
