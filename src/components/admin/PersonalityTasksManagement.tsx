import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, User } from "lucide-react";

interface PersonalityTask {
  id: string;
  title: string;
  description: string | null;
  points_reward: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const PersonalityTasksManagement = () => {
  const [tasks, setTasks] = useState<PersonalityTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<PersonalityTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points_reward: 5,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('personality_development_tasks')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('خطأ في جلب المهام');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('personality_development_tasks')
          .update(formData)
          .eq('id', editingTask.id);

        if (error) throw error;
        toast.success('تم تحديث المهمة بنجاح');
      } else {
        const { error } = await supabase
          .from('personality_development_tasks')
          .insert([formData]);

        if (error) throw error;
        toast.success('تم إضافة المهمة بنجاح');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('خطأ في حفظ المهمة');
    }
  };

  const handleEdit = (task: PersonalityTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      points_reward: task.points_reward,
      is_active: task.is_active,
      display_order: task.display_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;

    try {
      const { error } = await supabase
        .from('personality_development_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف المهمة بنجاح');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('خطأ في حذف المهمة');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      points_reward: 5,
      is_active: true,
      display_order: 0
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>إدارة مهام تطوير الشخصية</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة مهمة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان المهمة</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">وصف المهمة</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="points_reward">نقاط المكافأة</Label>
                    <Input
                      id="points_reward"
                      type="number"
                      min="1"
                      value={formData.points_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, points_reward: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="display_order">ترتيب العرض</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingTask ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {task.title}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{task.description}</TableCell>
                  <TableCell>{task.points_reward}</TableCell>
                  <TableCell>
                    <Badge variant={task.is_active ? "default" : "secondary"}>
                      {task.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.display_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مهام متاحة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityTasksManagement;