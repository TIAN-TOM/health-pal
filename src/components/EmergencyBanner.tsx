
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyBannerProps {
  onEmergencyClick: () => void;
}

const EmergencyBanner = ({ onEmergencyClick }: EmergencyBannerProps) => {
  const playClickSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PyvGEcBz2V2+7FdCQCKHjC8+CVQQ0PUrFrh3AE3eR7dDYOcfFJa+FoYuLSlOeOdNh0FHbeDNrCy3JFbfxWZelgZ93kWnQ3Dn3xS2jhY2fjhEIqHiJ8jW77XEIwH4gH16gAm7qzjLSFbxM8Wdx28t2QOgwFKYPH+OGKPAgZY7rq9J5QEQ1Oq+X0w3IlBSuEzfHejD4EJW/H7d+TOAcZY7nr86hSFAlGmeT0wG8nBjJ/y+/dhjwOGGvF5+efWB4AVuze6aFaGQ9Dn+L5v2QdCz6V3PHFZR0IR+zy2IMSAQ==');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (error) {
      console.log('Sound creation failed:', error);
    }
  };

  const handleClick = () => {
    playClickSound();
    onEmergencyClick();
  };

  return (
    <Button
      onClick={handleClick}
      className="w-full h-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center justify-center gap-2"
    >
      <AlertCircle className="h-8 w-8" />
      <span className="text-lg">我需要帮助</span>
    </Button>
  );
};

export default EmergencyBanner;
