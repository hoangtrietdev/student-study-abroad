import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import SEO from '@/components/SEO'

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
    <>
      <SEO
        title="Study Overseas Map - Interactive Study Abroad Roadmap"
        description="Plan your study abroad journey with our interactive roadmap. Get AI-powered guidance on university applications, visas, scholarships, and international education planning."
        keywords="study abroad roadmap, international students, overseas education, university applications, student visa guide, study abroad planning, AI study assistant"
        url="https://studyoverseasmap.com"
      />
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Study Overseas Map</h1>
          <p className="text-gray-600">Loading your study abroad journey...</p>
        </div>
      </div>
    </>
  )
}
