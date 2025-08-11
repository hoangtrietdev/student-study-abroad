import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>
  )
}
