import UpdatesManagement from "@/components/admin/UpdatesManagement";

export default function UpdatesAdmin() {
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: `url('/lovable-uploads/updates-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen bg-background/90">
        <UpdatesManagement />
      </div>
    </div>
  );
}