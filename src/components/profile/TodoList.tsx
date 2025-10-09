import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface TodoItem {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_at: string;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState("");
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
      setTodos((data || []) as TodoItem[]);
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast({
        title: "خطأ",
        description: "فشل تحميل قائمة الأعمال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async () => {
    if (!newTitle.trim()) {
      toast({
        title: "تنبيه",
        description: "يرجى إدخال عنوان المهمة",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_todo_items')
        .insert({
          user_id: user.id,
          title: newTitle,
          description: newDescription || null,
          priority: newPriority,
          due_date: newDueDate || null,
        });

      if (error) throw error;

      // Record as daily task completion
      await supabase.from('user_daily_task_completions').insert({
        user_id: user.id,
        task_id: (await supabase.from('daily_tasks').select('id').eq('task_key', 'todo_list').single()).data?.id,
        points_earned: 5,
      });

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المهمة بنجاح",
      });

      setNewTitle("");
      setNewDescription("");
      setNewPriority('medium');
      setNewDueDate("");
      fetchTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
      toast({
        title: "خطأ",
        description: "فشل إضافة المهمة",
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
          completed_at: !currentStatus ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: "خطأ",
        description: "فشل تحديث المهمة",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_todo_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTodos();
      toast({
        title: "تم الحذف",
        description: "تم حذف المهمة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast({
        title: "خطأ",
        description: "فشل حذف المهمة",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
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
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          قائمة الأعمال
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new todo */}
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <Input
            placeholder="عنوان المهمة"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            dir="rtl"
          />
          <Textarea
            placeholder="وصف المهمة (اختياري)"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            dir="rtl"
            rows={2}
          />
          <div className="flex gap-2">
            <Select value={newPriority} onValueChange={(value: any) => setNewPriority(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">منخفضة</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={addTodo} className="w-full">
            <Plus className="h-4 w-4 ml-2" />
            إضافة مهمة
          </Button>
        </div>

        {/* Todo list */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا توجد مهام بعد</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`p-4 border rounded-lg space-y-2 ${
                  todo.is_completed ? 'bg-muted/30 opacity-75' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={todo.is_completed}
                    onCheckedChange={() => toggleComplete(todo.id, todo.is_completed)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h4 className={`font-semibold ${todo.is_completed ? 'line-through' : ''}`}>
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getPriorityColor(todo.priority)} className="text-xs">
                        {getPriorityLabel(todo.priority)}
                      </Badge>
                      {todo.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(todo.due_date), 'dd MMM yyyy', { locale: ar })}
                        </div>
                      )}
                      {todo.is_completed && todo.completed_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Circle className="h-3 w-3" />
                          أُنجزت: {format(new Date(todo.completed_at), 'dd MMM', { locale: ar })}
                        </div>
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
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};