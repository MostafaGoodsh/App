import TodoIntroductionManagement from "@/components/admin/TodoIntroductionManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const TodoIntroductionAdmin = () => {
  return (
    <AdminPageShell withContainer>
      <div className="max-w-4xl mx-auto">
        <TodoIntroductionManagement />
      </div>
    </AdminPageShell>
  );
};

export default TodoIntroductionAdmin;
