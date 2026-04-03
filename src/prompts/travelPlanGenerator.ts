import { TravelPlan, TravelPlannerInput } from '@/types/travel';

export function buildTravelPlanPrompt(input: TravelPlannerInput, seedPlans: TravelPlan[], assumptions: string[]): string {
  return `You are a European student travel planning assistant.

TASK:
Refine the provided estimated plans into user-friendly plans while preserving realistic cost and duration ranges.

RULES:
- Return ONLY valid JSON.
- Keep exactly ${seedPlans.length} plans.
- Keep each plan id and strategy unchanged.
- Do not output booking links.
- Keep costs practical for budget students in Europe.
- Never claim booking is completed.
- Keep itinerary lightweight and concise.

USER INPUT:
${JSON.stringify(input, null, 2)}

ASSUMPTIONS:
${JSON.stringify(assumptions, null, 2)}

SEED PLANS:
${JSON.stringify(seedPlans, null, 2)}

OUTPUT JSON SHAPE:
{
  "plans": [
    {
      "id": "string",
      "title": "string",
      "strategy": "budget-first | balanced | comfort-first",
      "transport": {
        "summary": "string",
        "legs": [
          {
            "type": "bus | train | flight | mixed",
            "from": "string",
            "to": "string",
            "estimatedDurationHours": 0,
            "estimatedCostEUR": 0,
            "notes": "optional string"
          }
        ],
        "totalEstimatedDurationHours": 0,
        "totalEstimatedCostEUR": 0
      },
      "accommodation": {
        "type": "hostel | budget_hotel | mid_hotel | apartment | mixed",
        "nightlyRangeEUR": { "min": 0, "max": 0 },
        "estimatedNights": 0,
        "estimatedTotalEUR": 0,
        "notes": "string"
      },
      "itinerary": [
        {
          "day": 1,
          "theme": "string",
          "highlights": ["string"],
          "estimatedDailySpendEUR": 0
        }
      ],
      "totals": {
        "estimatedTotalEUR": 0,
        "estimatedTripHours": 0,
        "confidence": "low | medium | high"
      },
      "rationale": "string",
      "tradeoffs": ["string"]
    }
  ]
}`;
}
