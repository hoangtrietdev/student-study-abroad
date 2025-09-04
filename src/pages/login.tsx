import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import SEO from '@/components/SEO'
import GoogleLoginButton from '@/components/GoogleLoginButton'
import ContinueAsGuestButton from '@/components/ContinueAsGuestButton'

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
      <>
        <SEO
          title="Sign In - Study Overseas Map"
          description="Sign in to access your personalized study abroad roadmap and track your progress towards international education."
          url="https://studyoverseasmap.com/login"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center">{t('common.loading')}</div>
      </>
    )
  }

  if (user) {
    return (
      <>
        <SEO
          title="Dashboard - Study Overseas Map"
          description="Access your study abroad dashboard and interactive roadmap."
          url="https://studyoverseasmap.com/dashboard"
          noindex={true}
        />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="mb-4">{t('auth.alreadyLoggedIn')}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {t('auth.goToDashboard')}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title="Sign In - Study Overseas Map"
        description="Sign in to track your study abroad progress or continue as guest to explore our interactive roadmap and AI assistant."
        url="https://studyoverseasmap.com/login"
        noindex={true}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 rounded-lg bg-white p-6 sm:p-8 shadow-lg">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('auth.signInToAccount')}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.guestBrowsingMessage')}
            </p>
          </div>

          <div className="mt-6 sm:mt-8 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
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
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
