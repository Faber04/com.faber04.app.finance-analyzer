import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { Key } from 'lucide-react';
import { saveFmpApiKey, getFmpApiKey, removeFmpApiKey } from '@/services';
import { useTranslation } from '@/i18n';

export const ApiKeySettings: React.FC = () => {
  const { t } = useTranslation();
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
      alert(t('settings.apiSavedAlert'));
    }
  };

  const handleRemove = () => {
    removeFmpApiKey();
    setApiKey('');
    setIsSaved(false);
    alert(t('settings.apiRemovedAlert'));
  };

  return (
    <Card className={`mb-6 border-blue-200 dark:border-blue-700 ${isSaved ? 'bg-green-50 dark:bg-success-500/10/30' : 'bg-blue-50 dark:bg-blue-500/10/50'}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg shrink-0">
          <Key className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {t('settings.apiTitle')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('settings.apiSubtitle')}
          </p>

          {hasEnvKey ? (
            <div className="text-sm font-medium text-green-700 dark:text-success-400 bg-green-100 dark:bg-success-500/20 p-3 rounded-md">
              {t('settings.apiEnvDetected')}
            </div>
          ) : (
            <div className="flex items-end gap-3 max-w-md">
              <div className="flex-1">
                <Input
                  label={t('settings.apiLabel')}
                  name="apiKey"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (isSaved) setIsSaved(false);
                  }}
                  placeholder={t('settings.apiPlaceholder')}
                  type="password"
                />
              </div>
              {isSaved ? (
                <Button onClick={handleRemove} variant="danger" className="shrink-0 mb-[2px]">
                  {t('settings.apiRemove')}
                </Button>
              ) : (
                <Button onClick={handleSave} className="shrink-0 mb-[2px]">
                  {t('settings.apiSave')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
