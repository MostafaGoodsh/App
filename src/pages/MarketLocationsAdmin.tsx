import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MarketLocationsManagement from "@/components/admin/MarketLocationsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const MarketLocationsAdmin = () => {
  return (
    <AdminPageShell withContainer>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">إدارة مواقع المتعاونين | Market Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketLocationsManagement />
        </CardContent>
      </Card>
    </AdminPageShell>
  );
};

export default MarketLocationsAdmin;
