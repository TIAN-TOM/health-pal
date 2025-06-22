
import React from 'react';
import { Apple, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DietSectionProps {
  dietOpen: boolean;
  setDietOpen: (open: boolean) => void;
  diet: string[];
  setDiet: (diet: string[]) => void;
  customFood: string;
  setCustomFood: (food: string) => void;
  waterIntake: string;
  setWaterIntake: (intake: string) => void;
  saltPreference: string;
  setSaltPreference: (preference: string) => void;
}

const DietSection = ({
  dietOpen,
  setDietOpen,
  diet,
  setDiet,
  customFood,
  setCustomFood,
  waterIntake,
  setWaterIntake,
  saltPreference,
  setSaltPreference
}: DietSectionProps) => {
  // 主食类
  const stapleFood = ['米饭', '面条', '包子', '馒头', '粥类', '面包'];
  
  // 蛋白质类
  const proteinFood = ['鸡肉', '猪肉', '牛肉', '鱼类', '虾类', '鸡蛋', '豆腐', '豆类'];
  
  // 蔬菜类
  const vegetables = ['青菜', '白菜', '萝卜', '土豆', '番茄', '黄瓜', '茄子', '豆角'];
  
  // 水果类
  const fruits = ['苹果', '香蕉', '橙子', '葡萄', '梨', '桃子'];
  
  // 饮品类
  const drinks = ['白开水', '茶水', '咖啡', '牛奶', '酸奶', '豆浆', '果汁'];
  
  // 零食类
  const snacks = ['坚果', '饼干', '水果干', '酸奶'];

  const hasDietData = diet.length > 0 || waterIntake || saltPreference;

  const handleFoodToggle = (food: string) => {
    if (diet.includes(food)) {
      setDiet(diet.filter(f => f !== food));
    } else {
      setDiet([...diet, food]);
    }
  };

  const handleAddCustomFood = () => {
    if (customFood.trim() && !diet.includes(customFood.trim())) {
      setDiet([...diet, customFood.trim()]);
      setCustomFood('');
    }
  };

  const FoodCategory = ({ title, foods, icon }: { title: string; foods: string[]; icon?: React.ReactNode }) => (
    <div className="mb-4">
      <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
        {icon && <span className="mr-1">{icon}</span>}
        {title}
      </Label>
      <div className="grid grid-cols-3 gap-1">
        {foods.map((food) => (
          <label key={food} className="flex items-center space-x-1 p-2 rounded border hover:bg-gray-50 cursor-pointer text-sm">
            <Checkbox
              checked={diet.includes(food)}
              onCheckedChange={() => handleFoodToggle(food)}
            />
            <span>{food}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <Collapsible open={dietOpen} onOpenChange={setDietOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Apple className="h-5 w-5 mr-2 text-green-600" />
                饮食记录
                {hasDietData && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </div>
              {dietOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <FoodCategory title="主食类" foods={stapleFood} icon="🍚" />
            <FoodCategory title="蛋白质类" foods={proteinFood} icon="🥩" />
            <FoodCategory title="蔬菜类" foods={vegetables} icon="🥬" />
            <FoodCategory title="水果类" foods={fruits} icon="🍎" />
            <FoodCategory title="饮品类" foods={drinks} icon="🥤" />
            <FoodCategory title="零食类" foods={snacks} icon="🍪" />

            <div className="flex space-x-2">
              <Input
                placeholder="添加其他食物"
                value={customFood}
                onChange={(e) => setCustomFood(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFood())}
              />
              <Button type="button" onClick={handleAddCustomFood} variant="outline">
                添加
              </Button>
            </div>

            {diet.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <Label className="text-sm font-medium text-green-700">已选择的食物：</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {diet.map((food) => (
                    <span key={food} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                      {food}
                      <button
                        type="button"
                        onClick={() => handleFoodToggle(food)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="saltPreference">口味咸淡</Label>
              <Select value={saltPreference} onValueChange={setSaltPreference}>
                <SelectTrigger>
                  <SelectValue placeholder="选择口味偏好" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">清淡</SelectItem>
                  <SelectItem value="normal">适中</SelectItem>
                  <SelectItem value="salty">偏咸</SelectItem>
                  <SelectItem value="very-salty">很咸</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="waterIntake">饮水量（杯）</Label>
              <Input
                id="waterIntake"
                type="number"
                min="0"
                max="20"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
                placeholder="一杯约250ml"
              />
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-start">
                <span className="text-lg mr-2">💡</span>
                <p className="text-sm text-green-700">
                  温馨提示：良好的饮食和作息习惯有助于减少眩晕发作，建议清淡饮食、规律作息
                </p>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default DietSection;
