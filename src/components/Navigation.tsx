import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, LineChart, Briefcase, BookOpen, Settings, Menu, X } from "lucide-react";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: TrendingUp },
    { path: "/analysis", label: "Analisi Fondamentale", icon: LineChart },
    { path: "/portfolio", label: "Portfolio", icon: Briefcase },
    { path: "/journal", label: "Journal", icon: BookOpen },
    { path: "/settings", label: "Impostazioni", icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">
                Finance Analyzer
              </span>
            </Link>
          </div>

          <div className="flex gap-1">
            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-1">
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
                          ? "bg-primary-100 text-primary-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-t z-50">
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
                                ? "bg-primary-100 text-primary-700 font-semibold"
                                : "text-gray-600 hover:bg-gray-100"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
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
