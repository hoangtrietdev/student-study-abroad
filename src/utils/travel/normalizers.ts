import { TravelPlannerInput } from '@/types/travel';

export function normalizeCity(city: string): string {
  return city.trim().replace(/\s+/g, ' ');
}

export function toCityKey(city: string): string {
  return normalizeCity(city).toLowerCase();
}

export function parseISODate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function estimateTripDays(input: TravelPlannerInput): number {
  const start = parseISODate(input.startDate);
  const end = parseISODate(input.endDate);

  if (!start || !end) return 3;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) return 3;

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.min(Math.max(days, 2), 7);
}

export function clampBudget(inputBudget?: number): number {
  if (typeof inputBudget !== 'number' || !Number.isFinite(inputBudget)) return 300;
  return Math.min(Math.max(inputBudget, 50), 15000);
}

export function validateTravelInput(input: TravelPlannerInput): string[] {
  const errors: string[] = [];

  if (!input.originCity?.trim()) errors.push('Origin city is required.');
  if (!input.destinationCity?.trim()) errors.push('Destination city is required.');
  if (normalizeCity(input.originCity) === normalizeCity(input.destinationCity)) {
    errors.push('Origin and destination must be different.');
  }

  if (input.budgetEUR !== undefined && (!Number.isFinite(input.budgetEUR) || input.budgetEUR <= 0)) {
    errors.push('Budget must be a valid positive number.');
  }

  if (!input.startDate) {
    errors.push('Start date is required.');
  }

  if (input.startDate && !parseISODate(input.startDate)) {
    errors.push('Start date is invalid.');
  }

  if (input.endDate && !parseISODate(input.endDate)) {
    errors.push('End date is invalid.');
  }

  const start = parseISODate(input.startDate);
  const end = parseISODate(input.endDate);
  if (start && end && end.getTime() < start.getTime()) {
    errors.push('End date must be on or after start date.');
  }

  if (input.mode !== 'save_money' && input.mode !== 'comfort') {
    errors.push('Mode must be save_money or comfort.');
  }

  return errors;
}
