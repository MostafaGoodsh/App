import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import TodoIntroductionManagement from "@/components/admin/TodoIntroductionManagement";
import { useToast } from "@/hooks/use-toast";

const TodoIntroductionAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      toast({
        title: "غير مصرح",
        description: "ليس لديك صلاحية الوصول لهذه الصفحة",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <TodoIntroductionManagement />
      </div>
    </div>
  );
};

export default TodoIntroductionAdmin;