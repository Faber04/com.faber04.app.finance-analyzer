import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Key } from 'lucide-react';
import { saveFmpApiKey, getFmpApiKey, removeFmpApiKey } from '@/services';

export const ApiKeySettings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(false);

  useEffect(() => {
    try {
      const key = getFmpApiKey();
      if (key) {
        setApiKey(key);
        setIsSaved(true);
        // Controlliamo se proviene dal .env verificando il localstorage
        const local = localStorage.getItem('FMP_API_KEY');
        if (!local) {
          setHasEnvKey(true);
        }
      }
    } catch (e) {
      // nessuna chiave preesistente
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      saveFmpApiKey(apiKey);
      setIsSaved(true);
      setHasEnvKey(false);
      alert('API Key salvata con successo nel browser!');
    }
  };

  const handleRemove = () => {
    removeFmpApiKey();
    setApiKey('');
    setIsSaved(false);
    alert('API Key rimossa dal browser.');
  };

  return (
    <Card className={`mb-6 border-blue-200 ${isSaved ? 'bg-green-50/30' : 'bg-blue-50/50'}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-lg shrink-0">
          <Key className="text-blue-600" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Financial Modeling Prep API Key
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Per ottenere i dati finanziari in tempo reale, inserisci la tua API Key di FMP. 
            La chiave verrà salvata in modo sicuro nel localStorage del browser.
          </p>
          
          {hasEnvKey ? (
            <div className="text-sm font-medium text-green-700 bg-green-100 p-3 rounded-md">
              ✓ API Key rilevata dal file di configurazione ambientale (.env).
            </div>
          ) : (
            <div className="flex items-end gap-3 max-w-md">
              <div className="flex-1">
                <Input
                  label="Chiave API"
                  name="apiKey"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (isSaved) setIsSaved(false);
                  }}
                  placeholder="Inserisci qui la chiave API..."
                  type="password"
                />
              </div>
              {isSaved ? (
                <Button onClick={handleRemove} variant="danger" className="shrink-0 mb-[2px]">
                  Rimuovi
                </Button>
              ) : (
                <Button onClick={handleSave} className="shrink-0 mb-[2px]">
                  Salva
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
