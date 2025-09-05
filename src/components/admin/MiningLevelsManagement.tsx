import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Star,
  Edit2,
  Save,
  X,
  Plus
} from 'lucide-react';

interface MiningLevel {
  id: number;
  level_number: number;
  level_name: string;
  required_account_strength: number;
  mining_rate_per_hour: number;
  upgrade_cost: number;
  created_at: string;
}

const MiningLevelsManagement = () => {
  const [levels, setLevels] = useState<MiningLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MiningLevel>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_levels')
        .select('*')
        .order('level_number', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching mining levels:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل مستويات التعدين",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (level: MiningLevel) => {
    setEditingLevel(level.id);
    setEditForm(level);
  };

  const handleSave = async () => {
    if (!editingLevel || !editForm) return;

    try {
      const updateData = {
        level_name: editForm.level_name || '',
        required_account_strength: Number(editForm.required_account_strength || 0),
        mining_rate_per_hour: Number(editForm.mining_rate_per_hour || 0),
        upgrade_cost: Number(editForm.upgrade_cost || 0)
      };

      const { data, error } = await supabase
        .from('mining_levels')
        .update(updateData)
        .eq('id', editingLevel)
        .select();

      if (error) {
        console.error('خطأ في التحديث:', error);
        throw error;
      }

      console.log('تم التحديث بنجاح:', data);

      toast({
        title: "تم الحفظ",
        description: "تم تحديث مستوى التعدين بنجاح"
      });

      setEditingLevel(null);
      setEditForm({});
      fetchLevels();
    } catch (error: any) {
      console.error('خطأ في حفظ التعديلات:', error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في تحديث مستوى التعدين",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setEditingLevel(null);
    setEditForm({});
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">إدارة مستويات التعدين</h2>
          <p className="text-muted-foreground">
            إدارة وتحديث مستويات التعدين ومعدلات الإنتاج
          </p>
        </div>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          مستويات التعدين تحدد قوة التعدين والمتطلبات لكل مستوى. تأكد من صحة البيانات قبل الحفظ.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {levels.map((level) => (
          <Card key={level.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {level.level_number <= 2 ? (
                      <Star className="w-5 h-5 text-yellow-500" />
                    ) : level.level_number <= 4 ? (
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                    ) : level.level_number <= 6 ? (
                      <Shield className="w-5 h-5 text-purple-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-orange-500" />
                    )}
                    <Badge variant="outline">المستوى {level.level_number}</Badge>
                  </div>
                  <CardTitle>
                    {editingLevel === level.id ? (
                      <Input
                        value={editForm.level_name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, level_name: e.target.value }))}
                        className="w-48"
                      />
                    ) : (
                      level.level_name
                    )}
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  {editingLevel === level.id ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(level)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">قوة الحساب المطلوبة</Label>
                  {editingLevel === level.id ? (
                    <Input
                      type="number"
                      value={editForm.required_account_strength || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, required_account_strength: Number(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-primary mt-1">
                      {level.required_account_strength.toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">معدل التعدين/ساعة</Label>
                  {editingLevel === level.id ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.mining_rate_per_hour || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mining_rate_per_hour: Number(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {level.mining_rate_per_hour} MSR
                    </p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">تكلفة الترقية</Label>
                  {editingLevel === level.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editForm.upgrade_cost || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, upgrade_cost: Number(e.target.value) || 0 }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                      {level.upgrade_cost} MSR
                    </p>
                  )}
                </div>
                
                <div>
                  <Label className="text-sm font-medium">إنتاجية يومية</Label>
                  {editingLevel === level.id ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editForm.mining_rate_per_hour ? (editForm.mining_rate_per_hour * 24).toFixed(1) : ''}
                      onChange={(e) => {
                        const dailyProduction = Number(e.target.value) || 0;
                        const hourlyRate = dailyProduction / 24;
                        setEditForm(prev => ({ ...prev, mining_rate_per_hour: hourlyRate }));
                      }}
                      className="mt-1"
                      placeholder="الإنتاج اليومي بـ MSR"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-blue-600 mt-1">
                      {(level.mining_rate_per_hour * 24).toFixed(1)} MSR
                    </p>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>تاريخ الإنشاء: {new Date(level.created_at).toLocaleDateString('ar-EG')}</span>
                <span>كفاءة: {((level.mining_rate_per_hour * 24) / Math.max(level.required_account_strength, 1) * 1000).toFixed(2)} MSR/1000 قوة</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MiningLevelsManagement;