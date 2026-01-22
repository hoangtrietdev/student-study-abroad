import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import LoadingSpinner from "@/components/LoadingSpinner";
import CustomRoadmapModal from "@/components/CustomRoadmapModal";
import AIChatbot from "@/components/AIChatbot";

interface CustomRoadmap {
  id: string;
  university: string;
  degreeLevel: string;
  major: string;
  faculty?: string;
  roadmapData: {
    title: string;
    overview: string;
  };
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
}

export default function MyRoadmapsPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [roadmaps, setRoadmaps] = useState<CustomRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!authLoading && !user) {
        router.push("/login");
        return;
      }

      if (user) {
        await fetchRoadmaps();
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchRoadmaps = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "customRoadmaps"),
        where("userId", "==", user.uid)
      );

      const querySnapshot = await getDocs(q);
      const roadmapsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CustomRoadmap[];

      // Sort in JavaScript instead of Firestore to avoid needing composite index
      roadmapsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setRoadmaps(roadmapsData);
    } catch (err) {
      console.error("Error fetching roadmaps:", err);
      alert(t("myRoadmaps.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roadmapId: string) => {
    if (!confirm(t("myRoadmaps.deleteConfirmation"))) {
      return;
    }

    setDeletingId(roadmapId);
    try {
      await deleteDoc(doc(db, "customRoadmaps", roadmapId));
      setRoadmaps(roadmaps.filter((r) => r.id !== roadmapId));
    } catch (err) {
      console.error("Error deleting roadmap:", err);
      alert(t("myRoadmaps.deleteError"));
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <MainLayout showHeader={false} showFooter={false}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-400">
              {t("myRoadmaps.loadingRoadmaps")}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <>
      <SEO
        title={`${t("myRoadmaps.title")} - Study Abroad Plans`}
        description="View and manage all your personalized study abroad roadmaps"
      />
      <MainLayout title={t("myRoadmaps.title")}>
        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl sm:px-6 sm:py-3 sm:text-base"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("myRoadmaps.createNewRoadmap")}
            </button>
          </div>

          {/* Roadmaps Grid */}
          {roadmaps.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                {t("myRoadmaps.noRoadmapsYet")}
              </h3>
              <p className="text-gray-400 mb-6">
                {t("myRoadmaps.createFirstRoadmap")}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("myRoadmaps.createYourFirstRoadmap")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {roadmaps.map((roadmap) => (
                <div
                    key={roadmap.id}
                    className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-200 border border-gray-700 hover:border-blue-500 flex flex-col"
                  >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-xs font-medium rounded-full mb-2">
                        {roadmap.degreeLevel}
                      </span>
                      <h3 className="text-xl font-bold mb-1 line-clamp-2">
                        {roadmap.university}
                      </h3>
                      <p className="text-sm text-gray-400">{roadmap.major}</p>
                      {roadmap.faculty && (
                        <p className="text-xs text-gray-500 mt-1">
                          {roadmap.faculty}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 mb-4">
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {roadmap.roadmapData.overview}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>
                        {t("myRoadmaps.created")}{" "}
                        {new Date(
                          roadmap.createdAt.seconds * 1000
                        ).toLocaleDateString()}
                      </span>
                      <span>
                        {t("myRoadmaps.updated")}{" "}
                        {new Date(
                          roadmap.updatedAt.seconds * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          router.push(`/custom-roadmap/${roadmap.id}`)
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                      >
                        {t("myRoadmaps.viewRoadmap")}
                      </button>
                      <button
                        onClick={() => handleDelete(roadmap.id)}
                        disabled={deletingId === roadmap.id}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {deletingId === roadmap.id ? (
                          <LoadingSpinner />
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Chatbot */}
        <AIChatbot />
      </MainLayout>

      {/* Create Roadmap Modal */}
      <CustomRoadmapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
