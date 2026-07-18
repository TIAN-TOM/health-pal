import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PrivacyCardProps {
  onPrivacyCenter: () => void;
}

const PrivacyCard = ({ onPrivacyCenter }: PrivacyCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center">
        <ShieldCheck className="h-5 w-5 mr-2" />
        隐私与数据
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full justify-start" onClick={onPrivacyCenter}>
        查看同意记录、导出或删除我的数据
      </Button>
    </CardContent>
  </Card>
);

export default PrivacyCard;
