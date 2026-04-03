import { TravelPlan } from '@/types/travel';
import PlanCard from '@/components/travel/PlanCard';

interface PlanListProps {
  plans: TravelPlan[];
  selectedPlanId?: string;
  onSelectPlan: (plan: TravelPlan) => void;
  onOpenChat?: () => void;
}

export default function PlanList({ plans, selectedPlanId, onSelectPlan, onOpenChat }: PlanListProps) {
  if (!plans.length) return null;

  const activePlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-gray-700 bg-gray-900/60 p-2">
        <div className="flex flex-wrap gap-2">
          {plans.map((plan, index) => {
            const isActive = plan.id === activePlan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelectPlan(plan)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400'
                    : 'bg-gray-800 text-gray-300 border border-gray-600 hover:border-gray-400'
                }`}
              >
                Plan {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <PlanCard
        key={activePlan.id}
        plan={activePlan}
        selected
        onOpenChat={onOpenChat}
      />
    </section>
  );
}
