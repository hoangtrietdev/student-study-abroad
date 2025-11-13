import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useAuth } from "@/contexts/AuthContext";
// import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { t: tCommon } = useTranslation("common");
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.reload();
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
      <div className="flex flex-col sm:flex-row md:justify-between md:items-center space-y-3 sm:space-y-0">
        <div className="flex flex-col sm:flex-row md:items-center space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-6">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {title}
          </h1>
          
          {/* Navigation Links */}
          {user && (
            <nav className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  router.pathname === '/dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tCommon("navigation.dashboard")}
              </button>
              <button
                onClick={() => router.push('/my-roadmaps')}
                className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  router.pathname === '/my-roadmaps'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tCommon("navigation.myRoadmaps")}
              </button>
            </nav>
          )}
          
          {user ? (
            <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-green-900/50 text-green-300 border border-green-700/50 max-w-fit shadow-sm">
              <span className="hidden sm:inline md:text-sm">
                {tCommon("common.signedInAs") + " " + user.email}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gray-700/50 text-gray-300 border border-gray-600/50 shadow-sm">
              <span className="hidden sm:inline">
                {tCommon("common.guestModeDescription")}
              </span>
              <span className="sm:hidden">{tCommon("common.guestMode")}</span>
            </span>
          )}
        </div>
        <div className="flex items-center justify-end space-x-2 sm:space-x-3 md:space-x-4 lg:space-x-5">
          {/* <LanguageSwitcher /> */}
          {user ? (
            <button
              onClick={handleSignOut}
              className="text-xs sm:text-sm md:text-base text-gray-400 hover:text-gray-200 transition-colors duration-200 px-2 sm:px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 rounded-md hover:bg-gray-700/50 font-semibold"
            >
              {tCommon("common.signOut")}
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-xs sm:text-sm md:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 sm:px-3 md:px-4 lg:px-5 py-1 md:py-1.5 lg:py-2 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md font-semibold"
            >
              <span className="hidden sm:inline lg:text-base">
                {tCommon("common.signIn")}
              </span>
              <span className="sm:hidden">{tCommon("common.signIn")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
