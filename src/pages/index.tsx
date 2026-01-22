import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import SEO from '@/components/SEO'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const router = useRouter()
  const { loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      // Always redirect to dashboard - guest mode is now default
      router.push('/dashboard')
    }
  }, [loading, router])

  return (
    <MainLayout showHeader={false} showFooter={false}>
      <SEO
        title="Study Overseas Map - Interactive Study Abroad Roadmap"
        description="Plan your study abroad journey with our interactive roadmap. Get AI-powered guidance on university applications, visas, scholarships, and international education planning."
        keywords="study abroad roadmap, international students, overseas education, university applications, student visa guide, study abroad planning, AI study assistant"
        url="https://studyoverseasmap.com"
      />
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <LoadingSpinner />
          <h1 className="mb-2 mt-4 text-xl font-semibold text-white">Study Overseas Map</h1>
          <p className="text-gray-400">Loading your study abroad journey...</p>
        </div>
      </div>
    </MainLayout>
  )
}
