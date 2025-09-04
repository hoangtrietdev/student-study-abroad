import { useTranslation } from 'next-i18next'

interface ContinueAsGuestButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function ContinueAsGuestButton({ onClick, disabled }: ContinueAsGuestButtonProps) {
  const { t } = useTranslation('common')

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-md bg-gray-800 px-4 py-3 text-sm sm:text-base font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {t('common.continueAsGuest')}
    </button>
  )
}
