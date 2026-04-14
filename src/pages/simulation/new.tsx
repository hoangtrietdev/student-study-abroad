import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import CVUploader from '@/components/simulation/CVUploader';
import GoalInput from '@/components/simulation/GoalInput';
import type { ExtractedProfile } from '@/types/simulation';

type Stage = 'upload' | 'goal' | 'saving';

const STEPS = [
  { key: 'upload', label: 'Upload CV' },
  { key: 'goal', label: 'Set Goal' },
  { key: 'saving', label: 'Generating' },
];

export default function NewSimulationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [stage, setStage] = useState<Stage>('upload');
  const [profile, setProfile] = useState<ExtractedProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoalSubmit(goal: string) {
    if (!profile) return;
    setError(null);
    setIsGenerating(true);
    setStage('saving');

    try {
      // 1. Generate the graph
      const res = await fetch('/api/simulation/generate-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, goal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate graph.');

      if (user) {
        // 2a. Save to Firebase
        const docRef = await addDoc(collection(db, 'simulations'), {
          userId: user.uid,
          goal,
          profile,
          graph: data.graph,
          completedNodes: [],
          completedSteps: {},
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        // 3a. Navigate
        router.push(`/simulation/${docRef.id}`);
      } else {
        // 2b. Save to localStorage
        const simData = {
          id: 'guest',
          userId: 'guest',
          goal,
          profile,
          graph: data.graph,
          completedNodes: [],
          completedSteps: {},
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
          updatedAt: { seconds: Math.floor(Date.now() / 1000) },
        };
        localStorage.setItem('guest_simulation_data', JSON.stringify(simData));
        // 3b. Navigate to the local simulation
        router.push('/simulation/guest');
      }
    } catch (err) {
      console.error('Graph generation error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStage('goal');
      setIsGenerating(false);
    }
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === stage);

  return (
    <>
      <SEO
        title="New Career Graph Simulation — Study Abroad"
        description="Upload your CV and set your career goal to generate a personalised career knowledge graph."
      />

      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-3xl">

          {/* Back link */}
          <button
            onClick={() => router.push('/simulation')}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Simulations
          </button>

          {/* Progress stepper */}
          <div className="flex items-center mb-10">
            {STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                      ${i < currentStepIndex
                        ? 'bg-green-500 text-white'
                        : i === currentStepIndex
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-gray-700 text-gray-500'
                      }
                    `}
                  >
                    {i < currentStepIndex ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`text-xs font-medium ${i === currentStepIndex ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${i < currentStepIndex ? 'bg-green-500' : 'bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong>Error:</strong> {error}
                <button onClick={() => setError(null)} className="ml-2 underline text-red-400 hover:text-red-300">Dismiss</button>
              </div>
            </div>
          )}

          {/* Stage views */}
          {stage === 'upload' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">Upload your CV</h2>
                <p className="text-sm text-gray-400">
                  We&apos;ll extract your skills, education, certificates and connections automatically.
                </p>
              </div>
              <CVUploader
                onExtracted={(p) => {
                  setProfile(p);
                  setStage('goal');
                }}
              />
            </div>
          )}

          {stage === 'goal' && profile && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">What&apos;s your career goal?</h2>
                <p className="text-sm text-gray-400">
                  Be specific — the more detail you give, the more accurate your graph will be.
                </p>
              </div>
              <GoalInput
                profile={profile}
                onGenerate={handleGoalSubmit}
                isLoading={isGenerating}
              />
            </div>
          )}

          {stage === 'saving' && (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white mb-1">Building your career graph…</p>
                <p className="text-sm text-gray-400">
                  AI is mapping your path — this takes about 20–30 seconds
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'roadmap'])),
    },
  };
};
