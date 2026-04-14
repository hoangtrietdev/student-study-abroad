import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import SEO from '@/components/SEO';
import LoadingSpinner from '@/components/LoadingSpinner';
import SimulationCard from '@/components/simulation/SimulationCard';
import type { SimulationDoc } from '@/types/simulation';

const MAX_AUTH_SIMULATIONS = 5;
const MAX_GUEST_SIMULATIONS = 1;

export default function SimulationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [simulations, setSimulations] = useState<SimulationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    fetchSimulations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  async function fetchSimulations() {
    setLoading(true);
    try {
      if (user) {
        // Authenticated user: fetch from Firebase
        const q = query(
          collection(db, 'simulations'),
          where('userId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SimulationDoc[];
        docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setSimulations(docs);
      } else {
        // Guest user: fetch from localStorage
        const customData = localStorage.getItem('guest_simulation_data');
        if (customData) {
          const parsed = JSON.parse(customData);
          setSimulations([parsed]);
        } else {
          setSimulations([]);
        }
      }
    } catch (err) {
      console.error('Error fetching simulations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this simulation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      if (user) {
        await deleteDoc(doc(db, 'simulations', id));
      } else {
        localStorage.removeItem('guest_simulation_data');
      }
      setSimulations((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Error deleting simulation:', err);
      alert('Failed to delete simulation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  const maxLimit = user ? MAX_AUTH_SIMULATIONS : MAX_GUEST_SIMULATIONS;
  const atLimit = simulations.length >= maxLimit;

  if (authLoading || loading) {
    return (
      <MainLayout showHeader={false} showFooter={false}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">Loading your simulations…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEO
        title="Career Graph Simulation — Study Abroad"
        description="Upload your CV, set your career goal, and visualise your personalised path with an interactive knowledge graph."
        url="https://studyoverseasmap.com/simulation"
      />

      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Guest Warning Banner */}
          {!user && (
            <div className="mb-6 p-4 rounded-xl bg-blue-900/30 border border-blue-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-300">You are in Guest Mode</p>
                  <p className="text-xs text-blue-400/80 mt-0.5">Your simulation is saved locally in this browser. You can create 1 simulation as a guest.</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-xs font-semibold rounded-lg"
              >
                Sign in to save online
              </button>
            </div>
          )}

          {/* Page header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Career Graph Simulations
              </h1>
              <p className="text-gray-400 text-sm max-w-xl">
                Upload your CV, tell us your goal, and we&apos;ll build an interactive knowledge graph
                showing the path from where you are to where you want to be.
              </p>
            </div>

            {/* New simulation button */}
            <div className="relative group shrink-0">
              <button
                onClick={() => !atLimit && router.push('/simulation/new')}
                disabled={atLimit}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white
                  transition-all shadow-lg
                  ${atLimit
                    ? 'bg-gray-700 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/25'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Simulation
              </button>

              {/* Tooltip when at limit */}
              {atLimit && (
                <div className="
                  absolute right-0 top-full mt-2 w-60 bg-gray-900 border border-gray-700 rounded-xl p-3
                  text-xs text-gray-300 shadow-xl z-10 hidden group-hover:block
                ">
                  You&apos;ve reached the <strong>{maxLimit}-simulation limit</strong>. Delete an existing simulation to create a new one.
                </div>
              )}
            </div>
          </div>

          {/* Simulation count badge */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1.5">
              {Array.from({ length: maxLimit }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-2 rounded-full transition-colors ${
                    i < simulations.length
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {simulations.length} / {maxLimit} simulations used
            </span>
          </div>

          {/* Empty state */}
          {simulations.length === 0 && (
            <div className="text-center py-20 bg-gray-800/20 rounded-2xl border border-gray-800/50">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center shadow-inner">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No simulations yet</h2>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">
                Create your first career graph simulation &mdash; upload your CV and set your goal to get started.
              </p>
              <button
                onClick={() => router.push('/simulation/new')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
                  bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
                  transition-all shadow-lg hover:shadow-blue-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Simulation
              </button>
            </div>
          )}

          {/* Grid */}
          {simulations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {simulations.map((sim, i) => (
                <SimulationCard
                  key={sim.id}
                  simulation={sim}
                  index={i}
                  onDelete={handleDelete}
                  isDeleting={deletingId === sim.id}
                />
              ))}
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
