import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const LanguageSwitcher = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const handleLanguageChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <div className="flex items-center">
      {/* Toggle Container */}
      <div className="relative flex items-center bg-gray-800/60 rounded-lg p-0.5 border-2 border-gray-400 shadow-lg backdrop-blur-sm">
        {/* Background Slider */}
        <div 
          className={`
            absolute top-0.5 bottom-0.5 
            w-6 rounded-md transition-all duration-300 ease-out shadow-md
            ${currentLanguage === 'en' 
              ? 'left-0.5 bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'left-6.5 bg-gradient-to-r from-red-500 to-red-600'}
          `}
        />
        
        {/* EN Button */}
        <button
          onClick={() => handleLanguageChange('en')}
          className={`
            relative z-10 w-6 py-1 
            text-xs font-semibold rounded-md transition-all duration-200
            flex items-center justify-center
            ${currentLanguage === 'en' 
              ? 'text-white' 
              : 'text-gray-400 hover:text-gray-200'
            }
          `}
        >
          EN
        </button>
        
        {/* VI Button */}
        <button
          onClick={() => handleLanguageChange('vi')}
          className={`
            relative z-10 w-6 py-1 
            text-xs font-semibold rounded-md transition-all duration-200
            flex items-center justify-center
            ${currentLanguage === 'vi' 
              ? 'text-yellow-400' 
              : 'text-gray-400 hover:text-gray-200'
            }
          `}
        >
          VI
        </button>
      </div>
      
      {/* Language Label */}
      <div className="ml-2 md:ml-3 hidden sm:block">
        <span className="text-xs md:text-sm text-gray-300 font-medium">
          {currentLanguage === 'en' ? 'English' : 'Tiếng Việt'}
        </span>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
