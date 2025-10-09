import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: string;
  due_date: string | null;
  created_at: string;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('user_todo_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTodo.title.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال عنوان المهمة",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_todo_items')
        .insert({
          user_id: userData.user.id,
          title: newTodo.title,
          description: newTodo.description || null,
          priority: newTodo.priority,
          due_date: newTodo.due_date || null
        })
        .select()
        .single();

      if (error) throw error;

      // Try to record as completed daily task (optional, may fail if task doesn't exist)
      const { data: taskData } = await supabase
        .from('daily_tasks')
        .select('id')
        .eq('task_key', 'add_todo')
        .single();

      if (taskData) {
        await supabase.from('user_daily_task_completions').insert({
          user_id: userData.user.id,
          task_id: taskData.id,
          points_earned: 5
        });
      }

      setTodos([data, ...todos]);
      setNewTodo({ title: "", description: "", priority: "medium", due_date: "" });
      setIsDialogOpen(false);
      
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المهمة بنجاح",
      });
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المهمة",
        variant: "destructive",
      });
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_todo_items')
        .update({ 
          is_completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.map(todo => 
        todo.id === id 
          ? { ...todo, is_completed: !currentStatus }
          : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_todo_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTodos(todos.filter(todo => todo.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف المهمة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  if (loading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          قائمة الأعمال
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 ml-2" />
              إضافة مهمة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مهمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المهمة *</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                  placeholder="أدخل عنوان المهمة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                  placeholder="أدخل وصف المهمة (اختياري)"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select value={newTodo.priority} onValueChange={(value) => setNewTodo({ ...newTodo, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">تاريخ الاستحقاق</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTodo.due_date}
                  onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                />
              </div>
              <Button onClick={addTodo} className="w-full">
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">لا توجد مهام حالياً</p>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={todo.is_completed}
                  onCheckedChange={() => toggleComplete(todo.id, todo.is_completed)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.title}
                  </p>
                  {todo.description && (
                    <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className={getPriorityColor(todo.priority)}>
                      <AlertCircle className="h-3 w-3 inline ml-1" />
                      {getPriorityLabel(todo.priority)}
                    </span>
                    {todo.due_date && (
                      <span className="text-muted-foreground">
                        <Calendar className="h-3 w-3 inline ml-1" />
                        {new Date(todo.due_date).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};