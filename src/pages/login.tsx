import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SEO from '@/components/SEO'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import ContinueAsGuestButton from '@/components/ContinueAsGuestButton'
import MainLayout from '@/components/layout/MainLayout'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Login() {
  const { t } = useTranslation('common')
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      setIsSigningIn(false)
      console.error('Sign in error:', error)
      setError('An error occurred during sign in')
      
    }
  }

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <MainLayout showHeader={false} showFooter={false}>
        <SEO
          title="Sign In - Study Overseas Map"
          description="Sign in to access your personalized study abroad roadmap and track your progress towards international education."
          url="https://studyoverseasmap.com/login"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    )
  }

  if (user) {
    return (
      <MainLayout showHeader={false} showFooter={false}>
        <SEO
          title="Dashboard - Study Overseas Map"
          description="Access your study abroad dashboard and interactive roadmap."
          url="https://studyoverseasmap.com/dashboard"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <p className="mb-4 text-lg">{t('auth.alreadyLoggedIn')}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
            >
              {t('auth.goToDashboard')}
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showHeader={false} showFooter={false}>
      <SEO
        title="Sign In - Study Overseas Map"
        description="Sign in to track your study abroad progress or continue as guest to explore our interactive roadmap and AI assistant."
        url="https://studyoverseasmap.com/login"
        noindex={true}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-700 bg-gray-800/80 p-6 shadow-2xl backdrop-blur-sm sm:max-w-md sm:space-y-8 sm:p-8">
          <div className="text-center">
            <div className="mb-4 text-5xl sm:text-6xl">🎓</div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('auth.signInToAccount')}</h2>
            <p className="mt-2 text-sm text-gray-300">
              {t('auth.guestBrowsingMessage')}
            </p>
          </div>

          <div className="mt-6 space-y-4 sm:mt-8">
            {error && (
              <div className="rounded-lg bg-red-900/30 p-4 border border-red-700">
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}
            
            <GoogleLoginButton
              onClick={handleGoogleSignIn}
              isSigningIn={isSigningIn}
            />

            <ContinueAsGuestButton
              onClick={() => router.push('/dashboard')}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
