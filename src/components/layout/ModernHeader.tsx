import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface ModernHeaderProps {
  title?: string;
}

export default function ModernHeader({ title }: ModernHeaderProps) {
  const { t } = useTranslation("common");
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  const handleSignOut = async () => {
    await signOut();
    router.reload();
  };

  const navigation = user
    ? [
        { name: t("navigation.dashboard"), href: "/dashboard" },
        { name: "Simulations", href: "/simulation" },
        { name: t("navigation.myRoadmaps"), href: "/my-roadmaps" },
        { name: t("navigation.travelPlanner"), href: "/travel" },
      ]
    : [
        { name: t("navigation.dashboard"), href: "/dashboard" },
        { name: "Simulations", href: "/simulation" },
        { name: t("navigation.travelPlanner"), href: "/travel" },
      ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl font-bold text-white">🎓</span>
              </div>
              <div className="hidden lg:block">
                <h2 className="font-bold text-white">
                  {title || "Study Overseas"}
                </h2>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  router.pathname === item.href
                    ? "text-white border-b-2 border-[#0066FF] pb-1"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                aria-current={router.pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}

            {/* User Status */}
            {user ? (
              <div className="relative flex items-center space-x-3 pl-4" ref={profileMenuRef}>
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none rounded-full hover:bg-gray-700/50 p-1 pr-2 transition-colors"
                >
                  {user.photoURL ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={user.photoURL} alt={formattedName} className="h-8 w-8 rounded-full object-cover border border-gray-600" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {formattedName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-200">{formattedName}</span>
                  <svg className={`h-4 w-4 text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-12 mt-2 w-64 rounded-xl shadow-2xl bg-[#1e2329] border border-gray-700 py-2 z-50 transition-opacity">
                    <div className="px-5 py-3 border-b border-gray-700/60 mb-2">
                       <p className="text-[15px] font-semibold text-white">{user.displayName || formattedName}</p>
                       <p className="text-[13px] text-gray-400 mt-0.5 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full mt-1 flex items-center space-x-3 px-5 py-3 text-[15px] font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors text-left"
                    >
                      <svg className="h-[22px] w-[22px] opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                {t("common.signIn")}
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-700">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium ${
                  router.pathname === item.href
                    ? "text-white border-b-2 border-[#0066FF]"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={router.pathname === item.href ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile User Status */}
            <div className="border-t border-gray-700 pt-4">
              {user ? (
                <>
                  <div className="mb-3 flex items-center space-x-2 px-3">
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    <span className="text-sm text-gray-300">{user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full rounded-lg bg-gray-700 px-3 py-2 text-left text-base font-medium text-gray-300 hover:bg-gray-600"
                  >
                    {t("common.signOut")}
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-3 px-3">
                    <span className="text-sm text-gray-400">
                      Guest mode
                    </span>
                  </div>
                  <Link
                    href="/login"
                    className="block w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 text-center text-base font-semibold text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("common.signIn")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
