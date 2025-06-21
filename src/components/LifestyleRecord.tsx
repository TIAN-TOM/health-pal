
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Clock, Bed, Coffee, Apple, Droplets, Activity, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { saveMeniereRecord } from '@/services/meniereRecordService';

interface LifestyleRecordProps {
  onBack: () => void;
}

const LifestyleRecord = ({ onBack }: LifestyleRecordProps) => {
  // 折叠状态管理
  const [sleepOpen, setSleepOpen] = useState(false);
  const [dietOpen, setDietOpen] = useState(false);
  const [exerciseOpen, setExerciseOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);

  // 表单状态
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [bedTime, setBedTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [waterIntake, setWaterIntake] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [exerciseDuration, setExerciseDuration] = useState('');
  const [stressLevel, setStressLevel] = useState('');
  const [diet, setDiet] = useState<string[]>([]);
  const [customFood, setCustomFood] = useState('');
  const [saltPreference, setSaltPreference] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const exerciseOptions = [
    '散步', '慢跑', '快走', '游泳', '骑车',
    '瑜伽', '太极', '健身房', '跳舞', '球类运动',
    '爬山', '家务劳动', '其他'
  ];

  useEffect(() => {
    // 设置默认时间
    if (!bedTime) setBedTime('22:00');
    if (!wakeTime) setWakeTime('07:00');
  }, []);

  const handleFoodToggle = (food: string) => {
    setDiet(prev => 
      prev.includes(food) 
        ? prev.filter(f => f !== food)
        : [...prev, food]
    );
  };

  const handleAddCustomFood = () => {
    if (customFood.trim() && !diet.includes(customFood.trim())) {
      setDiet(prev => [...prev, customFood.trim()]);
      setCustomFood('');
    }
  };

  const hasAnyData = () => {
    return sleepHours || sleepQuality || bedTime !== '22:00' || wakeTime !== '07:00' ||
           waterIntake || exerciseType || exerciseDuration || stressLevel ||
           diet.length > 0 || saltPreference || note.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAnyData()) {
      toast({
        title: "请填写至少一项信息",
        description: "请填写任意一项生活方式信息后再保存",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const recordData = {
        type: 'lifestyle' as const,
        sleep: sleepHours ? `${sleepHours}小时` : undefined,
        stress: stressLevel || undefined,
        diet: diet.length > 0 ? diet : undefined,
        note: note.trim() || undefined,
        data: {
          sleep_quality: sleepQuality || undefined,
          bed_time: bedTime !== '22:00' ? bedTime : undefined,
          wake_time: wakeTime !== '07:00' ? wakeTime : undefined,
          water_intake: waterIntake ? `${waterIntake}杯` : undefined,
          exercise_type: exerciseType || undefined,
          exercise_duration: exerciseDuration ? `${exerciseDuration}分钟` : undefined,
          salt_preference: saltPreference || undefined
        }
      };

      await saveMeniereRecord(recordData);
      
      toast({
        title: "记录保存成功",
        description: "生活方式记录已保存"
      });
      
      onBack();
    } catch (error) {
      console.error('保存记录失败:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">记录饮食与作息</h1>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 提示：您可以选择填写任意一项或多项信息，不必全部填写。点击各个模块标题可以展开或收起。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 睡眠记录 */}
          <Card>
            <Collapsible open={sleepOpen} onOpenChange={setSleepOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bed className="h-5 w-5 mr-2 text-blue-600" />
                      睡眠状况
                      {(sleepHours || sleepQuality || bedTime !== '22:00' || wakeTime !== '07:00') && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    {sleepOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bedTime">入睡时间</Label>
                      <Input
                        id="bedTime"
                        type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wakeTime">起床时间</Label>
                      <Input
                        id="wakeTime"
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="sleepHours">睡眠时长（小时）</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={sleepHours}
                      onChange={(e) => setSleepHours(e.target.value)}
                      placeholder="例如：7.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sleepQuality">睡眠质量</Label>
                    <Select value={sleepQuality} onValueChange={setSleepQuality}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择睡眠质量" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">非常好</SelectItem>
                        <SelectItem value="good">良好</SelectItem>
                        <SelectItem value="fair">一般</SelectItem>
                        <SelectItem value="poor">较差</SelectItem>
                        <SelectItem value="very-poor">很差</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 饮食记录 */}
          <Card>
            <Collapsible open={dietOpen} onOpenChange={setDietOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Apple className="h-5 w-5 mr-2 text-green-600" />
                      饮食记录
                      {(diet.length > 0 || waterIntake || saltPreference) && (
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

          {/* 运动记录 */}
          <Card>
            <Collapsible open={exerciseOpen} onOpenChange={setExerciseOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-purple-600" />
                      运动情况
                      {(exerciseType || exerciseDuration) && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    {exerciseOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="exerciseType">运动类型</Label>
                    <Select value={exerciseType} onValueChange={setExerciseType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择运动类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseOptions.map((exercise) => (
                          <SelectItem key={exercise} value={exercise}>
                            {exercise}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="exerciseDuration">运动时长（分钟）</Label>
                    <Input
                      id="exerciseDuration"
                      type="number"
                      min="0"
                      max="480"
                      value={exerciseDuration}
                      onChange={(e) => setExerciseDuration(e.target.value)}
                      placeholder="例如：30"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 情绪状态 */}
          <Card>
            <Collapsible open={moodOpen} onOpenChange={setMoodOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sun className="h-5 w-5 mr-2 text-yellow-600" />
                      情绪与压力
                      {stressLevel && (
                        <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                    {moodOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div>
                    <Label htmlFor="stressLevel">压力程度</Label>
                    <Select value={stressLevel} onValueChange={setStressLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择压力程度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">无压力</SelectItem>
                        <SelectItem value="low">轻微压力</SelectItem>
                        <SelectItem value="moderate">中等压力</SelectItem>
                        <SelectItem value="high">较大压力</SelectItem>
                        <SelectItem value="severe">重度压力</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* 备注 */}
          <Card>
            <CardHeader>
              <CardTitle>备注（可选）</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录其他相关信息，如：今天心情如何、有什么特殊情况等..."
                rows={3}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '保存中...' : '保存记录'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LifestyleRecord;
