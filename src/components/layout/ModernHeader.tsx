import { useState } from "react";
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

  const handleSignOut = async () => {
    await signOut();
    router.reload();
  };

  const navigation = [
    { name: t("navigation.dashboard"), href: "/dashboard" },
    { name: t("navigation.myRoadmaps"), href: "/my-roadmaps" },
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
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-white">
                  {title || "Study Overseas Map"}
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      router.pathname === item.href
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}

            {/* User Status */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center rounded-full bg-green-900/30 px-3 py-1.5 text-sm font-medium text-green-300 border border-green-700/50">
                  <span className="mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  {t("common.signOut")}
                </button>
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
          <div className="flex md:hidden">
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
        <div className="md:hidden border-t border-gray-700">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {user && (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-base font-medium ${
                      router.pathname === item.href
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
            
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
                      {t("common.guestMode")}
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
