import AdminPageShell from "@/components/admin/AdminPageShell";
import LiquidityPoolManagement from "@/components/admin/LiquidityPoolManagement";

export default function LiquidityPoolAdmin() {
  return (
    <AdminPageShell withContainer>
      <LiquidityPoolManagement />
    </AdminPageShell>
  );
}
