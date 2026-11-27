import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, Search, Briefcase, BookOpen, Menu, X } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";
import { useTranslation } from "@/i18n";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Navigazione primaria a 3 voci: racconta il ciclo analyze / track / reflect.
  const navItems = [
    { path: "/", label: t("nav.analyze"), icon: Search },
    { path: "/portfolio", label: t("nav.portfolio"), icon: Briefcase },
    { path: "/journal", label: t("nav.journal"), icon: BookOpen },
  ];

  return (
    <nav className="bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl shadow-soft dark:shadow-none border-b border-white/60 dark:border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-brand-teal" />
              <span className="text-xl font-bold text-brand-navy dark:text-gray-100">
                Finance Analyzer
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-primary-100 text-primary-700 font-semibold dark:bg-primary-900/60 dark:text-primary-300"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Lingua + tema sempre visibili (desktop) */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
              <LanguageSelector />
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                aria-label={t("nav.mobileMenu")}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-t border-white/60 dark:border-gray-800 z-50">
                  <div className="px-4 py-2 space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                            ${
                              isActive
                                ? "bg-primary-100 text-primary-700 font-semibold dark:bg-primary-900/60 dark:text-primary-300"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 mt-1">
                      <LanguageSelector />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
