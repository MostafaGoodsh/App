import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2, Clock, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyTask {
  id: string;
  task_key: string;
  title: string;
  description: string | null;
  points_reward: number;
  task_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const DailyTasksManagement = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [formData, setFormData] = useState({
    task_key: "",
    title: "",
    description: "",
    points_reward: 10,
    task_type: "general",
    is_active: true,
    display_order: 0,
  });

  const taskTypes = [
    { value: "general", label: "عام" },
    { value: "login", label: "تسجيل دخول" },
    { value: "profile", label: "ملف شخصي" },
    { value: "mining", label: "تعدين" },
    { value: "learning", label: "تعلم" },
    { value: "social", label: "اجتماعي" },
  ];

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "خطأ",
          description: "فشل في جلب المهام اليومية",
          variant: "destructive",
        });
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from('daily_tasks')
          .update(formData)
          .eq('id', editingTask.id);

        if (error) {
          console.error('Error updating task:', error);
          toast({
            title: "خطأ",
            description: "فشل في تحديث المهمة",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "تم بنجاح",
          description: "تم تحديث المهمة بنجاح",
        });
      } else {
        // Create new task
        const { error } = await supabase
          .from('daily_tasks')
          .insert([formData]);

        if (error) {
          console.error('Error creating task:', error);
          toast({
            title: "خطأ",
            description: "فشل في إنشاء المهمة",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "تم بنجاح",
          description: "تم إنشاء المهمة بنجاح",
        });
      }

      setIsDialogOpen(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  const handleEdit = (task: DailyTask) => {
    setEditingTask(task);
    setFormData({
      task_key: task.task_key,
      title: task.title,
      description: task.description || "",
      points_reward: task.points_reward,
      task_type: task.task_type,
      is_active: task.is_active,
      display_order: task.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

    try {
      const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "خطأ",
          description: "فشل في حذف المهمة",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "تم بنجاح",
        description: "تم حذف المهمة بنجاح",
      });
      
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      task_key: "",
      title: "",
      description: "",
      points_reward: 10,
      task_type: "general",
      is_active: true,
      display_order: 0,
    });
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTask(null);
      resetForm();
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جارٍ تحميل المهام اليومية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              إدارة المهام اليومية
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة مهمة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingTask ? "تعديل المهمة" : "إضافة مهمة جديدة"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="task_key">مفتاح المهمة</Label>
                    <Input
                      id="task_key"
                      value={formData.task_key}
                      onChange={(e) => setFormData({...formData, task_key: e.target.value})}
                      placeholder="daily_login"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">عنوان المهمة</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="تسجيل الدخول اليومي"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="قم بتسجيل الدخول إلى المنصة"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="points_reward">النقاط</Label>
                      <Input
                        id="points_reward"
                        type="number"
                        value={formData.points_reward}
                        onChange={(e) => setFormData({...formData, points_reward: parseInt(e.target.value)})}
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="display_order">ترتيب العرض</Label>
                      <Input
                        id="display_order"
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="task_type">نوع المهمة</Label>
                    <Select
                      value={formData.task_type}
                      onValueChange={(value) => setFormData({...formData, task_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">مهمة نشطة</Label>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                      إلغاء
                    </Button>
                    <Button type="submit">
                      {editingTask ? "تحديث" : "إضافة"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>النقاط</TableHead>
                <TableHead>الترتيب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {task.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {task.task_key}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {taskTypes.find(t => t.value === task.task_type)?.label || task.task_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-orange-500" />
                      {task.points_reward}
                    </div>
                  </TableCell>
                  <TableCell>{task.display_order}</TableCell>
                  <TableCell>
                    <Badge variant={task.is_active ? "default" : "secondary"}>
                      {task.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTasksManagement;