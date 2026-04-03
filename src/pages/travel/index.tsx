import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import TravelPlannerForm from '@/components/travel/TravelPlannerForm';
import PlanList from '@/components/travel/PlanList';
import TravelChatPanel from '@/components/travel/TravelChatPanel';
import TravelRouteMap from '@/components/travel/TravelRouteMap';
import { usePostMutation } from '@/hooks/useReactQuery';
import { TravelPlan, TravelPlannerInput, TravelPlanResponse } from '@/types/travel';

const QUICK_START_TRIPS: Array<Pick<TravelPlannerInput, 'originCity' | 'destinationCity'>> = [
  { originCity: 'Budapest', destinationCity: 'Vienna' },
  { originCity: 'Prague', destinationCity: 'Berlin' },
  { originCity: 'Milan', destinationCity: 'Zurich' },
];

export default function TravelPage() {
  const [plannerInput, setPlannerInput] = useState<TravelPlannerInput | undefined>(undefined);
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [assumptions, setAssumptions] = useState<string[]>([]);
  const [requestId, setRequestId] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<TravelPlan | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const mutation = usePostMutation<TravelPlanResponse, TravelPlannerInput>('/api/travel/generate-plans', {
    onSuccess: (data) => {
      setPlans(data.plans || []);
      setAssumptions(data.assumptions || []);
      setRequestId(data.requestId || '');
      setSelectedPlan(data.plans?.[0]);
    },
  });

  const handleGenerate = (input: TravelPlannerInput) => {
    setPlannerInput(input);
    setPlans([]);
    setSelectedPlan(undefined);
    mutation.mutate(input);
  };

  const handleQuickStart = (trip: Pick<TravelPlannerInput, 'originCity' | 'destinationCity'>) => {
    handleGenerate({
      originCity: trip.originCity,
      destinationCity: trip.destinationCity,
      startDate: new Date().toISOString().slice(0, 10),
      mode: 'save_money',
      travelers: 1,
    });
  };

  return (
    <MainLayout title="Travel Planner">
      <SEO
        description="Generate practical Europe travel plans for students with budget/comfort modes and booking suggestions."
        url="https://travel.studyoverseasmap.com/travel"
      />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.15),_transparent_45%),linear-gradient(180deg,#0b1220_0%,#111827_100%)] lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[96rem] flex-col px-4 py-4 sm:px-6 lg:px-8">
          <TravelPlannerForm onSubmit={handleGenerate} loading={mutation.isPending} initialValue={plannerInput} />

          {mutation.isError && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              Failed to generate plans. Please check your inputs and try again.
            </div>
          )}

          {!!plans.length && (
            <>
              <div className="mt-3 grid grid-cols-1 gap-4 lg:h-[calc(100vh-210px)] lg:grid-cols-[1.18fr_0.82fr]">
                <div className="h-full rounded-2xl border border-gray-700 bg-gray-800/40 p-3 lg:overflow-y-auto">
                  <PlanList
                    plans={plans}
                    selectedPlanId={selectedPlan?.id}
                    onSelectPlan={setSelectedPlan}
                    onOpenChat={() => setIsChatOpen(true)}
                  />
                </div>

                {plannerInput && (
                  <div className="h-full">
                    <TravelRouteMap
                      originCity={plannerInput.originCity}
                      destinationCity={plannerInput.destinationCity}
                      minimal
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {!plans.length && !mutation.isPending && !mutation.isError && (
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.18fr_0.82fr]">
              <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-emerald-500/5 p-6 shadow-[0_10px_40px_rgba(14,165,233,0.12)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Trip lab is waiting</p>
                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">No itinerary yet. Your suitcase is bored.</h2>
                <p className="mt-3 max-w-2xl text-sm text-gray-200 sm:text-base">
                  Pick your cities, hit Search, and we will build a practical route with transport, stays, and booking shortcuts.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {QUICK_START_TRIPS.map((trip) => (
                    <button
                      key={`${trip.originCity}-${trip.destinationCity}`}
                      type="button"
                      onClick={() => handleQuickStart(trip)}
                      className="cursor-pointer rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-400/20"
                    >
                      Try {trip.originCity} to {trip.destinationCity}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs text-gray-300/90">
                  Pro tip: budget is optional, but adding one helps rank options faster.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-6">
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-500/70 bg-gray-900/40 text-center">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
                  <p className="mt-3 text-lg font-semibold text-white">Route map will appear here</p>
                  <p className="mt-1 max-w-xs text-sm text-gray-300">
                    Choose a route and search to unlock your travel path preview.
                  </p>
                </div>
              </div>
            </section>
          )}

          <TravelChatPanel
            plannerInput={plannerInput}
            requestId={requestId}
            assumptions={assumptions}
            plans={plans}
            activePlan={selectedPlan}
            isOpen={isChatOpen}
            onOpenChange={setIsChatOpen}
          />
        </div>
      </div>
    </MainLayout>
  );
}
