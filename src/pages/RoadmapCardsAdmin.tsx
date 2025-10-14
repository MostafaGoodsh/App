import { useState } from "react";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoadmapCardsManagement from "@/components/admin/RoadmapCardsManagement";

const RoadmapCardsAdmin = () => {
  return (
    <RequireAdmin>
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">إدارة كروت خارطة الطريق</CardTitle>
          </CardHeader>
          <CardContent>
            <RoadmapCardsManagement />
          </CardContent>
        </Card>
      </div>
    </RequireAdmin>
  );
};

export default RoadmapCardsAdmin;
