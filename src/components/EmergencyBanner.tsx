
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyBannerProps {
  onEmergencyClick: () => void;
}

const EmergencyBanner = ({ onEmergencyClick }: EmergencyBannerProps) => {
  return (
    <div className="bg-orange-500 text-white p-4 shadow-lg">
      <Button
        onClick={onEmergencyClick}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xl font-bold py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        <AlertCircle className="mr-3 h-6 w-6" />
        头晕不舒服，点这里
      </Button>
    </div>
  );
};

export default EmergencyBanner;
