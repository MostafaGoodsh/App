import { Helmet } from "react-helmet-async";
import QuranPagesManagement from "@/components/admin/QuranPagesManagement";

const QuranPagesAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة صفحات القرآن - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص صفحات القرآن الكريم" />
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
          <QuranPagesManagement />
        </div>
      </div>
    </>
  );
};

export default QuranPagesAdmin;