import { useEffect, useRef, useState } from 'react';
import Markdown from 'markdown-to-jsx';
import { usePostMutation } from '@/hooks/useReactQuery';
import { TravelPlan, TravelPlannerInput } from '@/types/travel';

interface TravelChatPanelProps {
  plannerInput?: TravelPlannerInput;
  requestId?: string;
  assumptions?: string[];
  plans: TravelPlan[];
  activePlan?: TravelPlan;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface TravelChatResponse {
  message: string;
}

interface TravelChatRequest {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
  plannerInput?: TravelPlannerInput;
  activePlan?: TravelPlan;
  allPlans: TravelPlan[];
}

const markdownOptions = {
  overrides: {
    h1: {
      component: ({ children }: { children: React.ReactNode }) => (
        <h1 className="mb-2 text-base font-bold text-cyan-100">{children}</h1>
      ),
    },
    h2: {
      component: ({ children }: { children: React.ReactNode }) => (
        <h2 className="mb-2 text-sm font-bold text-cyan-100">{children}</h2>
      ),
    },
    h3: {
      component: ({ children }: { children: React.ReactNode }) => (
        <h3 className="mb-1 text-sm font-semibold text-cyan-100">{children}</h3>
      ),
    },
    p: {
      component: ({ children }: { children: React.ReactNode }) => (
        <p className="mb-2 last:mb-0 whitespace-pre-wrap leading-relaxed text-gray-100">{children}</p>
      ),
    },
    ul: {
      component: ({ children }: { children: React.ReactNode }) => (
        <ul className="mb-2 list-disc space-y-1 pl-5 text-gray-100">{children}</ul>
      ),
    },
    ol: {
      component: ({ children }: { children: React.ReactNode }) => (
        <ol className="mb-2 list-decimal space-y-1 pl-5 text-gray-100">{children}</ol>
      ),
    },
    li: {
      component: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    },
    strong: {
      component: ({ children }: { children: React.ReactNode }) => (
        <strong className="font-semibold text-cyan-100">{children}</strong>
      ),
    },
    a: {
      component: ({ href, children }: { href?: string; children: React.ReactNode }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300 underline hover:text-cyan-200"
        >
          {children}
        </a>
      ),
    },
    code: {
      component: ({ children }: { children: React.ReactNode }) => (
        <code className="rounded bg-gray-900 px-1 py-0.5 text-xs text-cyan-200">{children}</code>
      ),
    },
  },
};

export default function TravelChatPanel({
  plannerInput,
  requestId,
  assumptions = [],
  plans,
  activePlan,
  isOpen,
  onOpenChange,
}: TravelChatPanelProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [lastInjectedRequestId, setLastInjectedRequestId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resolvedIsOpen = isOpen ?? internalIsOpen;

  const setResolvedIsOpen = (open: boolean) => {
    if (isOpen === undefined) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
  };
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content:
        'I provide travel tips and suggestions. Generate plans first, then ask for cheaper transport, better hotel choices, and the best places to visit by budget and season.',
    },
  ]);

  useEffect(() => {
    if (!plans.length || !requestId || requestId === lastInjectedRequestId) return;

    const assumptionsText = assumptions.length
      ? `Planning assumptions:\n${assumptions.map((item) => `- ${item}`).join('\n')}\n\n`
      : '';

    const planDetails = plans
      .map((plan, index) => {
        return `### Plan ${index + 1}: ${plan.title}
- Estimated total: EUR ${plan.totals.estimatedTotalEUR}
- Estimated duration: ${plan.totals.estimatedTripHours} hours
- Transport: ${plan.transport.summary}
- Accommodation: ${plan.accommodation.type.replace('_', ' ')} (EUR ${plan.accommodation.nightlyRangeEUR.min}-${plan.accommodation.nightlyRangeEUR.max}/night)
- Cheap ticket tip: Compare train and bus first, then check aggregator platforms for deal windows.
- Hotel tip: Book in flexible-rate windows first, then lock lower price 1-2 weeks before departure.
- Beautiful places tip: Focus on 2-3 key highlights per day and combine nearby spots to reduce local transit costs.
- Best time tip: Visit major attractions early morning or weekday afternoons to avoid queues and peak prices.`;
      })
      .join('\n\n');

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `## Tips and Suggestions\n${assumptionsText}${planDetails}`,
      },
    ]);
    setLastInjectedRequestId(requestId);
  }, [assumptions, lastInjectedRequestId, plans, requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, resolvedIsOpen]);

  const mutation = usePostMutation<TravelChatResponse, TravelChatRequest>('/api/travel/chat-refine', {
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Unable to refine right now. Please try again.' },
      ]);
    },
  });

  const submit = () => {
    if (!input.trim() || mutation.isPending) return;
    const next = { role: 'user' as const, content: input.trim() };
    const history = [...messages, next].filter((m) => m.role === 'user' || m.role === 'assistant');
    setMessages((prev) => [...prev, next]);
    setInput('');

    mutation.mutate({
      message: next.content,
      history,
      plannerInput,
      activePlan,
      allPlans: plans,
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setResolvedIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 cursor-pointer rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 p-4 text-white shadow-lg transition hover:opacity-90"
        aria-label="Open travel tips"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-3 3-3-3z"
          />
        </svg>
      </button>

      {resolvedIsOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setResolvedIsOpen(false)} />

          <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col border-l border-cyan-500/20 bg-gradient-to-b from-slate-800/95 to-slate-900/95 p-5 shadow-[0_20px_60px_-30px_rgba(34,211,238,0.6)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-white">Tips and Suggestions</h3>
                <p className="mt-1 text-sm text-gray-300">Active plan: {activePlan?.title || 'none selected'}</p>
              </div>
              <button
                type="button"
                onClick={() => setResolvedIsOpen(false)}
                className="cursor-pointer rounded-md p-1 text-gray-300 hover:bg-gray-700 hover:text-white"
                aria-label="Close travel tips"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto rounded-xl border border-gray-700/70 bg-gray-950/55 p-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-lg p-2 text-sm ${
                    message.role === 'user'
                      ? 'ml-6 bg-slate-700 text-white'
                      : 'mr-6 border border-cyan-500/20 bg-cyan-900/20 text-gray-100'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-headings:m-0 prose-p:m-0 prose-ul:m-0">
                      <Markdown options={markdownOptions}>{message.content}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-white">{message.content}</p>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
                placeholder="Ask for tips: cheaper tickets, better hotels, best places, best visit time..."
                className="flex-1 rounded-xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={submit}
                disabled={mutation.isPending}
                className="cursor-pointer rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
