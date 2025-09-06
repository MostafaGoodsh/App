import { Helmet } from "react-helmet-async";
import MediaContentManagement from "@/components/admin/MediaContentManagement";

const MediaContentAdmin = () => {
  return (
    <>
      <Helmet>
        <title>إدارة محتوى الوسائط - لوحة التحكم</title>
        <meta name="description" content="إدارة وتخصيص محتوى الوسائط للمهام اليومية" />
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
          <MediaContentManagement />
        </div>
      </div>
    </>
  );
};

export default MediaContentAdmin;