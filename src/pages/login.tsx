import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Login() {
  const { t } = useTranslation('common')
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard') // Redirect to dashboard if authenticated
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">{t('common.loading')}</div>
  }

  // If user is already logged in, show dashboard link
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">{t('auth.alreadyLoggedIn')}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
          >
            {t('auth.goToDashboard')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 rounded-lg bg-white p-6 sm:p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('auth.signInToAccount')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.guestBrowsingMessage')}
          </p>
        </div>

        <div className="mt-6 sm:mt-8 space-y-4">
          <button
            onClick={() => signInWithGoogle()}
            className="flex w-full items-center justify-center space-x-2 rounded-md bg-white px-4 py-3 text-sm sm:text-base text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-semibold"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>{t('auth.signInWithGoogle')}</span>
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full rounded-md bg-gray-800 px-4 py-3 text-sm sm:text-base font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            {t('common.continueAsGuest')}
          </button>
        </div>
      </div>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
