import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, LineChart, Briefcase, BookOpen } from 'lucide-react';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: TrendingUp },
    { path: '/analysis', label: 'Analisi Fondamentale', icon: LineChart },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { path: '/journal', label: 'Journal', icon: BookOpen },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Finance Analyzer</span>
            </Link>
          </div>

          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
