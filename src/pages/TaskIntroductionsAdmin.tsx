import { Helmet } from "react-helmet-async";
import TaskIntroductionsManagement from "@/components/admin/TaskIntroductionsManagement";

const TaskIntroductionsAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة مقدمات المهام - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص مقدمات أقسام المهام اليومية" />
      </Helmet>
      <div 
        className="min-h-screen"
        style={{
          backgroundImage: `url('/lovable-uploads/5f71efaf-8d4b-42c4-993b-f0d50e00f50e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="min-h-screen bg-background/90">
          <TaskIntroductionsManagement />
        </div>
      </div>
    </>
  );
};

export default TaskIntroductionsAdmin;