import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoadmapCardsManagement from "@/components/admin/RoadmapCardsManagement";
import AdminPageShell from "@/components/admin/AdminPageShell";

const RoadmapCardsAdmin = () => {
  return (
    <AdminPageShell withContainer>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">إدارة كروت خارطة الطريق</CardTitle>
        </CardHeader>
        <CardContent>
          <RoadmapCardsManagement />
        </CardContent>
      </Card>
    </AdminPageShell>
  );
};

export default RoadmapCardsAdmin;
