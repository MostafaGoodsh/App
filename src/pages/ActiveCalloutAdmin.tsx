import ActiveCalloutManagement from "@/components/admin/ActiveCalloutManagement";
import RequireAdmin from "@/components/auth/RequireAdmin";

const ActiveCalloutAdmin = () => {
  return (
    <RequireAdmin>
      <div className="container mx-auto py-8 px-4">
        <ActiveCalloutManagement />
      </div>
    </RequireAdmin>
  );
};

export default ActiveCalloutAdmin;