
import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LearningResourcesProps {
  onEducation: () => void;
}

const LearningResources = ({ onEducation }: LearningResourcesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <GraduationCap className="h-5 w-5 mr-2" />
          学习资源
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={onEducation}
          variant="outline"
          className="w-full justify-start"
        >
          <GraduationCap className="h-4 w-4 mr-2" />
          健康教育中心
        </Button>
      </CardContent>
    </Card>
  );
};

export default LearningResources;
