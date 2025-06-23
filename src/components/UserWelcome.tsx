
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserWelcomeProps {
  userDisplayName: string;
  userRole?: string;
  onSettingsClick: () => void;
}

const UserWelcome = ({ userDisplayName, userRole, onSettingsClick }: UserWelcomeProps) => {
  const { t } = useLanguage();

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">
              {t('welcome')}, {userDisplayName}
            </h2>
            {userRole && (
              <p className="text-sm text-gray-600 mt-1">
                {userRole === 'admin' ? t('admin_role') : t('user_role')}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-800"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserWelcome;
