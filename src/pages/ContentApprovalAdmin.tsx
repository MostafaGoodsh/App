import { Helmet } from "react-helmet-async";
import { ContentApprovalManagement } from "@/components/admin/ContentApprovalManagement";

export default function ContentApprovalAdmin() {
  return (
    <>
      <Helmet>
        <title>إدارة موافقة المحتوى — إدارة النظام</title>
        <meta name="description" content="إدارة وموافقة المحتوى التعليمي المرسل من المستخدمين" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <ContentApprovalManagement />
      </div>
    </>
  );
}