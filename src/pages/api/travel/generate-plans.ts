import type { NextApiRequest, NextApiResponse } from 'next';
import { AFFILIATE_PROVIDERS } from '@/constants/travel';
import { buildTravelPlanPrompt } from '@/prompts/travelPlanGenerator';
import { TravelPlan, TravelPlanResponse, TravelPlannerInput } from '@/types/travel';
import {
  buildDeterministicPlans,
  pickModeAwareProviders,
} from '@/utils/travel/estimate';
import { buildInternalRedirectUrl } from '@/utils/travel/affiliateLinks';
import { validateTravelInput } from '@/utils/travel/normalizers';

function cleanAI(content: string): string {
  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, '')
    .trim();
}

function safeRound(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
}

function clampPlan(candidate: TravelPlan, fallback: TravelPlan): TravelPlan {
  return {
    ...candidate,
    id: fallback.id,
    strategy: fallback.strategy,
    score: fallback.score,
    bookingSuggestions: [],
    transport: {
      ...candidate.transport,
      legs: Array.isArray(candidate.transport?.legs) ? candidate.transport.legs : fallback.transport.legs,
      totalEstimatedDurationHours: safeRound(candidate.transport?.totalEstimatedDurationHours),
      totalEstimatedCostEUR: safeRound(candidate.transport?.totalEstimatedCostEUR),
    },
    accommodation: {
      ...candidate.accommodation,
      nightlyRangeEUR: {
        min: safeRound(candidate.accommodation?.nightlyRangeEUR?.min),
        max: Math.max(
          safeRound(candidate.accommodation?.nightlyRangeEUR?.max),
          safeRound(candidate.accommodation?.nightlyRangeEUR?.min)
        ),
      },
      estimatedNights: safeRound(candidate.accommodation?.estimatedNights),
      estimatedTotalEUR: safeRound(candidate.accommodation?.estimatedTotalEUR),
    },
    itinerary: Array.isArray(candidate.itinerary) && candidate.itinerary.length > 0
      ? candidate.itinerary.slice(0, 7).map((day, idx) => ({
          day: idx + 1,
          theme: day?.theme || `Day ${idx + 1}`,
          highlights: Array.isArray(day?.highlights) ? day.highlights.slice(0, 5) : ['Flexible activities'],
          estimatedDailySpendEUR: safeRound(day?.estimatedDailySpendEUR),
        }))
      : fallback.itinerary,
    totals: {
      estimatedTotalEUR: safeRound(candidate.totals?.estimatedTotalEUR),
      estimatedTripHours: safeRound(candidate.totals?.estimatedTripHours),
      confidence:
        candidate.totals?.confidence === 'low' ||
        candidate.totals?.confidence === 'medium' ||
        candidate.totals?.confidence === 'high'
          ? candidate.totals.confidence
          : fallback.totals.confidence,
    },
    rationale: candidate.rationale || fallback.rationale,
    tradeoffs: Array.isArray(candidate.tradeoffs) ? candidate.tradeoffs.slice(0, 5) : fallback.tradeoffs,
  };
}

function attachBookingSuggestions(
  plans: TravelPlan[],
  input: TravelPlannerInput,
  requestId: string
): TravelPlan[] {
  return plans.map((plan) => {
    const providers = pickModeAwareProviders(plan, input.destinationCity);
    const bookingSuggestions = providers.map(({ provider, mode }) => ({
      provider,
      mode,
      reason: AFFILIATE_PROVIDERS[provider].defaultReason,
      ctaLabel: AFFILIATE_PROVIDERS[provider].ctaLabel,
      redirectUrl: buildInternalRedirectUrl({
        provider,
        originCity: input.originCity,
        destinationCity: input.destinationCity,
        startDate: input.startDate,
        endDate: input.endDate,
        requestId,
        planId: plan.id,
      }),
    }));

    return {
      ...plan,
      bookingSuggestions,
    };
  });
}

async function maybeRefineWithGroq(
  input: TravelPlannerInput,
  deterministicPlans: TravelPlan[],
  assumptions: string[]
): Promise<TravelPlan[]> {
  if (!process.env.GROQ_API_KEY) {
    return deterministicPlans.map((plan) => ({
      ...plan,
      totals: { ...plan.totals, confidence: 'low' },
    }));
  }

  const prompt = buildTravelPlanPrompt(input, deterministicPlans, assumptions);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      return deterministicPlans;
    }

    const data = await response.json();
    const raw = cleanAI(data?.choices?.[0]?.message?.content || '');
    const parsed = JSON.parse(raw) as { plans?: TravelPlan[] };

    if (!Array.isArray(parsed?.plans)) {
      return deterministicPlans;
    }

    return deterministicPlans.map((fallbackPlan) => {
      const candidate = parsed.plans?.find((p) => p.id === fallbackPlan.id);
      if (!candidate) return fallbackPlan;
      return clampPlan(candidate, fallbackPlan);
    });
  } catch {
    return deterministicPlans;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const input = req.body as TravelPlannerInput;
    const errors = validateTravelInput(input);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const requestId = `travel_${Date.now()}`;

    const deterministic = buildDeterministicPlans(input);
    const refinedPlans = await maybeRefineWithGroq(
      input,
      deterministic.plans,
      deterministic.assumptions
    );

    const sortedPlans = refinedPlans
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const responsePayload: TravelPlanResponse = {
      requestId,
      currency: 'EUR',
      generatedAt: new Date().toISOString(),
      assumptions: [
        ...deterministic.assumptions,
        `Distance baseline used: ~${deterministic.distanceKm}km.`,
      ],
      plans: attachBookingSuggestions(sortedPlans, input, requestId),
    };

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Travel generate plans error:', error);
    return res.status(500).json({ message: 'Failed to generate travel plans.' });
  }
}
