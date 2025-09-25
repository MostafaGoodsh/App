import CalloutCardManagement from "@/components/admin/CalloutCardManagement";

export default function CalloutCardAdmin() {
  return (
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
        <div className="container mx-auto px-4 py-8">
          <CalloutCardManagement />
        </div>
      </div>
    </div>
  );
}