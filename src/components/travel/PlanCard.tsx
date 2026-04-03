import { useState } from 'react';
import { TravelPlan } from '@/types/travel';
import PlanItinerary from '@/components/travel/PlanItinerary';
import BookingRecommendation from '@/components/travel/BookingRecommendation';

interface PlanCardProps {
  plan: TravelPlan;
  selected: boolean;
  onOpenChat?: () => void;
}

export default function PlanCard({ plan, selected, onOpenChat }: PlanCardProps) {
  const [activeTab, setActiveTab] = useState<'transport' | 'accommodation' | 'detail'>('transport');

  return (
    <article
      className={`rounded-2xl border p-3 transition-colors ${
        selected ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-700 bg-gray-800/70'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{plan.title}</h3>
          <p className="mt-1 text-sm text-gray-300">{plan.transport.summary}</p>
          <p className="mt-1 text-xs text-gray-400 line-clamp-2">{plan.rationale}</p>
        </div>
        {selected ? (
          <button
            type="button"
            onClick={onOpenChat}
            className="cursor-pointer rounded-lg border border-cyan-400 bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/30"
          >
            Active chat plan
          </button>
        ) : (
          <span className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-gray-300">
            Inactive
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
        <div className="rounded-lg bg-gray-900/80 p-2">
          <p className="text-gray-400">Total cost</p>
          <p className="font-semibold text-white">EUR {plan.totals.estimatedTotalEUR}</p>
        </div>
        <div className="rounded-lg bg-gray-900/80 p-2">
          <p className="text-gray-400">Trip duration</p>
          <p className="font-semibold text-white">{plan.totals.estimatedTripHours} h</p>
        </div>
        <div className="rounded-lg bg-gray-900/80 p-2">
          <p className="text-gray-400">Accommodation</p>
          <p className="font-semibold text-white">{plan.accommodation.type.replace('_', ' ')}</p>
        </div>
        <div className="rounded-lg bg-gray-900/80 p-2">
          <p className="text-gray-400">Confidence</p>
          <p className="font-semibold capitalize text-white">{plan.totals.confidence}</p>
        </div>
      </div>

      <div className="mt-3 border-t border-gray-700 pt-3">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('transport')}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'transport'
                ? 'border border-cyan-400 bg-cyan-500/20 text-cyan-100'
                : 'border border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-400'
            }`}
          >
            Transport
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('accommodation')}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'accommodation'
                ? 'border border-cyan-400 bg-cyan-500/20 text-cyan-100'
                : 'border border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-400'
            }`}
          >
            Accommodation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold ${
              activeTab === 'detail'
                ? 'border border-cyan-400 bg-cyan-500/20 text-cyan-100'
                : 'border border-gray-600 bg-gray-900 text-gray-300 hover:border-gray-400'
            }`}
          >
            Detail Travel Plan
          </button>
        </div>

        {activeTab === 'transport' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-3 text-sm text-gray-200">
              <p className="font-semibold text-white">Transport summary</p>
              <p className="mt-1">{plan.transport.summary}</p>
              <p className="mt-2 text-xs text-gray-400">
                Estimated transport cost: EUR {plan.transport.totalEstimatedCostEUR} | Estimated duration: {plan.transport.totalEstimatedDurationHours}h
              </p>
            </div>
            <BookingRecommendation plan={plan} visibleSections={['travel']} />
          </div>
        )}

        {activeTab === 'accommodation' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-3 text-sm text-gray-200">
              <p className="font-semibold text-white">Accommodation details</p>
              <ul className="mt-2 space-y-1">
                <li>Type: {plan.accommodation.type.replace('_', ' ')}</li>
                <li>Nightly range: EUR {plan.accommodation.nightlyRangeEUR.min} - EUR {plan.accommodation.nightlyRangeEUR.max}</li>
                <li>Nights: {plan.accommodation.estimatedNights}</li>
                <li>Total estimate: EUR {plan.accommodation.estimatedTotalEUR}</li>
              </ul>
              <p className="mt-2 text-xs text-gray-400">{plan.accommodation.notes}</p>
            </div>
            <BookingRecommendation plan={plan} visibleSections={['stay']} />
          </div>
        )}

        {activeTab === 'detail' && (
          <div className="space-y-3">
            <PlanItinerary itinerary={plan.itinerary} />
            <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-3 text-sm text-gray-200">
              <p className="font-semibold text-white">Trade-offs</p>
              <ul className="mt-2 space-y-1">
                {plan.tradeoffs.map((tradeoff, index) => (
                  <li key={`${plan.id}-tradeoff-${index}`}>• {tradeoff}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
