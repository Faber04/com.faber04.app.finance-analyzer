import React, { useState } from 'react';
import { Settings, Puzzle, Globe } from 'lucide-react';
import { ApiKeySettings, Card } from '@/components/common';

type Tab = 'general' | 'integrations';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('integrations');

  const tabs = [
    { id: 'general', label: 'Generali', icon: Settings },
    { id: 'integrations', label: 'Integrazioni API', icon: Puzzle },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">Impostazioni</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Menu */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">Impostazioni Generali</h2>
              <Card>
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nessuna impostazione generale configurabile al momento.</p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">Integrazioni API</h2>
              <ApiKeySettings />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
